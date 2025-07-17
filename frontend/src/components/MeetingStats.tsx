import React from 'react';
import { Card } from '@/lib/ui/card';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Meeting } from '@/types/meeting';

interface MeetingStatsData {
  totalMeetingsOwned: number;
  totalMeetingsParticipated: number;
  averageDailyMinutes: number;
  weeklyData: {
    date: string;
    dayName: string;
    totalMinutes: number;
  }[];
}

interface MeetingStatsProps {
  meetings: Meeting[];
  currentUser: string;
  onBack: () => void;
}

export function MeetingStats({ meetings, currentUser }: MeetingStatsProps) {
  const calculateStats = (): MeetingStatsData => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // 過去1週間の日付を生成
    const weekDates: Date[] = [];
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
        const duration = (new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60);
        return total + duration;
      }, 0);
      
      return {
        date: date.toISOString().split('T')[0],
        dayName: format(date, 'E', { locale: ja }),
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

  // 簡易的な棒グラフコンポーネント
  const BarChart = ({ data }: { data: typeof stats.weeklyData }) => {
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
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">1日あたりの平均会議時間</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.averageDailyMinutes.toFixed(1)}分
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  週合計: {formatMinutes(stats.weeklyData.reduce((sum, day) => sum + day.totalMinutes, 0))}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">参加会議数</p>
                <p className="text-2xl font-bold mt-1">{stats.totalMeetingsParticipated}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  参加承諾済み
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </div>
        
        {/* 日別グラフ */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">日別会議時間（過去1週間）</h3>
          <BarChart data={stats.weeklyData} />
        </Card>
      </div>
    </div>
  );
}