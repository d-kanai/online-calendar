import { Meeting } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';

export class GetMeetingsByOwnerQuery {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(ownerId: string): Promise<Meeting[]> {
    return this.meetingRepository.findByOwner(ownerId);
  }
}