import { Meeting, UpdateMeetingData } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';

export class UpdateMeetingCommand {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(id: string, data: UpdateMeetingData): Promise<Meeting | null> {
    return this.meetingRepository.update(id, data);
  }
}