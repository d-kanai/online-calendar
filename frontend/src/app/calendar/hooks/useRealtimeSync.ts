import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateHelpers } from '../../../lib/query-keys';

interface RealtimeSyncOptions {
  // リアルタイム同期の間隔（ミリ秒）
  syncInterval?: number;
  // フォーカス時の即時同期
  refetchOnFocus?: boolean;
  // バックグラウンドでの同期
  refetchInBackground?: boolean;
  // WebSocket URLがある場合
  websocketUrl?: string;
}

export const useRealtimeSync = (options: RealtimeSyncOptions = {}) => {
  const queryClient = useQueryClient();
  const {
    syncInterval = 30000, // デフォルト30秒
    refetchOnFocus = true,
    refetchInBackground = false,
    websocketUrl,
  } = options;

  // 定期的な同期
  useEffect(() => {
    if (syncInterval <= 0) return;

    const interval = setInterval(() => {
      // バックグラウンドタブでも同期する場合
      if (refetchInBackground || document.visibilityState === 'visible') {
        // 会議リストと統計データを再取得
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.meetings(),
          refetchType: 'active',
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.stats(),
          refetchType: 'active',
        });
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [syncInterval, refetchInBackground, queryClient]);

  // フォーカス時の同期
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      // ウィンドウがフォーカスされたときに最新データを取得
      invalidateHelpers.invalidateAllMeetings(queryClient);
      invalidateHelpers.invalidateStats(queryClient);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // タブが表示されたときに最新データを取得
        invalidateHelpers.invalidateAllMeetings(queryClient);
      invalidateHelpers.invalidateStats(queryClient);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchOnFocus, queryClient]);

  // WebSocket接続（将来の拡張用）
  useEffect(() => {
    if (!websocketUrl) return;

    // WebSocket実装のプレースホルダー
    // 実際の実装では、サーバーからのリアルタイムイベントを受信して
    // 特定のクエリを無効化する
    const ws = new WebSocket(websocketUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'meeting:created':
          case 'meeting:updated':
          case 'meeting:deleted':
            // 会議データを再取得
            invalidateHelpers.invalidateAllMeetings(queryClient);
            break;
            
          case 'participant:added':
          case 'participant:removed':
            // 特定の会議詳細を再取得
            if (data.meetingId) {
              queryClient.invalidateQueries({
                queryKey: queryKeys.meetingDetail(data.meetingId),
              });
            }
            break;
            
          case 'stats:updated':
            // 統計データを再取得
            invalidateHelpers.invalidateStats(queryClient);
            break;
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [websocketUrl, queryClient]);

  // 手動同期関数
  const syncNow = () => {
    invalidateHelpers.invalidateAllMeetings(queryClient);
    invalidateHelpers.invalidateStats(queryClient);
  };

  // 特定のデータのみ同期
  const syncMeetings = () => {
    invalidateHelpers.invalidateAllMeetings(queryClient);
  };

  const syncStats = () => {
    invalidateHelpers.invalidateStats(queryClient);
  };

  return {
    syncNow,
    syncMeetings,
    syncStats,
  };
};

// グローバル設定用のフック
export const useGlobalRealtimeSync = () => {
  // アプリ全体でリアルタイム同期を有効化
  useRealtimeSync({
    syncInterval: 60000, // 1分ごと
    refetchOnFocus: true,
    refetchInBackground: false,
  });
};