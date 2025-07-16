import { MeetingRepository } from '../../infra/meeting.repository.js';
import { NotFoundException } from '../../../../shared/exceptions/http-exceptions.js';
import { MeetingWithOwnerHelper, MeetingWithOwner } from './meeting-with-owner.helper.js';

export class GetMeetingByIdQuery {
  private meetingRepository: MeetingRepository;
  private helper: MeetingWithOwnerHelper;

  constructor() {
    this.meetingRepository = new MeetingRepository();
    this.helper = new MeetingWithOwnerHelper();
  }

  async run(id: string): Promise<MeetingWithOwner> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    return this.helper.getMeetingWithOwner(meeting);
  }
}