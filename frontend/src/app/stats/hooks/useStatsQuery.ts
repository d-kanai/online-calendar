import { useQuery } from '@tanstack/react-query';
import { statsApi, DailyAverageResponse } from '../apis/stats.api';

// Query Keys
const QUERY_KEYS = {
  all: ['stats'] as const,
  dailyAverage: () => [...QUERY_KEYS.all, 'dailyAverage'] as const,
};

// 日別平均の取得
export function useDailyAverage() {
  return useQuery<DailyAverageResponse>({
    queryKey: QUERY_KEYS.dailyAverage(),
    queryFn: async () => {
      const response = await statsApi.getDailyAverage();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || '統計データの取得に失敗しました');
    },
    staleTime: 60 * 1000, // 1分
    gcTime: 5 * 60 * 1000, // 5分
    refetchInterval: 5 * 60 * 1000, // 5分ごとに自動更新
  });
}