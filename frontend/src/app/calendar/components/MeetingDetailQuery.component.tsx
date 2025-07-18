import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/lib/ui/dialog';
import { Button } from '@/lib/ui/button';
import { Badge } from '@/lib/ui/badge';
import { Separator } from '@/lib/ui/separator';
import { ParticipantManager } from './ParticipantManager.component';
import { Meeting } from '@/types/meeting';
import { Calendar, Clock, User, Star, Edit, Trash2 } from 'lucide-react';
import { useMeetingDetailSuspense } from '../hooks/useMeetingsQuerySuspense';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorFallback } from '@/components/ErrorFallback';

interface MeetingDetailProps {
  meetingId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onAddParticipant: (meetingId: string, email: string) => void;
  onRemoveParticipant: (meetingId: string, participantId: string) => void;
  currentUser: string;
}

// ヘルパー関数
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(date);
};

// 🎨 UIコンポーネント群（同一ファイル内）
function DetailHeader({ meeting, isOwner, hasStarted, onEdit, onDelete }: {
  meeting: Meeting;
  isOwner: boolean;
  hasStarted: boolean;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
}) {
  const handleEdit = () => {
    onEdit({
      ...meeting,
      createdAt: new Date(meeting.createdAt),
      updatedAt: new Date(meeting.updatedAt)
    });
  };

  const handleDelete = () => {
    onDelete({
      ...meeting,
      createdAt: new Date(meeting.createdAt),
      updatedAt: new Date(meeting.updatedAt)
    });
  };

  return (
    <DialogHeader>
      <DialogTitle className="flex items-center justify-between">
        <span>会議詳細</span>
        {isOwner && !hasStarted && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
              編集
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogTitle>
    </DialogHeader>
  );
}

function TitleAndStatus({ meeting, hasStarted, isCompleted }: {
  meeting: Meeting;
  hasStarted: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-semibold">{meeting.title}</h3>
        {meeting.isImportant && (
          <Badge variant="secondary">
            <Star className="h-3 w-3 mr-1" />
            重要
          </Badge>
        )}
        {isCompleted && (
          <Badge variant="outline">完了</Badge>
        )}
        {hasStarted && !isCompleted && (
          <Badge>進行中</Badge>
        )}
      </div>
    </div>
  );
}

function MeetingInfo({ meeting }: { meeting: Meeting }) {
  const duration = Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 1000 / 60);

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{formatDate(meeting.startTime)}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span data-testid="meeting-time-display">
          {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
        </span>
        <span className="text-muted-foreground">
          ({duration}分)
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>オーナー: {meeting.owner}</span>
      </div>
    </div>
  );
}

function MeetingStatusMessage({ hasStarted, isCompleted, isOwner }: {
  hasStarted: boolean;
  isCompleted: boolean;
  isOwner: boolean;
}) {
  if (!hasStarted) return null;

  return (
    <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
      {isCompleted ? '✓ この会議は終了しました' : (
        <>
          <p>● この会議は現在進行中です</p>
          {isOwner && <p>この会議は既に開始されているため、編集できません。</p>}
        </>
      )}
    </div>
  );
}

// 🏗️ メインコンポーネント - 構造が一目瞭然
function MeetingDetailContent({ 
  meetingId, 
  onEdit, 
  onDelete,
  onAddParticipant,
  onRemoveParticipant,
  currentUser 
}: Omit<MeetingDetailProps, 'open' | 'onClose'>) {
  const { meeting } = useMeetingDetailSuspense(meetingId);
  
  if (!meeting) return null;
  
  const isOwner = meeting?.ownerId === currentUser || meeting?.owner === currentUser;
  const hasStarted = meeting && new Date() >= new Date(meeting.startTime);
  const isCompleted = meeting && new Date() >= new Date(meeting.endTime);
  
  return (
    <>
      <DetailHeader 
        meeting={meeting}
        isOwner={isOwner}
        hasStarted={hasStarted}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      
      <div className="space-y-4">
        <TitleAndStatus 
          meeting={meeting}
          hasStarted={hasStarted}
          isCompleted={isCompleted}
        />
        
        <Separator />
        
        <MeetingInfo meeting={meeting} />
        
        <Separator />
        
        <ParticipantManager
          meetingId={meeting.id}
          participants={meeting.participants}
          onAddParticipant={onAddParticipant}
          onRemoveParticipant={onRemoveParticipant}
          owner={meeting.owner}
          currentUser={currentUser}
          isOwner={isOwner}
        />
        
        <MeetingStatusMessage 
          hasStarted={hasStarted}
          isCompleted={isCompleted}
          isOwner={isOwner}
        />
      </div>
    </>
  );
}

export function MeetingDetailQuery({ 
  meetingId, 
  open, 
  onClose, 
  onEdit, 
  onDelete,
  onAddParticipant,
  onRemoveParticipant,
  currentUser 
}: MeetingDetailProps) {
  if (!open || !meetingId) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner message="会議詳細を読み込んでいます..." />}>
            <MeetingDetailContent
              meetingId={meetingId}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddParticipant={onAddParticipant}
              onRemoveParticipant={onRemoveParticipant}
              currentUser={currentUser}
            />
          </Suspense>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}