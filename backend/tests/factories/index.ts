import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const meetingFactory = {
  create: async (data: any) => {
    return await prisma.meeting.create({
      data: {
        title: 'デフォルト会議',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
        isImportant: false,
        ownerId: 'user123',
        ...data
      }
    });
  }
};