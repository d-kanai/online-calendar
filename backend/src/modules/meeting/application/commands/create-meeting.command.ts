import { Meeting, CreateMeetingData } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';
import { UserRepository } from '../../../user/infra/user.repository.js';
import { User } from '../../../user/domain/user.model.js';

export class CreateMeetingCommand {
  private meetingRepository: MeetingRepository;
  private userRepository: UserRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
    this.userRepository = new UserRepository();
  }

  async run(data: CreateMeetingData): Promise<Meeting> {
    // Find or create owner user
    let ownerUser = await this.userRepository.findByEmail(data.ownerId);
    if (!ownerUser) {
      ownerUser = User.create({
        email: data.ownerId,
        name: data.ownerId.split('@')[0]
      });
      ownerUser = await this.userRepository.create(ownerUser);
    }
    
    // Create meeting with user ID
    const meetingData = {
      ...data,
      ownerId: ownerUser.id
    };
    
    const meeting = Meeting.create(meetingData);
    return this.meetingRepository.create(meeting);
  }
}