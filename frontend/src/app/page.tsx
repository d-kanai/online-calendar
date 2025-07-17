'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // ローディング中は何も表示しない
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>;
  }
  
  // 未認証の場合は認証画面を表示
  if (!isAuthenticated) {
    return <AuthLayout />;
  }

  // 認証済みの場合はカレンダーページにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/calendar');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-lg text-muted-foreground">リダイレクト中...</div>
      </div>
    </div>
  );
}
