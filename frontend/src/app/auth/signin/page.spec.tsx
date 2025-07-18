import { screen, waitFor, renderWithAuthProvider } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import SignInPage from './page';
import { authApi } from '@/app/auth/apis/auth.api';
import { toast } from 'sonner';
import { resetAllMocks } from '@/test/setup-mocks';

// モック化する関数
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();

// Next.js Navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

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

describe('SignInPage - ログインフローの振る舞い', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    resetAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockPrefetch.mockClear();
  });

  describe('ページ表示', () => {
    it('ログインページが正しく表示される', () => {
      // When - ページをレンダリング
      renderWithAuthProvider(<SignInPage />);

      // Then - ページ要素が表示されていることを確認
      expect(screen.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      expect(screen.getByLabelText('メールアドレス')).toBeVisible();
      expect(screen.getByLabelText('パスワード')).toBeVisible();
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeVisible();
    });
  });

  describe('更新API (Mutation) - ログインの送信', () => {
    it('フォーム送信後、正しく処理される（API呼び出し、トースト通知）', async () => {
      // Given - APIモック設定とユーザーイベントのセットアップ
      (authApi.signIn as jest.Mock).mockResolvedValue({
        token: 'test-token',
        user: {
          id: '1',
          email: 'yamada@example.com',
          name: '山田太郎',
          createdAt: new Date(),
        },
      });
      const user = userEvent.setup();
      renderWithAuthProvider(<SignInPage />);

      // When - フォーム入力とsubmit
      await user.type(screen.getByLabelText('メールアドレス'), 'yamada@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      // Then - 3つの観点で検証
      // ① APIに正しいパラメータが渡される
      await waitFor(() => {
        expect(authApi.signIn).toHaveBeenCalledWith({
          email: 'yamada@example.com',
          password: 'password123'
        });
      });

      // ② 成功時のルーティング
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/calendar');
      });

      // ③ トースト通知
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('ログインしました');
      });
    });

    it('API エラー時、エラーメッセージが表示される', async () => {
      // Given - APIエラーをモック
      (authApi.signIn as jest.Mock).mockRejectedValue(
        new Error('メールアドレスまたはパスワードが正しくありません')
      );
      const user = userEvent.setup();
      renderWithAuthProvider(<SignInPage />);

      // When - フォーム入力とsubmit
      await user.type(screen.getByLabelText('メールアドレス'), 'wrong@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      // Then - エラー処理の検証
      await waitFor(() => {
        expect(screen.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible();
      });
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('メールアドレスまたはパスワードが正しくありません');
      });
    });
  });

  describe('フォームバリデーション', () => {
    it('必須項目が未入力の場合、バリデーションエラーが表示される', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<SignInPage />);

      // When - 必須項目を空のまま送信
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      // Then - バリデーションエラーの検証
      await waitFor(() => {
        expect(screen.getByText('メールアドレスを入力してください')).toBeVisible();
      });
      expect(authApi.signIn).not.toHaveBeenCalled();
    });

  });

  describe('ページナビゲーション', () => {
    it('「新規登録」リンクをクリックすると、サインアップページへ遷移する', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<SignInPage />);

      // When - 新規登録リンクをクリック
      await user.click(screen.getByRole('button', { name: '新規登録' }));

      // Then - サインアップページへ遷移
      expect(mockPush).toHaveBeenCalledWith('/auth/signup');
    });
  });
});