import { Meeting } from '@prisma/client';

export type MeetingModel = Meeting;

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