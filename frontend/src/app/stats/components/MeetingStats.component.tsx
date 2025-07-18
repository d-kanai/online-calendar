import React from 'react';
import { Card } from '@/lib/ui/card';
import { Clock, Calendar } from 'lucide-react';
import { DailyAverageResponse } from '../apis/stats.api';
import { useDailyAverage } from '../hooks/useStatsQuery';

// ヘルパー関数
const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0) {
    return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
  }
  return `${mins}分`;
};

// 🎨 UIコンポーネント群（同一ファイル内）
function AverageTimeCard({ data }: { data: DailyAverageResponse }) {
  const weeklyTotal = data.weeklyData.reduce((sum, day) => sum + day.totalMinutes, 0);
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">1日あたりの平均会議時間</p>
          <p className="text-2xl font-bold mt-1" data-testid="daily-average-time">
            {data.averageDailyMinutes.toFixed(1)}分
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            週合計: {formatMinutes(weeklyTotal)}
          </p>
        </div>
        <Clock className="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  );
}

function ParticipationCard() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">参加会議数</p>
          <p className="text-2xl font-bold mt-1">0</p>
          <p className="text-xs text-muted-foreground mt-1">
            参加承諾済み
          </p>
        </div>
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  );
}

function BarChart({ data }: { data: DailyAverageResponse['weeklyData'] }) {
  const maxValue = Math.max(...data.map(d => d.totalMinutes), 1);
  
  return (
    <div className="space-y-2">
      {data.map((day) => (
        <div key={day.date} className="flex items-center gap-2">
          <div className="w-12 text-sm text-muted-foreground text-right">
            {day.dayName}
          </div>
          <div className="flex-1 relative h-8 bg-muted rounded">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded transition-all duration-300"
              style={{ width: `${(day.totalMinutes / maxValue) * 100}%` }}
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium">
              {formatMinutes(day.totalMinutes)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🏗️ メインコンポーネント - 構造が一目瞭然
export function MeetingStats() {
  const { data: dailyAverageData } = useDailyAverage();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AverageTimeCard data={dailyAverageData} />
          <ParticipationCard />
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">日別会議時間（過去1週間）</h3>
          <BarChart data={dailyAverageData.weeklyData} />
        </Card>
      </div>
    </div>
  );
}