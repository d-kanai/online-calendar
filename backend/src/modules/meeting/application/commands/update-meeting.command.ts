import { Meeting, UpdateMeetingData } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';
import { NotFoundException } from '../../../../shared/exceptions/http-exceptions.js';

export class UpdateMeetingCommand {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(id: string, data: UpdateMeetingData): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    
    meeting.modifyDetails(data);
    return this.meetingRepository.save(meeting);
  }
}