import React, { useState } from 'react';
import { Button } from '../lib/ui/button';
import { Input } from '../lib/ui/input';
import { Label } from '../lib/ui/label';
import { Badge } from '../lib/ui/badge';
import { Alert, AlertDescription } from '../lib/ui/alert';
import { Separator } from '../lib/ui/separator';
import { Participant } from '../types/meeting';
import { Plus, X, Mail, Bell, BellOff, Users, AlertCircle } from 'lucide-react';

interface ParticipantManagerProps {
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
  owner: string;
  currentUser: string;
  isOwner: boolean;
}

export function ParticipantManager({ 
  participants, 
  onParticipantsChange, 
  owner, 
  currentUser,
  isOwner 
}: ParticipantManagerProps) {
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [error, setError] = useState('');
  
  const MAX_PARTICIPANTS = 50;
  
  const addParticipant = () => {
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
    
    const newParticipant: Participant = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0], // 仮の名前
      notificationChannels: {
        email: true,
        push: false
      }
    };
    
    onParticipantsChange([...participants, newParticipant]);
    setNewParticipantEmail('');
  };
  
  const removeParticipant = (participantId: string) => {
    if (!isOwner) {
      setError('参加者の削除はオーナーのみ可能です');
      return;
    }
    
    onParticipantsChange(participants.filter(p => p.id !== participantId));
  };
  
  const toggleNotificationChannel = (participantId: string, channel: 'email' | 'push') => {
    onParticipantsChange(
      participants.map(p => 
        p.id === participantId 
          ? {
              ...p,
              notificationChannels: {
                ...p.notificationChannels,
                [channel]: !p.notificationChannels[channel]
              }
            }
          : p
      )
    );
  };
  
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
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNotificationChannel(participant.id, 'email')}
                      className={`h-6 p-1 ${participant.notificationChannels.email ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNotificationChannel(participant.id, 'push')}
                      className={`h-6 p-1 ${participant.notificationChannels.push ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {participant.notificationChannels.push ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParticipant(participant.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
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
              const updatedParticipants = participants.filter(p => p.email !== currentUser);
              onParticipantsChange(updatedParticipants);
            }}
          >
            会議から退会
          </Button>
        </div>
      )}
    </div>
  );
}