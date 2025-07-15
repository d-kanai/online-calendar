import { Meeting, CreateMeetingData } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';

export class CreateMeetingCommand {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(data: CreateMeetingData): Promise<Meeting> {
    return this.meetingRepository.create(data);
  }
}