import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Meeting } from '../../../types/meeting';
import { ApiMeeting, ApiParticipant } from '../../../types/api';
import { meetingApi } from '../apis/meeting.api';
import { toast } from 'sonner';

// Query Keys
const QUERY_KEYS = {
  all: ['meetings'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
};

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
export const useMeetings = () => {
  const queryClient = useQueryClient();
  
  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await meetingApi.getAll();
      if (response.success && response.data) {
        return response.data.map(mapApiToMeeting);
      }
      throw new Error('Failed to fetch meetings');
    },
    staleTime: 30 * 1000, // 30秒
    gcTime: 5 * 60 * 1000, // 5分
  });

  // 既存のインターフェースとの互換性のため
  const loadMeetings = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
  };

  const updateMeetings = (updater: (prev: Meeting[]) => Meeting[]) => {
    queryClient.setQueryData(QUERY_KEYS.lists(), updater);
  };

  return {
    meetings,
    isLoading,
    error: error ? '会議の取得に失敗しました' : null,
    loadMeetings,
    updateMeetings
  };
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
    onSuccess: (newMeeting) => {
      // キャッシュを更新
      queryClient.setQueryData(QUERY_KEYS.lists(), (old: Meeting[] = []) => {
        return [...old, newMeeting];
      });
      toast.success('会議を作成しました');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '会議の作成に失敗しました');
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
    onSuccess: (updatedMeeting) => {
      // キャッシュを更新
      queryClient.setQueryData(QUERY_KEYS.lists(), (old: Meeting[] = []) => {
        return old.map(meeting => 
          meeting.id === updatedMeeting.id ? updatedMeeting : meeting
        );
      });
      toast.success('会議を更新しました');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '会議の更新に失敗しました');
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
    onSuccess: (deletedId) => {
      // キャッシュから削除
      queryClient.setQueryData(QUERY_KEYS.lists(), (old: Meeting[] = []) => {
        return old.filter(meeting => meeting.id !== deletedId);
      });
      toast.success('会議を削除しました');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '会議の削除に失敗しました');
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
        return { meetingId, participant: addedParticipant };
      }
      throw new Error(response.error || '参加者の追加に失敗しました');
    },
    onSuccess: ({ meetingId, participant }) => {
      // キャッシュを更新
      queryClient.setQueryData(QUERY_KEYS.lists(), (old: Meeting[] = []) => {
        return old.map(meeting => {
          if (meeting.id === meetingId) {
            return {
              ...meeting,
              participants: [...meeting.participants, participant]
            };
          }
          return meeting;
        });
      });
      toast.success('参加者を追加しました');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '参加者の追加に失敗しました');
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
    onSuccess: ({ meetingId, participantId }) => {
      // キャッシュから削除
      queryClient.setQueryData(QUERY_KEYS.lists(), (old: Meeting[] = []) => {
        return old.map(meeting => {
          if (meeting.id === meetingId) {
            return {
              ...meeting,
              participants: meeting.participants.filter(p => p.id !== participantId)
            };
          }
          return meeting;
        });
      });
      toast.success('参加者を削除しました');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '参加者の削除に失敗しました');
    },
  });
};