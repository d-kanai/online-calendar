import { screen, waitFor, renderWithAuthProvider } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import SignUpPage from './page';
import { authApi } from '@/app/auth/apis/auth.api';
import { useRouter } from 'next/navigation';

// モック化するpush関数
const mockPush = jest.fn();

// authApiのモック
jest.mock('@/app/auth/apis/auth.api', () => ({
  authApi: {
    signUp: jest.fn(),
    setToken: jest.fn(),
    getToken: jest.fn(),
    clearToken: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

// Next.js Routerのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Toastのモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// localStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// QueryClientのモック
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

describe('SignUpPage', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
    mockPush.mockClear();
    
    // authApi.signUpのデフォルトモック（成功時）
    (authApi.signUp as jest.Mock).mockResolvedValue({
      token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
      },
    });
  });

  describe('フォーム入力とsubmit', () => {
    it('フォームに入力してsubmitすると、authApi.signUpが正しいパラメータで呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<SignUpPage />);

      // When - フォームに入力
      await user.type(screen.getByLabelText('名前'), '山田太郎');
      await user.type(screen.getByLabelText('メールアドレス'), 'yamada@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');

      // When - submitボタンをクリック
      await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

      // Then - authApi.signUpが正しいパラメータで呼ばれることを確認
      await waitFor(() => {
        expect(authApi.signUp).toHaveBeenCalledWith({
          name: '山田太郎',
          email: 'yamada@example.com',
          password: 'password123'
        });
      });
      expect(authApi.signUp).toHaveBeenCalledTimes(1);
    });

    it('signUp成功後、サインインページへリダイレクトされる', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<SignUpPage />);

      // When - フォームに入力
      await user.type(screen.getByLabelText('名前'), '山田太郎');
      await user.type(screen.getByLabelText('メールアドレス'), 'yamada@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');

      // When - submitボタンをクリック
      await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

      // Then - サインインページへリダイレクトされることを確認
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin');
      });
      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });
});