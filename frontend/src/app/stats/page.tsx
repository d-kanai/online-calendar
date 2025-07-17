'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MeetingStats } from './components/MeetingStats.component';
import { AppHeader } from '@/components/AppHeader';
import { useMeetings } from '@/hooks/useMeetings';
import { useAuth } from '@/contexts/AuthContext';

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { meetings, isLoading } = useMeetings();
  
  const handleNavigate = (screen: 'calendar' | 'stats') => {
    if (screen === 'calendar') {
      router.push('/calendar');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <AppHeader currentScreen="stats" onNavigate={handleNavigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader currentScreen="stats" onNavigate={handleNavigate} />
      <MeetingStats
        meetings={meetings}
        currentUser={user?.email || ''}
        onBack={() => router.push('/calendar')}
      />
    </div>
  );
}