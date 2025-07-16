import { MeetingRepository } from '../../infra/meeting.repository.js';
import { UserRepository } from '../../../user/infra/user.repository.js';
import { MeetingWithOwnerHelper, MeetingWithOwner } from './meeting-with-owner.helper.js';

export class GetMeetingsByOwnerQuery {
  private meetingRepository: MeetingRepository;
  private userRepository: UserRepository;
  private helper: MeetingWithOwnerHelper;

  constructor() {
    this.meetingRepository = new MeetingRepository();
    this.userRepository = new UserRepository();
    this.helper = new MeetingWithOwnerHelper();
  }

  async run(ownerEmail: string): Promise<MeetingWithOwner[]> {
    // Find user by email
    const user = await this.userRepository.findByEmail(ownerEmail);
    if (!user) {
      return [];
    }
    
    const meetings = await this.meetingRepository.findByOwner(user.id);
    return this.helper.getMeetingsWithOwners(meetings);
  }
}