const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class MeetingParticipantFactory {
  static async create(options = {}) {
    const now = new Date();
    
    const defaultData = {
      createdAt: now,
      updatedAt: now
    };

    const participantData = {
      ...defaultData,
      ...options
    };

    return prisma.meetingParticipant.create({ data: participantData });
  }

  // 会議に参加者を追加するヘルパーメソッド
  static async addParticipantToMeeting(meetingId, userId, options = {}) {
    return this.create({
      meetingId,
      userId,
      ...options
    });
  }
}

module.exports = { MeetingParticipantFactory };