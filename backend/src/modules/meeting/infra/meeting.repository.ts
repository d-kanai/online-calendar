import { prisma } from '../../../shared/database/prisma.js';
import { Meeting, CreateMeetingData, UpdateMeetingData } from '../domain/meeting.model.js';

export class MeetingRepository {
  async findAll(): Promise<Meeting[]> {
    return prisma.meeting.findMany({
      orderBy: { startTime: 'asc' }
    });
  }

  async findById(id: string): Promise<Meeting | null> {
    return prisma.meeting.findUnique({
      where: { id }
    });
  }

  async create(data: CreateMeetingData): Promise<Meeting> {
    return prisma.meeting.create({
      data
    });
  }

  async update(id: string, data: UpdateMeetingData): Promise<Meeting | null> {
    try {
      return await prisma.meeting.update({
        where: { id },
        data
      });
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.meeting.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByOwner(ownerId: string): Promise<Meeting[]> {
    return prisma.meeting.findMany({
      where: { ownerId },
      orderBy: { startTime: 'asc' }
    });
  }
}