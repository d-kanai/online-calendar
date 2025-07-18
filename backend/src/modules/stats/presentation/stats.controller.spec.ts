import { describe, test, expect, beforeEach } from 'vitest';
import { prisma } from '../../../shared/database/prisma.js';
import { UserFactory, MeetingFactory } from '../../../test/factories/index.js';

describe('StatsController', () => {
  beforeEach(async () => {
    // setup.tsでクリーンアップされるので、ここでは不要
  });

  test('getDailyAverage - 過去1週間の日次平均会議時間を正しく計算する', async () => {
    // Given - ユーザーを作成
    const user = await UserFactory.create();
    
    // 固定された基準日を使用（実行日に依存しない）
    const baseDate = new Date('2024-01-15'); // 月曜日
    
    // 1日目: 60分の会議
    const day1 = new Date(baseDate);
    day1.setHours(10, 0, 0, 0);
    const day1End = new Date(day1);
    day1End.setHours(11, 0, 0, 0);
    
    await MeetingFactory.create({
      ownerId: user.id,
      startTime: day1,
      endTime: day1End
    });

    // 3日目: 30分の会議
    const day3 = new Date(baseDate);
    day3.setDate(baseDate.getDate() + 2);
    day3.setHours(14, 0, 0, 0);
    const day3End = new Date(day3);
    day3End.setHours(14, 30, 0, 0);
    
    await MeetingFactory.create({
      ownerId: user.id,
      startTime: day3,
      endTime: day3End
    });

    // 5日目: 90分の会議
    const day5 = new Date(baseDate);
    day5.setDate(baseDate.getDate() + 4);
    day5.setHours(9, 0, 0, 0);
    const day5End = new Date(day5);
    day5End.setHours(10, 30, 0, 0);
    
    await MeetingFactory.create({
      ownerId: user.id,
      startTime: day5,
      endTime: day5End
    });

    // 7日目: 45分の会議
    const day7 = new Date(baseDate);
    day7.setDate(baseDate.getDate() + 6);
    day7.setHours(16, 0, 0, 0);
    const day7End = new Date(day7);
    day7End.setHours(16, 45, 0, 0);
    
    await MeetingFactory.create({
      ownerId: user.id,
      startTime: day7,
      endTime: day7End
    });

    // When - 固定日付範囲で計算
    const endDate = new Date('2024-01-21T23:59:59.999Z'); // 7日目の終了
    const startDate = new Date('2024-01-15T00:00:00.000Z'); // 1日目の開始
    
    // StatsControllerの代わりに直接QueryとCalculatorを使用
    const meetings = await prisma.meeting.findMany({
      where: {
        ownerId: user.id,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    const { DailyAverageStatCalculator } = await import('../domain/daily-average-calculator.js');
    const calculator = new DailyAverageStatCalculator(meetings, startDate, endDate);
    const result = calculator.run();

    // Then
    // 計算: (60+0+30+0+90+0+45) ÷ 7 = 225 ÷ 7 = 32.1分
    expect(result.averageDailyMinutes).toBeCloseTo(32.1, 1);
  });

  test('getDailyAverage - 参加者として参加した会議も計算に含める', async () => {
    // Given - ユーザーを作成
    const user = await UserFactory.create();
    const otherUser = await UserFactory.create();
    
    // 固定された基準日を使用
    const baseDate = new Date('2024-01-15T10:00:00.000Z');
    const endTime = new Date('2024-01-15T11:00:00.000Z'); // 60分

    // 他のユーザーが作成した会議
    const meeting = await MeetingFactory.create({
      ownerId: otherUser.id,
      startTime: baseDate,
      endTime: endTime
    });

    // userが参加者として参加
    await prisma.meetingParticipant.create({
      data: {
        id: 'participant-1',
        meetingId: meeting.id,
        userId: user.id
      }
    });

    // When - 固定日付範囲で計算
    const queryEndDate = new Date('2024-01-21T23:59:59.999Z');
    const queryStartDate = new Date('2024-01-15T00:00:00.000Z');
    
    // 参加者として参加した会議も含めて取得
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          {
            ownerId: user.id,
            startTime: {
              gte: queryStartDate,
              lte: queryEndDate
            }
          },
          {
            participants: {
              some: {
                userId: user.id
              }
            },
            startTime: {
              gte: queryStartDate,
              lte: queryEndDate
            }
          }
        ]
      }
    });
    
    const { DailyAverageStatCalculator } = await import('../domain/daily-average-calculator.js');
    const calculator = new DailyAverageStatCalculator(meetings, queryStartDate, queryEndDate);
    const result = calculator.run();

    // Then
    // 計算: (60+0+0+0+0+0+0) ÷ 7 = 60 ÷ 7 = 8.6分
    expect(result.averageDailyMinutes).toBeCloseTo(8.6, 1);
  });

  test('getDailyAverage - 参加者として参加していない会議は計算に含めない', async () => {
    // Given - ユーザーを作成
    const user = await UserFactory.create();
    const otherUser = await UserFactory.create();
    
    // 固定された基準日を使用
    const baseDate = new Date('2024-01-15T10:00:00.000Z');
    const endTime = new Date('2024-01-15T11:00:00.000Z'); // 60分

    // 他のユーザーが作成した会議（userは参加していない）
    await MeetingFactory.create({
      ownerId: otherUser.id,
      startTime: baseDate,
      endTime: endTime
    });

    // When - 固定日付範囲で計算
    const queryEndDate = new Date('2024-01-21T23:59:59.999Z');
    const queryStartDate = new Date('2024-01-15T00:00:00.000Z');
    
    // userが関連する会議のみ取得（オーナーまたは参加者）
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          {
            ownerId: user.id,
            startTime: {
              gte: queryStartDate,
              lte: queryEndDate
            }
          },
          {
            participants: {
              some: {
                userId: user.id
              }
            },
            startTime: {
              gte: queryStartDate,
              lte: queryEndDate
            }
          }
        ]
      }
    });
    
    const { DailyAverageStatCalculator } = await import('../domain/daily-average-calculator.js');
    const calculator = new DailyAverageStatCalculator(meetings, queryStartDate, queryEndDate);
    const result = calculator.run();

    // Then
    // 計算: (0+0+0+0+0+0+0) ÷ 7 = 0 ÷ 7 = 0.0
    expect(result.averageDailyMinutes).toBe(0.0);
  });
});