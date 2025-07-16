const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
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
  // 環境変数でheadlessモードを制御（デフォルトはheadless）
  const headless = process.env.E2E_HEADLESS !== 'false';
  browser = await chromium.launch({ headless });
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