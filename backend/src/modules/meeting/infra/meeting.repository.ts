import { prisma } from '../../../shared/database/prisma.js';
import { Meeting } from '../domain/meeting.model.js';

export class MeetingRepository {
  async findAll(): Promise<Meeting[]> {
    const records = await prisma.meeting.findMany({
      orderBy: { startTime: 'asc' }
    });
    return records.map(record => Meeting.fromPersistence(record));
  }

  async findById(id: string): Promise<Meeting | null> {
    const record = await prisma.meeting.findUnique({
      where: { id }
    });
    return record ? Meeting.fromPersistence(record) : null;
  }

  async create(meeting: Meeting): Promise<Meeting> {
    const data = this.toPersistence(meeting);
    const record = await prisma.meeting.create({
      data
    });
    return Meeting.fromPersistence(record);
  }

  async save(meeting: Meeting): Promise<Meeting> {
    const data = this.toPersistence(meeting);
    const record = await prisma.meeting.update({
      where: { id: meeting.id },
      data
    });
    return Meeting.fromPersistence(record);
  }

  private toPersistence(meeting: Meeting): {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    isImportant: boolean;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: meeting.id,
      title: meeting.title,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      isImportant: meeting.isImportant,
      ownerId: meeting.ownerId,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt
    };
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
    const records = await prisma.meeting.findMany({
      where: { ownerId },
      orderBy: { startTime: 'asc' }
    });
    return records.map(record => Meeting.fromPersistence(record));
  }
}