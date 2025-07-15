export interface CreateMeetingData {
  title: string;
  startTime: Date;
  endTime: Date;
  isImportant?: boolean;
  ownerId: string;
}

export interface UpdateMeetingData {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  isImportant?: boolean;
}

export class Meeting {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _startTime: Date,
    private _endTime: Date,
    private _isImportant: boolean,
    private readonly _ownerId: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(data: CreateMeetingData): Meeting {
    const now = new Date();
    const id = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Meeting(
      id,
      data.title,
      data.startTime,
      data.endTime,
      data.isImportant ?? false,
      data.ownerId,
      now,
      now
    );
  }

  static fromPersistence(data: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    isImportant: boolean;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Meeting {
    return new Meeting(
      data.id,
      data.title,
      data.startTime,
      data.endTime,
      data.isImportant,
      data.ownerId,
      data.createdAt,
      data.updatedAt
    );
  }

  update(data: UpdateMeetingData): void {
    if (data.title !== undefined) {
      this._title = data.title;
    }
    if (data.startTime !== undefined || data.endTime !== undefined) {
      this._startTime = data.startTime ?? this._startTime;
      this._endTime = data.endTime ?? this._endTime;
    }
    if (data.isImportant !== undefined) {
      this._isImportant = data.isImportant;
    }
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get startTime(): Date {
    return this._startTime;
  }

  get endTime(): Date {
    return this._endTime;
  }

  get isImportant(): boolean {
    return this._isImportant;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

}