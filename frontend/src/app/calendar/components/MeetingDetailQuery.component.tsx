import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/lib/ui/dialog';
import { Button } from '@/lib/ui/button';
import { Badge } from '@/lib/ui/badge';
import { Separator } from '@/lib/ui/separator';
import { ParticipantManager } from './ParticipantManager.component';
import { Meeting } from '@/types/meeting';
import { Calendar, Clock, User, Star, Edit, Trash2 } from 'lucide-react';
import { useMeetingDetail } from '../hooks/useMeetingsQuery';

interface MeetingDetailProps {
  meetingId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onParticipantsChange: (type: 'add' | 'remove', meetingId: string, data: { email?: string; participantId?: string }) => void;
  currentUser: string;
}

export function MeetingDetailQuery({ 
  meetingId, 
  open, 
  onClose, 
  onEdit, 
  onDelete,
  onParticipantsChange,
  currentUser 
}: MeetingDetailProps) {
  // TanStack Queryで会議詳細を取得
  const { data: meeting, isLoading, error } = useMeetingDetail(meetingId);
  
  if (!open || !meetingId) return null;
  
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
  
  const isOwner = meeting?.ownerId === currentUser || meeting?.owner === currentUser;
  const hasStarted = meeting && new Date() >= new Date(meeting.startTime);
  const isCompleted = meeting && new Date() >= new Date(meeting.endTime);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>会議詳細</span>
            {isOwner && !hasStarted && meeting && (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(meeting)}
                >
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
            )}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading && (
          <div className="py-8 text-center text-muted-foreground">
            読み込み中...
          </div>
        )}
        
        {error && (
          <div className="py-8 text-center text-destructive">
            エラーが発生しました
          </div>
        )}
        
        {meeting && !isLoading && !error && (
          <div className="space-y-4">
            {/* タイトルとステータス */}
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
            
            <Separator />
            
            {/* 基本情報 */}
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
                  ({Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 1000 / 60)}分)
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>オーナー: {meeting.owner}</span>
              </div>
            </div>
            
            <Separator />
            
            {/* 参加者管理 */}
            <ParticipantManager
              meetingId={meeting.id}
              participants={meeting.participants}
              onParticipantsChange={onParticipantsChange}
              owner={meeting.owner}
              currentUser={currentUser}
              isOwner={isOwner}
            />
            
            {hasStarted && (
              <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                {isCompleted ? '✓ この会議は終了しました' : (
                  <>
                    <p>● この会議は現在進行中です</p>
                    {isOwner && <p>この会議は既に開始されているため、編集できません。</p>}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}