'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorFallback } from '@/components/ErrorFallback';

function HomeContent() {
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
    return <LoadingSpinner message="読み込み中..." />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-lg text-muted-foreground">リダイレクト中...</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner message="アプリケーションを読み込んでいます..." />}>
          <HomeContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
