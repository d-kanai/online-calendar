import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';

// カスタムレンダラー - AuthProviderでラップ
export function renderWithAuthProvider(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
}

// re-export everything
export * from '@testing-library/react';