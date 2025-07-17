'use client';

import React from 'react';
import { CalendarSuspense } from './components/CalendarSuspense.component';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalRealtimeSync } from './hooks/useRealtimeSync';

export default function CalendarPage() {
  const { user } = useAuth();
  const CURRENT_USER = user?.email || 'unknown@example.com';
  
  // グローバルリアルタイム同期を有効化
  useGlobalRealtimeSync();

  return (
    <AuthenticatedLayout>
      <CalendarSuspense currentUser={CURRENT_USER} />
      <Toaster />
    </AuthenticatedLayout>
  );
}