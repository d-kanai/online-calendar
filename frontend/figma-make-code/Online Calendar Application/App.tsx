import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/auth/AuthLayout';
import { AppHeader } from './components/AppHeader';
import { CalendarView } from './components/CalendarView';
import { MeetingForm } from './components/MeetingForm';
import { MeetingDetail } from './components/MeetingDetail';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { Meeting, Participant } from './types/meeting';

// モックデータ
const initialMeetings: Meeting[] = [
  {
    id: '1',
    title: '定例MTG',
    startTime: new Date(2025, 3, 1, 10, 0), // 2025年4月1日 10:00
    endTime: new Date(2025, 3, 1, 11, 0),   // 2025年4月1日 11:00
    owner: 'taro@example.com',
    participants: [
      {
        id: '1',
        email: 'hanako@example.com',
        name: 'Hanako',
        notificationChannels: { email: true, push: false }
      }
    ],
    isImportant: false,
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: '重要会議',
    startTime: new Date(2025, 3, 2, 14, 0), // 2025年4月2日 14:00
    endTime: new Date(2025, 3, 2, 16, 0),   // 2025年4月2日 16:00
    owner: 'taro@example.com',
    participants: [],
    isImportant: true,
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function CalendarApp() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showMeetingDetail, setShowMeetingDetail] = useState(false);

  const currentUser = user?.email || '';

  // 会議作成・更新
  const handleMeetingSubmit = (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMeeting) {
      // 更新
      setMeetings(prev => prev.map(meeting => 
        meeting.id === editingMeeting.id 
          ? { 
              ...meetingData, 
              id: editingMeeting.id, 
              createdAt: editingMeeting.createdAt,
              updatedAt: new Date() 
            }
          : meeting
      ));
      toast.success('会議が更新されました');
      
      // 参加者に通知を送信
      if (meetingData.participants.length > 0) {
        toast.info(`${meetingData.participants.length}名の参加者に変更通知を送信しました`);
      }
    } else {
      // 新規作成
      const newMeeting: Meeting = {
        ...meetingData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setMeetings(prev => [...prev, newMeeting]);
      toast.success('会議が作成されました');
    }
    
    setEditingMeeting(undefined);
  };

  // 会議削除
  const handleMeetingDelete = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting && meeting.participants.length > 0) {
      toast.info(`${meeting.participants.length}名の参加者にキャンセル通知を送信しました`);
    }
    
    setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
    setShowMeetingDetail(false);
    setSelectedMeeting(null);
    toast.success('会議が削除されました');
  };

  // 参加者変更
  const handleParticipantsChange = (meetingId: string, participants: Participant[]) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, participants, updatedAt: new Date() }
        : meeting
    ));
    
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting(prev => prev ? { ...prev, participants } : null);
    }
    
    toast.success('参加者が更新されました');
  };

  // 日付選択
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setEditingMeeting(undefined);
    setShowMeetingForm(true);
  };

  // 会議選択
  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDetail(true);
  };

  // 会議作成ボタン
  const handleCreateMeeting = () => {
    setSelectedDate(new Date());
    setEditingMeeting(undefined);
    setShowMeetingForm(true);
  };

  // 会議編集
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setShowMeetingDetail(false);
    setShowMeetingForm(true);
  };

  // リマインダー処理（実際のアプリでは別のサービスで処理）
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      meetings.forEach(meeting => {
        const reminderMinutes = meeting.isImportant ? 60 : 15;
        const reminderTime = new Date(meeting.startTime.getTime() - reminderMinutes * 60000);
        
        // リマインダー時刻の1分以内なら通知
        if (Math.abs(now.getTime() - reminderTime.getTime()) < 60000) {
          const activeParticipants = meeting.participants.filter(p => 
            p.notificationChannels.email || p.notificationChannels.push
          );
          
          if (activeParticipants.length > 0) {
            toast.info(`「${meeting.title}」のリマインダーを${activeParticipants.length}名に送信しました`);
          }
        }
      });
    };

    // 1分ごとにチェック
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [meetings]);

  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader />
      
      <div className="flex-1 overflow-hidden">
        <CalendarView
          meetings={meetings}
          onDateSelect={handleDateSelect}
          onMeetingSelect={handleMeetingSelect}
          onCreateMeeting={handleCreateMeeting}
        />
      </div>
      
      <MeetingForm
        open={showMeetingForm}
        onClose={() => {
          setShowMeetingForm(false);
          setEditingMeeting(undefined);
          setSelectedDate(undefined);
        }}
        onSubmit={handleMeetingSubmit}
        meeting={editingMeeting}
        selectedDate={selectedDate}
        existingMeetings={meetings}
        currentUser={currentUser}
      />
      
      <MeetingDetail
        meeting={selectedMeeting}
        open={showMeetingDetail}
        onClose={() => {
          setShowMeetingDetail(false);
          setSelectedMeeting(null);
        }}
        onEdit={handleEditMeeting}
        onDelete={handleMeetingDelete}
        onParticipantsChange={handleParticipantsChange}
        currentUser={currentUser}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <CalendarApp /> : <AuthLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}