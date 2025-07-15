import { Meeting } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';

export class GetMeetingByIdQuery {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(id: string): Promise<Meeting | null> {
    return this.meetingRepository.findById(id);
  }
}