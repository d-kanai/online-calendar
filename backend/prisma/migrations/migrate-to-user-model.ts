import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration to User model...');

  // 1. Get all unique email addresses from meetings
  const meetings = await prisma.$queryRaw<Array<{ ownerId: string; participants: string | null }>>`
    SELECT DISTINCT ownerId, participants FROM meetings
  `;

  const emailSet = new Set<string>();
  
  // Collect all unique emails
  meetings.forEach(meeting => {
    emailSet.add(meeting.ownerId);
    if (meeting.participants) {
      meeting.participants.split(',').forEach(email => {
        if (email.trim()) {
          emailSet.add(email.trim());
        }
      });
    }
  });

  console.log(`Found ${emailSet.size} unique email addresses`);

  // 2. Create User records for each email
  const emailToUserId = new Map<string, string>();
  
  for (const email of emailSet) {
    try {
      const user = await prisma.user.create({
        data: {
          email: email,
          name: email.split('@')[0] // Use email prefix as default name
        }
      });
      emailToUserId.set(email, user.id);
      console.log(`Created user for ${email}`);
    } catch (error) {
      // User might already exist
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        emailToUserId.set(email, existingUser.id);
      }
    }
  }

  // 3. Update meeting ownerIds to use User IDs
  const allMeetings = await prisma.$queryRaw<Array<{ id: string; ownerId: string; participants: string | null }>>`
    SELECT id, ownerId, participants FROM meetings
  `;

  for (const meeting of allMeetings) {
    const ownerUserId = emailToUserId.get(meeting.ownerId);
    if (ownerUserId) {
      await prisma.$executeRaw`
        UPDATE meetings SET ownerId = ${ownerUserId} WHERE id = ${meeting.id}
      `;
      console.log(`Updated meeting ${meeting.id} owner to user ${ownerUserId}`);

      // 4. Create MeetingParticipant records
      if (meeting.participants) {
        const participantEmails = meeting.participants.split(',').filter(email => email.trim());
        for (const participantEmail of participantEmails) {
          const participantUserId = emailToUserId.get(participantEmail.trim());
          if (participantUserId) {
            try {
              await prisma.meetingParticipant.create({
                data: {
                  meetingId: meeting.id,
                  userId: participantUserId
                }
              });
              console.log(`Added participant ${participantEmail} to meeting ${meeting.id}`);
            } catch (error) {
              console.error(`Failed to add participant: ${error}`);
            }
          }
        }
      }
    }
  }

  // 5. Remove participants column (this would be done later after verification)
  console.log('Migration completed successfully!');
  console.log('Note: The participants column in meetings table should be removed after verification');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });