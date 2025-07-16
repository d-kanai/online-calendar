import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../lib/ui/dialog';
import { Button } from '../lib/ui/button';
import { Input } from '../lib/ui/input';
import { Label } from '../lib/ui/label';
import { Textarea } from '../lib/ui/textarea';
import { Switch } from '../lib/ui/switch';
import { Alert, AlertDescription } from '../lib/ui/alert';
import { Meeting } from '../types/meeting';
import { AlertCircle } from 'lucide-react';

interface MeetingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  meeting?: Meeting;
  selectedDate?: Date;
  existingMeetings: Meeting[];
  currentUser: string;
}

export function MeetingForm({ 
  open, 
  onClose, 
  onSubmit, 
  meeting, 
  selectedDate, 
  existingMeetings,
  currentUser 
}: MeetingFormProps) {
  console.log('MeetingForm rendered:', { open, selectedDate });
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    isImportant: false,
    description: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        startTime: meeting.startTime.toISOString().slice(0, 16),
        endTime: meeting.endTime.toISOString().slice(0, 16),
        isImportant: meeting.isImportant,
        description: ''
      });
    } else if (selectedDate) {
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(10, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setHours(11, 0, 0, 0);
      
      setFormData({
        title: '',
        startTime: defaultStart.toISOString().slice(0, 16),
        endTime: defaultEnd.toISOString().slice(0, 16),
        isImportant: false,
        description: ''
      });
    }
  }, [meeting, selectedDate]);
  
  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.title.trim()) {
      newErrors.push('タイトルは必須項目です');
    }
    
    if (!formData.startTime) {
      newErrors.push('開始時刻は必須項目です');
    }
    
    if (!formData.endTime) {
      newErrors.push('終了時刻は必須項目です');
    }
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (end <= start) {
        newErrors.push('終了時刻は開始時刻より後に設定してください');
      }
      
      // 開始済み会議の変更チェック
      if (meeting) {
        const now = new Date();
        if (start <= now) {
          newErrors.push('開始済みの会議は変更できません');
        }
      }
      
      // 時間重複チェック
      const hasConflict = existingMeetings.some(existingMeeting => {
        if (meeting && existingMeeting.id === meeting.id) return false;
        
        const existingStart = existingMeeting.startTime;
        const existingEnd = existingMeeting.endTime;
        
        return (start < existingEnd && end > existingStart);
      });
      
      if (hasConflict) {
        newErrors.push('他の会議と時間が重複しています');
      }
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      owner: currentUser,
      participants: meeting?.participants || [],
      isImportant: formData.isImportant,
      status: 'scheduled'
    };
    
    onSubmit(meetingData);
    handleClose();
  };
  
  const handleClose = () => {
    setFormData({
      title: '',
      startTime: '',
      endTime: '',
      isImportant: false,
      description: ''
    });
    setErrors([]);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {meeting ? '会議を編集' : '新しい会議を作成'}
          </DialogTitle>
        </DialogHeader>
        
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              data-testid="meeting-title-input"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="会議のタイトルを入力"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時刻 *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">終了時刻 *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="important"
              data-testid="meeting-important-switch"
              checked={formData.isImportant}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isImportant: checked }))}
            />
            <Label htmlFor="important">重要な会議</Label>
            <span className="text-sm text-muted-foreground">
              (リマインダーが60分前に送信されます)
            </span>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" data-testid="meeting-submit-button">
              {meeting ? '更新' : '作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}