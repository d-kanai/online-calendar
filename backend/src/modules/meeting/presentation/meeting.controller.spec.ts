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
    await prisma.meetingParticipant.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.user.deleteMany();
  });

  test('getAllMeetings - 全ての会議を取得してJSONレスポンスを返す', async () => {
    // Given - ユーザーを作成
    const user1 = await prisma.user.create({
      data: {
        email: 'user123@example.com',
        name: 'user123'
      }
    });
    const user2 = await prisma.user.create({
      data: {
        email: 'user456@example.com',
        name: 'user456'
      }
    });
    
    // テストデータを作成（特定の値は不要）
    await prisma.meeting.create({
      data: {
        title: 'テスト会議1',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
        isImportant: false,
        ownerId: user1.id
      }
    });
    await prisma.meeting.create({
      data: {
        title: 'テスト会議2',
        startTime: new Date('2025-01-16T14:00:00Z'),
        endTime: new Date('2025-01-16T15:30:00Z'),
        isImportant: true,
        ownerId: user2.id
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
    expect((response as any).data.data.owner).toBe('taro@example.com');
    expect((response as any).data.message).toBe('Meeting created successfully');
    expect((response as any).status).toBe(201);
  });

  test('createMeeting - titleが空の場合BadRequestExceptionを発生させる', async () => {
    // Given - titleが空のリクエストデータ
    const meetingData = {
      title: '',
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:30:00Z',
      isImportant: false,
      ownerId: 'taro@example.com'
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow('会議タイトルは必須です');
  });

  test('createMeeting - startTimeが空の場合BadRequestExceptionを発生させる', async () => {
    // Given - startTimeが空のリクエストデータ
    const meetingData = {
      title: '定例MTG',
      startTime: '',
      endTime: '2025-01-15T10:30:00Z',
      isImportant: false,
      ownerId: 'taro@example.com'
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow('開始時刻は必須です');
  });

  test('createMeeting - endTimeが空の場合BadRequestExceptionを発生させる', async () => {
    // Given - endTimeが空のリクエストデータ
    const meetingData = {
      title: '定例MTG',
      startTime: '2025-01-15T10:00:00Z',
      endTime: '',
      isImportant: false,
      ownerId: 'taro@example.com'
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow('終了時刻は必須です');
  });

  test('createMeeting - ownerIdが空の場合BadRequestExceptionを発生させる', async () => {
    // Given - ownerIdが空のリクエストデータ
    const meetingData = {
      title: '定例MTG',
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:30:00Z',
      isImportant: false,
      ownerId: ''
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow('メールアドレスは必須です');
  });

  test('createMeeting - 複数項目が未入力の場合BadRequestExceptionを発生させる', async () => {
    // Given - 複数項目が空のリクエストデータ
    const meetingData = {
      title: '',
      startTime: '',
      endTime: '',
      isImportant: false,
      ownerId: ''
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow();
  });

  test('createMeeting - 開始時刻が終了時刻より後の場合BadRequestExceptionを発生させる', async () => {
    // Given - 開始時刻 > 終了時刻のリクエストデータ
    const meetingData = {
      title: '定例MTG',
      startTime: '2025-01-15T11:00:00Z',
      endTime: '2025-01-15T10:00:00Z',
      isImportant: false,
      ownerId: 'taro@example.com'
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow('開始時刻は終了時刻より前である必要があります');
  });

  test('createMeeting - 期間が15分未満の場合BadRequestExceptionを発生させる', async () => {
    // Given - 期間が10分（15分未満）のリクエストデータ
    const meetingData = {
      title: '定例MTG',
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:10:00Z',  // 10分間
      isImportant: false,
      ownerId: 'taro@example.com'
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow('会議は15分以上である必要があります');
  });

  test('updateMeeting - 会議のタイトルと時刻を正常に更新できる', async () => {
    // Given - ユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: 'taro'
      }
    });
    
    // 既存の会議を作成
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: '既存会議',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });

    const updateData = {
      title: '更新された会議',
      startTime: '2025-01-15T14:00:00Z',
      endTime: '2025-01-15T15:30:00Z',
      isImportant: true
    };

    // When
    const mockContext = createMockContext({ id: existingMeeting.id }, updateData);
    const response = await meetingController.updateMeeting(mockContext as any);

    // Then
    expect((response as any).data.success).toBe(true);
    expect((response as any).data.data.title).toBe('更新された会議');
    expect((response as any).data.data.isImportant).toBe(true);
    expect((response as any).data.message).toBe('Meeting updated successfully');
    expect((response as any).status).toBe(200);
  });

  test('updateMeeting - 存在しないIDの場合NotFoundExceptionを発生させる', async () => {
    // Given - 存在しないMeeting ID
    const updateData = {
      title: '更新された会議',
      startTime: '2025-01-15T14:00:00Z',
      endTime: '2025-01-15T15:30:00Z'
    };

    // When & Then - NotFoundExceptionが発生することを確認
    const mockContext = createMockContext({ id: 'non-existent-id' }, updateData);
    await expect(meetingController.updateMeeting(mockContext as any))
      .rejects
      .toThrow('Meeting not found');
  });

  test('updateMeeting - 期間が15分未満の場合BadRequestExceptionを発生させる', async () => {
    // Given - ユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: 'taro'
      }
    });
    
    // 既存の会議を作成
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: '既存会議',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });

    const updateData = {
      title: '更新された会議',
      startTime: '2025-01-15T14:00:00Z',
      endTime: '2025-01-15T14:10:00Z'  // 10分間（15分未満）
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({ id: existingMeeting.id }, updateData);
    await expect(meetingController.updateMeeting(mockContext as any))
      .rejects
      .toThrow('会議は15分以上である必要があります');
  });

  test('addParticipant - オーナーが参加者を追加できる', async () => {
    // Given - オーナーユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: 'taro'
      }
    });
    
    // 会議が存在する
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: 'チームミーティング',
        startTime: new Date('2025-01-15T14:00:00Z'),
        endTime: new Date('2025-01-15T15:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });

    const participantData = {
      email: 'hanako@example.com',
      name: 'hanako',
      requesterId: 'taro@example.com' // オーナー自身のリクエスト
    };

    // When
    const mockContext = createMockContext({ id: existingMeeting.id }, participantData);
    const response = await meetingController.addParticipant(mockContext as any);

    // Then
    expect((response as any).data.success).toBe(true);
    expect((response as any).data.message).toBe('参加者が追加されました');
    expect((response as any).status).toBe(200);
    
    // データベースで確認
    const participants = await prisma.meetingParticipant.findMany({
      where: { meetingId: existingMeeting.id }
    });
    expect(participants).toHaveLength(1);
    
    const participantUser = await prisma.user.findUnique({
      where: { email: 'hanako@example.com' }
    });
    expect(participantUser).not.toBeNull();
  });

  test('addParticipant - オーナー以外は参加者を追加できない', async () => {
    // Given - オーナーユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'other@example.com',
        name: 'other'
      }
    });
    
    // 他のユーザーが作成した会議
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: 'チームミーティング',
        startTime: new Date('2025-01-15T14:00:00Z'),
        endTime: new Date('2025-01-15T15:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });

    const participantData = {
      email: 'hanako@example.com',
      name: 'hanako',
      requesterId: 'taro@example.com' // オーナーではない
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id }, participantData);
    await expect(meetingController.addParticipant(mockContext as any))
      .rejects
      .toThrow('参加者の追加はオーナーのみ可能です');
  });

  test('addParticipant - 最大参加者数（50名）を超えて追加できない', async () => {
    // Given - オーナーユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: 'taro'
      }
    });
    
    // 会議を作成
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: 'チームミーティング',
        startTime: new Date('2025-01-15T14:00:00Z'),
        endTime: new Date('2025-01-15T15:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });
    
    // 既に50名の参加者を追加
    for (let i = 0; i < 50; i++) {
      const user = await prisma.user.create({
        data: {
          email: `user${i}@example.com`,
          name: `user${i}`
        }
      });
      await prisma.meetingParticipant.create({
        data: {
          meetingId: existingMeeting.id,
          userId: user.id
        }
      });
    }

    const participantData = {
      email: 'hanako@example.com',
      name: 'hanako',
      requesterId: 'taro@example.com'
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id }, participantData);
    await expect(meetingController.addParticipant(mockContext as any))
      .rejects
      .toThrow('参加者は50名までです');
  });

  test('addParticipant - 既に参加している人を重複して追加できない', async () => {
    // Given - オーナーユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: 'taro'
      }
    });
    
    // 参加者ユーザーを作成
    const participant = await prisma.user.create({
      data: {
        email: 'hanako@example.com',
        name: 'hanako'
      }
    });
    
    // 会議を作成
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: 'チームミーティング',
        startTime: new Date('2025-01-15T14:00:00Z'),
        endTime: new Date('2025-01-15T15:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });
    
    // 既に参加者を追加
    await prisma.meetingParticipant.create({
      data: {
        meetingId: existingMeeting.id,
        userId: participant.id
      }
    });

    const participantData = {
      email: 'hanako@example.com',
      name: 'hanako',
      requesterId: 'taro@example.com'
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id }, participantData);
    await expect(meetingController.addParticipant(mockContext as any))
      .rejects
      .toThrow('この参加者は既に追加されています');
  });

  test('removeParticipant - オーナーが参加者を削除できる', async () => {
    // Given - オーナーユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: 'taro'
      }
    });
    
    // 参加者ユーザーを作成
    const participant = await prisma.user.create({
      data: {
        email: 'hanako@example.com',
        name: 'hanako'
      }
    });
    
    // 会議を作成
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: 'チームミーティング',
        startTime: new Date('2025-01-15T14:00:00Z'),
        endTime: new Date('2025-01-15T15:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });
    
    // 参加者を追加
    const meetingParticipant = await prisma.meetingParticipant.create({
      data: {
        meetingId: existingMeeting.id,
        userId: participant.id
      }
    });

    const removeData = {
      requesterId: 'taro@example.com'
    };

    // When
    const mockContext = createMockContext({ id: existingMeeting.id, participantId: meetingParticipant.id }, removeData);
    const response = await meetingController.removeParticipant(mockContext as any);

    // Then
    expect((response as any).data.success).toBe(true);
    expect((response as any).data.message).toBe('参加者が削除されました');
    expect((response as any).status).toBe(200);
    
    // データベースで確認
    const participants = await prisma.meetingParticipant.findMany({
      where: { meetingId: existingMeeting.id }
    });
    expect(participants).toHaveLength(0);
  });

  test('removeParticipant - オーナー以外は参加者を削除できない', async () => {
    // Given - オーナーユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: 'taro'
      }
    });
    
    // 参加者ユーザーを作成
    const participant = await prisma.user.create({
      data: {
        email: 'hanako@example.com',
        name: 'hanako'
      }
    });
    
    // 会議を作成
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: 'チームミーティング',
        startTime: new Date('2025-01-15T14:00:00Z'),
        endTime: new Date('2025-01-15T15:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });
    
    // 参加者を追加
    const meetingParticipant = await prisma.meetingParticipant.create({
      data: {
        meetingId: existingMeeting.id,
        userId: participant.id
      }
    });

    const removeData = {
      requesterId: 'other@example.com' // オーナーではない
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id, participantId: meetingParticipant.id }, removeData);
    await expect(meetingController.removeParticipant(mockContext as any))
      .rejects
      .toThrow('Only the meeting owner can remove participants');
  });

  test('removeParticipant - 存在しない参加者の削除でNotFoundExceptionが発生する', async () => {
    // Given - オーナーユーザーを作成
    const owner = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: 'taro'
      }
    });
    
    // 会議を作成
    const existingMeeting = await prisma.meeting.create({
      data: {
        title: 'チームミーティング',
        startTime: new Date('2025-01-15T14:00:00Z'),
        endTime: new Date('2025-01-15T15:00:00Z'),
        isImportant: false,
        ownerId: owner.id
      }
    });

    const removeData = {
      requesterId: 'taro@example.com'
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id, participantId: 'non-existent-id' }, removeData);
    await expect(meetingController.removeParticipant(mockContext as any))
      .rejects
      .toThrow('Participant not found in this meeting');
  });
});