import { Meeting } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';
import { NotFoundException } from '../../../../shared/exceptions/http-exceptions.js';

export class GetMeetingByIdQuery {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(id: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    return meeting;
  }
}