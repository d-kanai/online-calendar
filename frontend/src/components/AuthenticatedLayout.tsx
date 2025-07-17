'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ナビゲーションハンドラー
  const handleNavigate = (screen: 'calendar' | 'stats') => {
    if (screen === 'calendar') {
      router.push('/calendar');
    } else if (screen === 'stats') {
      router.push('/stats');
    }
  };

  // 現在のページを判定
  const getCurrentScreen = (): 'calendar' | 'stats' => {
    if (pathname?.includes('/stats')) return 'stats';
    return 'calendar';
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader currentScreen={getCurrentScreen()} onNavigate={handleNavigate} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}