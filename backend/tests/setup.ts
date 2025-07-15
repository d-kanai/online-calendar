import { beforeEach, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { resetSequence } from '@quramy/prisma-fabbrica';

// テスト用のPrismaクライアント
const prisma = new PrismaClient();

// テスト開始前にデータベース接続確認
beforeAll(async () => {
  // データベース接続の確認（meetingテーブルの件数を取得）
  await prisma.meeting.count();
});

// 各テスト前にテーブルをクリア
beforeEach(async () => {
  // テーブルの全データを削除
  await prisma.meeting.deleteMany();
  // ファクトリシーケンスをリセット
  resetSequence();
});

// テスト終了時にクリーンアップ
afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };