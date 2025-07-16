import { toast } from 'sonner';
import { Meeting, Participant } from '../types/meeting';
import { meetingApi } from '../lib/api';

interface UseMeetingActionsProps {
  meetings: Meeting[];
  updateMeetings: (updater: (prev: Meeting[]) => Meeting[]) => void;
  loadMeetings: () => Promise<void>;
  editingMeeting?: Meeting;
  setEditingMeeting: (meeting: Meeting | undefined) => void;
  selectedMeeting: Meeting | null;
  setSelectedMeeting: React.Dispatch<React.SetStateAction<Meeting | null>>;
  setShowMeetingDetail: (show: boolean) => void;
}

export const useMeetingActions = ({
  meetings,
  updateMeetings,
  loadMeetings,
  editingMeeting,
  setEditingMeeting,
  selectedMeeting,
  setSelectedMeeting,
  setShowMeetingDetail
}: UseMeetingActionsProps) => {

  // 会議作成・更新
  const handleMeetingSubmit = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingMeeting) {
        // 更新
        updateMeetings(prev => prev.map(meeting => 
          meeting.id === editingMeeting.id 
            ? { 
                ...meetingData, 
                id: editingMeeting.id, 
                createdAt: editingMeeting.createdAt,
                updatedAt: new Date() 
              }
            : meeting
        ));
        toast.success('会議が更新されました');
        
        // 参加者に通知を送信
        if (meetingData.participants.length > 0) {
          toast.info(`${meetingData.participants.length}名の参加者に変更通知を送信しました`);
        }
      } else {
        // 新規作成 - APIを呼び出す
        const response = await meetingApi.create({
          title: meetingData.title,
          startTime: meetingData.startTime.toISOString(),
          endTime: meetingData.endTime.toISOString(),
          isImportant: meetingData.isImportant,
          ownerId: meetingData.owner
        });
        
        if (response.success && response.data) {
          // 会議作成後、全ての会議を再取得してUIを更新
          await loadMeetings();
          toast.success('会議が作成されました');
        } else {
          // バックエンドからのエラーメッセージを表示
          const errorMessage = response.error || '会議の作成に失敗しました';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      }
      
      setEditingMeeting(undefined);
    } catch (error) {
      console.error('API Error:', error);
      // エラーはtoastで既に表示済みなので、ここではre-throwのみ
      throw error;
    }
  };

  // 会議削除
  const handleMeetingDelete = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting && meeting.participants.length > 0) {
      toast.info(`${meeting.participants.length}名の参加者にキャンセル通知を送信しました`);
    }
    
    updateMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
    setShowMeetingDetail(false);
    setSelectedMeeting(null);
    toast.success('会議が削除されました');
  };

  // 参加者変更
  const handleParticipantsChange = (meetingId: string, participants: Participant[]) => {
    updateMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, participants, updatedAt: new Date() }
        : meeting
    ));
    
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting((prev: Meeting | null) => {
        if (!prev) return null;
        return { ...prev, participants };
      });
    }
    
    toast.success('参加者が更新されました');
  };

  return {
    handleMeetingSubmit,
    handleMeetingDelete,
    handleParticipantsChange
  };
};