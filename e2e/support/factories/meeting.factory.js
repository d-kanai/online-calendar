const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class MeetingFactory {
  static counter = 0;

  static async create(options) {
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

  static async createTomorrow(ownerId, options = {}) {
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

  static async createYesterday(ownerId, options = {}) {
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
}

module.exports = { MeetingFactory };