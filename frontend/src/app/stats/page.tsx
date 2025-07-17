'use client';

import React, { Suspense } from 'react';
import { MeetingStats } from './components/MeetingStats.component';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function StatsPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-hidden" data-testid="stats-view">
        <Suspense fallback={<LoadingSpinner message="統計データを読み込んでいます..." />}>
          <MeetingStats />
        </Suspense>
      </div>
    </AuthenticatedLayout>
  );
}