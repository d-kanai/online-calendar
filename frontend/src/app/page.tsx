'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // 認証状態に応じてリダイレクト
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/calendar');
      } else {
        router.push('/auth/signin');
      }
    }
  }, [isAuthenticated, isLoading, router]);
  
  // ローディング中は何も表示しない
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-lg text-muted-foreground">リダイレクト中...</div>
      </div>
    </div>
  );
}
