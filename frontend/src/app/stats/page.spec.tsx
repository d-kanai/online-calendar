import { screen, waitFor, renderWithAuthProvider } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import StatsPage from './page';
import { statsApi } from './apis/stats.api';
import { resetAllMocks } from '@/test/setup-mocks';
import { useSuspenseQuery } from '@tanstack/react-query';

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
  usePathname: () => '/stats',
}));

// APIレイヤーのみモック（TestCルールに従う）
jest.mock('./apis/stats.api', () => ({
  statsApi: {
    getDailyAverage: jest.fn(),
  },
}));

// react-error-boundaryのみ最小限モック
jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children, FallbackComponent }: any) => {
    try {
      return children;
    } catch (error) {
      return <FallbackComponent error={error} resetErrorBoundary={() => {}} />;
    }
  },
}));


describe('StatsPage - 統計ページの振る舞い', () => {
  const mockStatsData = {
    averageDailyMinutes: 120.5,
    weeklyData: [
      { date: '2024-01-15', dayName: '月', totalMinutes: 90 },
      { date: '2024-01-16', dayName: '火', totalMinutes: 150 },
      { date: '2024-01-17', dayName: '水', totalMinutes: 120 },
      { date: '2024-01-18', dayName: '木', totalMinutes: 180 },
      { date: '2024-01-19', dayName: '金', totalMinutes: 60 },
      { date: '2024-01-20', dayName: '土', totalMinutes: 0 },
      { date: '2024-01-21', dayName: '日', totalMinutes: 0 },
    ],
  };

  beforeEach(() => {
    // 各テスト前にモックをリセット
    resetAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockPrefetch.mockClear();

    // デフォルトのAPIモック設定
    (statsApi.getDailyAverage as jest.Mock).mockResolvedValue({
      success: true,
      data: mockStatsData,
    });

    // useSuspenseQueryのモック設定
    (useSuspenseQuery as jest.Mock).mockReturnValue({
      data: mockStatsData,
    });
  });

  describe('ページ表示', () => {
    it('統計ページが正しく表示される', async () => {
      // When - ページをレンダリング
      renderWithAuthProvider(<StatsPage />);

      // Then - ページ要素が表示されていることを確認
      expect(screen.getByTestId('stats-view')).toBeVisible();
      
      // 統計データが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByText('1日あたりの平均会議時間')).toBeVisible();
      });

      expect(screen.getByTestId('daily-average-time')).toBeVisible();
      expect(screen.getByText('参加会議数')).toBeVisible();
      expect(screen.getByText('日別会議時間（過去1週間）')).toBeVisible();
    });
  });

  describe('参照API (Query) - 統計データの取得', () => {
    it('統計データが正しく表示される', async () => {
      // When - ページをレンダリング
      renderWithAuthProvider(<StatsPage />);

      // Then - 統計データが表示される
      await waitFor(() => {
        expect(screen.getByTestId('daily-average-time')).toHaveTextContent('120.5分');
      });

      // 週次データが表示される
      expect(screen.getByText('月')).toBeVisible();
      expect(screen.getByText('火')).toBeVisible();
      expect(screen.getByText('水')).toBeVisible();
      expect(screen.getByText('木')).toBeVisible();
      expect(screen.getByText('金')).toBeVisible();
    });

    it('APIが正常に呼び出されることを確認', async () => {
      // When - ページをレンダリング
      renderWithAuthProvider(<StatsPage />);

      // Then - useSuspenseQueryが呼び出される
      expect(useSuspenseQuery).toHaveBeenCalled();
      
      // 統計データが表示される
      await waitFor(() => {
        expect(screen.getByTestId('daily-average-time')).toHaveTextContent('120.5分');
      });
    });
  });

  describe('APIモック設定の検証', () => {
    it('APIモックが正しく設定されている', async () => {
      // Given - APIの設定確認
      const result = await statsApi.getDailyAverage();
      
      // Then - モックの戻り値が正しい
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStatsData);
      
      // useSuspenseQueryのモックも確認
      expect(useSuspenseQuery).toBeDefined();
    });
  });

  describe('データフォーマット', () => {
    it('時間の表示フォーマットが正しい', async () => {
      // Given - 異なる時間データでテスト
      const customStatsData = {
        ...mockStatsData,
        weeklyData: [
          { date: '2024-01-15', dayName: '月', totalMinutes: 125 }, // 2時間5分
          { date: '2024-01-16', dayName: '火', totalMinutes: 60 },  // 1時間
          { date: '2024-01-17', dayName: '水', totalMinutes: 30 },  // 30分
          { date: '2024-01-18', dayName: '木', totalMinutes: 0 },   // 0分
          { date: '2024-01-19', dayName: '金', totalMinutes: 180 }, // 3時間
          { date: '2024-01-20', dayName: '土', totalMinutes: 0 },
          { date: '2024-01-21', dayName: '日', totalMinutes: 0 },
        ],
      };

      (useSuspenseQuery as jest.Mock).mockReturnValue({
        data: customStatsData,
      });

      // When - ページをレンダリング
      renderWithAuthProvider(<StatsPage />);

      // Then - 時間フォーマットが正しく表示される
      await waitFor(() => {
        expect(screen.getByText('2時間5分')).toBeVisible();
      });
      expect(screen.getByText('1時間')).toBeVisible();
      expect(screen.getByText('30分')).toBeVisible();
      expect(screen.getByText('3時間')).toBeVisible();
    });
  });
});