import { useState } from 'react';
import { Meeting } from '../types/meeting';

export const useMeetingModals = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showMeetingDetail, setShowMeetingDetail] = useState(false);

  // 日付選択
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setEditingMeeting(undefined);
    setShowMeetingForm(true);
  };

  // 会議選択
  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDetail(true);
  };

  // 会議作成ボタン
  const handleCreateMeeting = () => {
    setSelectedDate(new Date());
    setEditingMeeting(undefined);
    setShowMeetingForm(true);
  };

  // 会議編集
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setShowMeetingDetail(false);
    setShowMeetingForm(true);
  };

  // フォーム閉じる
  const handleCloseForm = () => {
    setShowMeetingForm(false);
    setEditingMeeting(undefined);
    setSelectedDate(undefined);
  };

  // 詳細モーダル閉じる
  const handleCloseDetail = () => {
    setShowMeetingDetail(false);
    setSelectedMeeting(null);
  };

  return {
    // State
    selectedMeeting,
    showMeetingForm,
    editingMeeting,
    selectedDate,
    showMeetingDetail,
    
    // Setters (for external use like useMeetingActions)
    setSelectedMeeting,
    setEditingMeeting,
    setShowMeetingDetail,
    
    // Handlers
    handleDateSelect,
    handleMeetingSelect,
    handleCreateMeeting,
    handleEditMeeting,
    handleCloseForm,
    handleCloseDetail
  };
};