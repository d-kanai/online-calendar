import { prisma } from '../../../../shared/database/prisma.js';
import { DailyAverageData } from '../../domain/daily-average-calculator.js';
import { DailyAverageStatCalculator } from '../../domain/daily-average-calculator.js';

export class GetDailyAverageQuery {
  async run(userId: string): Promise<DailyAverageData> {
    // 日付範囲を計算（過去7日間）
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    
    // 会議データを取得（Prisma直接使用）
    const meetings = await this.findMeetingsByUserAndDateRange(
      userId,
      startDate,
      endDate
    );

    // 計算実行
    const calculator = new DailyAverageStatCalculator(meetings, startDate, endDate);
    return calculator.run();
  }

  private async findMeetingsByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.meeting.findMany({
      where: {
        OR: [
          {
            ownerId: userId,
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            participants: {
              some: {
                userId: userId
              }
            },
            startTime: {
              gte: startDate,
              lte: endDate
            }
          }
        ]
      }
    });
  }
}