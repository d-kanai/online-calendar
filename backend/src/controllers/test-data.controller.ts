import { Context } from 'hono';
import { prisma } from '../shared/database/prisma.js';

export class TestDataController {
  async setupData(c: Context) {
    // 本番環境では動作しない
    if (process.env.NODE_ENV === 'production') {
      return c.json({ error: 'Not found' }, 404);
    }

    try {
      const { table, data } = await c.req.json();

      if (!table || !data) {
        return c.json({ error: 'Table name and data are required' }, 400);
      }

      // Prismaのモデルを動的に取得
      const model = (prisma as any)[table];
      if (!model) {
        return c.json({ error: `Table ${table} not found` }, 400);
      }

      // データを作成（既存の場合は更新）
      let result;
      if (data.id) {
        // IDが指定されている場合はupsertを使用
        result = await model.upsert({
          where: { id: data.id },
          update: data,
          create: data
        });
      } else {
        result = await model.create({
          data: data
        });
      }

      return c.json({ 
        message: 'Test data created successfully',
        data: result 
      }, 201);
    } catch (error) {
      console.error('Test data setup error:', error);
      return c.json({ 
        error: 'Failed to create test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }

  async resetAll(c: Context) {
    // 本番環境では動作しない
    if (process.env.NODE_ENV === 'production') {
      return c.json({ error: 'Not found' }, 404);
    }

    try {
      // 依存関係の順序で削除（外部キー制約を考慮）
      const deleteCounts = {
        meetingParticipant: await prisma.meetingParticipant.deleteMany({}),
        meeting: await prisma.meeting.deleteMany({}),
        user: await prisma.user.deleteMany({})
      };

      return c.json({ 
        message: 'All test data cleared successfully',
        counts: {
          meetingParticipant: deleteCounts.meetingParticipant.count,
          meeting: deleteCounts.meeting.count,
          user: deleteCounts.user.count
        }
      }, 200);
    } catch (error) {
      console.error('Test data reset error:', error);
      return c.json({ 
        error: 'Failed to reset test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }
}