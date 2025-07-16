// API Output Types - 1 API = 1 Output Type

export class GetAllMeetingsOutput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isImportant: boolean,
    public readonly ownerId: string,
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
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

// Conversion functions from Domain Model to Output
import { Meeting } from '../domain/meeting.model.js';

export function toGetAllMeetingsOutput(meeting: Meeting): GetAllMeetingsOutput {
  return new GetAllMeetingsOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toGetMeetingByIdOutput(meeting: Meeting): GetMeetingByIdOutput {
  return new GetMeetingByIdOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toCreateMeetingOutput(meeting: Meeting): CreateMeetingOutput {
  return new CreateMeetingOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toUpdateMeetingOutput(meeting: Meeting): UpdateMeetingOutput {
  return new UpdateMeetingOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    meeting.createdAt,
    meeting.updatedAt
  );
}

export function toGetMeetingsByOwnerOutput(meeting: Meeting): GetMeetingsByOwnerOutput {
  return new GetMeetingsByOwnerOutput(
    meeting.id,
    meeting.title,
    meeting.startTime,
    meeting.endTime,
    meeting.isImportant,
    meeting.ownerId,
    meeting.createdAt,
    meeting.updatedAt
  );
}