import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query-keys';
import { Meeting } from '../../../types/meeting';

// UI状態を通常のReact stateで管理（TanStack Queryはサーバー状態専用）
export const useCalendarState = () => {
  const queryClient = useQueryClient();
  
  // UI状態
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMeetingDetail, setShowMeetingDetail] = useState(false);
  
  // 日付選択
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowMeetingForm(true);
    setEditingMeetingId(null);
  };
  
  // 会議選択
  const handleMeetingSelect = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setShowMeetingDetail(true);
  };
  
  // 新規作成
  const handleCreateMeeting = () => {
    setShowMeetingForm(true);
    setEditingMeetingId(null);
    setSelectedDate(new Date());
  };
  
  // 編集開始
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeetingId(meeting.id);
    setShowMeetingForm(true);
    setShowMeetingDetail(false);
  };
  
  // フォームを閉じる
  const handleCloseForm = () => {
    setShowMeetingForm(false);
    setEditingMeetingId(null);
  };
  
  // 詳細を閉じる
  const handleCloseDetail = () => {
    setShowMeetingDetail(false);
    setSelectedMeetingId(null);
  };
  
  // 編集中の会議を取得
  const getEditingMeeting = (): Meeting | undefined => {
    if (!editingMeetingId) return undefined;
    
    // まずキャッシュから取得
    const detailCache = queryClient.getQueryData(
      queryKeys.meetingDetail(editingMeetingId)
    ) as Meeting | undefined;
    
    if (detailCache) return detailCache;
    
    // リストキャッシュから取得
    const listCache = queryClient.getQueryData(queryKeys.meetingsList()) as Meeting[] | undefined;
    return listCache?.find(m => m.id === editingMeetingId);
  };
  
  return {
    // UI状態
    selectedMeetingId,
    showMeetingForm,
    editingMeetingId,
    editingMeeting: getEditingMeeting(),
    selectedDate,
    showMeetingDetail,
    
    // ハンドラー
    handleDateSelect,
    handleMeetingSelect,
    handleCreateMeeting,
    handleEditMeeting,
    handleCloseForm,
    handleCloseDetail,
  };
};