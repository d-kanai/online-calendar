export interface CreateMeetingRequest {
  title: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  isImportant?: boolean;
}

export interface UpdateMeetingRequest {
  title?: string;
  startTime?: string;
  endTime?: string;
  isImportant?: boolean;
}