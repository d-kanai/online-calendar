import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
  }): Promise<AuthUser> {
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

    return new AuthUser(props);
  }

  static fromPersistence(props: AuthUserProps): AuthUser {
    return new AuthUser(AuthUserSchema.parse(props));
  }

  async signin(password: string): Promise<string> {
    const isValid = await bcrypt.compare(password, this.props.password);
    if (!isValid) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }
    return this.generateToken();
  }

  generateToken(): string {
    return jwt.sign(
      { id: this.props.id, email: this.props.email },
      AuthUser.JWT_SECRET,
      { expiresIn: AuthUser.JWT_EXPIRES_IN }
    );
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