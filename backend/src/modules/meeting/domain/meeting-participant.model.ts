export class MeetingParticipant {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _userName: string,
    private readonly _userEmail: string,
    private readonly _joinedAt: Date
  ) {}

  static create(userId: string, userName: string, userEmail: string): MeetingParticipant {
    const id = this.generateId();
    const joinedAt = new Date();
    
    return new MeetingParticipant(
      id,
      userId,
      userName,
      userEmail,
      joinedAt
    );
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    joinedAt: Date;
  }): MeetingParticipant {
    return new MeetingParticipant(
      data.id,
      data.userId,
      data.userName,
      data.userEmail,
      data.joinedAt
    );
  }

  private static generateId(): string {
    // 簡易的なID生成（実際はUUID等を使用）
    return `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get userName(): string {
    return this._userName;
  }

  get userEmail(): string {
    return this._userEmail;
  }

  get joinedAt(): Date {
    return this._joinedAt;
  }
}