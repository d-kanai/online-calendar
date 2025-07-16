'use client';

import React, { useState, useEffect } from 'react';
import { CalendarView } from '../components/CalendarView';
import { MeetingForm } from '../components/MeetingForm';
import { MeetingDetail } from '../components/MeetingDetail';
import { toast, Toaster } from 'sonner';
import { Meeting, Participant } from '../types/meeting';
import { meetingApi } from '../lib/api';

// モックデータ
const CURRENT_USER = 'taro@example.com';

const initialMeetings: Meeting[] = [
  {
    id: '1',
    title: '定例MTG',
    startTime: new Date(2025, 3, 1, 10, 0), // 2025年4月1日 10:00
    endTime: new Date(2025, 3, 1, 11, 0),   // 2025年4月1日 11:00
    owner: CURRENT_USER,
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
    owner: CURRENT_USER,
    participants: [],
    isImportant: true,
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showMeetingDetail, setShowMeetingDetail] = useState(false);

  // 会議作成・更新
  const handleMeetingSubmit = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
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
        // 新規作成 - APIを呼び出す
        const response = await meetingApi.create({
          title: meetingData.title,
          startTime: meetingData.startTime.toISOString(),
          endTime: meetingData.endTime.toISOString(),
          isImportant: meetingData.isImportant,
          ownerId: meetingData.owner
        });
        
        if (response.success && response.data) {
          const newMeeting: Meeting = {
            id: response.data.id,
            title: response.data.title,
            startTime: new Date(response.data.startTime),
            endTime: new Date(response.data.endTime),
            owner: response.data.ownerId,
            participants: [],
            isImportant: response.data.isImportant,
            status: 'scheduled',
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt)
          };
          setMeetings(prev => [...prev, newMeeting]);
          toast.success('会議が作成されました');
        } else {
          toast.error(response.error || '会議の作成に失敗しました');
        }
      }
      
      setEditingMeeting(undefined);
    } catch (error) {
      console.error('API Error:', error);
      toast.error('会議の作成に失敗しました');
    }
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
    console.log('会議作成ボタンがクリックされました');
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
    <div className="h-screen bg-background">
      <CalendarView
        meetings={meetings}
        onDateSelect={handleDateSelect}
        onMeetingSelect={handleMeetingSelect}
        onCreateMeeting={handleCreateMeeting}
      />
      
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
        currentUser={CURRENT_USER}
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
        currentUser={CURRENT_USER}
      />
      
      <Toaster />
    </div>
  );
}
