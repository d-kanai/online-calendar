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
import { Meeting } from '@/types/meeting';

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
      <CalendarViewSection
        meetings={meetings}
        onDateSelect={handleDateSelect}
        onMeetingSelect={handleMeetingSelect}
        onCreateMeeting={handleCreateMeeting}
      />
      
      <CalendarModals
        meetings={meetings}
        currentUser={currentUser}
        showMeetingForm={showMeetingForm}
        editingMeeting={editingMeeting ?? null}
        selectedDate={selectedDate}
        showMeetingDetail={showMeetingDetail}
        selectedMeetingId={selectedMeetingId}
        onCloseForm={handleCloseForm}
        onMeetingSubmit={handleMeetingSubmit}
        onCloseDetail={handleCloseDetail}
        onEditMeeting={handleEditMeeting}
        onMeetingDelete={handleMeetingDelete}
        onParticipantsChange={handleParticipantsChange}
      />
      
      <Toaster />
    </>
  );
}

// 🎨 UIコンポーネント群
function CalendarViewSection({ meetings, onDateSelect, onMeetingSelect, onCreateMeeting }: {
  meetings: Meeting[];
  onDateSelect: (date: Date) => void;
  onMeetingSelect: (meetingId: string) => void;
  onCreateMeeting: () => void;
}) {
  return (
    <div className="flex-1 overflow-hidden">
      <CalendarView
        meetings={meetings}
        onDateSelect={onDateSelect}
        onMeetingSelect={onMeetingSelect}
        onCreateMeeting={onCreateMeeting}
      />
    </div>
  );
}

function CalendarModals({ 
  meetings, 
  currentUser,
  showMeetingForm,
  editingMeeting,
  selectedDate,
  showMeetingDetail,
  selectedMeetingId,
  onCloseForm,
  onMeetingSubmit,
  onCloseDetail,
  onEditMeeting,
  onMeetingDelete,
  onParticipantsChange
}: {
  meetings: Meeting[];
  currentUser: string;
  showMeetingForm: boolean;
  editingMeeting: Meeting | null;
  selectedDate: Date | null;
  showMeetingDetail: boolean;
  selectedMeetingId: string | null;
  onCloseForm: () => void;
  onMeetingSubmit: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCloseDetail: () => void;
  onEditMeeting: (meeting: Meeting) => void;
  onMeetingDelete: (meeting: Meeting) => void;
  onParticipantsChange: (type: 'add' | 'remove', meetingId: string, data: { email?: string; participantId?: string }) => void;
}) {
  return (
    <>
      <MeetingForm
        open={showMeetingForm}
        onClose={onCloseForm}
        onSubmit={onMeetingSubmit}
        meeting={editingMeeting ?? undefined}
        selectedDate={selectedDate ?? undefined}
        existingMeetings={meetings}
        currentUser={currentUser}
      />
      
      <MeetingDetailQuery
        meetingId={selectedMeetingId}
        open={showMeetingDetail}
        onClose={onCloseDetail}
        onEdit={onEditMeeting}
        onDelete={onMeetingDelete}
        onParticipantsChange={onParticipantsChange}
        currentUser={currentUser}
      />
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