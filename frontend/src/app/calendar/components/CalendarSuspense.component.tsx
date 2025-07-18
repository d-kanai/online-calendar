'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CalendarView } from './CalendarView.component';
import { MeetingForm } from './MeetingForm.component';
import { MeetingDetailQuery } from './MeetingDetailQuery.component';
import { Toaster } from 'sonner';
import { useMeetingsSuspense } from '../hooks/useMeetingsQuerySuspense';
import { useCalendarState } from '../hooks/useCalendarState';
import { useMeetingActions } from '../hooks/useMeetingActionsQuery';
import { useReminderService } from '../hooks/useReminderService';

// Suspense対応のカレンダーコンテンツ
function CalendarContent({ currentUser }: { currentUser: string }) {
  // Suspenseを使用したデータ取得
  const { meetings } = useMeetingsSuspense();
  
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
    setEditingMeeting: () => {},
    selectedMeeting: null,
    setSelectedMeeting: () => {},
    setShowMeetingDetail: () => {},
  });

  // リマインダーサービス
  useReminderService({ meetings });

  return (
    <>
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
        selectedDate={selectedDate ?? undefined}
        existingMeetings={meetings}
        currentUser={currentUser}
      />
      
      <MeetingDetailQuery
        meetingId={selectedMeetingId}
        open={showMeetingDetail}
        onClose={handleCloseDetail}
        onEdit={handleEditMeeting}
        onDelete={handleMeetingDelete}
        onParticipantsChange={handleParticipantsChange}
        currentUser={currentUser}
      />
      
      <Toaster />
    </>
  );
}

// ローディングコンポーネント
function CalendarLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">会議データを読み込んでいます...</p>
      </div>
    </div>
  );
}

// エラーフォールバックコンポーネント
function CalendarError({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-destructive">エラーが発生しました</p>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          再試行
        </button>
      </div>
    </div>
  );
}

// Suspense対応のカレンダーコンポーネント
export function CalendarSuspense({ currentUser }: { currentUser: string }) {
  return (
    <ErrorBoundary FallbackComponent={CalendarError}>
      <Suspense fallback={<CalendarLoading />}>
        <CalendarContent currentUser={currentUser} />
      </Suspense>
    </ErrorBoundary>
  );
}