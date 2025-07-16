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

Given('オーナーが {string} の会議を作成済み', async function (timeRange) {
  // データベースリセット - 全テーブルをクリア
  await prisma.meeting.deleteMany();
  
  // ブラウザとページを初期化
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  
  // Page Objectインスタンスを作成
  calendarPage = new CalendarPage(page);
  meetingFormPage = new MeetingFormPage(page);
  
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
  
  createdMeetingId = meeting.id;
  
  // トップページにアクセス
  await calendarPage.navigate();
  
  // ページが読み込まれて会議が表示されるまで待機
  await page.waitForTimeout(3000);
});

When('カレンダー画面で会議をクリックする', async function () {
  // カレンダーが表示されているか確認
  await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  
  // 会議要素を探してクリック
  const meetingElements = await page.locator('.text-xs.p-1.rounded.truncate').all();
  
  if (meetingElements.length > 0) {
    await meetingElements[0].click();
  } else {
    throw new Error('No meeting elements found on the calendar');
  }
});

Then('会議詳細画面に {string} と表示される', async function (expectedTime) {
  // 会議詳細モーダルが表示されるまで待機
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  
  // 時刻表示を確認
  const timeText = await page.textContent('[role="dialog"]');
  expect(timeText).toContain(expectedTime);
});

When('編集ボタンをクリックする', async function () {
  await page.click('button:has-text("編集")');
  await page.waitForTimeout(1000);
});

Then('編集フォームの開始時刻に {string} が表示される', async function (expectedStartTime) {
  // フォームが表示されるまで待機
  await page.waitForSelector('#startTime', { timeout: 10000 });
  
  // 開始時刻の値を確認
  const startTimeValue = await page.inputValue('#startTime');
  
  // 時刻部分のみを抽出（HH:MM形式）
  const timeOnly = startTimeValue.split('T')[1]?.substring(0, 5) || startTimeValue.substring(11, 16);
  
  expect(timeOnly).toBe(expectedStartTime);
});

Then('編集フォームの終了時刻に {string} が表示される', async function (expectedEndTime) {
  // 終了時刻の値を確認
  const endTimeValue = await page.inputValue('#endTime');
  
  // 時刻部分のみを抽出（HH:MM形式）
  const timeOnly = endTimeValue.split('T')[1]?.substring(0, 5) || endTimeValue.substring(11, 16);
  
  expect(timeOnly).toBe(expectedEndTime);
});

When('タイトルを {string} に変更する', async function (newTitle) {
  await page.fill('[data-testid="meeting-title-input"]', '');
  await page.fill('[data-testid="meeting-title-input"]', newTitle);
});

When('開始時刻を {string} に変更する', async function (newStartTime) {
  // 現在の日付を保持したまま時刻だけ変更
  const currentValue = await page.inputValue('#startTime');
  const datePart = currentValue.split('T')[0];
  const newValue = `${datePart}T${newStartTime}`;
  
  await page.fill('#startTime', newValue);
});

When('終了時刻を {string} に変更する', async function (newEndTime) {
  // 現在の日付を保持したまま時刻だけ変更
  const currentValue = await page.inputValue('#endTime');
  const datePart = currentValue.split('T')[0];
  const newValue = `${datePart}T${newEndTime}`;
  
  await page.fill('#endTime', newValue);
});

When('更新ボタンをクリックする', async function () {
  await page.click('[data-testid="meeting-submit-button"]');
  
  // 成功メッセージが表示されるまで待機
  await page.waitForSelector('text=会議が更新されました', { timeout: 10000 });
  
  // フォームが閉じるまで待機
  await page.waitForSelector('[data-testid="meeting-title-input"]', { state: 'hidden', timeout: 10000 });
  
  // カレンダーが更新されるまで待機
  await page.waitForTimeout(3000);
});

Then('カレンダー画面に {string} が表示される', async function (expectedTitle) {
  // カレンダーに更新された会議が表示されることを確認
  // 会議要素のテキストには時刻も含まれるため、部分一致で検索
  await page.waitForSelector(`:text("${expectedTitle}")`, { timeout: 10000 });
});

When('更新された会議をクリックする', async function () {
  // 更新された会議をクリック（部分一致）
  await page.click(':text("更新された会議")');
  await page.waitForTimeout(1000);
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