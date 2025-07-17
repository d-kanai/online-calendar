export interface Participant {
  id: string;
  email: string;
  name: string;
  notificationChannels: {
    email: boolean;
    push: boolean;
  };
  response?: 'yes' | 'no' | 'pending'; // 参加者の回答状況を追加
}

export interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  owner: string;
  participants: Participant[];
  isImportant: boolean;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingStats {
  totalMeetingsOwned: number;
  totalMeetingsParticipated: number;
  averageDailyMinutes: number;
  weeklyData: {
    date: string;
    dayName: string;
    totalMinutes: number;
  }[];
}