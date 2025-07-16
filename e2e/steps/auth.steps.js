const { Given } = require('@cucumber/cucumber');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

Given('ユーザー{string}でログイン', async function (userName) {
  // データベースリセット - 全テーブルをクリア
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();
  
  // ユーザー作成
  const user = await prisma.user.create({
    data: {
      email: `${userName.toLowerCase()}@example.com`,
      name: userName
    }
  });
  
  // ページエラーをキャッチ（デバッグ用）
  if (global.calendarPage && global.calendarPage.page) {
    global.calendarPage.page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // ページアクセス前にlocalStorageを設定
    await global.calendarPage.page.goto('http://localhost:3000');
    
    // ページが読み込まれるまで待機
    await global.calendarPage.page.waitForLoadState('networkidle');
    
    // ログイン状態をlocalStorageに設定
    await global.calendarPage.page.evaluate((userData) => {
      // ユーザー一覧をlocalStorageに保存
      const users = [userData];
      localStorage.setItem('calendar_app_users', JSON.stringify(users));
      
      // 現在のユーザーをlocalStorageに保存
      localStorage.setItem('calendar_app_current_user', JSON.stringify(userData));
    }, {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.createdAt)
    });
    
    // ページをリロードして認証状態を反映
    await global.calendarPage.page.reload();
    
    // カレンダーが表示されるまで待機（認証完了を確認）
    await global.calendarPage.page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  }
  
  // ユーザー情報を保存（他のステップで使用）
  this.currentUser = user;
});

// データ準備のGivenステップはdata.steps.jsに移動
// フック関連のコードはhook.steps.jsに移動

Given('ユーザー{string}でログインしてページにアクセス', async function (userName) {
  // ユーザー作成
  const user = await prisma.user.create({
    data: {
      email: `${userName.toLowerCase()}@example.com`,
      name: userName
    }
  });
  
  // ページエラーをキャッチ（デバッグ用）
  global.calendarPage.page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // トップページにアクセス
  await global.calendarPage.page.goto('http://localhost:3000');
  
  // ページが読み込まれるまで待機
  await global.calendarPage.page.waitForLoadState('networkidle');
  
  // ログイン状態をlocalStorageに設定
  await global.calendarPage.page.evaluate((userData) => {
    // ユーザー一覧をlocalStorageに保存
    const users = [userData];
    localStorage.setItem('calendar_app_users', JSON.stringify(users));
    
    // 現在のユーザーをlocalStorageに保存
    localStorage.setItem('calendar_app_current_user', JSON.stringify(userData));
  }, {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date(user.createdAt)
  });
  
  // ページをリロードして認証状態を反映
  await global.calendarPage.page.reload();
  
  // カレンダーが表示されるまで待機（認証完了を確認）
  await global.calendarPage.page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  
  // ユーザー情報を保存（他のステップで使用）
  this.currentUser = user;
});