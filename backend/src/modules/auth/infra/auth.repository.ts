import { PrismaClient } from '@prisma/client';
import { AuthUser } from '../domain/auth-user.model';

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    return AuthUser.fromPersistence(user);
  }

  async save(authUser: AuthUser): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        password: authUser.password,
        createdAt: authUser.createdAt,
        updatedAt: authUser.updatedAt
      }
    });
  }
}