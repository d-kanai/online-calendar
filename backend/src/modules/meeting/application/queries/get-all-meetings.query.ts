import { Meeting } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';

export class GetAllMeetingsQuery {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(): Promise<Meeting[]> {
    return this.meetingRepository.findAll();
  }
}