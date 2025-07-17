export { UserFactory } from './user.factory';
export { MeetingFactory } from './meeting.factory';
export { MeetingParticipantFactory } from './meeting-participant.factory';

// 便利なヘルパー関数
import { UserFactory } from './user.factory';
import { MeetingFactory } from './meeting.factory';
import { MeetingParticipantFactory } from './meeting-participant.factory';

export async function createUserWithMeeting(userData?: { name?: string; email?: string }) {
  const user = await UserFactory.create(userData);
  const meeting = await MeetingFactory.create({
    ownerId: user.id
  });
  
  return { user, meeting };
}

export async function createMeetingWithParticipants(
  ownerId: string, 
  participantCount: number = 1
) {
  const meeting = await MeetingFactory.create({ ownerId });
  const participants = [];
  
  for (let i = 0; i < participantCount; i++) {
    const participant = await UserFactory.create();
    await MeetingParticipantFactory.create({
      meetingId: meeting.id,
      userId: participant.id
    });
    participants.push(participant);
  }
  
  return { meeting, participants };
}