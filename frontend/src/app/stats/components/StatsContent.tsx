'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/lib/ui/chart';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Clock } from 'lucide-react';
import { useDailyAverageSuspense } from '../hooks/useStatsQuerySuspense';

// Suspense境界内で使用するコンテンツコンポーネント
export function StatsContent() {
  const { data } = useDailyAverageSuspense();
  
  const formatMinutes = (minutes: number) => {
    if (minutes === 0) return '0分';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}時間${mins}分`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else {
      return `${mins}分`;
    }
  };

  const chartData = data.weeklyData.map(day => ({
    name: day.dayName,
    value: day.totalMinutes,
    display: formatMinutes(day.totalMinutes)
  }));

  const maxValue = Math.max(...data.weeklyData.map(d => d.totalMinutes), 1);

  return (
    <div className="grid gap-6">
      {/* 平均時間カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            1日あたりの平均会議時間
          </CardTitle>
          <CardDescription>
            過去7日間の統計データ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="average-time">
            {data.averageDailyMinutes.toFixed(1)}分
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            週平均: {formatMinutes(Math.round(data.averageDailyMinutes * 7))}
          </p>
        </CardContent>
      </Card>

      {/* グラフカード */}
      <Card>
        <CardHeader>
          <CardTitle>日別会議時間</CardTitle>
          <CardDescription>
            過去1週間の会議時間推移
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{
              value: {
                label: "会議時間",
                color: "hsl(var(--primary))"
              }
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, maxValue * 1.1]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}分`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`${value}分`, '会議時間']}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* サマリーカード */}
      <Card>
        <CardHeader>
          <CardTitle>週間サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.weeklyData.map((day, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm font-medium">{day.dayName}</span>
                <span className="text-sm text-muted-foreground">{formatMinutes(day.totalMinutes)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}