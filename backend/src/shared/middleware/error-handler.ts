import { Context } from 'hono';
import { ApiResponse } from '../types/api.js';
import { HttpException } from '../exceptions/http-exceptions.js';

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error occurred:', err);
  
  if (err instanceof HttpException) {
    return c.json<ApiResponse>({
      success: false,
      error: err.message
    }, err.statusCode as any);
  }
  
  return c.json<ApiResponse>({
    success: false,
    error: 'Internal server error'
  }, 500);
};