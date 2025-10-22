import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithAuthProvider } from '@/test/test-utils';
import Home from './page';
import { authRoutes, calendarRoutes } from '@/lib/routes';

// Next.jsのnavigationをモック
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 既存のAuthContextモックを上書き
jest.mock('@/contexts/AuthContext', () => {
  const originalModule = jest.requireActual('@/contexts/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn(),
  };
});

const { useAuth } = require('@/contexts/AuthContext');

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証済みユーザー', () => {
    it('認証済みの場合、カレンダー画面にリダイレクトされる', async () => {
      // Given - 認証済み状態をモック
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'user1', email: 'user1@example.com', name: 'Test User' },
      });

      // When - ページをレンダリング
      renderWithAuthProvider(<Home />);

      // Then - カレンダー画面へのリダイレクトを確認
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(calendarRoutes.root());
      });
    });
  });

  describe('未認証ユーザー', () => {
    it('未認証の場合、サインイン画面にリダイレクトされる', async () => {
      // Given - 未認証状態をモック
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      // When - ページをレンダリング
      renderWithAuthProvider(<Home />);

      // Then - サインイン画面へのリダイレクトを確認
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(authRoutes.signin());
      });
    });
  });

  describe('ローディング状態', () => {
    it('認証状態の確認中はローディングが表示される', () => {
      // Given - ローディング状態をモック
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      // When - ページをレンダリング
      renderWithAuthProvider(<Home />);

      // Then - ローディングメッセージが表示される
      expect(screen.getByText('読み込み中...')).toBeVisible();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('認証状態の変化', () => {
    it('認証状態がロード完了後に変化した場合、適切にリダイレクトされる', async () => {
      // Given - 最初はローディング状態
      const mockUseAuth = useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      const { rerender } = renderWithAuthProvider(<Home />);

      // ローディング中はリダイレクトされない
      expect(mockPush).not.toHaveBeenCalled();

      // When - 認証状態が確定（未認証）
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      rerender(<Home />);

      // Then - サインイン画面へリダイレクト
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(authRoutes.signin());
      });
    });
  });
});
