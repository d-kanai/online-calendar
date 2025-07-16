const { Given, When, Then, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
const { PrismaClient } = require('@prisma/client');
const CalendarPage = require('../page-objects/CalendarPage');
const MeetingFormPage = require('../page-objects/MeetingFormPage');

// タイムアウトを60秒に設定
setDefaultTimeout(60000);

const prisma = new PrismaClient();

let browser;
let page;
let calendarPage;
let meetingFormPage;
let createdMeetingId;

Given('オーナーが作成した未来の会議がある', async function () {
  // データベースリセット - 全テーブルをクリア
  await prisma.meeting.deleteMany();
  
  // ブラウザとページを初期化
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  
  // API通信をモニタリング
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`API Response: ${response.status()} ${response.url()}`);
    }
  });
  
  page.on('requestfailed', request => {
    console.log(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  // Page Objectインスタンスを作成
  calendarPage = new CalendarPage(page);
  meetingFormPage = new MeetingFormPage(page);
  
  // 未来の会議を作成（明日の10:00-11:00）
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(11, 0, 0, 0);
  
  // テスト用会議をPrisma直接でDBに作成
  const meeting = await prisma.meeting.create({
    data: {
      title: '既存会議',
      startTime: tomorrow,
      endTime: endTime,
      isImportant: false,
      ownerId: 'taro@example.com'
    }
  });
  
  console.log('Created meeting in DB:', meeting.id);
  createdMeetingId = meeting.id;
  
  // バックエンドサーバーが起動しているかチェック
  try {
    const response = await fetch('http://localhost:3001/api/v1/meetings');
    console.log('Backend health check:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('API response data:', data);
    }
  } catch (error) {
    console.error('Backend server not available:', error.message);
    throw new Error('Backend server must be running on localhost:3001 for E2E tests');
  }
  
  // トップページにアクセス
  await calendarPage.navigate();
  
  // ページが読み込まれて会議が表示されるまで待機
  await page.waitForTimeout(5000);
  
  // フロントエンドが正しく読み込まれているかチェック
  try {
    await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
    console.log('Frontend loaded successfully');
  } catch (error) {
    await page.screenshot({ path: 'frontend-load-error.png', fullPage: true });
    throw new Error('Frontend failed to load properly');
  }
});

When('オーナーが title と period を更新する', async function () {
  // 少し待機してページが完全に読み込まれるまで待つ
  await page.waitForTimeout(3000);
  
  // デバッグ用：ページの内容をログ出力
  const pageContent = await page.content();
  console.log('Page content contains "既存会議":', pageContent.includes('既存会議'));
  
  // カレンダーが表示されているか確認
  await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  
  // より具体的なセレクターで会議要素を探す
  const meetingElements = await page.locator('.text-xs.p-1.rounded.truncate').all();
  console.log('Found meeting elements:', meetingElements.length);
  
  // 会議要素があるかどうかを確認
  if (meetingElements.length > 0) {
    // 最初の会議要素をクリック
    await meetingElements[0].click();
  } else {
    // スクリーンショットを撮影して状態を確認
    await page.screenshot({ path: 'debug-no-meetings.png', fullPage: true });
    console.log('Screenshot saved as debug-no-meetings.png');
    
    // ページの詳細な状態をデバッグ
    const url = page.url();
    console.log('Current URL:', url);
    
    // API通信の確認
    const networkLogs = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        networkLogs.push(`${response.status()} ${response.url()}`);
      }
    });
    
    // ページリロードしてAPI通信を再試行
    await page.reload();
    await page.waitForTimeout(5000);
    
    console.log('Network logs after reload:', networkLogs);
    await page.screenshot({ path: 'debug-after-reload.png', fullPage: true });
    
    throw new Error('No meeting elements found on the calendar');
  }
  
  // 編集ボタンをクリック（会議詳細画面で）
  await page.waitForSelector('text=編集', { timeout: 10000 });
  await page.click('text=編集');
  
  // フォームが表示されるまで待機
  await page.waitForSelector('[data-testid="meeting-title-input"]');
  
  // 既存のタイトルをクリアして新しいタイトルを入力
  await page.fill('[data-testid="meeting-title-input"]', '');
  await page.fill('[data-testid="meeting-title-input"]', '更新された会議');
  
  // 期間を更新（開始時刻と終了時刻を変更）
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0); // 14:00に変更
  
  const endTime = new Date(tomorrow);
  endTime.setHours(15, 30, 0, 0); // 15:30に変更（1時間30分間）
  
  const startTimeString = tomorrow.toISOString().slice(0, 16);
  const endTimeString = endTime.toISOString().slice(0, 16);
  
  await page.fill('#startTime', startTimeString);
  await page.fill('#endTime', endTimeString);
  
  // 更新ボタンをクリック
  await page.click('[data-testid="meeting-submit-button"]');
});

Then('会議が正常に更新される', async function () {
  // 成功トーストメッセージが表示されることを確認
  await page.waitForSelector('text=会議が更新されました', { timeout: 10000 });
  
  // フォームが閉じていることを確認
  await page.waitForSelector('[data-testid="meeting-title-input"]', { state: 'hidden' });
  
  // カレンダー上で更新された会議タイトルが表示されることを確認
  await page.waitForSelector('text=更新された会議', { timeout: 10000 });
});

// After hook to clean up
After(async function () {
  if (page) {
    await page.close();
    page = null;
  }
  if (browser) {
    await browser.close();
    browser = null;
  }
  await prisma.$disconnect();
});