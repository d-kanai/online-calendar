'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // QueryClientをstateで管理することで、
  // Server ComponentとClient Component間での不整合を防ぐ
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // キャッシュ時間（デフォルト: 5分）
            gcTime: 5 * 60 * 1000,
            // データが古いと判定される時間（デフォルト: 0）
            staleTime: 30 * 1000, // 30秒
            // リトライ設定
            retry: 1,
            // フォーカス時の再取得
            refetchOnWindowFocus: false,
            // 再接続時の再取得
            refetchOnReconnect: 'always',
          },
          mutations: {
            // ミューテーションのリトライ
            retry: 0,
            // エラー時の動作
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}