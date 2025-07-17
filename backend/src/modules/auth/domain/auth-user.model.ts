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

const SignUpDataSchema = z.object({
  email: z.string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください')
    .trim(),
  name: z.string()
    .min(1, '名前は必須です')
    .trim(),
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
});

export type AuthUserProps = z.infer<typeof AuthUserSchema>;
export type SignUpData = z.infer<typeof SignUpDataSchema>;

export class AuthUser {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  private static readonly JWT_EXPIRES_IN = '24h';

  private constructor(private props: AuthUserProps) {}

  static async signup(data: SignUpData): Promise<{ authUser: AuthUser; authToken: AuthToken }> {
    try {
      const validatedData = SignUpDataSchema.parse(data);
      
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const now = new Date();
      
      const props = AuthUserSchema.parse({
        id: crypto.randomUUID(),
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now
      });

      const authUser = new AuthUser(props);
      const authToken = authUser.generateToken();
      
      return { authUser, authToken };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues;
        if (issues && issues.length > 0) {
          throw new Error(issues[0].message);
        }
        throw new Error('Validation failed');
      }
      throw error;
    }
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