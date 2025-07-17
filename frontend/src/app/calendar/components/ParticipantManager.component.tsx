import React, { useState } from 'react';
import { Button } from '@/lib/ui/button';
import { Input } from '@/lib/ui/input';
import { Label } from '@/lib/ui/label';
import { Badge } from '@/lib/ui/badge';
import { Alert, AlertDescription } from '@/lib/ui/alert';
import { Separator } from '@/lib/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/lib/ui/dialog';
import { Participant } from '@/types/meeting';
import { Plus, X, Users, AlertCircle } from 'lucide-react';
import { meetingApi } from '../apis/meeting.api';
import { toast } from 'sonner';

interface ParticipantManagerProps {
  meetingId: string;
  participants: Participant[];
  onParticipantsChange: (type: 'add' | 'remove', meetingId: string, data: { email?: string; participantId?: string }) => void;
  owner: string;
  currentUser: string;
  isOwner: boolean;
}

export function ParticipantManager({ 
  meetingId,
  participants, 
  onParticipantsChange, 
  owner, 
  currentUser,
  isOwner 
}: ParticipantManagerProps) {
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  
  const MAX_PARTICIPANTS = 50;
  
  const addParticipant = async () => {
    setError('');
    
    if (!newParticipantEmail.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    if (!isOwner) {
      setError('参加者の追加はオーナーのみ可能です');
      return;
    }
    
    if (participants.length >= MAX_PARTICIPANTS) {
      setError('参加者は50名までです');
      return;
    }
    
    const email = newParticipantEmail.trim().toLowerCase();
    
    // 重複チェック
    if (participants.some(p => p.email === email) || email === owner.toLowerCase()) {
      setError('この参加者は既に追加されています');
      return;
    }
    
    // 簡単なメール形式チェック
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }
    
    // API呼び出しは親コンポーネントでmutationを通じて実行
    onParticipantsChange('add', meetingId, { email: email });
    setNewParticipantEmail('');
  };
  
  const openDeleteDialog = (participant: Participant) => {
    if (!isOwner) {
      setError('参加者の削除はオーナーのみ可能です');
      return;
    }
    
    setParticipantToDelete(participant);
    setDeleteDialogOpen(true);
  };

  const removeParticipant = async () => {
    if (!participantToDelete) return;
    
    // API呼び出しは親コンポーネントでmutationを通じて実行
    onParticipantsChange('remove', meetingId, { participantId: participantToDelete.id });
    setDeleteDialogOpen(false);
    setParticipantToDelete(null);
  };
  
  // Notification toggle removed since notificationChannels is no longer part of Participant
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h3>参加者管理</h3>
        <Badge variant="secondary">
          {participants.length}/{MAX_PARTICIPANTS}
        </Badge>
      </div>
      
      {/* オーナー表示 */}
      <div className="space-y-2">
        <Label>オーナー</Label>
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <Badge variant="default">オーナー</Badge>
          <span>{owner}</span>
        </div>
      </div>
      
      <Separator />
      
      {/* 参加者追加 */}
      {isOwner && (
        <div className="space-y-2">
          <Label>参加者を追加</Label>
          <div className="flex gap-2">
            <Input
              placeholder="参加者のメールアドレス"
              value={newParticipantEmail}
              onChange={(e) => setNewParticipantEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
            />
            <Button onClick={addParticipant} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {/* 参加者リスト */}
      {participants.length > 0 && (
        <div className="space-y-2">
          <Label>参加者一覧</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{participant.name}</span>
                    <span className="text-sm text-muted-foreground">({participant.email})</span>
                  </div>
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(participant)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    削除
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isOwner && (
        <div className="space-y-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              参加者の招待と管理はオーナーのみ可能です。
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // 参加者が会議から退会する処理
              const participant = participants.find(p => p.email === currentUser);
              if (participant) {
                onParticipantsChange('remove', meetingId, { participantId: participant.id });
              }
            }}
          >
            会議から退会
          </Button>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>参加者の削除</DialogTitle>
            <DialogDescription>
              {participantToDelete && (
                <>
                  <strong>{participantToDelete.email}</strong> を会議から削除しますか？
                  <br />
                  この操作は取り消すことができません。
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setParticipantToDelete(null);
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={removeParticipant}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}