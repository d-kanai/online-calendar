export interface Participant {
  id: string;
  email: string;
  name: string;
  response?: 'yes' | 'no' | 'pending'; // 参加者の回答状況
}

export interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  ownerId: string;
  owner: string; // owner email
  participants: Participant[];
  isImportant: boolean;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

