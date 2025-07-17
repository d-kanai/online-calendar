export interface DailyMeetingData {
  date: string;
  dayName: string;
  totalMinutes: number;
}

export interface DailyAverageData {
  averageDailyMinutes: number;
  weeklyData: DailyMeetingData[];
}

export class DailyAverageCalculator {
  static calculateAverage(weeklyData: DailyMeetingData[]): number {
    if (weeklyData.length === 0) return 0;
    
    const totalMinutes = weeklyData.reduce((sum, day) => sum + day.totalMinutes, 0);
    return totalMinutes / 7; // 7日間の平均
  }

  static formatAverage(average: number): number {
    return Math.round(average * 10) / 10; // 小数点第1位まで
  }
}