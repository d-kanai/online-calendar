const { Given, Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('@playwright/test');
const CalendarPage = require('../page-objects/CalendarPage');
const MeetingFormPage = require('../page-objects/MeetingFormPage');

const prisma = new PrismaClient();
let browser;
let page;

// グローバル変数としてPage Objectを定義
global.calendarPage = null;
global.meetingFormPage = null;

// テストスイート開始時にブラウザを起動
BeforeAll(async function () {
  browser = await chromium.launch({ headless: false });
  page = await browser.newPage();
  
  // Page Objectインスタンスを作成
  global.calendarPage = new CalendarPage(page);
  global.meetingFormPage = new MeetingFormPage(page);
});

// テストスイート終了時にブラウザを終了
AfterAll(async function () {
  try {
    if (page) {
      await page.close();
      page = null;
    }
    if (browser) {
      await browser.close();
      browser = null;
    }
    await prisma.$disconnect();
  } catch (error) {
    console.log('Cleanup error:', error);
  }
});

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
  if (page) {
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // ページアクセス前にlocalStorageを設定
    await page.goto('http://localhost:3000');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // ログイン状態をlocalStorageに設定
    await page.evaluate((userData) => {
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
    await page.reload();
    
    // カレンダーが表示されるまで待機（認証完了を確認）
    await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  }
  
  // ユーザー情報を保存（他のステップで使用）
  this.currentUser = user;
});

// データ準備用の共通Givenステップ（純粋なDB操作のみ）
Given('会議 {string} を作成済み', async function (title) {
  const owner = this.currentUser;
  
  // 明日の14:00-15:00の会議を作成
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(15, 0, 0, 0);
  
  const meeting = await prisma.meeting.create({
    data: {
      title: title,
      startTime: tomorrow,
      endTime: endTime,
      isImportant: false,
      ownerId: owner.id
    }
  });
  
  // 他のステップで使用するため保存
  this.createdMeeting = meeting;
});

Given('時間帯 {string} の会議を作成済み', async function (timeRange) {
  const owner = this.currentUser;
  
  // timeRangeから開始時刻と終了時刻を抽出（例: "10:00-11:00"）
  const [startTimeStr, endTimeStr] = timeRange.split('-');
  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);
  
  // 明日の日付で指定された時刻の会議を作成
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  const meeting = await prisma.meeting.create({
    data: {
      title: '既存会議',
      startTime: tomorrow,
      endTime: endTime,
      isImportant: false,
      ownerId: owner.id
    }
  });
  
  // 他のステップで使用するため保存
  this.createdMeeting = meeting;
});

// After hook for cleanup between scenarios
After(async function () {
  // シナリオ間でページを再利用するため、各シナリオ後はページをクリアのみ
  if (page) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
});

Given('ユーザー{string}でログインしてページにアクセス', async function (userName) {
  // ユーザー作成
  const user = await prisma.user.create({
    data: {
      email: `${userName.toLowerCase()}@example.com`,
      name: userName
    }
  });
  
  // ページエラーをキャッチ（デバッグ用）
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // トップページにアクセス
  await page.goto('http://localhost:3000');
  
  // ページが読み込まれるまで待機
  await page.waitForLoadState('networkidle');
  
  // ログイン状態をlocalStorageに設定
  await page.evaluate((userData) => {
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
  await page.reload();
  
  // カレンダーが表示されるまで待機（認証完了を確認）
  await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  
  // ユーザー情報を保存（他のステップで使用）
  this.currentUser = user;
});