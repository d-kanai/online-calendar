
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