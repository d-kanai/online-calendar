const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class UserFactory {
  static counter = 0;

  static async create(options = {}) {
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
        ? await bcrypt.hash(options.password, 10)  // 生パスワードをハッシュ化
        : options.password;  // 既にハッシュ化済みパスワード
    }

    // useHashedPasswordはPrismaに送信しない
    const { useHashedPassword, ...prismaOptions } = options;
    
    const userData = {
      ...defaultData,
      ...prismaOptions,
      password
    };

    return prisma.user.create({ data: userData });
  }

  static async createWithName(name, password = 'password123') {
    return this.create({
      name,
      email: `${name.toLowerCase()}@example.com`,
      password: await bcrypt.hash(password, 10)
    });
  }

  static async createForAuth(name) {
    // 認証テスト用のユーザーを作成（固定パスワード）
    // E2Eテストで一意性を保証するため、タイムスタンプを追加
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    
    return this.create({
      name,
      email: `${name.toLowerCase()}-${timestamp}-${randomString}@example.com`,
      password: 'password123',
      useHashedPassword: false  // createメソッドでハッシュ化を行う
    });
  }
}

module.exports = { UserFactory };