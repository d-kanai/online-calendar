import { Meeting } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';

interface MeetingFactoryOptions {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  isImportant?: boolean;
  ownerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MeetingFactory {
  static counter = 0;

  static async create(options: MeetingFactoryOptions = {}): Promise<Meeting> {
    if (!options.ownerId) {
      throw new Error('ownerId is required for creating a meeting');
    }
    
    this.counter++;
    
    const now = new Date();
    // デフォルトは明日の日付を使用（開始済み会議のテストを避けるため）
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const defaultStartTime = new Date(tomorrow);
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
    // デフォルトは明日の日付を使用
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setMinutes(endTime.getMinutes() + minutes);

    return this.create({
      ownerId,
      startTime: tomorrow,
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