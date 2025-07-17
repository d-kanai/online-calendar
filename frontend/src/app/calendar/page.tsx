'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarView } from './components/CalendarView.component';
import { MeetingForm } from './components/MeetingForm.component';
import { MeetingDetailQuery } from './components/MeetingDetailQuery.component';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from 'sonner';
import { useMeetings } from './hooks/useMeetingsQuery';
import { useCalendarState } from './hooks/useCalendarState';
import { useMeetingActions } from './hooks/useMeetingActionsQuery';
import { useReminderService } from './hooks/useReminderService';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalRealtimeSync } from './hooks/useRealtimeSync';

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const CURRENT_USER = user?.email || 'unknown@example.com';
  
  // グローバルリアルタイム同期を有効化
  useGlobalRealtimeSync();
  
  // TanStack Query Hooks
  const { meetings, isLoading, error } = useMeetings();
  
  // 統合されたカレンダー状態管理
  const {
    selectedMeetingId,
    showMeetingForm,
    editingMeeting,
    selectedDate,
    showMeetingDetail,
    handleDateSelect,
    handleMeetingSelect,
    handleCreateMeeting,
    handleEditMeeting,
    handleCloseForm,
    handleCloseDetail,
  } = useCalendarState();

  const {
    handleMeetingSubmit,
    handleMeetingDelete,
    handleParticipantsChange,
  } = useMeetingActions({
    editingMeeting,
    setEditingMeeting: () => {}, // もう必要ない
    selectedMeeting: null, // MeetingDetailQueryで管理
    setSelectedMeeting: () => {}, // もう必要ない
    setShowMeetingDetail: () => {}, // もう必要ない
  });

  // リマインダーサービス
  useReminderService({ meetings });

  const handleNavigate = (screen: 'calendar' | 'stats') => {
    if (screen === 'stats') {
      router.push('/stats');
    }
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">会議データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">エラーが発生しました</p>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

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
      
      <MeetingDetailQuery
        meetingId={selectedMeetingId}
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