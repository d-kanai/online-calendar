import { MeetingRepository } from '../../infra/meeting.repository.js';
import { Meeting } from '../../domain/meeting.model.js';
import { NotFoundException } from '../../../../shared/exceptions/http-exceptions.js';

export class RemoveParticipantCommand {
  constructor(private readonly repository: MeetingRepository) {}

  async run(meetingId: string, participantId: string, requesterId: string): Promise<Meeting> {
    const meeting = await this.repository.findById(meetingId);
    
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    
    // participantIdからuserIdを取得
    const participant = meeting.participants.find(p => p.id === participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found in this meeting');
    }
    
    // 参加者削除（ドメインロジックで権限チェック）
    meeting.removeParticipant(participant.userId, requesterId);
    
    // 永続化
    return await this.repository.save(meeting);
  }
}