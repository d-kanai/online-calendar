import { Context } from 'hono';
import { ApiResponse } from '../../../shared/types/api.js';
import { CreateMeetingRequest, UpdateMeetingRequest } from './input.js';
import { GetAllMeetingsQuery } from '../application/queries/get-all-meetings.query.js';
import { GetMeetingByIdQuery } from '../application/queries/get-meeting-by-id.query.js';
import { GetMeetingsByOwnerQuery } from '../application/queries/get-meetings-by-owner.query.js';
import { CreateMeetingCommand } from '../application/commands/create-meeting.command.js';
import { UpdateMeetingCommand } from '../application/commands/update-meeting.command.js';
import { DeleteMeetingCommand } from '../application/commands/delete-meeting.command.js';

export class MeetingController {
  private getAllMeetingsQuery: GetAllMeetingsQuery;
  private getMeetingByIdQuery: GetMeetingByIdQuery;
  private getMeetingsByOwnerQuery: GetMeetingsByOwnerQuery;
  private createMeetingCommand: CreateMeetingCommand;
  private updateMeetingCommand: UpdateMeetingCommand;
  private deleteMeetingCommand: DeleteMeetingCommand;

  constructor() {
    this.getAllMeetingsQuery = new GetAllMeetingsQuery();
    this.getMeetingByIdQuery = new GetMeetingByIdQuery();
    this.getMeetingsByOwnerQuery = new GetMeetingsByOwnerQuery();
    this.createMeetingCommand = new CreateMeetingCommand();
    this.updateMeetingCommand = new UpdateMeetingCommand();
    this.deleteMeetingCommand = new DeleteMeetingCommand();
  }

  async getAllMeetings(c: Context) {
    const meetings = await this.getAllMeetingsQuery.run();
    return c.json<ApiResponse>({
      success: true,
      data: meetings
    });
  }

  async getMeetingById(c: Context) {
    const id = c.req.param('id');
    const meeting = await this.getMeetingByIdQuery.run(id);

    return c.json<ApiResponse>({
      success: true,
      data: meeting
    });
  }

  async createMeeting(c: Context) {
    const body = await c.req.json<CreateMeetingRequest>();
    
    const meetingData = {
      title: body.title,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      isImportant: body.isImportant || false,
      ownerId: body.ownerId
    };

    const meeting = await this.createMeetingCommand.run(meetingData);

    return c.json<ApiResponse>({
      success: true,
      data: meeting,
      message: 'Meeting created successfully'
    }, 201);
  }

  async updateMeeting(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json<UpdateMeetingRequest>();

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.isImportant !== undefined) updateData.isImportant = body.isImportant;

    const meeting = await this.updateMeetingCommand.run(id, updateData);

    return c.json<ApiResponse>({
      success: true,
      data: meeting,
      message: 'Meeting updated successfully'
    });
  }

  async deleteMeeting(c: Context) {
    const id = c.req.param('id');
    await this.deleteMeetingCommand.run(id);

    return c.json<ApiResponse>({
      success: true,
      message: 'Meeting deleted successfully'
    });
  }

  async getMeetingsByOwner(c: Context) {
    const ownerId = c.req.param('ownerId');
    const meetings = await this.getMeetingsByOwnerQuery.run(ownerId);

    return c.json<ApiResponse>({
      success: true,
      data: meetings
    });
  }
}