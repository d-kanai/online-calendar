import { authApi } from '../../auth/apis/auth.api';
import { API_BASE_URL } from '../../../lib/config';

interface DailyMeetingData {
  date: string;
  dayName: string;
  totalMinutes: number;
}

export interface DailyAverageResponse {
  averageDailyMinutes: number;
  weeklyData: DailyMeetingData[];
}

interface StatsApiResponse {
  success: boolean;
  data?: DailyAverageResponse;
  error?: string;
}

export const statsApi = {
  async getDailyAverage(): Promise<StatsApiResponse> {
    const token = authApi.getToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/stats/daily-average`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch daily average');
    }

    return result;
  }
};