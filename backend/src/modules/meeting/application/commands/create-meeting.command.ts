import { Meeting, CreateMeetingData } from '../../domain/meeting.model.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';

export class CreateMeetingCommand {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(data: CreateMeetingData): Promise<Meeting> {
    // ownerIdは既にユーザーIDとして渡される
    const meeting = Meeting.create(data);
    return this.meetingRepository.create(meeting);
  }
}