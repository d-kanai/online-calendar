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
  onAddParticipant: (meetingId: string, email: string) => void;
  onRemoveParticipant: (meetingId: string, participantId: string) => void;
  owner: string;
  currentUser: string;
  isOwner: boolean;
}

// 🎨 UIコンポーネント群（同一ファイル内）
function ParticipantHeader({ participantsCount, maxParticipants }: { participantsCount: number; maxParticipants: number }) {
  return (
    <div className="flex items-center gap-2">
      <Users className="h-5 w-5" />
      <h3>参加者管理</h3>
      <Badge variant="secondary">
        {participantsCount}/{maxParticipants}
      </Badge>
    </div>
  );
}

function OwnerSection({ owner }: { owner: string }) {
  return (
    <div className="space-y-2">
      <Label>オーナー</Label>
      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
        <Badge variant="default">オーナー</Badge>
        <span>{owner}</span>
      </div>
    </div>
  );
}

function AddParticipantForm({ 
  isOwner, 
  newParticipantEmail, 
  setNewParticipantEmail, 
  onAdd, 
  error 
}: { 
  isOwner: boolean; 
  newParticipantEmail: string; 
  setNewParticipantEmail: (email: string) => void; 
  onAdd: () => void; 
  error: string; 
}) {
  if (!isOwner) return null;
  
  return (
    <div className="space-y-2">
      <Label>参加者を追加</Label>
      <div className="flex gap-2">
        <Input
          placeholder="参加者のメールアドレス"
          value={newParticipantEmail}
          onChange={(e) => setNewParticipantEmail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        />
        <Button onClick={onAdd} size="sm">
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
  );
}

function ParticipantList({ 
  participants, 
  isOwner, 
  onDelete 
}: { 
  participants: Participant[]; 
  isOwner: boolean; 
  onDelete: (participant: Participant) => void; 
}) {
  if (participants.length === 0) return null;
  
  return (
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
                onClick={() => onDelete(participant)}
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
  );
}

function NonOwnerActions({ 
  currentUser, 
  participants, 
  meetingId, 
  onRemoveParticipant 
}: { 
  currentUser: string; 
  participants: Participant[]; 
  meetingId: string; 
  onRemoveParticipant: (meetingId: string, participantId: string) => void; 
}) {
  return (
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
            onRemoveParticipant(meetingId, participant.id);
          }
        }}
      >
        会議から退会
      </Button>
    </div>
  );
}

function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  participantToDelete, 
  onConfirm 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  participantToDelete: Participant | null; 
  onConfirm: () => void; 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 🏗️ メインコンポーネント - 構造が一目瞭然
export function ParticipantManager({ 
  meetingId,
  participants, 
  onAddParticipant,
  onRemoveParticipant, 
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
    onAddParticipant(meetingId, email);
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
    onRemoveParticipant(meetingId, participantToDelete.id);
    setDeleteDialogOpen(false);
    setParticipantToDelete(null);
  };
  
  return (
    <div className="space-y-4">
      <ParticipantHeader participantsCount={participants.length} maxParticipants={MAX_PARTICIPANTS} />
      <OwnerSection owner={owner} />
      <Separator />
      <AddParticipantForm 
        isOwner={isOwner}
        newParticipantEmail={newParticipantEmail}
        setNewParticipantEmail={setNewParticipantEmail}
        onAdd={addParticipant}
        error={error}
      />
      <ParticipantList 
        participants={participants}
        isOwner={isOwner}
        onDelete={openDeleteDialog}
      />
      {!isOwner && (
        <NonOwnerActions 
          currentUser={currentUser}
          participants={participants}
          meetingId={meetingId}
          onRemoveParticipant={onRemoveParticipant}
        />
      )}
      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        participantToDelete={participantToDelete}
        onConfirm={removeParticipant}
      />
    </div>
  );
}