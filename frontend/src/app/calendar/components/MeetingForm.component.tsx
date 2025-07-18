import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/lib/ui/dialog';
import { Button } from '@/lib/ui/button';
import { Input } from '@/lib/ui/input';
import { Label } from '@/lib/ui/label';
// import { Textarea } from '@/lib/ui/textarea'; // TODO: 将来的に説明フィールドで使用予定
import { Switch } from '@/lib/ui/switch';
import { Alert, AlertDescription } from '@/lib/ui/alert';
import { Meeting } from '@/types/meeting';
import { AlertCircle } from 'lucide-react';

interface MeetingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  meeting?: Meeting;
  selectedDate?: Date;
  existingMeetings: Meeting[];
  currentUser: string;
}

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
    if (!data.startTime || !data.endTime) return true; // 基本バリデーションが先に実行される
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

// 🎨 UIコンポーネント群（同一ファイル内）
function FormHeader({ meeting }: { meeting?: Meeting }) {
  return (
    <DialogHeader>
      <DialogTitle>
        {meeting ? '会議を編集' : '新しい会議を作成'}
      </DialogTitle>
    </DialogHeader>
  );
}

function ValidationErrors({ errors }: { errors: any }) {
  const hasError = errors.title || errors.startTime || errors.endTime;
  
  if (!hasError) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1">
          {errors.title && <li>{errors.title.message}</li>}
          {errors.startTime && <li>{errors.startTime.message}</li>}
          {errors.endTime && <li>{errors.endTime.message}</li>}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function TitleInput({ register }: { register: any }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="title">タイトル *</Label>
      <Input
        id="title"
        data-testid="meeting-title-input"
        {...register('title')}
        placeholder="会議のタイトルを入力"
      />
    </div>
  );
}

function TimeInputs({ register }: { register: any }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="startTime">開始時刻 *</Label>
        <Input
          id="startTime"
          type="datetime-local"
          {...register('startTime')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endTime">終了時刻 *</Label>
        <Input
          id="endTime"
          type="datetime-local"
          {...register('endTime')}
        />
      </div>
    </div>
  );
}

function ImportantSwitch({ register, watch, setValue }: { register: any; watch: any; setValue: any }) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="important"
        data-testid="meeting-important-switch"
        {...register('isImportant')}
        checked={watch('isImportant')}
        onCheckedChange={(checked) => setValue('isImportant', checked)}
      />
      <Label htmlFor="important">重要な会議</Label>
      <span className="text-sm text-muted-foreground">
        (リマインダーが60分前に送信されます)
      </span>
    </div>
  );
}

function FormActions({ meeting, onClose }: { meeting?: Meeting; onClose: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onClose}>
        キャンセル
      </Button>
      <Button type="submit" data-testid="meeting-submit-button">
        {meeting ? '更新' : '作成'}
      </Button>
    </div>
  );
}

// 🏗️ メインコンポーネント - 構造が一目瞭然
export function MeetingForm({ 
  open, 
  onClose, 
  onSubmit, 
  meeting, 
  selectedDate, 
  existingMeetings,
  currentUser 
}: MeetingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(MeetingFormSchema) as any,
    defaultValues: {
      title: '',
      startTime: '',
      endTime: '',
      isImportant: false
    }
  });
  
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');
  
  useEffect(() => {
    if (!open) {
      // フォームが閉じているときは初期状態にリセット
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
      // 編集モード: 既存の会議データをセット
      // startTimeとendTimeがDateオブジェクトかチェック
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
      // 新規作成モード: デフォルト値をセット
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
      // デフォルト: 現在時刻ベース
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
  
  const validateBusinessRules = (data: FormData): boolean => {
    let hasError = false;
    
    // 追加のビジネスルールバリデーション（Zodでは表現困難なもの）
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
  
  const onFormSubmit = async (data: FormData) => {
    // ビジネスルールのバリデーション
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
      // エラーがある場合はフォームを閉じない
      console.error('Form submission error:', error);
    }
  };
  
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
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <FormHeader meeting={meeting} />
        <ValidationErrors errors={errors} />
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <TitleInput register={register} />
          <TimeInputs register={register} />
          <ImportantSwitch register={register} watch={watch} setValue={setValue} />
          <FormActions meeting={meeting} onClose={handleClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
}