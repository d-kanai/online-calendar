'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarView } from './components/CalendarView.component';
import { MeetingForm } from './components/MeetingForm.component';
import { MeetingDetail } from './components/MeetingDetail.component';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from 'sonner';
import { useMeetings } from '@/hooks/useMeetings';
import { useMeetingModals } from '@/hooks/useMeetingModals';
import { useMeetingActions } from '@/hooks/useMeetingActions';
import { useReminderService } from '@/hooks/useReminderService';
import { useAuth } from '@/contexts/AuthContext';

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
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

  const handleNavigate = (screen: 'calendar' | 'stats') => {
    if (screen === 'stats') {
      router.push('/stats');
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader currentScreen="calendar" onNavigate={handleNavigate} />
      
      <div className="flex-1 overflow-hidden">
        <CalendarView
          meetings={meetings}
          onDateSelect={handleDateSelect}
          onMeetingSelect={handleMeetingSelect}
          onCreateMeeting={handleCreateMeeting}
        />
      </div>
      
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