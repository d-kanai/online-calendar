const { Given } = require('@cucumber/cucumber');
const { PrismaClient } = require('@prisma/client');
const { UserFactory } = require('../support/factories');

const prisma = new PrismaClient();

Given('ユーザー{string}でログイン', async function (userName) {
  // データベースリセット - 全テーブルをクリア
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();
  
  // ユーザー作成 (ファクトリーを使用)
  const user = await UserFactory.createForAuth(userName);
  
  // ページエラーをキャッチ（デバッグ用）
  if (global.calendarPage && global.calendarPage.page) {
    global.calendarPage.page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // ページアクセス前にlocalStorageを設定
    await global.calendarPage.page.goto('http://localhost:3000');
    
    // ページが読み込まれるまで待機
    await global.calendarPage.page.waitForLoadState('networkidle');
    
    // APIでサインインしてJWTトークンを取得
    const response = await fetch('http://localhost:3001/api/v1/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: 'password123'
      })
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to sign in');
    }
    
    const { token, user: authUser } = result.data;
    
    // JWTトークンとユーザー情報をlocalStorageに設定
    await global.calendarPage.page.evaluate(({ token, user }) => {
      // JWTトークンを保存
      localStorage.setItem('calendar_app_token', token);
      
      // 現在のユーザーをlocalStorageに保存
      localStorage.setItem('calendar_app_current_user', JSON.stringify(user));
    }, {
      token,
      user: authUser
    });
    
    // 認証情報を設定後、カレンダーページに直接移動
    await global.calendarPage.page.goto('http://localhost:3000/calendar');
    
    // カレンダーが表示されるまで待機（認証完了を確認）
    await global.calendarPage.page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  }
  
  // ユーザー情報を保存（他のステップで使用）
  this.currentUser = user;
});

// データ準備のGivenステップはdata.steps.jsに移動
// フック関連のコードはhook.steps.jsに移動