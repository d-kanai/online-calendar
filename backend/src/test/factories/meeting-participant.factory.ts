import { PrismaClient, MeetingParticipant } from '@prisma/client';

const prisma = new PrismaClient();

export interface MeetingParticipantFactoryOptions {
  meetingId: string;
  userId: string;
  joinedAt?: Date;
}

export class MeetingParticipantFactory {
  static async create(options: MeetingParticipantFactoryOptions): Promise<MeetingParticipant> {
    const defaultData = {
      joinedAt: new Date()
    };

    const participantData = {
      ...defaultData,
      ...options
    };

    return prisma.meetingParticipant.create({ data: participantData });
  }

  static async createMany(
    meetingId: string, 
    userIds: string[]
  ): Promise<MeetingParticipant[]> {
    const participants: MeetingParticipant[] = [];
    
    for (const userId of userIds) {
      participants.push(
        await this.create({ meetingId, userId })
      );
    }
    
    return participants;
  }
}