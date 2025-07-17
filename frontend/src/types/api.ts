// API Response Types
export interface ApiParticipant {
  id: string;
  email: string;
  name: string;
}

export interface ApiMeeting {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isImportant: boolean;
  owner: string;
  participants: ApiParticipant[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}