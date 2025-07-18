import { ApiMeeting, ApiResponse } from '../../../types/api';
import { apiClient } from '../../../lib/api-client';

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
    return apiClient.post<ApiMeeting>('/meetings', data);
  },
  
  async getAll(): Promise<ApiResponse<ApiMeeting[]>> {
    return apiClient.get<ApiMeeting[]>('/meetings');
  },
  
  async getById(id: string): Promise<ApiResponse<ApiMeeting>> {
    return apiClient.get<ApiMeeting>(`/meetings/${id}`);
  },
  
  async update(id: string, data: UpdateMeetingRequest): Promise<ApiResponse<ApiMeeting>> {
    return apiClient.put<ApiMeeting>(`/meetings/${id}`, data);
  },

  async addParticipant(meetingId: string, data: { email: string; name: string }): Promise<ApiResponse<ApiMeeting>> {
    return apiClient.post<ApiMeeting>(`/meetings/${meetingId}/participants`, data);
  },

  async removeParticipant(meetingId: string, participantId: string): Promise<ApiResponse<ApiMeeting>> {
    return apiClient.delete<ApiMeeting>(`/meetings/${meetingId}/participants/${participantId}`);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/meetings/${id}`);
  }
};