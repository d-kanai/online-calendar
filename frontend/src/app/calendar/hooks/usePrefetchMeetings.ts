import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query-keys';
import { meetingApi } from '../apis/meeting.api';

export const usePrefetchMeetings = () => {
  const queryClient = useQueryClient();

  // 会議リストをプリフェッチ
  const prefetchMeetingsList = async () => {
    await queryClient.prefetchQuery({
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
      staleTime: 30 * 1000, // 30秒
    });
  };

  // 特定の会議詳細をプリフェッチ
  const prefetchMeetingDetail = async (meetingId: string) => {
    await queryClient.prefetchQuery({
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
  };

  // 今日の会議をプリフェッチ
  const prefetchTodaysMeetings = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await queryClient.prefetchQuery({
      queryKey: queryKeys.meetingsList({ date: today }),
      queryFn: async () => {
        const response = await meetingApi.getAll();
        if (response.success && response.data) {
          // 今日の会議のみフィルタリング
          return response.data
            .map(meeting => ({
              ...meeting,
              startTime: new Date(meeting.startTime),
              endTime: new Date(meeting.endTime),
            }))
            .filter(meeting => {
              const meetingDate = new Date(meeting.startTime);
              meetingDate.setHours(0, 0, 0, 0);
              return meetingDate.getTime() === today.getTime();
            });
        }
        throw new Error(response.error || '会議データの取得に失敗しました');
      },
      staleTime: 30 * 1000,
    });
  };

  // 画面表示時の会議詳細を事前取得
  const prefetchVisibleMeetings = async (meetingIds: string[]) => {
    // 並列でプリフェッチ
    await Promise.all(
      meetingIds.map(id => prefetchMeetingDetail(id))
    );
  };

  // ホバー時のプリフェッチ（UX向上）
  const prefetchOnHover = (meetingId: string) => {
    // キャッシュに既にある場合はスキップ
    const cached = queryClient.getQueryData(queryKeys.meetingDetail(meetingId));
    if (!cached) {
      prefetchMeetingDetail(meetingId);
    }
  };

  return {
    prefetchMeetingsList,
    prefetchMeetingDetail,
    prefetchTodaysMeetings,
    prefetchVisibleMeetings,
    prefetchOnHover,
  };
};