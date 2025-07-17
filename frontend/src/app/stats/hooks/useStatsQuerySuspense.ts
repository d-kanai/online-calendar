import { useSuspenseQuery } from '@tanstack/react-query';
import { statsApi, DailyAverageResponse } from '../apis/stats.api';
import { queryKeys } from '../../../lib/query-keys';
import { useAuth } from '../../../contexts/AuthContext';

// Suspense対応版の統計データ取得
export function useDailyAverageSuspense() {
  const { user } = useAuth();
  
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.dailyAverage(user?.id),
    queryFn: async () => {
      const response = await statsApi.getDailyAverage();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || '統計データの取得に失敗しました');
    },
  });

  return { data };
}