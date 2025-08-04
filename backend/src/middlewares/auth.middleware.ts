import { Context, Next } from 'hono';
import { AuthService } from '../modules/auth/domain/auth.service.js';


export const authMiddleware = () => {
  const authService = new AuthService();

  return async (c: Context, next: Next): Promise<Response | void> => {
    try {
      const authHeader = c.req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: '認証トークンが必要です' }, 401);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // E2Eテストトークンの場合は固定ユーザー情報を設定
      if (process.env.NODE_ENV !== 'production' && token === 'e2e-test-token') {
        c.set('loginUserId', 'e2e-test-user');
        c.set('loginUserEmail', 'test@example.com');
        await next();
        return;
      }
      
      const payload = authService.verifyToken(token);

      // Set authenticated user info in context
      c.set('loginUserId', payload.id);
      c.set('loginUserEmail', payload.email);

      await next();
    } catch (error) {
      return c.json({ error: '認証に失敗しました' }, 401);
    }
  };
};