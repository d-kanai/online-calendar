import { describe, test, expect, beforeEach } from 'vitest';
import { AddParticipantCommand } from './add-participant.command.js';
import { MeetingRepository } from '../../infra/meeting.repository.js';
import { prisma } from '../../../../shared/database/prisma.js';
import { UserFactory, MeetingFactory } from '../../../../test/factories/index.js';
import { NotFoundException } from '../../../../shared/exceptions/http-exceptions.js';

describe('AddParticipantCommand', () => {
  let command: AddParticipantCommand;
  let repository: MeetingRepository;

  beforeEach(async () => {
    repository = new MeetingRepository();
    command = new AddParticipantCommand(repository);
    // setup.tsでクリーンアップされるので、ここでは不要
  });

  test('存在するユーザーを参加者として追加できる', async () => {
    // Given
    const owner = await UserFactory.create();
    const participant = await UserFactory.create({
      email: 'participant@example.com',
      name: 'Participant User'
    });
    const meeting = await MeetingFactory.create({ ownerId: owner.id });

    // When
    const result = await command.run({
      meetingId: meeting.id,
      email: participant.email,
      name: participant.name,
      requesterId: owner.id
    });

    // Then
    expect(result).toBeDefined();
    const participants = await prisma.meetingParticipant.findMany({
      where: { meetingId: meeting.id }
    });
    expect(participants).toHaveLength(1);
    expect(participants[0].userId).toBe(participant.id);
  });

  test('存在しないユーザーを参加者として追加しようとするとエラーになる', async () => {
    // Given
    const owner = await UserFactory.create();
    const meeting = await MeetingFactory.create({ ownerId: owner.id });

    // When & Then
    await expect(command.run({
      meetingId: meeting.id,
      email: 'nonexistent@example.com',
      name: 'Non Existent User',
      requesterId: owner.id
    })).rejects.toThrow(NotFoundException);
    
    await expect(command.run({
      meetingId: meeting.id,
      email: 'nonexistent@example.com',
      name: 'Non Existent User',
      requesterId: owner.id
    })).rejects.toThrow('指定されたメールアドレスのユーザーが見つかりません');
  });

  test('オーナー以外が参加者を追加しようとするとエラーになる', async () => {
    // Given
    const owner = await UserFactory.create();
    const otherUser = await UserFactory.create();
    const participant = await UserFactory.create();
    const meeting = await MeetingFactory.create({ ownerId: owner.id });

    // When & Then
    await expect(command.run({
      meetingId: meeting.id,
      email: participant.email,
      name: participant.name,
      requesterId: otherUser.id // オーナーではない
    })).rejects.toThrow('参加者の追加はオーナーのみ可能です');
    
    await expect(command.run({
      meetingId: meeting.id,
      email: participant.email,
      name: participant.name,
      requesterId: otherUser.id
    })).rejects.toThrow('参加者の追加はオーナーのみ可能です');
  });

  test('存在しない会議に参加者を追加しようとするとエラーになる', async () => {
    // Given
    const user = await UserFactory.create();
    const participant = await UserFactory.create();

    // When & Then
    await expect(command.run({
      meetingId: 'non-existent-meeting-id',
      email: participant.email,
      name: participant.name,
      requesterId: user.id
    })).rejects.toThrow(NotFoundException);
    
    await expect(command.run({
      meetingId: 'non-existent-meeting-id',
      email: participant.email,
      name: participant.name,
      requesterId: user.id
    })).rejects.toThrow('Meeting not found');
  });

  test('既に参加しているユーザーを追加しようとするとエラーになる', async () => {
    // Given
    const owner = await UserFactory.create();
    const participant = await UserFactory.create();
    const meeting = await MeetingFactory.create({ ownerId: owner.id });
    
    // 既に参加者として追加
    await prisma.meetingParticipant.create({
      data: {
        meetingId: meeting.id,
        userId: participant.id
      }
    });

    // When & Then
    await expect(command.run({
      meetingId: meeting.id,
      email: participant.email,
      name: participant.name,
      requesterId: owner.id
    })).rejects.toThrow('この参加者は既に追加されています');
  });

  test('参加者数が上限（50名）に達している場合はエラーになる', async () => {
    // Given
    const owner = await UserFactory.create();
    const meeting = await MeetingFactory.create({ ownerId: owner.id });
    
    // 50名の参加者を追加
    for (let i = 0; i < 50; i++) {
      const user = await UserFactory.create({
        email: `user${i}@example.com`,
        name: `User ${i}`
      });
      await prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId: user.id
        }
      });
    }
    
    const newParticipant = await UserFactory.create();

    // When & Then
    await expect(command.run({
      meetingId: meeting.id,
      email: newParticipant.email,
      name: newParticipant.name,
      requesterId: owner.id
    })).rejects.toThrow('参加者は50名までです');
  });
});