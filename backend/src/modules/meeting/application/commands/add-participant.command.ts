import { MeetingRepository } from '../../infra/meeting.repository.js';
import { UserRepository } from '../../../user/infra/user.repository.js';
import { Meeting } from '../../domain/meeting.model.js';
import { User } from '../../../user/domain/user.model.js';
import { NotFoundException } from '../../../../shared/exceptions/http-exceptions.js';
import { ForbiddenException } from '../../../../shared/exceptions/http-exceptions.js';

interface AddParticipantData {
  meetingId: string;
  email: string;
  name: string;
  requesterId: string;
}

export class AddParticipantCommand {
  private userRepository: UserRepository;
  
  constructor(private readonly repository: MeetingRepository) {
    this.userRepository = new UserRepository();
  }

  async run(data: AddParticipantData): Promise<Meeting> {
    const meeting = await this.repository.findById(data.meetingId);
    
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    
    // Get requester user
    let requesterUser = await this.userRepository.findByEmail(data.requesterId);
    if (!requesterUser) {
      // Create user if not exists
      requesterUser = User.create({
        email: data.requesterId,
        name: data.requesterId.split('@')[0]
      });
      requesterUser = await this.userRepository.create(requesterUser);
    }
    
    // オーナーチェック
    if (meeting.ownerId !== requesterUser.id) {
      throw new ForbiddenException('参加者の追加はオーナーのみ可能です');
    }
    
    // Find or create participant user
    let participantUser = await this.userRepository.findByEmail(data.email);
    if (!participantUser) {
      participantUser = User.create({
        email: data.email,
        name: data.name
      });
      participantUser = await this.userRepository.create(participantUser);
    }
    
    // 参加者追加（ドメインロジックで重複・上限チェック）
    meeting.addParticipant(participantUser);
    
    // 永続化
    return await this.repository.save(meeting);
  }
}