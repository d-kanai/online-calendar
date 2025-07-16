import { prisma } from '../../../shared/database/prisma.js';
import { User } from '../domain/user.model.js';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { id }
    });
    return record ? User.fromPersistence(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { email }
    });
    return record ? User.fromPersistence(record) : null;
  }

  async create(user: User): Promise<User> {
    const data = this.toPersistence(user);
    const record = await prisma.user.create({
      data
    });
    return User.fromPersistence(record);
  }

  async save(user: User): Promise<User> {
    const data = this.toPersistence(user);
    const record = await prisma.user.update({
      where: { id: user.id },
      data
    });
    return User.fromPersistence(record);
  }

  private toPersistence(user: User): {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}