import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Meeting } from '../../../types/meeting';
import { ApiMeeting, ApiParticipant } from '../../../types/api';
import { meetingApi } from '../apis/meeting.api';
import { toast } from 'sonner';
import { queryKeys, invalidateHelpers, cacheHelpers } from '../../../lib/query-keys';

// APIレスポンスをMeeting型に変換
const mapApiToMeeting = (apiMeeting: ApiMeeting): Meeting => ({
  id: apiMeeting.id,
  title: apiMeeting.title,
  startTime: new Date(apiMeeting.startTime),
  endTime: new Date(apiMeeting.endTime),
  ownerId: apiMeeting.ownerId,
  owner: apiMeeting.owner,
  participants: apiMeeting.participants ? apiMeeting.participants.map((p: ApiParticipant) => ({
    id: p.id,
    email: p.email,
    name: p.name
  })) : [],
  isImportant: apiMeeting.isImportant,
  status: 'scheduled' as const,
  createdAt: new Date(apiMeeting.createdAt),
  updatedAt: new Date(apiMeeting.updatedAt)
});

// 会議一覧の取得（既存のuseMeetingsと互換性を保つ）
export const useMeetings = (filters?: { date?: Date; ownerId?: string }) => {
  const queryClient = useQueryClient();
  
  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: queryKeys.meetingsList(filters),
    queryFn: async () => {
      const response = await meetingApi.getAll();
      if (response.success && response.data) {
        const allMeetings = response.data.map(mapApiToMeeting);
        
        // フィルタリング
        let filtered = allMeetings;
        if (filters?.date) {
          const targetDate = filters.date.toDateString();
          filtered = filtered.filter(m => 
            new Date(m.startTime).toDateString() === targetDate
          );
        }
        if (filters?.ownerId) {
          filtered = filtered.filter(m => m.ownerId === filters.ownerId);
        }
        
        return filtered;
      }
      throw new Error('Failed to fetch meetings');
    },
    staleTime: 30 * 1000, // 30秒
    gcTime: 5 * 60 * 1000, // 5分
  });

  // 既存のインターフェースとの互換性のため
  const loadMeetings = async () => {
    await invalidateHelpers.invalidateAllMeetings(queryClient);
  };

  const updateMeetings = (updater: (prev: Meeting[]) => Meeting[]) => {
    queryClient.setQueryData(queryKeys.meetingsList(filters), updater);
  };

  return {
    meetings,
    isLoading,
    error: error ? '会議の取得に失敗しました' : null,
    loadMeetings,
    updateMeetings
  };
};

// 会議詳細の取得（新規）
export const useMeetingDetail = (meetingId: string | null) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.meetingDetail(meetingId!),
    queryFn: async () => {
      // まずキャッシュから取得を試みる
      const cachedMeeting = cacheHelpers.getMeetingFromList(queryClient, meetingId!);
      if (cachedMeeting) {
        return cachedMeeting;
      }
      
      // キャッシュになければAPIから取得
      const response = await meetingApi.getById(meetingId!);
      if (response.success && response.data) {
        return mapApiToMeeting(response.data);
      }
      throw new Error('Failed to fetch meeting detail');
    },
    enabled: !!meetingId,
    staleTime: 60 * 1000, // 1分
    gcTime: 10 * 60 * 1000, // 10分
  });
};

// 会議作成のMutation
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      startTime: Date;
      endTime: Date;
      ownerId: string;
      isImportant: boolean;
    }) => {
      const response = await meetingApi.create({
        ...data,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString()
      });
      if (response.success && response.data) {
        return mapApiToMeeting(response.data);
      }
      throw new Error(response.error || '会議の作成に失敗しました');
    },
    onMutate: async (newMeeting) => {
      // 楽観的更新のための準備
      await queryClient.cancelQueries({ queryKey: queryKeys.meetings() });
      
      const previousMeetings = queryClient.getQueryData(queryKeys.meetingsList());
      
      // 楽観的に追加
      const optimisticMeeting: Meeting = {
        id: `temp-${Date.now()}`,
        ...newMeeting,
        owner: newMeeting.ownerId,
        participants: [],
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      queryClient.setQueryData(queryKeys.meetingsList(), (old: Meeting[] = []) => {
        return [...old, optimisticMeeting];
      });
      
      return { previousMeetings };
    },
    onError: (err, newMeeting, context) => {
      // エラー時は元に戻す
      if (context?.previousMeetings) {
        queryClient.setQueryData(queryKeys.meetingsList(), context.previousMeetings);
      }
      toast.error(err instanceof Error ? err.message : '会議の作成に失敗しました');
    },
    onSettled: () => {
      // 成功・失敗に関わらず最新データを取得
      invalidateHelpers.invalidateAllMeetings(queryClient);
    },
    onSuccess: () => {
      toast.success('会議が作成されました');
    },
  });
};

