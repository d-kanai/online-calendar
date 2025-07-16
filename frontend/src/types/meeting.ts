export interface Participant {
  id: string;
  email: string;
  name: string;
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

export interface NotificationEvent {
  id: string;
  meetingId: string;
  type: 'reminder' | 'invitation' | 'rescheduled' | 'cancelled';
  scheduledTime: Date;
  recipients: string[];
  status: 'pending' | 'sent' | 'failed';
}