import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';

interface UserFactoryOptions {
  email?: string;
  name?: string;
  password?: string;
  useHashedPassword?: boolean;
}

export class UserFactory {
  static counter = 0;

  static async create(options: UserFactoryOptions = {}): Promise<User> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    this.counter++;

    // デフォルトのパスワードをハッシュ化
    const defaultPassword = await bcrypt.hash('password123', 10);

    const defaultData = {
      email: `user-${timestamp}-${randomString}@example.com`,
      name: `User${this.counter}`,
      password: defaultPassword,
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

  static async createWithName(name: string, password = 'password123'): Promise<User> {
    return this.create({
      name,
      email: `${name.toLowerCase()}@example.com`,
      password: await bcrypt.hash(password, 10)
    });
  }

  static async createForAuth(name: string): Promise<User> {
    // 認証テスト用のユーザーを作成（固定パスワード）
    return this.create({
      name,
      email: `${name.toLowerCase()}@example.com`,
      password: 'password123'  // createメソッドがハッシュ化を行う
    });
  }
}