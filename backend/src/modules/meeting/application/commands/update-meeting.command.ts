import { Meeting, UpdateMeetingData } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';

export class UpdateMeetingCommand {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(id: string, data: UpdateMeetingData): Promise<Meeting | null> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      return null;
    }
    
    meeting.modifyDetails(data);
    return this.meetingRepository.save(meeting);
  }
}