import { z, ZodError } from 'zod';

export const CreateUserDataSchema = z.object({
  email: z.string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください')
    .trim(),
  name: z.string()
    .min(1, '名前は必須です')
    .trim()
});

export type CreateUserData = z.infer<typeof CreateUserDataSchema>;

export interface UpdateUserData {
  name?: string;
}

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: string,
    private _name: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(data: CreateUserData): User {
    try {
      const validatedData = CreateUserDataSchema.parse(data);
      
      const now = new Date();
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return new User(
        id,
        validatedData.email,
        validatedData.name,
        now,
        now
      );
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues;
        if (issues && issues.length > 0) {
          throw new Error(issues[0].message);
        }
        throw new Error('Validation failed');
      }
      throw error;
    }
  }

  static fromPersistence(data: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.createdAt,
      data.updatedAt
    );
  }

  updateProfile(data: UpdateUserData): void {
    if (data.name !== undefined) {
      this._name = data.name;
    }
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}