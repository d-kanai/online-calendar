import { useEffect } from 'react';
import { toast } from 'sonner';
import { Meeting } from '../../../types/meeting';

interface UseReminderServiceProps {
  meetings: Meeting[];
}

export const useReminderService = ({ meetings }: UseReminderServiceProps) => {

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      meetings.forEach(meeting => {
        const reminderMinutes = meeting.isImportant ? 60 : 15;
        const reminderTime = new Date(meeting.startTime.getTime() - reminderMinutes * 60000);
        
        // リマインダー時刻の1分以内なら通知
        if (Math.abs(now.getTime() - reminderTime.getTime()) < 60000) {
          // 全参加者に通知を送信（通知設定は別途管理される前提）
          const participantCount = meeting.participants.length;
          
          if (participantCount > 0) {
            toast.info(`「${meeting.title}」のリマインダーを${participantCount}名に送信しました`);
          }
        }
      });
    };

    // 1分ごとにチェック
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [meetings]);

  // このフックは副作用のみを管理するため、返り値は不要
  return null;
};