import { useState, useEffect } from 'react';
import { Meeting } from '../types/meeting';
import { ApiMeeting, ApiParticipant } from '../types/api';
import { meetingApi } from '../lib/api';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 会議データを取得
  const loadMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await meetingApi.getAll();
      if (response.success && response.data) {
        const mappedMeetings: Meeting[] = response.data.map((meeting: ApiMeeting) => ({
          id: meeting.id,
          title: meeting.title,
          startTime: new Date(meeting.startTime),
          endTime: new Date(meeting.endTime),
          owner: meeting.owner,
          participants: meeting.participants ? meeting.participants.map((p: ApiParticipant) => ({
            id: p.id,
            email: p.email,
            name: p.name
          })) : [],
          isImportant: meeting.isImportant,
          status: 'scheduled' as const,
          createdAt: new Date(meeting.createdAt),
          updatedAt: new Date(meeting.updatedAt)
        }));
        setMeetings(mappedMeetings);
      }
    } catch (err) {
      console.error('Failed to load meetings:', err);
      setError('会議の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 会議リストを更新
  const updateMeetings = (updater: (prev: Meeting[]) => Meeting[]) => {
    setMeetings(updater);
  };

  // 初期ロード
  useEffect(() => {
    loadMeetings();
  }, []);

  return {
    meetings,
    isLoading,
    error,
    loadMeetings,
    updateMeetings
  };
};