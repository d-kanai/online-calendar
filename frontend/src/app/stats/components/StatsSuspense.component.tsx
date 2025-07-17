'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MeetingStats } from './MeetingStats.component';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// エラーフォールバックコンポーネント
function StatsError({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-destructive">統計データの読み込みでエラーが発生しました</p>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          再試行
        </button>
      </div>
    </div>
  );
}

export function StatsSuspense() {
  return (
    <ErrorBoundary FallbackComponent={StatsError}>
      <Suspense fallback={<LoadingSpinner message="統計データを読み込んでいます..." />}>
        <MeetingStats />
      </Suspense>
    </ErrorBoundary>
  );
}