export interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isImportant: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMeetingData {
  title: string;
  startTime: Date;
  endTime: Date;
  isImportant?: boolean;
  ownerId: string;
}

export interface UpdateMeetingData {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  isImportant?: boolean;
}