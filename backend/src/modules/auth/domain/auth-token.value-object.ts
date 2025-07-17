import { z } from 'zod';

const AuthTokenSchema = z.object({
  value: z.string().min(1),
  expiresAt: z.date()
});

export class AuthToken {
  private constructor(
    private readonly _value: string,
    private readonly _expiresAt: Date
  ) {}

  static create(value: string, expiresAt: Date): AuthToken {
    const parsed = AuthTokenSchema.parse({ value, expiresAt });
    return new AuthToken(parsed.value, parsed.expiresAt);
  }

  get value(): string {
    return this._value;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  toJSON() {
    return {
      token: this._value,
      expiresAt: this._expiresAt.toISOString()
    };
  }
}