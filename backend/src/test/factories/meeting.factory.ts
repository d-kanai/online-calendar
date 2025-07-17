import { PrismaClient, Meeting } from '@prisma/client';

const prisma = new PrismaClient();

export interface MeetingFactoryOptions {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  isImportant?: boolean;
  ownerId: string;
}

export class MeetingFactory {
  private static counter = 0;

  static async create(options: MeetingFactoryOptions): Promise<Meeting> {
    this.counter++;
    
    const now = new Date();
    const defaultStartTime = new Date(now);
    defaultStartTime.setHours(14, 0, 0, 0);
    
    const defaultEndTime = new Date(defaultStartTime);
    defaultEndTime.setHours(15, 0, 0, 0);

    const defaultData = {
      title: `Meeting ${this.counter}`,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      isImportant: false,
      createdAt: now,
      updatedAt: now
    };

    const meetingData = {
      ...defaultData,
      ...options
    };

    return prisma.meeting.create({ data: meetingData });
  }

  // 明日の会議を作成
  static async createTomorrow(ownerId: string, options: Partial<MeetingFactoryOptions> = {}): Promise<Meeting> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(15, 0, 0, 0);

    return this.create({
      ownerId,
      startTime: tomorrow,
      endTime,
      ...options
    });
  }

  // 昨日の会議を作成
  static async createYesterday(ownerId: string, options: Partial<MeetingFactoryOptions> = {}): Promise<Meeting> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(14, 0, 0, 0);
    
    const endTime = new Date(yesterday);
    endTime.setHours(15, 0, 0, 0);

    return this.create({
      ownerId,
      startTime: yesterday,
      endTime,
      ...options
    });
  }

  // 特定の期間の会議を作成
  static async createWithDuration(ownerId: string, minutes: number, options: Partial<MeetingFactoryOptions> = {}): Promise<Meeting> {
    const startTime = new Date();
    startTime.setHours(14, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + minutes);

    return this.create({
      ownerId,
      startTime,
      endTime,
      ...options
    });
  }

  // 重要な会議を作成
  static async createImportant(ownerId: string, options: Partial<MeetingFactoryOptions> = {}): Promise<Meeting> {
    return this.create({
      ownerId,
      isImportant: true,
      ...options
    });
  }
}