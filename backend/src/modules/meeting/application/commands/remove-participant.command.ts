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
    
    // 参加者削除（ドメインロジックで権限チェックと存在確認）
    meeting.removeParticipant(participantId, requesterId);
    
    // 永続化
    return await this.repository.save(meeting);
  }
}