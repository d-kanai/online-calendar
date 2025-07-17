import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/auth/AuthLayout';
import { AppHeader } from './components/AppHeader';
import { CalendarView } from './components/CalendarView';
import { MeetingForm } from './components/MeetingForm';
import { MeetingDetail } from './components/MeetingDetail';
import { MeetingStats } from './components/MeetingStats';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { Meeting, Participant } from './types/meeting';

// 画面タイプの定義
type AppScreen = 'calendar' | 'stats';

// モックデータ - 過去1週間のテストデータを含む
const initialMeetings: Meeting[] = [
  // 今週の会議
  {
    id: '1',
    title: '定例MTG',
    startTime: new Date(2025, 6, 17, 10, 0), // 2025年7月17日 10:00 (今日)
    endTime: new Date(2025, 6, 17, 11, 0),   // 2025年7月17日 11:00
    owner: 'test@example.com',
    participants: [
      {
        id: '1',
        email: 'hanako@example.com',
        name: 'Hanako',
        notificationChannels: { email: true, push: false },
        response: 'yes'
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
    startTime: new Date(2025, 6, 16, 14, 0), // 2025年7月16日 14:00 (昨日)
    endTime: new Date(2025, 6, 16, 16, 0),   // 2025年7月16日 16:00
    owner: 'test@example.com',
    participants: [],
    isImportant: true,
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // 過去1週間のテストデータ
  {
    id: '3',
    title: 'チーム会議',
    startTime: new Date(2025, 6, 15, 9, 0),  // 2025年7月15日 9:00
    endTime: new Date(2025, 6, 15, 10, 30),  // 2025年7月15日 10:30
    owner: 'manager@example.com',
    participants: [
      {
        id: '2',
        email: 'test@example.com',
        name: 'Test User',
        notificationChannels: { email: true, push: true },
        response: 'yes'
      }
    ],
    isImportant: false,
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    title: 'プロジェクト打ち合わせ',
    startTime: new Date(2025, 6, 14, 13, 0), // 2025年7月14日 13:00
    endTime: new Date(2025, 6, 14, 14, 0),   // 2025年7月14日 14:00
    owner: 'test@example.com',
    participants: [
      {
        id: '3',
        email: 'client@example.com',
        name: 'Client',
        notificationChannels: { email: true, push: false },
        response: 'yes'
      }
    ],
    isImportant: true,
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    title: '1on1ミーティング',
    startTime: new Date(2025, 6, 13, 15, 0), // 2025年7月13日 15:00
    endTime: new Date(2025, 6, 13, 15, 45),  // 2025年7月13日 15:45
    owner: 'test@example.com',
    participants: [
      {
        id: '4',
        email: 'junior@example.com',
        name: 'Junior',
        notificationChannels: { email: true, push: true },
        response: 'yes'
      }
    ],
    isImportant: false,
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    title: '参加辞退した会議',
    startTime: new Date(2025, 6, 12, 16, 0), // 2025年7月12日 16:00
    endTime: new Date(2025, 6, 12, 17, 0),   // 2025年7月12日 17:00
    owner: 'other@example.com',
    participants: [
      {
        id: '5',
        email: 'test@example.com',
        name: 'Test User',
        notificationChannels: { email: true, push: false },
        response: 'no'
      }
    ],
    isImportant: false,
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    title: '参加した長時間会議',
    startTime: new Date(2025, 6, 11, 10, 0), // 2025年7月11日 10:00
    endTime: new Date(2025, 6, 11, 12, 0),   // 2025年7月11日 12:00
    owner: 'other@example.com',
    participants: [
      {
        id: '6',
        email: 'test@example.com',
        name: 'Test User',
        notificationChannels: { email: true, push: true },
        response: 'yes'
      }
    ],
    isImportant: true,
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function CalendarApp() {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('calendar');
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

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'stats':
        return (
          <MeetingStats
            meetings={meetings}
            currentUser={currentUser}
            onBack={() => setCurrentScreen('calendar')}
          />
        );
      case 'calendar':
      default:
        return (
          <CalendarView
            meetings={meetings}
            onDateSelect={handleDateSelect}
            onMeetingSelect={handleMeetingSelect}
            onCreateMeeting={handleCreateMeeting}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader 
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />
      
      <div className="flex-1 overflow-hidden">
        {renderCurrentScreen()}
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