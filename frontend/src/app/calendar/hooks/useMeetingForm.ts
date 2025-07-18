import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Meeting } from '@/types/meeting';

// Zodスキーマ定義（backendと同期）
const MeetingFormSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須項目です')
    .trim(),
  startTime: z.string()
    .min(1, '開始時刻は必須項目です'),
  endTime: z.string()
    .min(1, '終了時刻は必須項目です'),
  isImportant: z.boolean().default(false)
}).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true;
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
  },
  {
    message: '終了時刻は開始時刻より後に設定してください',
    path: ['endTime']
  }
).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true;
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const duration = end.getTime() - start.getTime();
    return duration >= 15 * 60 * 1000; // 15分以上
  },
  {
    message: '会議は15分以上で設定してください',
    path: ['endTime']
  }
);

type FormData = z.infer<typeof MeetingFormSchema>;

// ローカル時刻でフォームに設定するためのヘルパー関数
const toLocalDateTimeString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface UseMeetingFormParams {
  open: boolean;
  meeting?: Meeting;
  selectedDate?: Date;
  existingMeetings: Meeting[];
  currentUser: string;
  onSubmit: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function useMeetingForm({
  open,
  meeting,
  selectedDate,
  existingMeetings,
  currentUser,
  onSubmit,
  onClose
}: UseMeetingFormParams) {
  const form = useForm<FormData>({
    resolver: zodResolver(MeetingFormSchema) as any,
    defaultValues: {
      title: '',
      startTime: '',
      endTime: '',
      isImportant: false
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue,
    watch
  } = form;

  // フォームの初期化ロジック
  useEffect(() => {
    if (!open) {
      reset({
        title: '',
        startTime: '',
        endTime: '',
        isImportant: false
      });
      clearErrors();
      return;
    }
    
    if (meeting) {
      // 編集モード
      const startTime = meeting.startTime instanceof Date 
        ? meeting.startTime 
        : new Date(meeting.startTime);
      const endTime = meeting.endTime instanceof Date 
        ? meeting.endTime 
        : new Date(meeting.endTime);
      
      reset({
        title: meeting.title,
        startTime: toLocalDateTimeString(startTime),
        endTime: toLocalDateTimeString(endTime),
        isImportant: meeting.isImportant
      });
    } else if (selectedDate) {
      // 新規作成モード（日付選択あり）
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(10, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setHours(11, 0, 0, 0);
      
      reset({
        title: '',
        startTime: toLocalDateTimeString(defaultStart),
        endTime: toLocalDateTimeString(defaultEnd),
        isImportant: false
      });
    } else {
      // 新規作成モード（デフォルト）
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      const endTime = new Date(now);
      endTime.setHours(endTime.getHours() + 1);
      
      reset({
        title: '',
        startTime: toLocalDateTimeString(now),
        endTime: toLocalDateTimeString(endTime),
        isImportant: false
      });
    }
  }, [open, meeting, selectedDate, reset, clearErrors]);

  // ビジネスルールバリデーション
  const validateBusinessRules = (data: FormData): boolean => {
    let hasError = false;
    
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      
      // 開始済み会議の変更チェック
      if (meeting) {
        const now = new Date();
        if (start <= now) {
          setError('startTime', {
            type: 'manual',
            message: '開始済みの会議は編集できません'
          });
          hasError = true;
        }
      }
      
      // 時間重複チェック
      const hasConflict = existingMeetings.some(existingMeeting => {
        if (meeting && existingMeeting.id === meeting.id) return false;
        
        const existingStart = existingMeeting.startTime;
        const existingEnd = existingMeeting.endTime;
        
        return (start < existingEnd && end > existingStart);
      });
      
      if (hasConflict) {
        setError('startTime', {
          type: 'manual',
          message: '他の会議と時間が重複しています'
        });
        hasError = true;
      }
    }
    
    return !hasError;
  };

  // フォーム送信処理
  const onFormSubmit = async (data: FormData) => {
    if (!validateBusinessRules(data)) {
      return;
    }
    
    const meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> = {
      title: data.title.trim(),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      ownerId: currentUser,
      owner: currentUser,
      participants: meeting?.participants || [],
      isImportant: data.isImportant,
      status: 'scheduled'
    };
    
    try {
      await onSubmit(meetingData);
      handleClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // ダイアログを閉じる処理
  const handleClose = () => {
    reset({
      title: '',
      startTime: '',
      endTime: '',
      isImportant: false
    });
    clearErrors();
    onClose();
  };

  return {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    onFormSubmit,
    handleClose,
    isEditing: !!meeting
  };
}