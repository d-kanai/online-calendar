import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = async (c: Context, next: Next): Promise<Response | void> => {
  try {
    await next();
  } catch (err) {
    // エラーの詳細をログ出力
    console.error('🚨 Error occurred:');
    console.error('  Request:', {
      method: c.req.method,
      url: c.req.url,
      headers: Object.fromEntries(c.req.raw.headers.entries()),
      body: await c.req.text().catch(() => 'Unable to read body')
    });

    if (err instanceof HTTPException) {
      // HTTPExceptionの場合
      console.error('  Type: HTTPException');
      console.error('  Status:', err.status);
      console.error('  Message:', err.message);
      
      const res = err.getResponse();
      return res;
    }
    
    if (err instanceof Error) {
      // 通常のErrorの場合
      console.error('  Type:', err.constructor.name);
      console.error('  Message:', err.message);
      console.error('  Stack:', err.stack);
      
      // 特定のエラーメッセージをチェック
      if (err.message.includes('メールアドレスまたはパスワードが正しくありません')) {
        return c.json({ error: err.message }, 401);
      }
      
      if (err.message.includes('必須') || err.message.includes('無効な') || err.message.includes('有効な')) {
        return c.json({ error: err.message }, 400);
      }
    }
    
    // その他のエラー
    console.error('  Unknown error type:', err);
    
    return c.json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? String(err) : undefined
    }, 500);
  }
};