import { screen, waitFor, renderWithAuthProvider } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import StatsPage from './page';
import { statsApi } from './apis/stats.api';
import { resetAllMocks } from '@/test/setup-mocks';
import { calendarRoutes, statsRoutes } from '@/lib/routes';

// TestCルール: 3つのみモック
// 1. APIレイヤー
jest.mock('./apis/stats.api', () => ({
  statsApi: {
    getDailyAverage: jest.fn(),
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
  usePathname: () => statsRoutes.root(),
}));

// 3. ErrorBoundary
jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => children,
}));

describe('StatsPage - 統計ページの振る舞いテスト', () => {
  beforeEach(() => {
    // Given - テスト前の準備
    resetAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockPrefetch.mockClear();
  });

  describe('取得API (Query) - 統計データの表示', () => {
    it('APIレスポンスの動的データが画面に表示される', async () => {
      // Given - APIレスポンスをモック定義
      const mockStatsData = {
        averageDailyMinutes: 85.3,
        weeklyData: [
          { date: '2024-01-15', dayName: '月', totalMinutes: 120 },
          { date: '2024-01-16', dayName: '火', totalMinutes: 90 },
          { date: '2024-01-17', dayName: '水', totalMinutes: 60 },
          { date: '2024-01-18', dayName: '木', totalMinutes: 150 },
          { date: '2024-01-19', dayName: '金', totalMinutes: 30 },
          { date: '2024-01-20', dayName: '土', totalMinutes: 0 },
          { date: '2024-01-21', dayName: '日', totalMinutes: 45 },
        ],
      };
      (statsApi.getDailyAverage as jest.Mock).mockResolvedValue({
        success: true,
        data: mockStatsData,
      });

      // When - ページをレンダリング
      renderWithAuthProvider(<StatsPage />);

      // Then - APIの動的データのみアサート（静的なタイトル等は除外）
      await waitFor(() => {
        // APIレスポンスの averageDailyMinutes を確認
        expect(screen.getByTestId('daily-average-time')).toHaveTextContent('85.3分');
      });

      // 週合計（APIデータから計算される動的な値）: 120+90+60+150+30+0+45 = 495分 = 8時間15分
      expect(screen.getByText('週合計: 8時間15分')).toBeVisible();

      // 週次データのdayName（APIレスポンスの動的データ）
      expect(screen.getByText('月')).toBeVisible();
      expect(screen.getByText('火')).toBeVisible();
      expect(screen.getByText('水')).toBeVisible();
      expect(screen.getByText('木')).toBeVisible();
      expect(screen.getByText('金')).toBeVisible();
      expect(screen.getByText('土')).toBeVisible();
      expect(screen.getByText('日')).toBeVisible();
      
      // totalMinutes（APIレスポンスの動的データ、formatMinutes関数を通した表示）
      expect(screen.getByText('2時間')).toBeVisible();     // 120分
      expect(screen.getByText('1時間30分')).toBeVisible(); // 90分
      expect(screen.getByText('1時間')).toBeVisible();     // 60分
      expect(screen.getByText('2時間30分')).toBeVisible(); // 150分
      expect(screen.getByText('30分')).toBeVisible();      // 30分
      // 0分は表示されない
      expect(screen.getByText('45分')).toBeVisible();      // 45分
    });

    it('異なるデータパターンでも正しく表示される', async () => {
      // Given - 異なるパターンのAPIレスポンス
      const mockStatsData = {
        averageDailyMinutes: 0,
        weeklyData: [
          { date: '2024-01-15', dayName: '月', totalMinutes: 0 },
          { date: '2024-01-16', dayName: '火', totalMinutes: 0 },
          { date: '2024-01-17', dayName: '水', totalMinutes: 0 },
          { date: '2024-01-18', dayName: '木', totalMinutes: 0 },
          { date: '2024-01-19', dayName: '金', totalMinutes: 0 },
          { date: '2024-01-20', dayName: '土', totalMinutes: 0 },
          { date: '2024-01-21', dayName: '日', totalMinutes: 0 },
        ],
      };
      (statsApi.getDailyAverage as jest.Mock).mockResolvedValue({
        success: true,
        data: mockStatsData,
      });

      // When
      renderWithAuthProvider(<StatsPage />);

      // Then - 0のケースでも正しく表示
      await waitFor(() => {
        expect(screen.getByTestId('daily-average-time')).toHaveTextContent('0分');
      });

      // 週合計も0
      expect(screen.getByText('週合計: 0分')).toBeVisible();

      // 曜日は表示される
      expect(screen.getByText('月')).toBeVisible();
      expect(screen.getByText('火')).toBeVisible();
      expect(screen.getByText('水')).toBeVisible();
      expect(screen.getByText('木')).toBeVisible();
      expect(screen.getByText('金')).toBeVisible();
      expect(screen.getByText('土')).toBeVisible();
      expect(screen.getByText('日')).toBeVisible();
    });
  });

  describe('イベントハンドリング - ナビゲーション', () => {
    it('戻るボタンクリックでカレンダー画面に遷移する', async () => {
      // Given - デフォルトのAPIレスポンス設定
      (statsApi.getDailyAverage as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          averageDailyMinutes: 0,
          weeklyData: [
            { date: '2024-01-15', dayName: '月', totalMinutes: 0 },
            { date: '2024-01-16', dayName: '火', totalMinutes: 0 },
            { date: '2024-01-17', dayName: '水', totalMinutes: 0 },
            { date: '2024-01-18', dayName: '木', totalMinutes: 0 },
            { date: '2024-01-19', dayName: '金', totalMinutes: 0 },
            { date: '2024-01-20', dayName: '土', totalMinutes: 0 },
            { date: '2024-01-21', dayName: '日', totalMinutes: 0 },
          ],
        },
      });
      const user = userEvent.setup();
      renderWithAuthProvider(<StatsPage />);

      // When - 戻るボタンをクリック
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '戻る' })).toBeVisible();
      });
      await user.click(screen.getByRole('button', { name: '戻る' }));

      // Then - ルーティングが発生
      expect(mockPush).toHaveBeenCalledWith(calendarRoutes.root());
    });
  });

  describe('エラーハンドリング - APIエラー時の処理', () => {
    it('APIエラー時にエラーが発生する', async () => {
      // Given - APIエラーをモック
      const testError = new Error('統計データの取得に失敗しました');
      (statsApi.getDailyAverage as jest.Mock).mockRejectedValue(testError);

      // エラーログを抑制
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // When - ページをレンダリング
      renderWithAuthProvider(<StatsPage />);

      // Then - APIが呼ばれることを確認
      await waitFor(() => {
        expect(statsApi.getDailyAverage).toHaveBeenCalled();
      });

      // APIがエラーを返したことを確認
      expect(statsApi.getDailyAverage).toHaveBeenCalledTimes(1);
      await expect(statsApi.getDailyAverage()).rejects.toThrow('統計データの取得に失敗しました');

      // クリーンアップ
      consoleErrorSpy.mockRestore();
    });
  });
});
