import { Context } from 'hono';
import { ApiResponse } from '../../../shared/types/api.js';
import { CreateMeetingRequest, UpdateMeetingRequest } from './input.js';
import { GetAllMeetingsQuery } from '../application/queries/get-all-meetings.query.js';
import { GetMeetingByIdQuery } from '../application/queries/get-meeting-by-id.query.js';
import { GetMeetingsByOwnerQuery } from '../application/queries/get-meetings-by-owner.query.js';
import { CreateMeetingCommand } from '../application/commands/create-meeting.command.js';
import { UpdateMeetingCommand } from '../application/commands/update-meeting.command.js';
import { DeleteMeetingCommand } from '../application/commands/delete-meeting.command.js';
import { AddParticipantCommand } from '../application/commands/add-participant.command.js';
import { RemoveParticipantCommand } from '../application/commands/remove-participant.command.js';
import { MeetingRepository } from '../infra/meeting.repository.js';
import { MeetingWithOwnerHelper } from '../application/queries/meeting-with-owner.helper.js';
import { 
  GetAllMeetingsOutput,
  GetMeetingByIdOutput,
  CreateMeetingOutput,
  UpdateMeetingOutput,
  GetMeetingsByOwnerOutput,
  AddParticipantOutput,
  toGetAllMeetingsOutput,
  toGetMeetingByIdOutput,
  toCreateMeetingOutput,
  toUpdateMeetingOutput,
  toGetMeetingsByOwnerOutput,
  toAddParticipantOutput
} from './output.js';

export class MeetingController {
  private getAllMeetingsQuery: GetAllMeetingsQuery;
  private getMeetingByIdQuery: GetMeetingByIdQuery;
  private getMeetingsByOwnerQuery: GetMeetingsByOwnerQuery;
  private createMeetingCommand: CreateMeetingCommand;
  private updateMeetingCommand: UpdateMeetingCommand;
  private deleteMeetingCommand: DeleteMeetingCommand;
  private addParticipantCommand: AddParticipantCommand;
  private removeParticipantCommand: RemoveParticipantCommand;
  private helper: MeetingWithOwnerHelper;

  constructor() {
    const repository = new MeetingRepository();
    this.getAllMeetingsQuery = new GetAllMeetingsQuery();
    this.getMeetingByIdQuery = new GetMeetingByIdQuery();
    this.getMeetingsByOwnerQuery = new GetMeetingsByOwnerQuery();
    this.createMeetingCommand = new CreateMeetingCommand();
    this.updateMeetingCommand = new UpdateMeetingCommand();
    this.deleteMeetingCommand = new DeleteMeetingCommand();
    this.addParticipantCommand = new AddParticipantCommand(repository);
    this.removeParticipantCommand = new RemoveParticipantCommand();
    this.helper = new MeetingWithOwnerHelper();
  }

  async getAllMeetings(c: Context): Promise<Response> {
    const meetingsWithOwners = await this.getAllMeetingsQuery.run();
    return c.json<ApiResponse<GetAllMeetingsOutput[]>>({
      success: true,
      data: meetingsWithOwners.map(toGetAllMeetingsOutput)
    });
  }

  async getMeetingById(c: Context) {
    const id = c.req.param('id');
    const meetingWithOwner = await this.getMeetingByIdQuery.run(id);

    return c.json<ApiResponse<GetMeetingByIdOutput>>({
      success: true,
      data: toGetMeetingByIdOutput(meetingWithOwner)
    });
  }

  async createMeeting(c: Context) {
    const body = await c.req.json<CreateMeetingRequest>();
    const loginUserId = c.get('loginUserId') as string;
    
    const meetingData = {
      title: body.title,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      isImportant: body.isImportant ?? false,
      ownerId: loginUserId
    };

    const meeting = await this.createMeetingCommand.run(meetingData);
    const meetingWithOwner = await this.helper.getMeetingWithOwner(meeting);

    return c.json<ApiResponse<CreateMeetingOutput>>({
      success: true,
      data: toCreateMeetingOutput(meetingWithOwner),
      message: 'Meeting created successfully'
    }, 201);
  }

  async updateMeeting(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json<UpdateMeetingRequest>();
    const loginUserId = c.get('loginUserId') as string;

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.isImportant !== undefined) updateData.isImportant = body.isImportant;

    const meeting = await this.updateMeetingCommand.run(id, updateData, loginUserId);
    const meetingWithOwner = await this.helper.getMeetingWithOwner(meeting);

    return c.json<ApiResponse<UpdateMeetingOutput>>({
      success: true,
      data: toUpdateMeetingOutput(meetingWithOwner),
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
    const meetingsWithOwners = await this.getMeetingsByOwnerQuery.run(ownerId);

    return c.json<ApiResponse<GetMeetingsByOwnerOutput[]>>({
      success: true,
      data: meetingsWithOwners.map(toGetMeetingsByOwnerOutput)
    });
  }

  async addParticipant(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json<{ email: string, name: string }>();
    const loginUserId = c.get('loginUserId') as string;
    
    const meeting = await this.addParticipantCommand.run({
      meetingId: id,
      email: body.email,
      name: body.name,
      requesterId: loginUserId
    });
    const meetingWithOwner = await this.helper.getMeetingWithOwner(meeting);

    return c.json<ApiResponse<AddParticipantOutput>>({
      success: true,
      data: toAddParticipantOutput(meetingWithOwner),
      message: '参加者が追加されました'
    });
  }

  async removeParticipant(c: Context) {
    const meetingId = c.req.param('id');
    const participantId = c.req.param('participantId');
    const loginUserId = c.get('loginUserId') as string;
    
    await this.removeParticipantCommand.run(meetingId, participantId, loginUserId);

    return c.json<ApiResponse>({
      success: true,
      message: '参加者が削除されました'
    });
  }
}