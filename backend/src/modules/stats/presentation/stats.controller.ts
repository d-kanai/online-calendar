import { Context } from 'hono';
import { GetDailyAverageQuery } from '../application/queries/get-daily-average.query.js';

export class StatsController {
  private getDailyAverageQuery: GetDailyAverageQuery;

  constructor() {
    this.getDailyAverageQuery = new GetDailyAverageQuery();
  }

  async getDailyAverage(c: Context) {
    try {
      const loginUserId = c.get('loginUserId');
      
      if (!loginUserId) {
        return c.json({
          success: false,
          error: 'Unauthorized'
        }, 401);
      }

      const result = await this.getDailyAverageQuery.execute(loginUserId);

      return c.json({
        success: true,
        data: result
      }, 200);
    } catch (error) {
      console.error('getDailyAverage error:', error);
      return c.json({
        success: false,
        error: 'Internal Server Error'
      }, 500);
    }
  }
}