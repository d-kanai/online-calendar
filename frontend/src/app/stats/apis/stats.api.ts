import { apiClient } from '../../../lib/api-client';

interface DailyMeetingData {
  date: string;
  dayName: string;
  totalMinutes: number;
}

export interface DailyAverageResponse {
  averageDailyMinutes: number;
  weeklyData: DailyMeetingData[];
}

export const statsApi = {
  async getDailyAverage(): Promise<{ success: boolean; data?: DailyAverageResponse; error?: string }> {
    return apiClient.get<DailyAverageResponse>('/stats/daily-average');
  }
};