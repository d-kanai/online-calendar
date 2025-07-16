import { MeetingRepository } from '../../infra/meeting.repository.js';
import { PrismaClient } from '@prisma/client';
import { NotFoundException, BadRequestException } from '../../../../shared/exceptions/http-exceptions.js';

export class RemoveParticipantCommand {
  private meetingRepository: MeetingRepository;
  private prisma: PrismaClient;

  constructor() {
    this.meetingRepository = new MeetingRepository();
    this.prisma = new PrismaClient();
  }

  async run(meetingId: string, participantId: string, requesterId: string): Promise<void> {
    // 会議が存在するか確認
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // リクエスト者が会議のオーナーか確認（emailで比較）
    const ownerUser = await this.prisma.user.findUnique({
      where: { id: meeting.ownerId }
    });
    
    if (!ownerUser || ownerUser.email !== requesterId) {
      throw new BadRequestException('Only the meeting owner can remove participants');
    }

    // 参加者が存在するか確認
    const participant = await this.prisma.meetingParticipant.findFirst({
      where: { 
        id: participantId,
        meetingId: meetingId
      }
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in this meeting');
    }

    // 参加者を削除
    await this.prisma.meetingParticipant.delete({
      where: { 
        id: participantId
      }
    });
  }
}