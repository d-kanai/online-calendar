import { MeetingRepository } from '../../infra/meeting.repository.js';
import { UserRepository } from '../../../user/infra/user.repository.js';
import { Meeting } from '../../domain/meeting.model.js';
import { NotFoundException } from '../../../../shared/exceptions/http-exceptions.js';
import { ForbiddenException } from '../../../../shared/exceptions/http-exceptions.js';

interface AddParticipantData {
  meetingId: string;
  email: string;
  name: string;
  requesterId: string; // User ID
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
    
    // オーナーチェック (requesterIdはユーザーID)
    if (meeting.ownerId !== data.requesterId) {
      throw new ForbiddenException('参加者の追加はオーナーのみ可能です');
    }
    
    // Find participant user
    const participantUser = await this.userRepository.findByEmail(data.email);
    if (!participantUser) {
      throw new NotFoundException('指定されたメールアドレスのユーザーが見つかりません');
    }
    
    // 参加者追加（ドメインロジックで重複・上限チェック）
    meeting.addParticipant(participantUser);
    
    // 永続化
    return await this.repository.save(meeting);
  }
}