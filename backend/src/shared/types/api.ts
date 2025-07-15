export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CreateMeetingRequest {
  title: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  isImportant?: boolean;
  ownerId: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  startTime?: string;
  endTime?: string;
  isImportant?: boolean;
}