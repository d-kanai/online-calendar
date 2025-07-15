import { prisma } from '../../../shared/database/prisma.js';
import { CreateMeetingData, UpdateMeetingData, MeetingModel } from '../models/meeting.model.js';

export class MeetingService {
  async getAllMeetings(): Promise<MeetingModel[]> {
    return prisma.meeting.findMany({
      orderBy: { startTime: 'asc' }
    });
  }

  async getMeetingById(id: string): Promise<MeetingModel | null> {
    return prisma.meeting.findUnique({
      where: { id }
    });
  }

  async createMeeting(data: CreateMeetingData): Promise<MeetingModel> {
    return prisma.meeting.create({
      data
    });
  }

  async updateMeeting(id: string, data: UpdateMeetingData): Promise<MeetingModel | null> {
    try {
      return await prisma.meeting.update({
        where: { id },
        data
      });
    } catch (error) {
      return null;
    }
  }

  async deleteMeeting(id: string): Promise<boolean> {
    try {
      await prisma.meeting.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getMeetingsByOwner(ownerId: string): Promise<MeetingModel[]> {
    return prisma.meeting.findMany({
      where: { ownerId },
      orderBy: { startTime: 'asc' }
    });
  }
}