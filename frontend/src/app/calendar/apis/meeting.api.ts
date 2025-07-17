import { ApiMeeting, ApiResponse } from '../../../types/api';
import { authService } from '../../auth/apis/auth.service';
import { API_BASE_URL } from '../../../lib/config';

interface CreateMeetingRequest {
  title: string;
  startTime: string;
  endTime: string;
  isImportant?: boolean;
}

interface UpdateMeetingRequest {
  title?: string;
  startTime?: string;
  endTime?: string;
  isImportant?: boolean;
}

export const meetingApi = {
  async create(data: CreateMeetingRequest): Promise<ApiResponse<ApiMeeting>> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    // HTTPステータスが400の場合もレスポンスボディを解析
    const result = await response.json();
    
    // HTTPステータスが失敗でもレスポンスボディにエラー情報があればそれを返す
    return result;
  },
  
  async getAll(): Promise<ApiResponse<ApiMeeting[]>> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  
  async update(id: string, data: UpdateMeetingRequest): Promise<ApiResponse<ApiMeeting>> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return result;
  },

  async addParticipant(meetingId: string, data: { email: string; name: string }): Promise<ApiResponse<ApiMeeting>> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return result;
  },

  async removeParticipant(meetingId: string, participantId: string): Promise<ApiResponse<ApiMeeting>> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/participants/${participantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const result = await response.json();
    return result;
  }
};