import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface UserFactoryOptions {
  email?: string;
  name?: string;
  password?: string;
  useHashedPassword?: boolean;
}

export class UserFactory {
  private static counter = 0;

  static async create(options: UserFactoryOptions = {}): Promise<User> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    this.counter++;

    const defaultData = {
      email: `user-${timestamp}-${randomString}@example.com`,
      name: `User${this.counter}`,
      password: 'hashedpassword', // デフォルトのテスト用ハッシュ
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // パスワードの処理
    let password = defaultData.password;
    if (options.password) {
      password = options.useHashedPassword === false 
        ? options.password 
        : await bcrypt.hash(options.password, 10);
    }

    const userData = {
      ...defaultData,
      ...options,
      password
    };

    return prisma.user.create({ data: userData });
  }

  static async createMany(count: number, options: UserFactoryOptions = {}): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(options));
    }
    return users;
  }

  // 特定の名前でユーザーを作成
  static async createWithName(name: string): Promise<User> {
    return this.create({
      name,
      email: `${name.toLowerCase()}@example.com`
    });
  }

  // 実際のパスワードハッシュを持つユーザーを作成（認証テスト用）
  static async createWithPassword(password: string = 'password123'): Promise<User> {
    return this.create({
      password: await bcrypt.hash(password, 10)
    });
  }
}