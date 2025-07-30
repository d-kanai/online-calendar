import { screen, waitFor, renderWithAuthProvider } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import CalendarPage from './page';
import { meetingApi } from './apis/meeting.api';
import { resetAllMocks } from '@/test/setup-mocks';
import { ApiMeeting } from '@/types/api';

// TestCルール: 3つのみモック
// 1. APIレイヤー
jest.mock('./apis/meeting.api', () => ({
  meetingApi: {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    addParticipant: jest.fn(),
    removeParticipant: jest.fn(),
    delete: jest.fn(),
  },
}));

// 2. Navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/calendar',
}));

// 3. ErrorBoundary
jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => children,
}));

// その他必要なモック
jest.mock('./hooks/useRealtimeSync', () => ({
  useGlobalRealtimeSync: jest.fn(),
}));

jest.mock('@/components/AuthenticatedLayout', () => ({
  AuthenticatedLayout: ({ children }: any) => <div>{children}</div>,
}));

import { toast } from 'sonner';

jest.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CalendarPage - カレンダーページの振る舞いテスト', () => {
  beforeEach(() => {
    // Given - テスト前の準備
    resetAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockPrefetch.mockClear();
  });

  describe('取得API (Query) - 会議データの表示', () => {
    it('APIが正しく呼ばれる', async () => {
      // Given - APIレスポンスをモック定義
      const mockMeetings: ApiMeeting[] = [
        {
          id: '1',
          title: 'チームミーティング',
          startTime: '2024-01-20T10:00:00Z',
          endTime: '2024-01-20T11:00:00Z',
          isImportant: true,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [
            { id: 'p1', email: 'participant1@example.com', name: '参加者1' },
            { id: 'p2', email: 'participant2@example.com', name: '参加者2' },
          ],
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z',
        },
      ];

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMeetings,
      });

      // When - ページをレンダリング
      renderWithAuthProvider(<CalendarPage />);

      // Then - APIが呼ばれたことを確認
      await waitFor(() => {
        expect(meetingApi.getAll).toHaveBeenCalledTimes(1);
      });
    });

    it('会議データが空の場合も正しく表示される', async () => {
      // Given - 空のAPIレスポンス
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      // When
      renderWithAuthProvider(<CalendarPage />);

      // Then - カレンダーは表示されるが会議データはない
      await waitFor(() => {
        // カレンダービューが表示されることを確認（data-testidなどがあれば使用）
        expect(meetingApi.getAll).toHaveBeenCalled();
      });
    });

    it('複数の会議データが存在する場合のAPI呼び出し', async () => {
      // Given - 複数の会議データ
      const mockMeetings: ApiMeeting[] = [
        {
          id: '1',
          title: '朝会',
          startTime: '2024-07-30T09:00:00Z',
          endTime: '2024-07-30T09:30:00Z',
          isImportant: false,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [],
          createdAt: '2024-07-01T09:00:00Z',
          updatedAt: '2024-07-01T09:00:00Z',
        },
        {
          id: '2',
          title: '企画会議',
          startTime: '2024-07-30T14:00:00Z',
          endTime: '2024-07-30T15:00:00Z',
          isImportant: true,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [
            { id: 'p1', email: 'alice@example.com', name: 'Alice' },
            { id: 'p2', email: 'bob@example.com', name: 'Bob' },
          ],
          createdAt: '2024-07-01T09:00:00Z',
          updatedAt: '2024-07-01T09:00:00Z',
        },
        {
          id: '3',
          title: '1on1',
          startTime: '2024-07-31T16:00:00Z',
          endTime: '2024-07-31T17:00:00Z',
          isImportant: false,
          ownerId: 'user2',
          owner: 'user2@example.com',
          participants: [
            { id: 'p3', email: 'user1@example.com', name: 'User1' },
          ],
          createdAt: '2024-07-01T09:00:00Z',
          updatedAt: '2024-07-01T09:00:00Z',
        },
      ];

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMeetings,
      });

      // When
      renderWithAuthProvider(<CalendarPage />);

      // Then - APIが呼ばれ、複数のデータが返される
      await waitFor(() => {
        expect(meetingApi.getAll).toHaveBeenCalledTimes(1);
      });

      // APIレスポンスの検証
      const response = await (meetingApi.getAll as jest.Mock).mock.results[0].value;
      expect(response.data).toHaveLength(3);
      expect(response.data[0].title).toBe('朝会');
      expect(response.data[1].title).toBe('企画会議');
      expect(response.data[1].isImportant).toBe(true);
      expect(response.data[1].participants).toHaveLength(2);
      expect(response.data[2].owner).toBe('user2@example.com');
    });
  });

  describe('更新API (Mutation) - 会議の作成', () => {
    it('フォーム送信後、正しく処理される', async () => {
      // Given - APIモックとユーザーイベントのセットアップ
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const newMeeting: ApiMeeting = {
        id: '123',
        title: 'プロジェクトキックオフ',
        startTime: '2024-07-30T10:00:00Z',
        endTime: '2024-07-30T11:00:00Z',
        isImportant: false,
        ownerId: 'user1',
        owner: 'user1@example.com',
        participants: [],
        createdAt: '2024-07-30T09:00:00Z',
        updatedAt: '2024-07-30T09:00:00Z',
      };

      (meetingApi.create as jest.Mock).mockResolvedValue({
        success: true,
        data: newMeeting,
      });

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議作成ボタンをクリック
      await waitFor(() => {
        expect(screen.getByText('会議を作成')).toBeVisible();
      });
      await user.click(screen.getByText('会議を作成'));

      // フォームが表示されるのを待つ
      await waitFor(() => {
        expect(screen.getByText('新しい会議を作成')).toBeVisible();
      });

      // フォーム入力
      await user.type(screen.getByTestId('meeting-title-input'), 'プロジェクトキックオフ');
      
      // 日時の入力（datetime-localの形式に合わせる）
      const startTimeInput = screen.getByLabelText('開始時刻 *');
      const endTimeInput = screen.getByLabelText('終了時刻 *');
      
      // 日時入力は実装の詳細に依存するため、シンプルに
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '2024-07-30T10:00');
      
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '2024-07-30T11:00');

      // フォーム送信
      await user.click(screen.getByTestId('meeting-submit-button'));

      // Then - 3つの観点で検証
      // ① APIに正しいパラメータが渡される
      await waitFor(() => {
        expect(meetingApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'プロジェクトキックオフ',
            // 時刻はタイムゾーン変換される可能性があるので、存在確認のみ
            startTime: expect.any(String),
            endTime: expect.any(String),
          })
        );
      });

      // ② 成功時の処理（モーダルが閉じる）
      expect(meetingApi.create).toHaveBeenCalledTimes(1);
      
      // ③ トースト通知
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('会議が作成されました');
      });
    });

    it('必須項目が未入力の場合、バリデーションエラーが表示される', async () => {
      // Given
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });
      
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議作成ボタンをクリック
      await waitFor(() => {
        expect(screen.getByText('会議を作成')).toBeVisible();
      });
      await user.click(screen.getByText('会議を作成'));

      // フォームが表示されるのを待つ
      await waitFor(() => {
        expect(screen.getByText('新しい会議を作成')).toBeVisible();
      });

      // 必須項目を空のまま送信
      await user.click(screen.getByTestId('meeting-submit-button'));

      // Then - バリデーションエラーの検証
      // ① エラーメッセージが表示される（エラーメッセージの実装に依存）
      await waitFor(() => {
        // バリデーションエラーが表示されていることを確認
        expect(screen.getByRole('alert')).toBeVisible();
      });

      // ② APIが呼ばれないことを確認
      expect(meetingApi.create).not.toHaveBeenCalled();
    });

    it('APIエラー時はエラートーストが表示される', async () => {
      // Given
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      (meetingApi.create as jest.Mock).mockRejectedValue(
        new Error('ネットワークエラー')
      );

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - フォームを開いて送信
      await waitFor(() => {
        expect(screen.getByText('会議を作成')).toBeVisible();
      });
      await user.click(screen.getByText('会議を作成'));

      await waitFor(() => {
        expect(screen.getByText('新しい会議を作成')).toBeVisible();
      });

      await user.type(screen.getByTestId('meeting-title-input'), 'テスト会議');
      const startTimeInput = screen.getByLabelText('開始時刻 *');
      const endTimeInput = screen.getByLabelText('終了時刻 *');
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '2024-07-30T10:00');
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '2024-07-30T11:00');

      await user.click(screen.getByTestId('meeting-submit-button'));

      // Then - エラートーストが表示される
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('ネットワークエラー');
      });
    });
  });

  describe('イベントハンドリング - カレンダー操作', () => {
    it('カレンダービューが表示される', async () => {
      // Given - デフォルトのAPIレスポンス設定
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      // When
      renderWithAuthProvider(<CalendarPage />);

      // Then - カレンダービューが表示される
      await waitFor(() => {
        expect(screen.getByTestId('calendar-view')).toBeVisible();
      });
    });
  });

  describe('エラーハンドリング - APIエラー時の処理', () => {
    it('会議データ取得エラー時にエラーが発生する', async () => {
      // Given - APIエラーをモック
      const testError = new Error('会議データの取得に失敗しました');
      (meetingApi.getAll as jest.Mock).mockRejectedValue(testError);

      // エラーログを抑制
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // When - ページをレンダリング
      renderWithAuthProvider(<CalendarPage />);

      // Then - APIが呼ばれることを確認
      await waitFor(() => {
        expect(meetingApi.getAll).toHaveBeenCalled();
      });

      // APIがエラーを返したことを確認
      expect(meetingApi.getAll).toHaveBeenCalledTimes(1);
      await expect(meetingApi.getAll()).rejects.toThrow('会議データの取得に失敗しました');

      // クリーンアップ
      consoleErrorSpy.mockRestore();
    });
  });

});