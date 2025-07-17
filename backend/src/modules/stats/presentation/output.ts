import { DailyAverageData } from '../domain/daily-average-calculator.js';

// 🎯 日次平均統計取得API用Output型
export interface GetDailyAverageOutput {
  success: boolean;
  data: {
    averageDailyMinutes: number;
    weeklyData: {
      date: string;
      dayName: string;
      totalMinutes: number;
    }[];
  };
}

// 🔄 変換関数
export function toDailyAverageOutput(data: DailyAverageData): GetDailyAverageOutput {
  return {
    success: true,
    data: {
      averageDailyMinutes: data.averageDailyMinutes,
      weeklyData: data.weeklyData
    }
  };
}