import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/lib/ui/button';
import { Card } from '@/lib/ui/card';
import { Meeting } from '@/types/meeting';
import { usePrefetchMeetings } from '../hooks/usePrefetchMeetings';

interface CalendarViewProps {
  meetings: Meeting[];
  onDateSelect: (date: Date) => void;
  onMeetingSelect: (meetingId: string) => void;
  onCreateMeeting: () => void;
}

// 🎨 UIコンポーネント群（同一ファイル内）
function CalendarHeader({ currentDate, onNavigateMonth, onCreateMeeting }: {
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onCreateMeeting: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">
          {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
        </h1>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => onNavigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button onClick={onCreateMeeting} className="gap-2">
        <Plus className="h-4 w-4" />
        会議を作成
      </Button>
    </div>
  );
}

function WeekdayHeaders() {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  
  return (
    <>
      {weekdays.map((day, index) => (
        <div 
          key={day} 
          className={`bg-muted p-3 text-center text-sm font-medium ${
            index === 0 || index === 6 ? 'text-muted-foreground' : ''
          }`}
        >
          {day}
        </div>
      ))}
    </>
  );
}

function MeetingItem({ meeting, onSelect, onHover }: {
  meeting: Meeting;
  onSelect: (meetingId: string) => void;
  onHover: (meetingId: string) => void;
}) {
  return (
    <div
      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
        meeting.isImportant 
          ? 'bg-destructive text-destructive-foreground' 
          : 'bg-primary text-primary-foreground'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(meeting.id);
      }}
      onMouseEnter={() => onHover(meeting.id)}
    >
      {meeting.startTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} {meeting.title}
    </div>
  );
}

function DateCell({ date, isCurrentMonth, meetings, isToday, onDateSelect, onMeetingSelect, prefetchOnHover }: {
  date: Date;
  isCurrentMonth: boolean;
  meetings: Meeting[];
  isToday: boolean;
  onDateSelect: (date: Date) => void;
  onMeetingSelect: (meetingId: string) => void;
  prefetchOnHover: (meetingId: string) => void;
}) {
  return (
    <Card 
      className={`min-h-24 p-2 cursor-pointer hover:bg-accent/50 transition-colors ${
        !isCurrentMonth ? 'opacity-40' : ''
      } ${isToday ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onDateSelect(date)}
    >
      <div className={`text-sm mb-1 ${isToday ? 'font-semibold text-primary' : ''}`}>
        {date.getDate()}
      </div>
      <div className="space-y-1">
        {meetings.slice(0, 2).map((meeting) => (
          <MeetingItem
            key={meeting.id}
            meeting={meeting}
            onSelect={onMeetingSelect}
            onHover={prefetchOnHover}
          />
        ))}
        {meetings.length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{meetings.length - 2}件
          </div>
        )}
      </div>
    </Card>
  );
}

// カレンダー日付生成ヘルパー
function generateCalendarDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  const calendarDays = [];
  
  // 前月の日付
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    calendarDays.push({ date, isCurrentMonth: false });
  }
  
  // 今月の日付
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }
  
  // 次月の日付（42日分まで埋める）
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({ date, isCurrentMonth: false });
  }
  
  return calendarDays;
}

// 🏗️ メインコンポーネント - 構造が一目瞭然
export function CalendarView({ meetings, onDateSelect, onMeetingSelect, onCreateMeeting }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { prefetchOnHover } = usePrefetchMeetings();
  
  const today = new Date();
  const calendarDays = generateCalendarDays(currentDate);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };
  
  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return meetingDate.toDateString() === date.toDateString();
    });
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  return (
    <div className="flex flex-col h-full" data-testid="calendar-view">
      <CalendarHeader 
        currentDate={currentDate}
        onNavigateMonth={navigateMonth}
        onCreateMeeting={onCreateMeeting}
      />
      
      <div className="flex-1 p-4">
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          <WeekdayHeaders />
          
          {calendarDays.map(({ date, isCurrentMonth }, index) => (
            <DateCell
              key={index}
              date={date}
              isCurrentMonth={isCurrentMonth}
              meetings={getMeetingsForDate(date)}
              isToday={isToday(date)}
              onDateSelect={onDateSelect}
              onMeetingSelect={onMeetingSelect}
              prefetchOnHover={prefetchOnHover}
            />
          ))}
        </div>
      </div>
    </div>
  );
}