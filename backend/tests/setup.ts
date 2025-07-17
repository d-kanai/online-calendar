import { beforeEach, beforeAll, afterAll } from 'vitest';
import { resetSequence } from '@quramy/prisma-fabbrica';
import { prisma } from '../src/shared/database/prisma.js';

// テスト開始前にデータベース接続確認
beforeAll(async () => {
  // データベース接続の確認（meetingテーブルの件数を取得）
  await prisma.meeting.count();
});

// 各テスト前にテーブルをクリア
beforeEach(async () => {
  // テーブルの全データを削除（外部キー制約順序に注意）
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();
  // ファクトリシーケンスをリセット
  resetSequence();
});

// テスト終了時にクリーンアップ
afterAll(async () => {
  await prisma.$disconnect();
});

