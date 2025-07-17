import { Meeting, UpdateMeetingData } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';
import { NotFoundException, ForbiddenException } from '../../../../shared/exceptions/http-exceptions.js';

export class UpdateMeetingCommand {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(id: string, data: UpdateMeetingData, loginUserId: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    
    // 権限チェック: オーナーのみが会議を編集可能
    if (meeting.ownerId !== loginUserId) {
      throw new ForbiddenException('オーナーのみが会議を編集できます');
    }
    
    meeting.modifyDetails(data);
    return this.meetingRepository.save(meeting);
  }
}