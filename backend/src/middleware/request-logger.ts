import { Context, Next } from 'hono';

export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const requestId = crypto.randomUUID().substring(0, 8);
  
  // リクエスト情報をログ
  console.log(`📥 [${requestId}] ${c.req.method} ${c.req.url}`);
  
  // リクエストボディをログ（開発環境のみ）
  if (process.env.NODE_ENV === 'development' && c.req.method !== 'GET') {
    try {
      const body = await c.req.text();
      if (body) {
        // パスワードを含む可能性があるフィールドをマスク
        const maskedBody = body.replace(/"password"\s*:\s*"[^"]*"/g, '"password":"***"');
        console.log(`📥 [${requestId}] Body:`, maskedBody);
      }
      // ボディを再度読めるようにする
      c.req.raw = new Request(c.req.raw, { body });
    } catch (e) {
      // ボディが読めない場合は無視
    }
  }
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  // ステータスコードに応じて異なるアイコンを使用
  let icon = '✅';
  if (status >= 400 && status < 500) icon = '⚠️';
  if (status >= 500) icon = '❌';
  
  // レスポンス情報をログ
  console.log(`${icon} [${requestId}] ${c.req.method} ${c.req.url} ${status} ${duration}ms`);
  
  // エラーレスポンスの場合は詳細をログ
  if (status >= 400) {
    try {
      const responseBody = await c.res.clone().text();
      console.log(`${icon} [${requestId}] Response:`, responseBody);
    } catch (e) {
      // レスポンスボディが読めない場合は無視
    }
  }
};