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
    try {
      const meetings = await this.getAllMeetingsQuery.run();
      return c.json<ApiResponse>({
        success: true,
        data: meetings
      });
    } catch (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Failed to fetch meetings'
      }, 500);
    }
  }

  async getMeetingById(c: Context) {
    try {
      const id = c.req.param('id');
      const meeting = await this.getMeetingByIdQuery.run(id);

      if (!meeting) {
        return c.json<ApiResponse>({
          success: false,
          error: 'Meeting not found'
        }, 404);
      }

      return c.json<ApiResponse>({
        success: true,
        data: meeting
      });
    } catch (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Failed to fetch meeting'
      }, 500);
    }
  }

  async createMeeting(c: Context) {
    try {
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
    } catch (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Failed to create meeting'
      }, 500);
    }
  }

  async updateMeeting(c: Context) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<UpdateMeetingRequest>();

      const updateData: any = {};
      if (body.title) updateData.title = body.title;
      if (body.startTime) updateData.startTime = new Date(body.startTime);
      if (body.endTime) updateData.endTime = new Date(body.endTime);
      if (body.isImportant !== undefined) updateData.isImportant = body.isImportant;

      const meeting = await this.updateMeetingCommand.run(id, updateData);

      if (!meeting) {
        return c.json<ApiResponse>({
          success: false,
          error: 'Meeting not found'
        }, 404);
      }

      return c.json<ApiResponse>({
        success: true,
        data: meeting,
        message: 'Meeting updated successfully'
      });
    } catch (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Failed to update meeting'
      }, 500);
    }
  }

  async deleteMeeting(c: Context) {
    try {
      const id = c.req.param('id');
      const success = await this.deleteMeetingCommand.run(id);

      if (!success) {
        return c.json<ApiResponse>({
          success: false,
          error: 'Meeting not found'
        }, 404);
      }

      return c.json<ApiResponse>({
        success: true,
        message: 'Meeting deleted successfully'
      });
    } catch (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Failed to delete meeting'
      }, 500);
    }
  }

  async getMeetingsByOwner(c: Context) {
    try {
      const ownerId = c.req.param('ownerId');
      const meetings = await this.getMeetingsByOwnerQuery.run(ownerId);

      return c.json<ApiResponse>({
        success: true,
        data: meetings
      });
    } catch (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Failed to fetch meetings'
      }, 500);
    }
  }
}