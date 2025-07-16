// API Output Types - 1 API = 1 Output Type

export interface ParticipantOutput {
  id: string;
  email: string;
  name: string;
}

export class GetAllMeetingsOutput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isImportant: boolean,
    public readonly ownerId: string,
    public readonly owner: string,
    public readonly participants: ParticipantOutput[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class GetMeetingByIdOutput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isImportant: boolean,
    public readonly ownerId: string,
    public readonly owner: string,
    public readonly participants: ParticipantOutput[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class CreateMeetingOutput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isImportant: boolean,
    public readonly ownerId: string,
    public readonly owner: string,
    public readonly participants: ParticipantOutput[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class UpdateMeetingOutput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isImportant: boolean,
    public readonly ownerId: string,
    public readonly owner: string,
    public readonly participants: ParticipantOutput[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class GetMeetingsByOwnerOutput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isImportant: boolean,
    public readonly ownerId: string,
    public readonly owner: string,
    public readonly participants: ParticipantOutput[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class AddParticipantOutput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isImportant: boolean,
    public readonly ownerId: string,
    public readonly owner: string,
    public readonly participants: ParticipantOutput[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

// Conversion functions from Domain Model to Output
import { MeetingWithOwner } from '../application/queries/meeting-with-owner.helper.js';

export function toGetAllMeetingsOutput(data: MeetingWithOwner): GetAllMeetingsOutput {
  const meeting = data.meeting;
  return new GetAllMeetingsOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    data.ownerEmail,
    meeting.participants.map(p => ({
      id: p.id,
      email: p.userEmail,
      name: p.userName
    })),
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toGetMeetingByIdOutput(data: MeetingWithOwner): GetMeetingByIdOutput {
  const meeting = data.meeting;
  return new GetMeetingByIdOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    data.ownerEmail,
    meeting.participants.map(p => ({
      id: p.id,
      email: p.userEmail,
      name: p.userName
    })),
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toCreateMeetingOutput(data: MeetingWithOwner): CreateMeetingOutput {
  const meeting = data.meeting;
  return new CreateMeetingOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    data.ownerEmail,
    meeting.participants.map(p => ({
      id: p.id,
      email: p.userEmail,
      name: p.userName
    })),
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toUpdateMeetingOutput(data: MeetingWithOwner): UpdateMeetingOutput {
  const meeting = data.meeting;
  return new UpdateMeetingOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    data.ownerEmail,
    meeting.participants.map(p => ({
      id: p.id,
      email: p.userEmail,
      name: p.userName
    })),
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toGetMeetingsByOwnerOutput(data: MeetingWithOwner): GetMeetingsByOwnerOutput {
  const meeting = data.meeting;
  return new GetMeetingsByOwnerOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    data.ownerEmail,
    meeting.participants.map(p => ({
      id: p.id,
      email: p.userEmail,
      name: p.userName
    })),
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toAddParticipantOutput(data: MeetingWithOwner): AddParticipantOutput {
  const meeting = data.meeting;
  return new AddParticipantOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    data.ownerEmail,
    meeting.participants.map(p => ({
      id: p.id,
      email: p.userEmail,
      name: p.userName
    })),
    meeting.createdAt,
    meeting.updatedAt
  );
}