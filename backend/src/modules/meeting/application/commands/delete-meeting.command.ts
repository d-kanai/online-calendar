import { MeetingRepository } from '../../infra/meeting.repository.js';
import { NotFoundException } from '../../../../shared/exceptions/http-exceptions.js';

export class DeleteMeetingCommand {
  private meetingRepository: MeetingRepository;

  constructor() {
    this.meetingRepository = new MeetingRepository();
  }

  async run(id: string): Promise<void> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    
    await this.meetingRepository.delete(id);
  }
}