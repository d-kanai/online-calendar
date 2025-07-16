import { prisma } from '../../../shared/database/prisma.js';
import { Meeting } from '../domain/meeting.model.js';
import { MeetingParticipant } from '../domain/meeting-participant.model.js';

export class MeetingRepository {
  async findAll(): Promise<Meeting[]> {
    const records = await prisma.meeting.findMany({
      orderBy: { startTime: 'asc' },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    return records.map(record => Meeting.fromPersistence(this.mapToDomain(record)));
  }

  async findById(id: string): Promise<Meeting | null> {
    const record = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    return record ? Meeting.fromPersistence(this.mapToDomain(record)) : null;
  }

  async create(meeting: Meeting): Promise<Meeting> {
    const data = this.toPersistence(meeting);
    const record = await prisma.meeting.create({
      data,
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    return Meeting.fromPersistence(this.mapToDomain(record));
  }

  async save(meeting: Meeting): Promise<Meeting> {
    const data = this.toPersistence(meeting);
    
    // Update meeting basic info
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        isImportant: data.isImportant,
        updatedAt: data.updatedAt
      }
    });

    // Update participants
    // Delete existing participants
    await prisma.meetingParticipant.deleteMany({
      where: { meetingId: meeting.id }
    });

    // Add new participants
    for (const participant of meeting.participants) {
      await prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId: participant.userId,
          joinedAt: participant.joinedAt
        }
      });
    }

    // Fetch updated record
    const record = await prisma.meeting.findUnique({
      where: { id: meeting.id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    
    return record ? Meeting.fromPersistence(this.mapToDomain(record)) : meeting;
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
      orderBy: { startTime: 'asc' },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    return records.map(record => Meeting.fromPersistence(this.mapToDomain(record)));
  }

  private mapToDomain(record: any): any {
    return {
      id: record.id,
      title: record.title,
      startTime: record.startTime,
      endTime: record.endTime,
      isImportant: record.isImportant,
      ownerId: record.ownerId,
      participants: record.participants?.map((p: any) => 
        MeetingParticipant.fromPersistence({
          id: p.id,
          userId: p.userId,
          userName: p.user.name,
          userEmail: p.user.email,
          joinedAt: p.joinedAt
        })
      ) || [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}