import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthToken } from './auth-token.value-object';

const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type AuthUserProps = z.infer<typeof AuthUserSchema>;

export class AuthUser {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  private static readonly JWT_EXPIRES_IN = '24h';

  private constructor(private props: AuthUserProps) {}

  static async signup(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<{ authUser: AuthUser; authToken: AuthToken }> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const now = new Date();
    
    const props = AuthUserSchema.parse({
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    });

    const authUser = new AuthUser(props);
    const authToken = authUser.generateToken();
    
    return { authUser, authToken };
  }

  static fromPersistence(props: AuthUserProps): AuthUser {
    return new AuthUser(AuthUserSchema.parse(props));
  }

  async signin(password: string): Promise<AuthToken> {
    const isValid = await bcrypt.compare(password, this.props.password);
    if (!isValid) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }
    return this.generateToken();
  }

  generateToken(): AuthToken {
    const token = jwt.sign(
      { id: this.props.id, email: this.props.email },
      AuthUser.JWT_SECRET,
      { expiresIn: AuthUser.JWT_EXPIRES_IN }
    );
    
    // JWT_EXPIRES_INをパースして有効期限を計算
    const expiresAt = new Date();
    const match = AuthUser.JWT_EXPIRES_IN.match(/(\d+)([dhms])/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 'd': expiresAt.setDate(expiresAt.getDate() + value); break;
        case 'h': expiresAt.setHours(expiresAt.getHours() + value); break;
        case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + value); break;
        case 's': expiresAt.setSeconds(expiresAt.getSeconds() + value); break;
      }
    }
    
    return AuthToken.create(token, expiresAt);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get password(): string {
    return this.props.password;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.props.id,
      email: this.props.email,
      name: this.props.name,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }
}