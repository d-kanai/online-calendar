import { UserRepository } from '../../../user/infra/user.repository.js';
import { Meeting } from '../../domain/meeting.model.js';

export interface MeetingWithOwner {
  meeting: Meeting;
  ownerEmail: string;
}

export class MeetingWithOwnerHelper {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getMeetingWithOwner(meeting: Meeting): Promise<MeetingWithOwner> {
    const owner = await this.userRepository.findById(meeting.ownerId);
    return {
      meeting,
      ownerEmail: owner ? owner.email : 'unknown'
    };
  }

  async getMeetingsWithOwners(meetings: Meeting[]): Promise<MeetingWithOwner[]> {
    return Promise.all(meetings.map(meeting => this.getMeetingWithOwner(meeting)));
  }
}