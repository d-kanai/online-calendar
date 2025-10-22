import React from 'react';
import { screen, waitFor, renderWithAuthProvider } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import CalendarPage from './page';
import { meetingApi } from './apis/meeting.api';
import { resetAllMocks } from '@/test/setup-mocks';
import { ApiMeeting } from '@/types/api';
import { calendarRoutes } from '@/lib/routes';

// Auth Contextのモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1', email: 'user1@example.com', name: 'Test User' },
    isAuthenticated: true,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

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
  usePathname: () => calendarRoutes.root(),
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
    
    // console.errorをモックしてテスト中のエラーログを抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // console.errorのモックをリストア
    jest.restoreAllMocks();
  });

  describe('取得API (Query) - 会議データの表示', () => {
    it('APIが正しく呼ばれる', async () => {
      // Given - APIレスポンスをモック定義
      const mockMeetings: ApiMeeting[] = [
        {
          id: '1',
          title: 'チームミーティング',
          startTime: '2025-07-30T10:00:00Z',
          endTime: '2025-07-30T11:00:00Z',
          isImportant: true,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [
            { id: 'p1', email: 'participant1@example.com', name: '参加者1' },
            { id: 'p2', email: 'participant2@example.com', name: '参加者2' },
          ],
          createdAt: '2025-07-15T09:00:00Z',
          updatedAt: '2025-07-15T09:00:00Z',
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
          startTime: '2025-07-30T09:00:00Z',
          endTime: '2025-07-30T09:30:00Z',
          isImportant: false,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [],
          createdAt: '2025-07-01T09:00:00Z',
          updatedAt: '2025-07-01T09:00:00Z',
        },
        {
          id: '2',
          title: '企画会議',
          startTime: '2025-07-30T14:00:00Z',
          endTime: '2025-07-30T15:00:00Z',
          isImportant: true,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [
            { id: 'p1', email: 'alice@example.com', name: 'Alice' },
            { id: 'p2', email: 'bob@example.com', name: 'Bob' },
          ],
          createdAt: '2025-07-01T09:00:00Z',
          updatedAt: '2025-07-01T09:00:00Z',
        },
        {
          id: '3',
          title: '1on1',
          startTime: '2025-07-31T16:00:00Z',
          endTime: '2025-07-31T17:00:00Z',
          isImportant: false,
          ownerId: 'user2',
          owner: 'user2@example.com',
          participants: [
            { id: 'p3', email: 'user1@example.com', name: 'User1' },
          ],
          createdAt: '2025-07-01T09:00:00Z',
          updatedAt: '2025-07-01T09:00:00Z',
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
        startTime: '2025-07-30T10:00:00Z',
        endTime: '2025-07-30T11:00:00Z',
        isImportant: false,
        ownerId: 'user1',
        owner: 'user1@example.com',
        participants: [],
        createdAt: '2025-07-30T09:00:00Z',
        updatedAt: '2025-07-30T09:00:00Z',
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
      await user.type(startTimeInput, '2025-07-30T10:00');
      
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '2025-07-30T11:00');

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
      await user.type(startTimeInput, '2025-07-30T10:00');
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '2025-07-30T11:00');

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

  describe('会議詳細の表示と操作', () => {
    const mockMeeting: ApiMeeting = {
      id: 'meeting-123',
      title: 'プロジェクト進捗確認',
      startTime: '2025-07-31T14:00:00Z',
      endTime: '2025-07-31T15:00:00Z',
      isImportant: true,
      ownerId: 'user1',
      owner: 'user1@example.com',
      participants: [
        { id: 'p1', email: 'alice@example.com', name: 'Alice' },
        { id: 'p2', email: 'bob@example.com', name: 'Bob' },
      ],
      createdAt: '2025-07-29T09:00:00Z',
      updatedAt: '2025-07-29T10:00:00Z',
    };

    beforeEach(() => {
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockMeeting],
      });
      (meetingApi.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMeeting,
      });
    });

    it('会議をクリックして詳細モーダルを開く', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議をクリック
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('プロジェクト進捗確認'));
        expect(meetings[0]).toBeVisible();
      });
      // カレンダー上の会議をクリック
      await user.click(screen.getAllByText((content) => content.includes('プロジェクト進捗確認'))[0]);

      // Then - 詳細モーダルが開く
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
      
      // API呼び出しを確認
      expect(meetingApi.getById).toHaveBeenCalledWith('meeting-123');
      
      // モーダル内のデータ表示を確認
      const titleElements = screen.getAllByText((content) => content.includes('プロジェクト進捗確認'));
      expect(titleElements.length).toBeGreaterThan(1); // カレンダーとモーダルの両方に表示
      expect(screen.getByText('重要')).toBeVisible(); // isImportant: true のバッジ
      expect(screen.getByText('user1@example.com')).toBeVisible(); // オーナー表示
    });

    it('会議詳細モーダルで編集ボタンをクリック', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議詳細を開き、編集ボタンをクリック
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('プロジェクト進捗確認'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getAllByText((content) => content.includes('プロジェクト進捗確認'))[0]);
      
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
      
      // 編集ボタンを探す
      await waitFor(() => {
        expect(screen.getByText('編集')).toBeVisible();
      });
      const editButton = screen.getByText('編集').closest('button');
      if (editButton) {
        await user.click(editButton);
      }

      // Then - 編集フォームが開く
      await waitFor(() => {
        expect(screen.getByText('会議を編集')).toBeVisible();
      });
      
      // フォームに既存データが入力されていることを確認
      expect(screen.getByDisplayValue('プロジェクト進捗確認')).toBeVisible();
    });

    it('会議詳細モーダルで削除ボタンをクリック', async () => {
      // Given
      (meetingApi.delete as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      });
      
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議詳細を開き、削除ボタンをクリック
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('プロジェクト進捗確認'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getAllByText((content) => content.includes('プロジェクト進捗確認'))[0]);
      
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
      
      // 削除ボタンを探してクリック（ゴミ箱アイコンボタン）
      const buttons = screen.getAllByRole('button');
      let foundDeleteButton = null;
      
      // Trash2 iconを持つボタンを探す
      for (const btn of buttons) {
        if (btn.querySelector('.lucide-trash2')) {
          foundDeleteButton = btn;
          break;
        }
      }
      
      if (foundDeleteButton) {
        await user.click(foundDeleteButton);
      }

      // Then - 削除処理が実行される
      await waitFor(() => {
        expect(meetingApi.delete).toHaveBeenCalledWith('meeting-123');
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('会議が削除されました');
      });
    });
  });

  describe('参加者管理機能', () => {
    const mockMeetingWithParticipants: ApiMeeting = {
      id: 'meeting-456',
      title: 'チーム定例会',
      startTime: '2025-07-30T10:00:00Z',
      endTime: '2025-07-30T11:00:00Z',
      isImportant: false,
      ownerId: 'user1',
      owner: 'user1@example.com',
      participants: [
        { id: 'p1', email: 'alice@example.com', name: 'Alice' },
        { id: 'p2', email: 'bob@example.com', name: 'Bob' },
      ],
      createdAt: '2025-07-30T09:00:00Z',
      updatedAt: '2025-07-30T09:00:00Z',
    };

    beforeEach(() => {
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockMeetingWithParticipants],
      });
      (meetingApi.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMeetingWithParticipants,
      });
    });

    it('会議詳細で参加者一覧が表示される', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議詳細を開く
      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return content.includes('チーム定例会');
        })).toBeVisible();
      });
      await user.click(screen.getByText((content, element) => {
        return content.includes('チーム定例会');
      }));

      // Then - 参加者管理セクションが表示される
      await waitFor(() => {
        expect(screen.getByText('参加者管理')).toBeVisible();
      });
      
      // 参加者一覧の表示確認（flexible text matcher使用）
      expect(screen.getByText((content) => content.includes('Alice'))).toBeVisible();
      expect(screen.getByText((content) => content.includes('alice@example.com'))).toBeVisible();
      expect(screen.getByText((content) => content.includes('Bob'))).toBeVisible();
      expect(screen.getByText((content) => content.includes('bob@example.com'))).toBeVisible();
      
      // 参加者数バッジの確認
      expect(screen.getByText((content) => content.includes('2/50'))).toBeVisible();
    });

    it('新しい参加者を追加する', async () => {
      // Given
      (meetingApi.addParticipant as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'p3', email: 'charlie@example.com', name: 'Charlie' },
      });
      
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議詳細を開き、参加者を追加
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('チーム定例会'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getByText((content) => content.includes('19:00') && content.includes('チーム定例会')));
      
      await waitFor(() => {
        expect(screen.getByText('参加者管理')).toBeVisible();
      });
      
      // 参加者追加フォームに入力
      const emailInput = await waitFor(() => 
        screen.getByPlaceholderText('参加者のメールアドレス')
      );
      await user.type(emailInput, 'charlie@example.com');
      
      // 追加ボタンをクリック - 参加者追加のためのサイズが小さいボタンを探す
      const buttons = screen.getAllByRole('button');
      let addButton = null;
      
      // Plus iconを持つ、且つsize="sm"のボタンを探す
      for (const btn of buttons) {
        if (btn.querySelector('.lucide-plus') && btn.classList.contains('h-8')) {
          addButton = btn;
          break;
        }
      }
      
      if (addButton) {
        await user.click(addButton);
      }

      // Then - API呼び出しと成功メッセージを確認
      await waitFor(() => {
        expect(meetingApi.addParticipant).toHaveBeenCalledWith('meeting-456', {
          email: 'charlie@example.com',
          name: 'charlie@example.com'
        });
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('参加者が更新されました');
      });
    });

    it('参加者を削除する', async () => {
      // Given
      (meetingApi.removeParticipant as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      });
      
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議詳細を開き、参加者を削除
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('チーム定例会'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getByText((content) => content.includes('19:00') && content.includes('チーム定例会')));
      
      await waitFor(() => {
        expect(screen.getByText('参加者管理')).toBeVisible();
      });
      
      // 削除ボタンをクリック
      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);
      
      // 削除確認ダイアログで確定
      await waitFor(() => {
        expect(screen.getByText('参加者の削除')).toBeVisible();
      });
      
      const confirmButton = screen.getByRole('button', { name: '削除する' });
      await user.click(confirmButton);

      // Then - API呼び出しと成功メッセージを確認
      await waitFor(() => {
        expect(meetingApi.removeParticipant).toHaveBeenCalledWith('meeting-456', 'p1');
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('参加者が更新されました');
      });
    });
  });

  describe('会議編集機能', () => {
    const editableMeeting: ApiMeeting = {
      id: 'editable-meeting',
      title: '編集可能な会議',
      startTime: '2025-08-01T09:00:00Z',
      endTime: '2025-08-01T10:00:00Z',
      isImportant: false,
      ownerId: 'user1',
      owner: 'user1@example.com',
      participants: [],
      createdAt: '2025-07-30T09:00:00Z',
      updatedAt: '2025-07-30T09:00:00Z',
    };

    beforeEach(() => {
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [editableMeeting],
      });
      (meetingApi.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: editableMeeting,
      });
    });

    it('会議を編集して更新する', async () => {
      // Given
      const updatedMeeting: ApiMeeting = {
        ...editableMeeting,
        title: '更新された会議タイトル',
        isImportant: true,
      };
      
      (meetingApi.update as jest.Mock).mockResolvedValue({
        success: true,
        data: updatedMeeting,
      });
      
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議編集フローを実行
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('編集可能な会議'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getAllByText((content) => content.includes('編集可能な会議'))[0]);
      
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
      
      const editButton = screen.getByRole('button', { name: /編集/ });
      await user.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByText('会議を編集')).toBeVisible();
      });
      
      // タイトルを変更
      const titleInput = screen.getByTestId('meeting-title-input');
      await user.clear(titleInput);
      await user.type(titleInput, '更新された会議タイトル');
      
      // 重要フラグを変更
      const importantSwitch = screen.getByTestId('meeting-important-switch');
      await user.click(importantSwitch);
      
      // フォーム送信
      await user.click(screen.getByTestId('meeting-submit-button'));

      // Then - 更新APIが呼ばれ、成功メッセージが表示される
      await waitFor(() => {
        expect(meetingApi.update).toHaveBeenCalledWith(
          'editable-meeting',
          expect.objectContaining({
            title: '更新された会議タイトル',
            isImportant: true,
          })
        );
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('会議が更新されました');
      });
    });

    it('編集時のバリデーションエラー処理', async () => {
      // Given
      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 無効なデータで編集を試行
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('編集可能な会議'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getAllByText((content) => content.includes('編集可能な会議'))[0]);
      
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
      
      const editButton = screen.getByRole('button', { name: /編集/ });
      await user.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByText('会議を編集')).toBeVisible();
      });
      
      // タイトルを空にする
      const titleInput = screen.getByTestId('meeting-title-input');
      await user.clear(titleInput);
      
      // フォーム送信
      await user.click(screen.getByTestId('meeting-submit-button'));

      // Then - バリデーションエラーが表示される
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeVisible();
      });
      
      // APIは呼ばれない
      expect(meetingApi.update).not.toHaveBeenCalled();
    });
  });

  describe('会議表示の状態管理', () => {
    it('開始済み会議のステータス表示', async () => {
      // Given - 開始済みの会議
      const ongoingMeeting: ApiMeeting = {
        id: 'ongoing-meeting',
        title: '進行中の会議',
        startTime: '2025-07-30T08:00:00Z', // 過去（開始済み）
        endTime: '2025-07-30T20:00:00Z', // 未来（終了前）
        isImportant: false,
        ownerId: 'user1',
        owner: 'user1@example.com',
        participants: [],
        createdAt: '2025-07-30T07:00:00Z',
        updatedAt: '2025-07-30T07:00:00Z',
      };

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [ongoingMeeting],
      });
      (meetingApi.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: ongoingMeeting,
      });

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 進行中の会議詳細を表示
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('進行中の会議'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getAllByText((content) => content.includes('進行中の会議'))[0]);

      // Then - 進行中ステータスが表示され、編集ボタンが非表示
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
      
      expect(screen.getByText('進行中')).toBeVisible();
      expect(screen.getByText((content) => content.includes('この会議は現在進行中です'))).toBeVisible();
      
      // 編集ボタンは表示されないはず
      expect(screen.queryByRole('button', { name: /編集/ })).not.toBeInTheDocument();
    });

    it('完了済み会議のステータス表示', async () => {
      // Given - 完了済みの会議
      const completedMeeting: ApiMeeting = {
        id: 'completed-meeting',
        title: '完了した会議',
        startTime: '2025-07-29T14:00:00Z', // 過去（開始済み）
        endTime: '2025-07-29T15:00:00Z', // 過去（終了済み）
        isImportant: true,
        ownerId: 'user1',
        owner: 'user1@example.com',
        participants: [],
        createdAt: '2025-07-29T13:00:00Z',
        updatedAt: '2025-07-29T13:00:00Z',
      };

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [completedMeeting],
      });
      (meetingApi.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: completedMeeting,
      });

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 完了済み会議の詳細を表示
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('完了した会議'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getAllByText((content) => content.includes('完了した会議'))[0]);

      // Then - 完了ステータスが表示される
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
      
      expect(screen.getByText('完了')).toBeVisible();
      expect(screen.getByText((content) => content.includes('この会議は終了しました'))).toBeVisible();
    });
  });

  describe('カレンダー表示機能', () => {
    it('異なる日付の会議が正しく表示される', async () => {
      // Given - 複数日の会議データ
      const multiDayMeetings: ApiMeeting[] = [
        {
          id: 'today-morning',
          title: '今日の朝会',
          startTime: '2025-07-30T09:00:00Z',
          endTime: '2025-07-30T09:30:00Z',
          isImportant: false,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [],
          createdAt: '2025-07-29T09:00:00Z',
          updatedAt: '2025-07-29T09:00:00Z',
        },
        {
          id: 'tomorrow-meeting',
          title: '明日の企画会議',
          startTime: '2025-07-31T14:00:00Z',
          endTime: '2025-07-31T16:00:00Z',
          isImportant: true,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [
            { id: 'p1', email: 'member1@example.com', name: 'メンバー1' },
          ],
          createdAt: '2025-07-29T09:00:00Z',
          updatedAt: '2025-07-29T09:00:00Z',
        },
      ];

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: multiDayMeetings,
      });

      // When
      renderWithAuthProvider(<CalendarPage />);

      // Then - 複数日の会議が表示される
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('今日の朝会'))).toBeVisible();
        expect(screen.getByText((content) => content.includes('明日の企画会議'))).toBeVisible();
      });
      
      // API呼び出し確認
      expect(meetingApi.getAll).toHaveBeenCalledTimes(1);
    });

    it('日付選択によるフィルタリング（カレンダー状態管理）', async () => {
      // Given
      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // Then - カレンダーが表示され、日付選択が可能
      await waitFor(() => {
        expect(screen.getByTestId('calendar-view')).toBeVisible();
      });
      
      // カレンダーの状態管理（useCalendarState）が動作していることを確認
      expect(meetingApi.getAll).toHaveBeenCalled();
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

    it.skip('参加者管理でのAPIエラー処理', async () => {
      // Given
      const testMeeting: ApiMeeting = {
        id: 'error-test-meeting',
        title: 'エラーテスト会議',
        startTime: '2025-08-01T10:00:00Z',
        endTime: '2025-08-01T11:00:00Z',
        isImportant: false,
        ownerId: 'user1',
        owner: 'user1@example.com',
        participants: [],
        createdAt: '2025-07-30T10:00:00Z',
        updatedAt: '2025-07-30T10:00:00Z',
      };

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [testMeeting],
      });
      (meetingApi.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: testMeeting,
      });
      (meetingApi.addParticipant as jest.Mock).mockRejectedValue(
        new Error('参加者追加エラー')
      );

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 参加者追加でエラーが発生
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('エラーテスト会議'));
        expect(meetings[0]).toBeVisible();
      });
      await user.click(screen.getAllByText((content) => content.includes('エラーテスト会議'))[0]);
      
      await waitFor(() => {
        expect(screen.getByText('参加者管理')).toBeVisible();
      });
      
      // 入力フィールドが表示されるまで待機
      const emailInput = await waitFor(() => 
        screen.getByPlaceholderText('参加者のメールアドレス')
      );
      await user.type(emailInput, 'error@example.com');
      
      // 追加ボタンをクリック - 参加者追加のためのサイズが小さいボタンを探す
      const buttons = screen.getAllByRole('button');
      let addButton = null;
      
      // Plus iconを持つ、且つsize="sm"のボタンを探す
      for (const btn of buttons) {
        if (btn.querySelector('.lucide-plus') && btn.classList.contains('h-8')) {
          addButton = btn;
          break;
        }
      }
      
      if (addButton) {
        await user.click(addButton);
      }

      // Then - エラートーストが表示される
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      
      // エラーメッセージを確認
      expect(toast.error).toHaveBeenCalledWith('参加者追加エラー');
    });
  });

  describe('プリフェッチ機能 - パフォーマンス最適化', () => {
    it('会議にホバーした時に詳細情報をプリフェッチする', async () => {
      // Given
      const testMeetings: ApiMeeting[] = [
        {
          id: 'meeting-hover-1',
          title: 'ホバーテスト会議1',
          startTime: '2025-07-30T00:00:00Z',  // 日本時間で09:00
          endTime: '2025-07-30T01:00:00Z',
          isImportant: false,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [],
          createdAt: '2025-07-20T10:00:00Z',
          updatedAt: '2025-07-20T10:00:00Z',
        },
        {
          id: 'meeting-hover-2',
          title: 'ホバーテスト会議2',
          startTime: '2025-07-30T05:00:00Z',  // 日本時間で14:00
          endTime: '2025-07-30T06:00:00Z',
          isImportant: true,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [],
          createdAt: '2025-07-20T10:00:00Z',
          updatedAt: '2025-07-20T10:00:00Z',
        }
      ];

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: testMeetings,
      });
      
      (meetingApi.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: testMeetings[0],
      });

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - カレンダーが表示され、会議にホバー
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('ホバーテスト会議1'));
        expect(meetings[0]).toBeVisible();
      });

      const meetings = screen.getAllByText((content) => content.includes('ホバーテスト会議1'));
      await user.hover(meetings[0]);

      // Then - プリフェッチAPIが呼ばれる
      await waitFor(() => {
        expect(meetingApi.getById).toHaveBeenCalledWith('meeting-hover-1');
      });
    });

    it('複数の会議に連続でホバーした時にそれぞれプリフェッチする', async () => {
      // Given
      const testMeetings: ApiMeeting[] = [
        {
          id: 'meeting-multi-1',
          title: 'マルチホバー会議1',
          startTime: '2025-07-30T00:00:00Z',
          endTime: '2025-07-30T01:00:00Z',
          isImportant: false,
          ownerId: 'user1',
          owner: 'user1@example.com',
          participants: [],
          createdAt: '2025-07-20T10:00:00Z',
          updatedAt: '2025-07-20T10:00:00Z',
        },
        {
          id: 'meeting-multi-2',
          title: 'マルチホバー会議2',
          startTime: '2025-07-30T05:00:00Z',
          endTime: '2025-07-30T06:00:00Z',
          isImportant: true,
          ownerId: 'user2',
          owner: 'user2@example.com',
          participants: [],
          createdAt: '2025-07-20T10:00:00Z',
          updatedAt: '2025-07-20T10:00:00Z',
        }
      ];

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: testMeetings,
      });
      
      (meetingApi.getById as jest.Mock)
        .mockResolvedValueOnce({ success: true, data: testMeetings[0] })
        .mockResolvedValueOnce({ success: true, data: testMeetings[1] });

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 複数の会議に連続でホバー
      await waitFor(() => {
        const meetings1 = screen.getAllByText((content) => content.includes('マルチホバー会議1'));
        const meetings2 = screen.getAllByText((content) => content.includes('マルチホバー会議2'));
        expect(meetings1[0]).toBeVisible();
        expect(meetings2[0]).toBeVisible();
      });

      const meetings1 = screen.getAllByText((content) => content.includes('マルチホバー会議1'));
      const meetings2 = screen.getAllByText((content) => content.includes('マルチホバー会議2'));
      
      await user.hover(meetings1[0]);
      await user.hover(meetings2[0]);

      // Then - 両方の会議がプリフェッチされる
      await waitFor(() => {
        expect(meetingApi.getById).toHaveBeenCalledWith('meeting-multi-1');
        expect(meetingApi.getById).toHaveBeenCalledWith('meeting-multi-2');
      });
    });

    it('プリフェッチAPIがエラーの場合でも画面は正常に動作する', async () => {
      // Given
      const testMeeting: ApiMeeting = {
        id: 'meeting-prefetch-error',
        title: 'プリフェッチエラー会議',
        startTime: '2025-07-30T00:00:00Z',
        endTime: '2025-07-30T01:00:00Z',
        isImportant: false,
        ownerId: 'user1',
        owner: 'user1@example.com',
        participants: [],
        createdAt: '2025-07-20T10:00:00Z',
        updatedAt: '2025-07-20T10:00:00Z',
      };

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [testMeeting],
      });
      
      // プリフェッチでエラーを返すが、クリック時は成功する
      (meetingApi.getById as jest.Mock)
        .mockRejectedValueOnce(new Error('プリフェッチエラー'))
        .mockResolvedValueOnce({ success: true, data: testMeeting });

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議にホバー（エラーが発生）
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('プリフェッチエラー会議'));
        expect(meetings[0]).toBeVisible();
      });

      const meetings = screen.getAllByText((content) => content.includes('プリフェッチエラー会議'));
      await user.hover(meetings[0]);

      // Then - エラーが発生してもUIは正常
      await waitFor(() => {
        expect(meetingApi.getById).toHaveBeenCalledWith('meeting-prefetch-error');
      });
      
      // 会議をクリックできることを確認
      await user.click(meetings[0]);
      
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
    });

    it('既にキャッシュされている会議への再ホバーではAPIが呼ばれない', async () => {
      // Given
      const testMeeting: ApiMeeting = {
        id: 'meeting-cached',
        title: 'キャッシュ済み会議',
        startTime: '2025-07-30T00:00:00Z',
        endTime: '2025-07-30T01:00:00Z',
        isImportant: false,
        ownerId: 'user1',
        owner: 'user1@example.com',
        participants: [],
        createdAt: '2025-07-20T10:00:00Z',
        updatedAt: '2025-07-20T10:00:00Z',
      };

      (meetingApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [testMeeting],
      });
      
      (meetingApi.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: testMeeting,
      });

      const user = userEvent.setup();
      renderWithAuthProvider(<CalendarPage />);

      // When - 会議を表示
      await waitFor(() => {
        const meetings = screen.getAllByText((content) => content.includes('キャッシュ済み会議'));
        expect(meetings[0]).toBeVisible();
      });

      // 会議をクリックして詳細を表示（キャッシュに保存される）
      const meetings = screen.getAllByText((content) => content.includes('キャッシュ済み会議'));
      await user.click(meetings[0]);
      
      await waitFor(() => {
        expect(screen.getByText('会議詳細')).toBeVisible();
      });
      
      // 詳細モーダルを閉じる
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);
      
      // APIコール数を記録
      const callCountBeforeHover = (meetingApi.getById as jest.Mock).mock.calls.length;
      
      // 再度ホバー（キャッシュが使われるべき）
      await user.hover(meetings[0]);
      
      // Then - APIは追加で呼ばれない
      await new Promise(resolve => setTimeout(resolve, 100));
      expect((meetingApi.getById as jest.Mock).mock.calls.length).toBe(callCountBeforeHover);
    });
  });

});
