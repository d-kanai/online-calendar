'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import { CalendarSuspense } from './components/CalendarSuspense.component';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorFallback } from '@/components/ErrorFallback';
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
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Suspense 
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner message="会議データを読み込んでいます..." />
            </div>
          }
        >
          <CalendarSuspense currentUser={CURRENT_USER} />
        </Suspense>
      </ErrorBoundary>
      <Toaster />
    </div>
  );
}