import { useSuspenseQuery, useSuspenseQueries } from '@tanstack/react-query';
import { meetingApi } from '../apis/meeting.api';
import { queryKeys } from '../../../lib/query-keys';
import { Meeting } from '../../../types/meeting';

// Suspense対応版のuseMeetings
export function useMeetingsSuspense() {
  const { data: meetings } = useSuspenseQuery({
    queryKey: queryKeys.meetingsList(),
    queryFn: async () => {
      const response = await meetingApi.getAll();
      if (response.success && response.data) {
        return response.data.map(meeting => ({
          ...meeting,
          startTime: new Date(meeting.startTime),
          endTime: new Date(meeting.endTime),
        }));
      }
      throw new Error(response.error || '会議データの取得に失敗しました');
    },
  });

  return { meetings };
}

// Suspense対応版の個別会議詳細取得
export function useMeetingDetailSuspense(meetingId: string | null) {
  const { data: meeting } = useSuspenseQuery({
    queryKey: queryKeys.meetingDetail(meetingId!),
    queryFn: async () => {
      const response = await meetingApi.getById(meetingId!);
      if (response.success && response.data) {
        return {
          ...response.data,
          startTime: new Date(response.data.startTime),
          endTime: new Date(response.data.endTime),
        };
      }
      throw new Error(response.error || '会議詳細の取得に失敗しました');
    },
    enabled: !!meetingId,
  });

  return { meeting };
}

// 複数の会議を並列で取得（Suspense対応）
export function useMeetingDetailsSuspense(meetingIds: string[]) {
  const results = useSuspenseQueries({
    queries: meetingIds.map(id => ({
      queryKey: queryKeys.meetingDetail(id),
      queryFn: async () => {
        const response = await meetingApi.getById(id);
        if (response.success && response.data) {
          return {
            ...response.data,
            startTime: new Date(response.data.startTime),
            endTime: new Date(response.data.endTime),
          };
        }
        throw new Error(response.error || '会議詳細の取得に失敗しました');
      },
    })),
  });

  return {
    meetings: results.map(result => result.data as Meeting),
  };
}