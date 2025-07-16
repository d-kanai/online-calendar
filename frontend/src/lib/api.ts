import { ApiMeeting, ApiResponse } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface CreateMeetingRequest {
  title: string;
  startTime: string;
  endTime: string;
  isImportant?: boolean;
  ownerId: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  startTime?: string;
  endTime?: string;
  isImportant?: boolean;
}

export const meetingApi = {
  async create(data: CreateMeetingRequest): Promise<ApiResponse<ApiMeeting>> {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // HTTPステータスが400の場合もレスポンスボディを解析
    const result = await response.json();
    
    // HTTPステータスが失敗でもレスポンスボディにエラー情報があればそれを返す
    return result;
  },
  
  async getAll(): Promise<ApiResponse<ApiMeeting[]>> {
    const response = await fetch(`${API_BASE_URL}/meetings`);
    return response.json();
  },
  
  async update(id: string, data: UpdateMeetingRequest): Promise<ApiResponse<ApiMeeting>> {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return result;
  },

  async addParticipant(meetingId: string, data: { email: string; name: string; requesterId: string }): Promise<ApiResponse<ApiMeeting>> {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return result;
  },

  async removeParticipant(meetingId: string, data: { participantId: string; requesterId: string }): Promise<ApiResponse<ApiMeeting>> {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/participants/${data.participantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requesterId: data.requesterId }),
    });
    
    const result = await response.json();
    return result;
  }
};