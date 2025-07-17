'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { CalendarSuspense } from './components/CalendarSuspense.component';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalRealtimeSync } from './hooks/useRealtimeSync';

// Suspense対応版のカレンダーページ例
// 本番環境で使用する場合は、page.tsxをこの内容で置き換える
export default function CalendarPageSuspense() {
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
    </div>
  );
}