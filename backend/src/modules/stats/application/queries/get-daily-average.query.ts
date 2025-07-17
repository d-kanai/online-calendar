import { prisma } from '../../../../shared/database/prisma.js';
import { DailyAverageData, DailyMeetingData, DailyAverageCalculator } from '../../domain/daily-average.model.js';

export class GetDailyAverageQuery {
  async execute(userId: string): Promise<DailyAverageData> {
    // 過去1週間の日付を計算 (E2Eテストと同じロジック)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今日の終わりまで含める
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0); // 7日前の開始から
    
    console.log('Backend query range:', {
      from: oneWeekAgo.toISOString(),
      to: today.toISOString()
    });
    
    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(oneWeekAgo.getDate() + i);
      weekDates.push(date);
    }

    // 過去1週間の会議を取得
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          // オーナーとして作成した会議
          {
            ownerId: userId,
            startTime: {
              gte: oneWeekAgo,
              lte: today
            }
          },
          // 参加者として参加した会議
          {
            participants: {
              some: {
                userId: userId
              }
            },
            startTime: {
              gte: oneWeekAgo,
              lte: today
            }
          }
        ]
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        ownerId: true,
        participants: {
          select: {
            userId: true
          }
        }
      }
    });

    // 日別データを計算
    const weeklyData: DailyMeetingData[] = weekDates.map(date => {
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      // その日の対象会議を取得
      const dayMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        if (meetingDate < dayStart || meetingDate >= dayEnd) return false;
        
        // オーナーとして作成した会議
        if (meeting.ownerId === userId) return true;
        
        // 参加者として参加した会議
        const participant = meeting.participants.find(p => p.userId === userId);
        return !!participant;
      });
      
      // その日の会議時間合計（分）
      const totalMinutes = dayMeetings.reduce((total, meeting) => {
        const duration = (new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60);
        return total + duration;
      }, 0);
      
      return {
        date: date.toISOString().split('T')[0],
        dayName: this.getDayName(date),
        totalMinutes: Math.round(totalMinutes)
      };
    });

    const averageDailyMinutes = DailyAverageCalculator.formatAverage(
      DailyAverageCalculator.calculateAverage(weeklyData)
    );

    return {
      averageDailyMinutes,
      weeklyData
    };
  }

  private getDayName(date: Date): string {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[date.getDay()];
  }
}