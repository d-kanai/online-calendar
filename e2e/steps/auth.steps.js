const { Given, Before } = require('@cucumber/cucumber');
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

Before(async function () {
  if (!browser) {
    browser = await chromium.launch({ headless: false });
  }
  if (!page) {
    page = await browser.newPage();
  }
  
  // Page Objectインスタンスを作成
  global.calendarPage = new CalendarPage(page);
  global.meetingFormPage = new MeetingFormPage(page);
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
    await page.waitForTimeout(1000);
    
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
    
    // 認証処理とコンポーネントの初期化を待機
    await page.waitForTimeout(3000);
  }
  
  // ユーザー情報を保存（他のステップで使用）
  this.currentUser = user;
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
  await page.waitForTimeout(1000);
  
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
  
  // 認証処理とコンポーネントの初期化を待機
  await page.waitForTimeout(3000);
  
  // ユーザー情報を保存（他のステップで使用）
  this.currentUser = user;
});