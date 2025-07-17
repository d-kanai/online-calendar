'use client';

import React from 'react';
import { useQuery, useQueries, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query-keys';
import { meetingApi } from '../apis/meeting.api';

// TanStack Queryの高度なパターンのデモ
export function AdvancedQueryDemo() {
  // 1. 依存関係のあるクエリ
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => ({ id: 'user1', name: 'Demo User' }),
  });

  const { data: userMeetings } = useQuery({
    queryKey: queryKeys.meetingsList({ ownerId: user?.id }),
    queryFn: async () => {
      const response = await meetingApi.getAll();
      if (response.success && response.data) {
        return response.data.filter(m => m.ownerId === user?.id);
      }
      return [];
    },
    enabled: !!user?.id, // userが取得できたら実行
  });

  // 2. 並列クエリ（複数の会議詳細を同時取得）
  const meetingIds = ['meeting1', 'meeting2', 'meeting3'];
  const meetingQueries = useQueries({
    queries: meetingIds.map(id => ({
      queryKey: queryKeys.meetingDetail(id),
      queryFn: () => meetingApi.getById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  // 3. 無限スクロール（ページネーション）の例
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['meetings', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      // 実際のAPIではページネーションパラメータを使用
      const response = await meetingApi.getAll();
      if (response.success && response.data) {
        const pageSize = 10;
        const start = pageParam * pageSize;
        const end = start + pageSize;
        return {
          meetings: response.data.slice(start, end),
          nextPage: end < response.data.length ? pageParam + 1 : undefined,
        };
      }
      return { meetings: [], nextPage: undefined };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // 4. ポーリング（定期的な更新）
  const { data: liveData } = useQuery({
    queryKey: ['meetings', 'live'],
    queryFn: () => meetingApi.getAll(),
    refetchInterval: 5000, // 5秒ごとに更新
    refetchIntervalInBackground: true, // バックグラウンドでも更新
  });

  // 5. 条件付きフェッチ
  const [shouldFetch, setShouldFetch] = React.useState(false);
  const { data: conditionalData } = useQuery({
    queryKey: ['meetings', 'conditional'],
    queryFn: () => meetingApi.getAll(),
    enabled: shouldFetch, // shouldFetchがtrueの時のみ実行
  });

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">TanStack Query Advanced Patterns Demo</h2>
      
      {/* 依存関係のあるクエリ */}
      <section>
        <h3 className="text-lg font-semibold">1. Dependent Queries</h3>
        <p>User: {user?.name}</p>
        <p>User Meetings: {userMeetings?.length || 0} meetings</p>
      </section>

      {/* 並列クエリ */}
      <section>
        <h3 className="text-lg font-semibold">2. Parallel Queries</h3>
        <p>Fetched {meetingQueries.filter(q => q.isSuccess).length} of {meetingIds.length} meetings</p>
      </section>

      {/* 無限スクロール */}
      <section>
        <h3 className="text-lg font-semibold">3. Infinite Scroll</h3>
        <div className="space-y-2">
          {infiniteData?.pages.map((page, i) => (
            <div key={i}>
              Page {i + 1}: {page.meetings.length} meetings
            </div>
          ))}
        </div>
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        )}
      </section>

      {/* ポーリング */}
      <section>
        <h3 className="text-lg font-semibold">4. Polling (Auto-refresh every 5s)</h3>
        <p>Live meeting count: {liveData?.data?.length || 0}</p>
      </section>

      {/* 条件付きフェッチ */}
      <section>
        <h3 className="text-lg font-semibold">5. Conditional Fetching</h3>
        <button
          onClick={() => setShouldFetch(!shouldFetch)}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
        >
          {shouldFetch ? 'Stop Fetching' : 'Start Fetching'}
        </button>
        {conditionalData && <p>Fetched {conditionalData.data?.length || 0} meetings</p>}
      </section>
    </div>
  );
}