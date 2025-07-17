import { describe, test, expect, beforeEach } from 'vitest';
import { MeetingController } from './meeting.controller.js';
import { prisma } from '../../../shared/database/prisma.js';
import { UserFactory, MeetingFactory } from '../../../test/factories/index.js';

// Mock Hono Context
const createMockContext = (params: Record<string, string> = {}, jsonBody = {}, loginUserId = 'test-user-id') => ({
  req: {
    param: (key: string) => params[key] || '',
    json: async () => jsonBody
  },
  json: (data: any, status?: number) => {
    return {
      data,
      status: status || 200
    };
  },
  get: (key: string) => {
    if (key === 'loginUserId') return loginUserId;
    if (key === 'loginUserEmail') return 'test@example.com';
    return null;
  }
});

describe('MeetingController', () => {
  let meetingController: MeetingController;

  beforeEach(async () => {
    meetingController = new MeetingController();
    // setup.tsでクリーンアップされるので、ここでは不要
  });

  test('getAllMeetings - 全ての会議を取得してJSONレスポンスを返す', async () => {
    // Given - ユーザーを作成
    const user1 = await UserFactory.create();
    const user2 = await UserFactory.create();
    
    
    // テストデータを作成（特定の値は不要）
    await MeetingFactory.create({ ownerId: user1.id });
    await MeetingFactory.createImportant(user2.id);

    // When
    const mockContext = createMockContext();
    const response = await meetingController.getAllMeetings(mockContext as any);

    // Then
    expect((response as any).data.success).toBe(true);
    expect((response as any).data.data).toHaveLength(2);
    expect((response as any).status).toBe(200);
  });

  test('createMeeting - 必要項目をすべて入力して会議を作成する', async () => {
    // Given - オーナーユーザーを作成
    const owner = await UserFactory.createWithName('taro');
    
    // 会議作成リクエストデータを準備
    const meetingData = {
      title: '定例MTG',
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:30:00Z',
      isImportant: false,
    };

    // When
    const mockContext = createMockContext({}, meetingData, owner.id);
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
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow('終了時刻は必須です');
  });


  test('createMeeting - 複数項目が未入力の場合BadRequestExceptionを発生させる', async () => {
    // Given - 複数項目が空のリクエストデータ
    const meetingData = {
      title: '',
      startTime: '',
      endTime: '',
      isImportant: false
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
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({}, meetingData);
    await expect(meetingController.createMeeting(mockContext as any))
      .rejects
      .toThrow('会議は15分以上である必要があります');
  });

  test('updateMeeting - 会議のタイトルと時刻を正常に更新できる', async () => {
    // Given - ユーザーを作成
    const owner = await UserFactory.createWithName('taro');
    
    // 既存の会議を作成
    const existingMeeting = await MeetingFactory.create({
      title: '既存会議',
      ownerId: owner.id
    });

    const updateData = {
      title: '更新された会議',
      startTime: '2025-01-15T14:00:00Z',
      endTime: '2025-01-15T15:30:00Z',
      isImportant: true
    };

    // When
    const mockContext = createMockContext({ id: existingMeeting.id }, updateData, owner.id);
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
    const mockContext = createMockContext({ id: 'non-existent-id' }, updateData, 'any-user-id');
    await expect(meetingController.updateMeeting(mockContext as any))
      .rejects
      .toThrow('Meeting not found');
  });

  test('updateMeeting - 期間が15分未満の場合BadRequestExceptionを発生させる', async () => {
    // Given - ユーザーを作成
    const owner = await UserFactory.createWithName('taro');
    
    // 既存の会議を作成
    const existingMeeting = await MeetingFactory.create({
      title: '既存会議',
      ownerId: owner.id
    });

    const updateData = {
      title: '更新された会議',
      startTime: '2025-01-15T14:00:00Z',
      endTime: '2025-01-15T14:10:00Z'  // 10分間（15分未満）
    };

    // When & Then - BadRequestExceptionが発生することを確認
    const mockContext = createMockContext({ id: existingMeeting.id }, updateData, owner.id);
    await expect(meetingController.updateMeeting(mockContext as any))
      .rejects
      .toThrow('会議は15分以上である必要があります');
  });

  test('updateMeeting - オーナー以外は会議を更新できない', async () => {
    // Given - オーナーユーザーを作成
    const owner = await UserFactory.createWithName('owner');
    
    // 他のユーザーを作成
    const otherUser = await UserFactory.createWithName('participant');
    
    // オーナーが作成した既存の会議
    const existingMeeting = await MeetingFactory.create({
      title: '他のユーザーの会議',
      ownerId: owner.id
    });

    const updateData = {
      title: '参加者が変更した会議',
      startTime: '2025-01-15T14:00:00Z',
      endTime: '2025-01-15T15:30:00Z',
      isImportant: false
    };

    // When & Then - オーナー以外がアクセスしてForbiddenExceptionが発生することを確認
    const mockContext = createMockContext({ id: existingMeeting.id }, updateData, otherUser.id);
    await expect(meetingController.updateMeeting(mockContext as any))
      .rejects
      .toThrow('オーナーのみが会議を編集できます');
  });

  test('addParticipant - オーナーが参加者を追加できる', async () => {
    // Given - オーナーユーザーを作成
    const owner = await UserFactory.createWithName('taro');
    
    // 参加者ユーザーを事前に作成
    const participant = await UserFactory.create({
      email: 'hanako@example.com',
      name: 'hanako'
    });
    
    // 会議が存在する
    const existingMeeting = await MeetingFactory.create({
      title: 'チームミーティング',
      ownerId: owner.id
    });

    const participantData = {
      email: participant.email,
      name: participant.name,
    };

    // When
    const mockContext = createMockContext({ id: existingMeeting.id }, participantData, owner.id);
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
    expect(participants[0].userId).toBe(participant.id);
  });

  test('addParticipant - オーナー以外は参加者を追加できない', async () => {
    // Given - オーナーユーザーを作成
    const owner = await UserFactory.createWithName('other');
    
    // 他のユーザーが作成した会議
    const existingMeeting = await MeetingFactory.create({
      title: 'チームミーティング',
      ownerId: owner.id
    });

    const participantData = {
      email: 'hanako@example.com',
      name: 'hanako',
      requesterId: 'taro@example.com' // オーナーではない
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id }, participantData, 'different-user-id');
    await expect(meetingController.addParticipant(mockContext as any))
      .rejects
      .toThrow('参加者の追加はオーナーのみ可能です');
  });

  test('addParticipant - 最大参加者数（50名）を超えて追加できない', async () => {
    // Given - オーナーユーザーを作成
    const owner = await UserFactory.createWithName('taro');
    
    // 会議を作成
    const existingMeeting = await MeetingFactory.create({
      title: 'チームミーティング',
      ownerId: owner.id
    });
    
    // 既に50名の参加者を追加
    for (let i = 0; i < 50; i++) {
      const user = await UserFactory.create({
        email: `user${i}@example.com`,
        name: `user${i}`
      });
      await prisma.meetingParticipant.create({
        data: {
          meetingId: existingMeeting.id,
          userId: user.id
        }
      });
    }

    // 新しい参加者を事前に作成
    const newParticipant = await UserFactory.create({
      email: 'hanako@example.com',
      name: 'hanako'
    });

    const participantData = {
      email: newParticipant.email,
      name: newParticipant.name,
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id }, participantData, owner.id);
    await expect(meetingController.addParticipant(mockContext as any))
      .rejects
      .toThrow('参加者は50名までです');
  });

  test('addParticipant - 既に参加している人を重複して追加できない', async () => {
    // Given - オーナーユーザーを作成
    const owner = await UserFactory.createWithName('taro');
    
    // 参加者ユーザーを作成
    const participant = await UserFactory.createWithName('hanako');
    
    // 会議を作成
    const existingMeeting = await MeetingFactory.create({
      title: 'チームミーティング',
      ownerId: owner.id
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
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id }, participantData, owner.id);
    await expect(meetingController.addParticipant(mockContext as any))
      .rejects
      .toThrow('この参加者は既に追加されています');
  });

  test('removeParticipant - オーナーが参加者を削除できる', async () => {
    // Given - オーナーユーザーを作成
    const owner = await UserFactory.createWithName('taro');
    
    // 参加者ユーザーを作成
    const participant = await UserFactory.createWithName('hanako');
    
    // 会議を作成
    const existingMeeting = await MeetingFactory.create({
      title: 'チームミーティング',
      ownerId: owner.id
    });
    
    // 参加者を追加
    const meetingParticipant = await prisma.meetingParticipant.create({
      data: {
        meetingId: existingMeeting.id,
        userId: participant.id
      }
    });

    const removeData = {
    };

    // When
    const mockContext = createMockContext({ id: existingMeeting.id, participantId: meetingParticipant.id }, removeData, owner.id);
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
    const owner = await UserFactory.createWithName('taro');
    
    // 参加者ユーザーを作成
    const participant = await UserFactory.createWithName('hanako');
    
    // 会議を作成
    const existingMeeting = await MeetingFactory.create({
      title: 'チームミーティング',
      ownerId: owner.id
    });
    
    // 参加者を追加
    const meetingParticipant = await prisma.meetingParticipant.create({
      data: {
        meetingId: existingMeeting.id,
        userId: participant.id
      }
    });

    const removeData = {};

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id, participantId: meetingParticipant.id }, removeData, 'different-user-id');
    await expect(meetingController.removeParticipant(mockContext as any))
      .rejects
      .toThrow('Only the meeting owner can remove participants');
  });

  test('removeParticipant - 存在しない参加者の削除でNotFoundExceptionが発生する', async () => {
    // Given - オーナーユーザーを作成
    const owner = await UserFactory.createWithName('taro');
    
    // 会議を作成
    const existingMeeting = await MeetingFactory.create({
      title: 'チームミーティング',
      ownerId: owner.id
    });

    const removeData = {
    };

    // When & Then
    const mockContext = createMockContext({ id: existingMeeting.id, participantId: 'non-existent-id' }, removeData, owner.id);
    await expect(meetingController.removeParticipant(mockContext as any))
      .rejects
      .toThrow('Participant not found in this meeting');
  });
});