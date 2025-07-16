import { describe, test, expect, beforeEach } from 'vitest';
import { MeetingController } from './meeting.controller.js';
import { prisma } from '../../../shared/database/prisma.js';

// Mock Hono Context
const createMockContext = (params: Record<string, string> = {}, jsonBody = {}) => ({
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
    // Given - テストデータを作成（特定の値は不要）
    await prisma.meeting.create({
      data: {
        title: 'テスト会議1',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
        isImportant: false,
        ownerId: 'user123'
      }
    });
    await prisma.meeting.create({
      data: {
        title: 'テスト会議2',
        startTime: new Date('2025-01-16T14:00:00Z'),
        endTime: new Date('2025-01-16T15:30:00Z'),
        isImportant: true,
        ownerId: 'user456'
      }
    });

    // When
    const mockContext = createMockContext();
    const response = await meetingController.getAllMeetings(mockContext as any);

    // Then
    expect((response as any).data.success).toBe(true);
    expect((response as any).data.data).toHaveLength(2);
    expect((response as any).status).toBe(200);
  });

  test('createMeeting - 必要項目をすべて入力して会議を作成する', async () => {
    // Given - 会議作成リクエストデータを準備
    const meetingData = {
      title: '定例MTG',
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:30:00Z',
      isImportant: false,
      ownerId: 'taro@example.com'
    };

    // When
    const mockContext = createMockContext({}, meetingData);
    const response = await meetingController.createMeeting(mockContext as any);

    // Then
    expect((response as any).data.success).toBe(true);
    expect((response as any).data.data.title).toBe('定例MTG');
    expect((response as any).data.data.isImportant).toBe(false);
    expect((response as any).data.data.ownerId).toBe('taro@example.com');
    expect((response as any).data.message).toBe('Meeting created successfully');
    expect((response as any).status).toBe(201);
  });
});