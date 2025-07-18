import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/lib/ui/dialog';
import { Button } from '@/lib/ui/button';
import { Input } from '@/lib/ui/input';
import { Label } from '@/lib/ui/label';
import { Switch } from '@/lib/ui/switch';
import { Alert, AlertDescription } from '@/lib/ui/alert';
import { Meeting } from '@/types/meeting';
import { AlertCircle } from 'lucide-react';
import { useMeetingForm } from '../hooks/useMeetingForm';

interface MeetingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  meeting?: Meeting;
  selectedDate?: Date;
  existingMeetings: Meeting[];
  currentUser: string;
}

// 🎨 UIコンポーネント群（同一ファイル内）
function FormHeader({ isEditing }: { isEditing: boolean }) {
  return (
    <DialogHeader>
      <DialogTitle>
        {isEditing ? '会議を編集' : '新しい会議を作成'}
      </DialogTitle>
    </DialogHeader>
  );
}

function ValidationErrors({ errors }: { errors: any }) {
  const hasError = errors.title || errors.startTime || errors.endTime;
  
  if (!hasError) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1">
          {errors.title && <li>{errors.title.message}</li>}
          {errors.startTime && <li>{errors.startTime.message}</li>}
          {errors.endTime && <li>{errors.endTime.message}</li>}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function TitleInput({ register }: { register: any }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="title">タイトル *</Label>
      <Input
        id="title"
        data-testid="meeting-title-input"
        {...register('title')}
        placeholder="会議のタイトルを入力"
      />
    </div>
  );
}

function TimeInputs({ register }: { register: any }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="startTime">開始時刻 *</Label>
        <Input
          id="startTime"
          type="datetime-local"
          {...register('startTime')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endTime">終了時刻 *</Label>
        <Input
          id="endTime"
          type="datetime-local"
          {...register('endTime')}
        />
      </div>
    </div>
  );
}

function ImportantSwitch({ register, watch, setValue }: { register: any; watch: any; setValue: any }) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="important"
        data-testid="meeting-important-switch"
        {...register('isImportant')}
        checked={watch('isImportant')}
        onCheckedChange={(checked) => setValue('isImportant', checked)}
      />
      <Label htmlFor="important">重要な会議</Label>
      <span className="text-sm text-muted-foreground">
        (リマインダーが60分前に送信されます)
      </span>
    </div>
  );
}

function FormActions({ isEditing, onClose }: { isEditing: boolean; onClose: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onClose}>
        キャンセル
      </Button>
      <Button type="submit" data-testid="meeting-submit-button">
        {isEditing ? '更新' : '作成'}
      </Button>
    </div>
  );
}

// 🏗️ メインコンポーネント - 構造が一目瞭然
export function MeetingForm({ 
  open, 
  onClose, 
  onSubmit, 
  meeting, 
  selectedDate, 
  existingMeetings,
  currentUser 
}: MeetingFormProps) {
  // カスタムフックで全てのロジックを管理
  const {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    onFormSubmit,
    handleClose,
    isEditing
  } = useMeetingForm({
    open,
    meeting,
    selectedDate,
    existingMeetings,
    currentUser,
    onSubmit,
    onClose
  });
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <FormHeader isEditing={isEditing} />
        <ValidationErrors errors={errors} />
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <TitleInput register={register} />
          <TimeInputs register={register} />
          <ImportantSwitch register={register} watch={watch} setValue={setValue} />
          <FormActions isEditing={isEditing} onClose={handleClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
}