'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarSuspense } from './components/CalendarSuspense.component';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalRealtimeSync } from './hooks/useRealtimeSync';

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const CURRENT_USER = user?.email || 'unknown@example.com';
  
  // グローバルリアルタイム同期を有効化
  useGlobalRealtimeSync();

  const handleNavigate = (screen: 'calendar' | 'stats') => {
    if (screen === 'stats') {
      router.push('/stats');
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader currentScreen="calendar" onNavigate={handleNavigate} />
      <CalendarSuspense currentUser={CURRENT_USER} />
      <Toaster />
    </div>
  );
}