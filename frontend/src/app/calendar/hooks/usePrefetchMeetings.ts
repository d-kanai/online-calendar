import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query-keys';
import { meetingApi } from '../apis/meeting.api';

export const usePrefetchMeetings = () => {
  const queryClient = useQueryClient();

  // ホバー時のプリフェッチ（UX向上）
  const prefetchOnHover = (meetingId: string) => {
    // キャッシュに既にある場合はスキップ
    const cached = queryClient.getQueryData(queryKeys.meetingDetail(meetingId));
    if (!cached) {
      // 特定の会議詳細をプリフェッチ
      queryClient.prefetchQuery({
        queryKey: queryKeys.meetingDetail(meetingId),
        queryFn: async () => {
          const response = await meetingApi.getById(meetingId);
          if (response.success && response.data) {
            return {
              ...response.data,
              startTime: new Date(response.data.startTime),
              endTime: new Date(response.data.endTime),
            };
          }
          throw new Error(response.error || '会議詳細の取得に失敗しました');
        },
        staleTime: 60 * 1000, // 1分
      });
    }
  };

  return {
    prefetchOnHover,
  };
};