import { MeetingRepository } from '../../infra/meeting.repository.js';

export class DeleteMeetingCommand {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(id: string): Promise<boolean> {
    return this.meetingRepository.delete(id);
  }
}