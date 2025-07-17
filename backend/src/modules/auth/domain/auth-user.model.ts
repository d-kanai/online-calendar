import { z } from 'zod';
import bcrypt from 'bcryptjs';

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
  private constructor(private props: AuthUserProps) {}

  static async create(data: {
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

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.props.password);
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