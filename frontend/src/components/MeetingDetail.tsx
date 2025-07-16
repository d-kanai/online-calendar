import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../lib/ui/sheet';
import { Button } from '../lib/ui/button';
import { Badge } from '../lib/ui/badge';
import { Separator } from '../lib/ui/separator';
import { ParticipantManager } from './ParticipantManager';
import { Meeting } from '../types/meeting';
import { Calendar, Clock, User, Star, Edit, Trash2 } from 'lucide-react';

interface MeetingDetailProps {
  meeting: Meeting | null;
  open: boolean;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string) => void;
  onParticipantsChange: (meetingId: string, participants: Meeting['participants']) => void;
  currentUser: string;
}

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
  const now = new Date();
  const hasStarted = meeting.startTime <= now;
  const isInProgress = meeting.startTime <= now && meeting.endTime > now;
  const hasEnded = meeting.endTime <= now;
  
  const getStatusBadge = () => {
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
  };
  
  const getReminderTime = () => {
    const reminderMinutes = meeting.isImportant ? 60 : 15;
    const reminderTime = new Date(meeting.startTime.getTime() - reminderMinutes * 60000);
    return reminderTime.toLocaleString('ja-JP');
  };
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-8 py-8">
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
                {getStatusBadge()}
                {meeting.isImportant && (
                  <Badge variant="outline">重要</Badge>
                )}
              </div>
            </div>
            {isOwner && !hasStarted && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(meeting)}>
                  <Edit className="h-4 w-4" />
                  編集
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(meeting.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>
        
        <div className="space-y-8">
          {/* 基本情報 */}
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
                ({Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000)}分)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>オーナー: {meeting.owner}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* リマインダー情報 */}
          <div className="space-y-2">
            <h4>リマインダー</h4>
            <p className="text-sm text-muted-foreground">
              {meeting.isImportant ? '60分前' : '15分前'}にリマインダーが送信されます
            </p>
            <p className="text-sm">
              送信予定時刻: {getReminderTime()}
            </p>
          </div>
          
          <Separator />
          
          {/* 参加者管理 */}
          <ParticipantManager
            meetingId={meeting.id}
            participants={meeting.participants}
            onParticipantsChange={(participants) => onParticipantsChange(meeting.id, participants)}
            owner={meeting.owner}
            currentUser={currentUser}
            isOwner={isOwner}
          />
          
          {hasStarted && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                この会議は既に開始されているため、編集できません。
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}