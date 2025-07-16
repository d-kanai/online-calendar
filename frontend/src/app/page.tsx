'use client';

import React from 'react';
import { CalendarView } from '../components/CalendarView';
import { MeetingForm } from '../components/MeetingForm';
import { MeetingDetail } from '../components/MeetingDetail';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Toaster } from 'sonner';
import { useMeetings } from '../hooks/useMeetings';
import { useMeetingModals } from '../hooks/useMeetingModals';
import { useMeetingActions } from '../hooks/useMeetingActions';
import { useReminderService } from '../hooks/useReminderService';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // ローディング中は何も表示しない
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>;
  }
  
  // 未認証の場合は認証画面を表示
  if (!isAuthenticated) {
    return <AuthLayout />;
  }

  const CURRENT_USER = user?.email || 'unknown@example.com';
  // Custom Hooks
  const { meetings, loadMeetings, updateMeetings } = useMeetings();
  
  const {
    selectedMeeting,
    showMeetingForm,
    editingMeeting,
    selectedDate,
    showMeetingDetail,
    setSelectedMeeting,
    setEditingMeeting,
    setShowMeetingDetail,
    handleDateSelect,
    handleMeetingSelect,
    handleCreateMeeting,
    handleEditMeeting,
    handleCloseForm,
    handleCloseDetail
  } = useMeetingModals();

  const {
    handleMeetingSubmit,
    handleMeetingDelete,
    handleParticipantsChange
  } = useMeetingActions({
    meetings,
    updateMeetings,
    loadMeetings,
    editingMeeting,
    setEditingMeeting,
    selectedMeeting,
    setSelectedMeeting,
    setShowMeetingDetail
  });

  // リマインダーサービス
  useReminderService({ meetings });

  return (
    <div className="h-screen bg-background">
      <CalendarView
        meetings={meetings}
        onDateSelect={handleDateSelect}
        onMeetingSelect={handleMeetingSelect}
        onCreateMeeting={handleCreateMeeting}
      />
      
      <MeetingForm
        open={showMeetingForm}
        onClose={handleCloseForm}
        onSubmit={handleMeetingSubmit}
        meeting={editingMeeting}
        selectedDate={selectedDate}
        existingMeetings={meetings}
        currentUser={CURRENT_USER}
      />
      
      <MeetingDetail
        meeting={selectedMeeting}
        open={showMeetingDetail}
        onClose={handleCloseDetail}
        onEdit={handleEditMeeting}
        onDelete={handleMeetingDelete}
        onParticipantsChange={handleParticipantsChange}
        currentUser={CURRENT_USER}
      />
      
      <Toaster />
    </div>
  );
}
