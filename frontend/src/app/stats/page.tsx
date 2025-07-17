'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import { MeetingStats } from './components/MeetingStats.component';
import { AppHeader } from '@/components/AppHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorFallback } from '@/components/ErrorFallback';
export default function StatsPage() {
  const router = useRouter();
  
  
  const handleNavigate = (screen: 'calendar' | 'stats') => {
    if (screen === 'calendar') {
      router.push('/calendar');
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col" data-testid="stats-view">
      <AppHeader currentScreen="stats" onNavigate={handleNavigate} />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner message="統計データを読み込んでいます..." />}>
          <MeetingStats />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}