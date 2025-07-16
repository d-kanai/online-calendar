import { MeetingRepository } from '../../infra/meeting.repository.js';
import { MeetingWithOwnerHelper, MeetingWithOwner } from './meeting-with-owner.helper.js';

export class GetAllMeetingsQuery {
  private meetingRepository: MeetingRepository;
  private helper: MeetingWithOwnerHelper;

  constructor() {
    this.meetingRepository = new MeetingRepository();
    this.helper = new MeetingWithOwnerHelper();
  }

  async run(): Promise<MeetingWithOwner[]> {
    const meetings = await this.meetingRepository.findAll();
    return this.helper.getMeetingsWithOwners(meetings);
  }
}