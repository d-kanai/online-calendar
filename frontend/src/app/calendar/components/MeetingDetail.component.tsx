import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/lib/ui/sheet';
import { Button } from '@/lib/ui/button';
import { Badge } from '@/lib/ui/badge';
import { Separator } from '@/lib/ui/separator';
import { ParticipantManager } from './ParticipantManager.component';
import { Meeting } from '@/types/meeting';
import { Calendar, Clock, User, Star, Edit, Trash2 } from 'lucide-react';

interface MeetingDetailProps {
  meeting: Meeting | null;
  open: boolean;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onParticipantsChange: (type: 'add' | 'remove', meetingId: string, data: { email?: string; participantId?: string }) => void;
  currentUser: string;
}

// 🎨 UIコンポーネント群（同一ファイル内）
function MeetingHeader({ meeting, isOwner, hasStarted, onEdit, onDelete }: {
  meeting: Meeting;
  isOwner: boolean;
  hasStarted: boolean;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
}) {
  return (
    <SheetHeader className="pb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <SheetTitle className="flex items-center gap-2">
            {meeting.title}
            {meeting.isImportant && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </SheetTitle>
          <SheetDescription>
            会議の詳細情報と参加者管理
          </SheetDescription>
          <div className="flex items-center gap-2 mt-3">
            <MeetingStatusBadge meeting={meeting} />
            {meeting.isImportant && (
              <Badge variant="outline">重要</Badge>
            )}
          </div>
        </div>
        <ActionButtons 
          isOwner={isOwner} 
          hasStarted={hasStarted} 
          meeting={meeting}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </SheetHeader>
  );
}

function MeetingStatusBadge({ meeting }: { meeting: Meeting }) {
  const now = new Date();
  const hasEnded = meeting.endTime <= now;
  const isInProgress = meeting.startTime <= now && meeting.endTime > now;
  const hasStarted = meeting.startTime <= now;
  
  if (hasEnded) {
    return <Badge variant="secondary">終了</Badge>;
  }
  if (isInProgress) {
    return <Badge variant="default">進行中</Badge>;
  }
  if (hasStarted) {
    return <Badge variant="secondary">開始済み</Badge>;
  }
  return <Badge variant="outline">予定</Badge>;
}

function ActionButtons({ isOwner, hasStarted, meeting, onEdit, onDelete }: {
  isOwner: boolean;
  hasStarted: boolean;
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
}) {
  if (!isOwner || hasStarted) return null;
  
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={() => onEdit(meeting)}>
        <Edit className="h-4 w-4" />
        編集
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onDelete(meeting)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function BasicInfo({ meeting }: { meeting: Meeting }) {
  const duration = Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{meeting.startTime.toLocaleDateString('ja-JP', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>
          {meeting.startTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          {' - '}
          {meeting.endTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-muted-foreground">
          ({duration}分)
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>オーナー: {meeting.owner}</span>
      </div>
    </div>
  );
}

function ReminderInfo({ meeting }: { meeting: Meeting }) {
  const reminderMinutes = meeting.isImportant ? 60 : 15;
  const reminderTime = new Date(meeting.startTime.getTime() - reminderMinutes * 60000);
  
  return (
    <div className="space-y-2">
      <h4>リマインダー</h4>
      <p className="text-sm text-muted-foreground">
        {reminderMinutes}分前にリマインダーが送信されます
      </p>
      <p className="text-sm">
        送信予定時刻: {reminderTime.toLocaleString('ja-JP')}
      </p>
    </div>
  );
}

function StartedMeetingNotice() {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground">
        この会議は既に開始されているため、編集できません。
      </p>
    </div>
  );
}

// 🏗️ メインコンポーネント - 構造が一目瞭然
export function MeetingDetail({ 
  meeting, 
  open, 
  onClose, 
  onEdit, 
  onDelete,
  onParticipantsChange,
  currentUser 
}: MeetingDetailProps) {
  if (!meeting) return null;
  
  const isOwner = meeting.owner === currentUser;
  const hasStarted = meeting.startTime <= new Date();
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-8 py-8">
        <MeetingHeader 
          meeting={meeting}
          isOwner={isOwner}
          hasStarted={hasStarted}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        
        <div className="space-y-8">
          <BasicInfo meeting={meeting} />
          <Separator />
          <ReminderInfo meeting={meeting} />
          <Separator />
          
          <ParticipantManager
            meetingId={meeting.id}
            participants={meeting.participants}
            onParticipantsChange={onParticipantsChange}
            owner={meeting.owner}
            currentUser={currentUser}
            isOwner={isOwner}
          />
          
          {hasStarted && <StartedMeetingNotice />}
        </div>
      </SheetContent>
    </Sheet>
  );
}