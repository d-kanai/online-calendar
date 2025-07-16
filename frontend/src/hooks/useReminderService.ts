import { useEffect } from 'react';
import { toast } from 'sonner';
import { Meeting } from '../types/meeting';

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
          const activeParticipants = meeting.participants.filter(p => 
            p.notificationChannels.email || p.notificationChannels.push
          );
          
          if (activeParticipants.length > 0) {
            toast.info(`「${meeting.title}」のリマインダーを${activeParticipants.length}名に送信しました`);
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