// 会議更新のMutation
export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: {
        title?: string;
        startTime?: Date;
        endTime?: Date;
        isImportant?: boolean;
      }
    }) => {
      const response = await meetingApi.update(id, {
        title: data.title,
        startTime: data.startTime?.toISOString(),
        endTime: data.endTime?.toISOString(),
        isImportant: data.isImportant
      });
      if (response.success && response.data) {
        return mapApiToMeeting(response.data);
      }
      throw new Error(response.error || '会議の更新に失敗しました');
    },
    onMutate: async ({ id, data }) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: queryKeys.meetingDetail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.meetingsList() });
      
      const previousMeeting = queryClient.getQueryData(queryKeys.meetingDetail(id));
      const previousList = queryClient.getQueryData(queryKeys.meetingsList());
      
      // 楽観的に更新
      const updater = (old: Meeting) => ({
        ...old,
        ...data,
        updatedAt: new Date()
      });
      
      cacheHelpers.updateMeetingInAllCaches(queryClient, id, updater);
      
      return { previousMeeting, previousList };
    },
    onError: (err, { id }, context) => {
      // エラー時は元に戻す
      if (context?.previousMeeting) {
        queryClient.setQueryData(queryKeys.meetingDetail(id), context.previousMeeting);
      }
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.meetingsList(), context.previousList);
      }
      toast.error(err instanceof Error ? err.message : '会議の更新に失敗しました');
    },
    onSettled: (data, error, { id }) => {
      // 成功・失敗に関わらず該当する会議を無効化
      invalidateHelpers.invalidateMeeting(queryClient, id);
    },
    onSuccess: () => {
      toast.success('会議が更新されました');
    },
  });
};

// 会議削除のMutation
export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await meetingApi.delete(id);
      if (!response.success) {
        throw new Error(response.error || '会議の削除に失敗しました');
      }
      return id;
    },
    onMutate: async (meetingId) => {
      // 楽観的削除
      await queryClient.cancelQueries({ queryKey: queryKeys.meetings() });
      
      const previousList = queryClient.getQueryData(queryKeys.meetingsList());
      
      // 楽観的に削除
      queryClient.setQueryData(queryKeys.meetingsList(), (old: Meeting[] = []) => {
        return old.filter(meeting => meeting.id !== meetingId);
      });
      
      // 詳細キャッシュも削除
      queryClient.removeQueries({ queryKey: queryKeys.meetingDetail(meetingId) });
      
      return { previousList };
    },
    onError: (err, meetingId, context) => {
      // エラー時は元に戻す
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.meetingsList(), context.previousList);
      }
      toast.error(err instanceof Error ? err.message : '会議の削除に失敗しました');
    },
    onSettled: () => {
      // 成功・失敗に関わらず最新データを取得
      invalidateHelpers.invalidateAllMeetings(queryClient);
    },
    onSuccess: () => {
      toast.success('会議が削除されました');
    },
  });
};

// 参加者追加のMutation
export const useAddParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetingId, email }: { meetingId: string; email: string }) => {
      const response = await meetingApi.addParticipant(meetingId, { email, name: email });
      if (response.success && response.data) {
        const updatedMeeting = mapApiToMeeting(response.data);
        const addedParticipant = updatedMeeting.participants[updatedMeeting.participants.length - 1];
        return { meetingId, participant: addedParticipant, updatedMeeting };
      }
      throw new Error(response.error || '参加者の追加に失敗しました');
    },
    onMutate: async ({ meetingId, email }) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: queryKeys.meetingDetail(meetingId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.meetingParticipants(meetingId) });
      
      const previousMeeting = queryClient.getQueryData(queryKeys.meetingDetail(meetingId));
      
      // 楽観的に参加者を追加
      const optimisticParticipant = {
        id: `temp-${Date.now()}`,
        email,
        name: email.split('@')[0]
      };
      
      cacheHelpers.updateMeetingInAllCaches(queryClient, meetingId, (old: Meeting) => ({
        ...old,
        participants: [...old.participants, optimisticParticipant]
      }));
      
      return { previousMeeting };
    },
    onError: (err, { meetingId }, context) => {
      // エラー時は元に戻す
      if (context?.previousMeeting) {
        cacheHelpers.updateMeetingInAllCaches(queryClient, meetingId, () => context.previousMeeting);
      }
      toast.error(err instanceof Error ? err.message : '参加者の追加に失敗しました');
    },
    onSettled: (data, error, { meetingId }) => {
      // 成功・失敗に関わらず該当する会議を無効化
      invalidateHelpers.invalidateMeeting(queryClient, meetingId);
    },
    onSuccess: () => {
      toast.success('参加者が更新されました');
    },
  });
};

// 参加者削除のMutation
export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetingId, participantId }: { meetingId: string; participantId: string }) => {
      const response = await meetingApi.removeParticipant(meetingId, participantId);
      if (!response.success) {
        throw new Error(response.error || '参加者の削除に失敗しました');
      }
      return { meetingId, participantId };
    },
    onMutate: async ({ meetingId, participantId }) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: queryKeys.meetingDetail(meetingId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.meetingParticipants(meetingId) });
      
      const previousMeeting = queryClient.getQueryData(queryKeys.meetingDetail(meetingId));
      
      // 楽観的に参加者を削除
      cacheHelpers.updateMeetingInAllCaches(queryClient, meetingId, (old: Meeting) => ({
        ...old,
        participants: old.participants.filter(p => p.id !== participantId)
      }));
      
      return { previousMeeting };
    },
    onError: (err, { meetingId }, context) => {
      // エラー時は元に戻す
      if (context?.previousMeeting) {
        cacheHelpers.updateMeetingInAllCaches(queryClient, meetingId, () => context.previousMeeting);
      }
      toast.error(err instanceof Error ? err.message : '参加者の削除に失敗しました');
    },
    onSettled: (data, error, { meetingId }) => {
      // 成功・失敗に関わらず該当する会議を無効化
      invalidateHelpers.invalidateMeeting(queryClient, meetingId);
    },
    onSuccess: () => {
      toast.success('参加者が更新されました');
    },
  });
};