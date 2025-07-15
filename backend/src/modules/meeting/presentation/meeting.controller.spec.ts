import { describe, test, expect, beforeEach } from 'vitest';
import { MeetingController } from './meeting.controller.js';
import { prisma } from '../../../shared/database/prisma.js';
import { meetingFactory } from '../../../../tests/factories/index.js';

// Mock Hono Context
const createMockContext = (params = {}, jsonBody = {}) => ({
  req: {
    param: (key: string) => params[key] || '',
    json: async () => jsonBody
  },
  json: (data: any, status?: number) => {
    return {
      data,
      status: status || 200
    };
  }
});

describe('MeetingController', () => {
  let meetingController: MeetingController;

  beforeEach(async () => {
    meetingController = new MeetingController();
    await prisma.meeting.deleteMany();
  });

  test('getAllMeetings - 全ての会議を取得してJSONレスポンスを返す', async () => {
    // Given - デフォルト値でテストデータを作成（特定の値は不要）
    await meetingFactory.create({});
    await meetingFactory.create({});

    // When
    const mockContext = createMockContext();
    const response = await meetingController.getAllMeetings(mockContext as any);

    // Then
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveLength(2);
    expect(response.status).toBe(200);
  });
});