// 会議データの型定義（Queryで使用）
interface MeetingData {
  startTime: Date;
  endTime: Date;
}

// 🎯 日別会議データ
export interface DailyMeetingData {
  date: string;
  dayName: string;
  totalMinutes: number;
}

// 🎯 日次平均データ（計算結果）
export interface DailyAverageData {
  averageDailyMinutes: number;
  weeklyData: DailyMeetingData[];
}

// 🧮 日次平均統計計算クラス
export class DailyAverageStatCalculator {
  private readonly startDate: Date;
  private readonly endDate: Date;

  constructor(
    private readonly meetings: MeetingData[],
    startDate?: Date,
    endDate?: Date
  ) {
    // デフォルトは過去7日間
    this.endDate = endDate || new Date();
    this.endDate.setHours(23, 59, 59, 999);
    
    this.startDate = startDate || new Date(this.endDate);
    if (!startDate) {
      this.startDate.setDate(this.endDate.getDate() - 7);
      this.startDate.setHours(0, 0, 0, 0);
    }
  }

  // 🎯 計算実行
  run(): DailyAverageData {
    const weeklyData = this.createWeeklyData();
    const averageDailyMinutes = this.calculateAverage(weeklyData);

    return {
      averageDailyMinutes,
      weeklyData
    };
  }

  // 🎯 週間データを作成
  private createWeeklyData(): DailyMeetingData[] {
    const dailyData: DailyMeetingData[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(this.startDate);
      currentDate.setDate(this.startDate.getDate() + i);
      
      const dayStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      // その日の会議を抽出
      const dayMeetings = this.meetings.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        return meetingDate >= dayStart && meetingDate < dayEnd;
      });
      
      // 合計時間を計算（分）
      const totalMinutes = dayMeetings.reduce((sum, meeting) => {
        const durationMs = meeting.endTime.getTime() - meeting.startTime.getTime();
        return sum + (durationMs / (1000 * 60));
      }, 0);
      
      dailyData.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: this.getDayName(currentDate),
        totalMinutes: Math.round(totalMinutes)
      });
    }
    
    return dailyData;
  }

  // 🎯 平均を計算
  private calculateAverage(weeklyData: DailyMeetingData[]): number {
    if (weeklyData.length === 0) return 0;
    
    const totalMinutes = weeklyData.reduce(
      (sum, day) => sum + day.totalMinutes,
      0
    );
    
    // 7日間の平均を計算し、小数点第1位まで丸める
    const average = totalMinutes / 7;
    return Math.round(average * 10) / 10;
  }

  // 🎯 曜日名を取得
  private getDayName(date: Date): string {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[date.getDay()];
  }
}