import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { statsApi, DailyAverageResponse } from '../apis/stats.api';
import { queryKeys, invalidateHelpers } from '../../../lib/query-keys';
import { useAuth } from '../../../contexts/AuthContext';

// 日別平均の取得（Suspense対応）
export function useDailyAverage() {
  const { user } = useAuth();
  
  return useSuspenseQuery<DailyAverageResponse>({
    queryKey: queryKeys.dailyAverage(user?.id),
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