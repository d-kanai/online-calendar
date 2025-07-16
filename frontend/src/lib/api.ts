const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface CreateMeetingRequest {
  title: string;
  startTime: string;
  endTime: string;
  isImportant?: boolean;
  ownerId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const meetingApi = {
  async create(data: CreateMeetingRequest): Promise<ApiResponse> {
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
  
  async getAll(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/meetings`);
    return response.json();
  }
};