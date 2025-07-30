import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

// テスト用のQueryClientを作成
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// カスタムレンダラー - AuthProviderとQueryClientProviderでラップ
export function renderWithAuthProvider(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// re-export everything
export * from '@testing-library/react';