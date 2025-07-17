// Import and re-export shared factories with TypeScript types
import { User, Meeting, MeetingParticipant } from '@prisma/client';

// Import the JavaScript factories
const { UserFactory: SharedUserFactory, MeetingFactory: SharedMeetingFactory, MeetingParticipantFactory: SharedMeetingParticipantFactory } = require('../../../../shared/test/factories');

// Type definitions for the factories
export interface UserFactoryOptions {
  email?: string;
  name?: string;
  password?: string;
  useHashedPassword?: boolean;
}

export interface MeetingFactoryOptions {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  isImportant?: boolean;
  ownerId: string;
}

export interface MeetingParticipantFactoryOptions {
  meetingId: string;
  userId: string;
}

// Typed factory exports
export const UserFactory = {
  create: (options?: UserFactoryOptions): Promise<User> => SharedUserFactory.create(options),
  createWithName: (name: string, password?: string): Promise<User> => SharedUserFactory.createWithName(name, password),
  createForAuth: (name: string): Promise<User> => SharedUserFactory.createForAuth(name)
};

export const MeetingFactory = {
  create: (options: MeetingFactoryOptions): Promise<Meeting> => SharedMeetingFactory.create(options),
  createTomorrow: (ownerId: string, options?: Partial<MeetingFactoryOptions>): Promise<Meeting> => SharedMeetingFactory.createTomorrow(ownerId, options),
  createYesterday: (ownerId: string, options?: Partial<MeetingFactoryOptions>): Promise<Meeting> => SharedMeetingFactory.createYesterday(ownerId, options),
  createWithDuration: (ownerId: string, minutes: number, options?: Partial<MeetingFactoryOptions>): Promise<Meeting> => SharedMeetingFactory.createWithDuration(ownerId, minutes, options),
  createImportant: (ownerId: string, options?: Partial<MeetingFactoryOptions>): Promise<Meeting> => SharedMeetingFactory.createImportant(ownerId, options)
};

export const MeetingParticipantFactory = {
  create: (options: MeetingParticipantFactoryOptions): Promise<MeetingParticipant> => SharedMeetingParticipantFactory.create(options),
  addParticipantToMeeting: (meetingId: string, userId: string, options?: Partial<MeetingParticipantFactoryOptions>): Promise<MeetingParticipant> => SharedMeetingParticipantFactory.addParticipantToMeeting(meetingId, userId, options)
};