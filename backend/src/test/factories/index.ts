// Export local factories
export { UserFactory } from './user.factory.js';
export { MeetingFactory } from './meeting.factory.js';

// Import the shared MeetingParticipantFactory
import { MeetingParticipant } from '@prisma/client';
const { MeetingParticipantFactory: SharedMeetingParticipantFactory } = require('../../../../shared/test/factories');

export interface MeetingParticipantFactoryOptions {
  meetingId: string;
  userId: string;
}

export const MeetingParticipantFactory = {
  create: (options: MeetingParticipantFactoryOptions): Promise<MeetingParticipant> => SharedMeetingParticipantFactory.create(options),
  addParticipantToMeeting: (meetingId: string, userId: string, options?: Partial<MeetingParticipantFactoryOptions>): Promise<MeetingParticipant> => SharedMeetingParticipantFactory.addParticipantToMeeting(meetingId, userId, options)
};