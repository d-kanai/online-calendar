import { Hono } from 'hono';
import { MeetingController } from './presentation/meeting.controller.js';
import { errorHandler } from '../../shared/middleware/error-handler.js';

const meetingRoutes = new Hono();
const meetingController = new MeetingController();

// Error handler
meetingRoutes.onError(errorHandler);

// GET /api/v1/meetings - Get all meetings
meetingRoutes.get('/', (c) => meetingController.getAllMeetings(c));

// GET /api/v1/meetings/:id - Get meeting by ID
meetingRoutes.get('/:id', (c) => meetingController.getMeetingById(c));

// POST /api/v1/meetings - Create new meeting
meetingRoutes.post('/', (c) => meetingController.createMeeting(c));

// PUT /api/v1/meetings/:id - Update meeting
meetingRoutes.put('/:id', (c) => meetingController.updateMeeting(c));

// DELETE /api/v1/meetings/:id - Delete meeting
meetingRoutes.delete('/:id', (c) => meetingController.deleteMeeting(c));

// POST /api/v1/meetings/:id/participants - Add participant to meeting
meetingRoutes.post('/:id/participants', (c) => meetingController.addParticipant(c));

// DELETE /api/v1/meetings/:id/participants/:participantId - Remove participant from meeting
meetingRoutes.delete('/:id/participants/:participantId', (c) => meetingController.removeParticipant(c));

// GET /api/v1/meetings/owner/:ownerId - Get meetings by owner
meetingRoutes.get('/owner/:ownerId', (c) => meetingController.getMeetingsByOwner(c));

export { meetingRoutes };