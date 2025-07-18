import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from './page';

// モック化するsignUp関数
const mockSignUp = jest.fn();

// Next.js Routerのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Authプロバイダーのモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// QueryClientのモック
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

describe('SignUpPage', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    mockSignUp.mockClear();
  });

  describe('サインアップページの表示', () => {
    it('Singupページが表示される', () => {
      // when
      render(<SignUpPage />);

      // then
      expect(screen.getByText('新規登録')).toBeVisible();
    });
  });

  describe('フォーム入力とsubmit', () => {
    it('フォームに入力してsubmitすると、signup APIに正しいパラメータが渡される', async () => {
      // Given
      const user = userEvent.setup();
      render(<SignUpPage />);

      // When - フォームに入力
      await user.type(screen.getByLabelText('名前'), '山田太郎');
      await user.type(screen.getByLabelText('メールアドレス'), 'yamada@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');

      // When - submitボタンをクリック
      await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

      // Then - signUp APIが正しいパラメータで呼ばれることを確認
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          name: '山田太郎',
          email: 'yamada@example.com',
          password: 'password123'
        });
      });
      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });
  });
});