import { screen, waitFor, renderWithAuthProvider } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import SignUpPage from './page';
import { authApi } from '@/app/auth/apis/auth.api';
import { toast } from 'sonner';

// モック化する関数
const mockPush = jest.fn();

// APIレイヤーのみモック（TestCルールに従う）
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

// 副作用の検証用モック
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

jest.mock('sonner');

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

describe('SignUpPage - ユーザー登録フローの振る舞い', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  describe('ページ表示', () => {
    it('新規登録ページが正しく表示される', () => {
      // When - ページをレンダリング
      renderWithAuthProvider(<SignUpPage />);

      // Then - ページ要素が表示されていることを確認
      expect(screen.getByText('新規登録')).toBeVisible();
      expect(screen.getByLabelText('名前')).toBeVisible();
      expect(screen.getByLabelText('メールアドレス')).toBeVisible();
      expect(screen.getByLabelText('パスワード')).toBeVisible();
      expect(screen.getByLabelText('パスワード（確認）')).toBeVisible();
      expect(screen.getByRole('button', { name: 'アカウントを作成' })).toBeVisible();
    });
  });

  describe('更新API (Mutation) - ユーザー登録の送信', () => {
    it('フォーム送信後、正しく処理される（API呼び出し、ルーティング、トースト通知）', async () => {
      // Given - APIモック設定とユーザーイベントのセットアップ
      (authApi.signUp as jest.Mock).mockResolvedValue({
        token: 'test-token',
        user: {
          id: '1',
          email: 'yamada@example.com',
          name: '山田太郎',
          createdAt: new Date(),
        },
      });
      const user = userEvent.setup();
      renderWithAuthProvider(<SignUpPage />);

      // When - フォーム入力とsubmit
      await user.type(screen.getByLabelText('名前'), '山田太郎');
      await user.type(screen.getByLabelText('メールアドレス'), 'yamada@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');
      await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

      // Then - 3つの観点で検証
      // ① APIに正しいパラメータが渡される
      await waitFor(() => {
        expect(authApi.signUp).toHaveBeenCalledWith({
          name: '山田太郎',
          email: 'yamada@example.com',
          password: 'password123'
        });
      });

      // ② 成功時のルーティング
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin');
      });

      // ③ トースト通知
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('アカウントが作成されました');
      });
    });

    it('API エラー時、エラーメッセージが表示される', async () => {
      // Given - APIエラーをモック
      (authApi.signUp as jest.Mock).mockRejectedValue(
        new Error('このメールアドレスは既に登録されています')
      );
      const user = userEvent.setup();
      renderWithAuthProvider(<SignUpPage />);

      // When - フォーム入力とsubmit
      await user.type(screen.getByLabelText('名前'), '山田太郎');
      await user.type(screen.getByLabelText('メールアドレス'), 'existing@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');
      await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

      // Then - エラー処理の検証
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('このメールアドレスは既に登録されています');
      });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('フォームバリデーション', () => {
    it('パスワードが一致しない場合、エラーが表示される', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<SignUpPage />);

      // When - 異なるパスワードを入力
      await user.type(screen.getByLabelText('名前'), '山田太郎');
      await user.type(screen.getByLabelText('メールアドレス'), 'yamada@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'different456');
      await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

      // Then - バリデーションエラーが表示される
      await waitFor(() => {
        expect(screen.getByText('パスワードが一致しません')).toBeVisible();
      });
      expect(authApi.signUp).not.toHaveBeenCalled();
    });
  });
});