// Query Keyファクトリー - 階層的で予測可能なキャッシュ管理
export const queryKeys = {
  // ベースキー
  all: ['online-calendar'] as const,
  
  // 認証関連
  auth: () => [...queryKeys.all, 'auth'] as const,
  currentUser: () => [...queryKeys.auth(), 'current-user'] as const,
  
  // 会議関連
  meetings: () => [...queryKeys.all, 'meetings'] as const,
  meetingsList: (filters?: { date?: Date; ownerId?: string }) => 
    [...queryKeys.meetings(), 'list', filters] as const,
  meetingDetail: (id: string) => 
    [...queryKeys.meetings(), 'detail', id] as const,
  meetingParticipants: (meetingId: string) => 
    [...queryKeys.meetings(), 'participants', meetingId] as const,
  
  // 統計関連
  stats: () => [...queryKeys.all, 'stats'] as const,
  dailyAverage: (userId?: string) => 
    [...queryKeys.stats(), 'daily-average', userId] as const,
  weeklyStats: (startDate: Date, endDate: Date) => 
    [...queryKeys.stats(), 'weekly', { startDate, endDate }] as const,
  
  // ユーザー関連
  users: () => [...queryKeys.all, 'users'] as const,
  userDetail: (id: string) => 
    [...queryKeys.users(), 'detail', id] as const,
  usersByEmail: (emails: string[]) => 
    [...queryKeys.users(), 'by-email', emails] as const,
} as const;

// キャッシュ無効化ヘルパー
export const invalidateHelpers = {
  // 会議関連の全キャッシュを無効化
  invalidateAllMeetings: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.meetings() });
  },
  
  // 特定の会議とそのリストを無効化
  invalidateMeeting: (queryClient: any, meetingId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.meetingDetail(meetingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.meetingsList() });
    queryClient.invalidateQueries({ queryKey: queryKeys.meetingParticipants(meetingId) });
  },
  
  // 統計関連を無効化
  invalidateStats: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
  },
};

// キャッシュ更新ヘルパー
export const cacheHelpers = {
  // 会議リストから特定の会議を取得
  getMeetingFromList: (queryClient: any, meetingId: string) => {
    const lists = queryClient.getQueriesData({ queryKey: queryKeys.meetingsList() });
    for (const [, data] of lists) {
      if (Array.isArray(data)) {
        const meeting = data.find((m: any) => m.id === meetingId);
        if (meeting) return meeting;
      }
    }
    return null;
  },
  
  // 会議詳細をリストキャッシュにも反映
  updateMeetingInAllCaches: (queryClient: any, meetingId: string, updater: (old: any) => any) => {
    // 詳細キャッシュを更新
    queryClient.setQueryData(queryKeys.meetingDetail(meetingId), updater);
    
    // リストキャッシュも更新
    queryClient.setQueriesData(
      { queryKey: queryKeys.meetingsList() },
      (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((meeting: any) => 
          meeting.id === meetingId ? updater(meeting) : meeting
        );
      }
    );
  },
};