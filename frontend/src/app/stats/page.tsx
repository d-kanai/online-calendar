'use client';

import React from 'react';
import { StatsSuspense } from './components/StatsSuspense.component';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';

export default function StatsPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-hidden" data-testid="stats-view">
        <StatsSuspense />
      </div>
    </AuthenticatedLayout>
  );
}