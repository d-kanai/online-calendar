import { z, ZodError } from 'zod';

export const CreateMeetingDataSchema = z.object({
  title: z.string()
    .min(1, '会議タイトルは必須です')
    .trim(),
  startTime: z.date({
    message: '開始時刻は必須です'
  }).refine(
    (date) => !isNaN(date.getTime()),
    {
      message: '開始時刻の形式が正しくありません'
    }
  ),
  endTime: z.date({
    message: '終了時刻は必須です'
  }).refine(
    (date) => !isNaN(date.getTime()),
    {
      message: '終了時刻の形式が正しくありません'
    }
  ),
  isImportant: z.boolean().optional().default(false),
  ownerId: z.string()
    .min(1, 'オーナーIDは必須です')
    .trim()
}).refine(
  (data) => data.startTime < data.endTime,
  {
    message: '開始時刻は終了時刻より前である必要があります',
    path: ['startTime']
  }
).refine(
  (data) => {
    const duration = data.endTime.getTime() - data.startTime.getTime();
    return duration >= 15 * 60 * 1000; // 15分以上
  },
  {
    message: '会議は15分以上である必要があります',
    path: ['endTime']
  }
);

export type CreateMeetingData = z.infer<typeof CreateMeetingDataSchema>;

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
    try {
      // Zodによるvalidation実行
      const validatedData = CreateMeetingDataSchema.parse(data);

      const now = new Date();
      const id = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return new Meeting(
        id,
        validatedData.title,
        validatedData.startTime,
        validatedData.endTime,
        validatedData.isImportant,
        validatedData.ownerId,
        now,
        now
      );
    } catch (error) {
      if (error instanceof ZodError) {
        // Zodエラーメッセージをフォーマット
        const issues = error.issues;
        if (issues && issues.length > 0) {
          throw new Error(issues[0].message);
        }
        // フォールバック
        throw new Error('Validation failed');
      }
      throw error;
    }
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

  modifyDetails(data: UpdateMeetingData): void {
    if (data.title !== undefined) {
      this._title = data.title;
    }
    if (data.startTime !== undefined || data.endTime !== undefined) {
      const newStartTime = data.startTime ?? this._startTime;
      const newEndTime = data.endTime ?? this._endTime;
      
      // 時刻更新時のバリデーション
      if (newStartTime >= newEndTime) {
        throw new Error('開始時刻は終了時刻より前である必要があります');
      }
      
      const duration = newEndTime.getTime() - newStartTime.getTime();
      if (duration < 15 * 60 * 1000) { // 15分未満
        throw new Error('会議は15分以上である必要があります');
      }
      
      this._startTime = newStartTime;
      this._endTime = newEndTime;
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