import { Context } from 'hono';
import { GetDailyAverageQuery } from '../application/queries/get-daily-average.query.js';
import { toDailyAverageOutput } from './output.js';

export class StatsController {
  private getDailyAverageQuery: GetDailyAverageQuery;

  constructor() {
    this.getDailyAverageQuery = new GetDailyAverageQuery();
  }

  async getDailyAverage(c: Context) {
    const loginUserId = c.get('loginUserId');
    const result = await this.getDailyAverageQuery.run(loginUserId);
    const output = toDailyAverageOutput(result);
    
    return c.json(output, 200);
  }
}