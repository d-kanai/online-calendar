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

Given('オーナーがログインしている', async function () {
  // データベースリセット - 全テーブルをクリア
  await prisma.meeting.deleteMany();
  
  // ブラウザとページを初期化
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  
  // Page Objectインスタンスを作成
  calendarPage = new CalendarPage(page);
  meetingFormPage = new MeetingFormPage(page);
  
  // トップページにアクセス（ログイン済み状態と仮定）
  await calendarPage.navigate();
});

When('title {string}, period {string}, important flag {string} で会議を作成する', async function (title, period, importantFlag) {
  // Page Objectを使用した会議作成フロー
  await meetingFormPage.createMeeting(title, period, importantFlag);
});

When('period {string} で会議を作成する', async function (period) {
  // Page Objectを使用した期間指定会議作成
  await meetingFormPage.createMeetingWithPeriod(period);
});

Then('会議が正常に作成される', async function () {
  // Page Objectを使用した成功確認
  await meetingFormPage.waitForSuccessMessage();
  await meetingFormPage.waitForFormClosed();
});

When('title, period, important flag のいずれかが未入力で会議を作成する', async function () {
  // Page Objectを使用した空フィールド会議作成試行
  await meetingFormPage.createMeetingWithEmptyFields();
});

Then('{string} エラーが表示される', async function (expectedErrorMessage) {
  // Page Objectを使用したエラー確認
  await meetingFormPage.waitForErrorMessage(expectedErrorMessage);
  await meetingFormPage.waitForFormStillVisible();
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