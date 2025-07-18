import { Meeting } from '../../../types/meeting';
import { 
  useCreateMeeting, 
  useUpdateMeeting, 
  useDeleteMeeting,
  useAddParticipant,
  useRemoveParticipant
} from './useMeetingsQuery';

interface UseMeetingActionsProps {
  editingMeeting?: Meeting;
  setEditingMeeting: (meeting: Meeting | undefined) => void;
  selectedMeeting: Meeting | null;
  setSelectedMeeting: React.Dispatch<React.SetStateAction<Meeting | null>>;
  setShowMeetingDetail: (show: boolean) => void;
}

export const useMeetingActions = ({
  editingMeeting,
  setEditingMeeting,
  selectedMeeting,
  setSelectedMeeting,
  setShowMeetingDetail
}: UseMeetingActionsProps) => {
  
  // Mutations
  const createMutation = useCreateMeeting();
  const updateMutation = useUpdateMeeting();
  const deleteMutation = useDeleteMeeting();
  const addParticipantMutation = useAddParticipant();
  const removeParticipantMutation = useRemoveParticipant();

  // 会議作成・更新
  const handleMeetingSubmit = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMeeting) {
      // 更新
      await updateMutation.mutateAsync({
        id: editingMeeting.id,
        data: {
          title: meetingData.title,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          isImportant: meetingData.isImportant
        }
      });
      
      // 編集モードをクリア
      setEditingMeeting(undefined);
      
      // 選択中の会議も更新
      if (selectedMeeting?.id === editingMeeting.id) {
        setSelectedMeeting(prev => prev ? {
          ...prev,
          title: meetingData.title,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          isImportant: meetingData.isImportant
        } : null);
      }
    } else {
      // 新規作成
      await createMutation.mutateAsync({
        title: meetingData.title,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        ownerId: meetingData.ownerId,
        isImportant: meetingData.isImportant
      });
    }
  };

  // 会議削除
  const handleMeetingDelete = async (meeting: Meeting) => {
    await deleteMutation.mutateAsync(meeting.id);
    
    // 詳細モーダルを閉じる
    setShowMeetingDetail(false);
    setSelectedMeeting(null);
    
    // 編集中の会議が削除された場合はクリア
    if (editingMeeting?.id === meeting.id) {
      setEditingMeeting(undefined);
    }
  };

  // 参加者追加
  const handleAddParticipant = async (meetingId: string, email: string) => {
    const result = await addParticipantMutation.mutateAsync({
      meetingId,
      email
    });
    
    // 選択中の会議の参加者を更新
    if (selectedMeeting?.id === meetingId && result) {
      setSelectedMeeting(prev => prev ? {
        ...prev,
        participants: [...prev.participants, result.participant]
      } : null);
    }
  };

  // 参加者削除
  const handleRemoveParticipant = async (meetingId: string, participantId: string) => {
    await removeParticipantMutation.mutateAsync({
      meetingId,
      participantId
    });
    
    // 選択中の会議の参加者を更新
    if (selectedMeeting?.id === meetingId) {
      setSelectedMeeting(prev => prev ? {
        ...prev,
        participants: prev.participants.filter(p => p.id !== participantId)
      } : null);
    }
  };

  return {
    handleMeetingSubmit,
    handleMeetingDelete,
    handleAddParticipant,
    handleRemoveParticipant,
    // Mutation状態
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingParticipant: addParticipantMutation.isPending,
    isRemovingParticipant: removeParticipantMutation.isPending
  };
};