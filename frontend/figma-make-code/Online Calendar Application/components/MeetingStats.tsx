import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Meeting, MeetingStats as MeetingStatsType } from '../types/meeting';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Calendar } from 'lucide-react';

interface MeetingStatsProps {
  meetings: Meeting[];
  currentUser: string;
  onBack: () => void;
}

export function MeetingStats({ meetings, currentUser }: MeetingStatsProps) {
  const calculateStats = (): MeetingStatsType => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // 過去1週間の日付を生成
    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      weekDates.push(date);
    }
    
    const weeklyData = weekDates.map(date => {
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      // その日の対象会議を取得
      const dayMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        if (meetingDate < dayStart || meetingDate >= dayEnd) return false;
        
        // オーナーとして作成した会議
        if (meeting.owner === currentUser) return true;
        
        // 参加者として"yes"で回答した会議
        const participant = meeting.participants.find(p => p.email === currentUser);
        return participant && participant.response === 'yes';
      });
      
      // その日の会議時間合計（分）
      const totalMinutes = dayMeetings.reduce((total, meeting) => {
        const duration = (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60);
        return total + duration;
      }, 0);
      
      return {
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
        totalMinutes
      };
    });
    
    // 1日あたりの平均時間を計算
    const totalMinutes = weeklyData.reduce((sum, day) => sum + day.totalMinutes, 0);
    const averageDailyMinutes = totalMinutes / 7;
    
    // 統計情報
    const totalMeetingsOwned = meetings.filter(m => 
      m.owner === currentUser && 
      new Date(m.startTime) >= oneWeekAgo
    ).length;
    
    const totalMeetingsParticipated = meetings.filter(m => {
      const participant = m.participants.find(p => p.email === currentUser);
      return participant && 
             participant.response === 'yes' && 
             new Date(m.startTime) >= oneWeekAgo;
    }).length;
    
    return {
      totalMeetingsOwned,
      totalMeetingsParticipated,
      averageDailyMinutes,
      weeklyData
    };
  };
  
  const stats = calculateStats();
  
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
    }
    return `${mins}分`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">1日あたりの平均会議時間</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageDailyMinutes.toFixed(1)}分
              </div>
              <p className="text-xs text-muted-foreground">
                週合計: {formatMinutes(stats.weeklyData.reduce((sum, day) => sum + day.totalMinutes, 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">参加会議数</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMeetingsParticipated}</div>
              <p className="text-xs text-muted-foreground">
                参加承諾済み
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* 日別グラフ */}
        <Card>
          <CardHeader>
            <CardTitle>日別会議時間（過去1週間）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dayName" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: '分', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return `${data.dayName} (${new Date(data.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })})`;
                    }
                    return label;
                  }}
                  formatter={(value: number) => [formatMinutes(value), '会議時間']}
                />
                <Bar 
                  dataKey="totalMinutes" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}