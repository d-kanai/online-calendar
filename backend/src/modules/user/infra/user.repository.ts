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


  async save(user: User): Promise<User> {
    const { email, name, updatedAt } = user;
    const record = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        name,
        updatedAt
      }
    });
    return User.fromPersistence(record);
  }
}