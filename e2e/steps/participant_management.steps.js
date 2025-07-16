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

// 古いGivenステップは削除 - auth.steps.jsの共通ステップを使用

When('カレンダー画面で会議詳細を開く', async function () {
  // カレンダーページにアクセス
  await global.calendarPage.navigate();
  
  // カレンダーが表示されているか確認
  await global.calendarPage.waitForCalendarVisible();
  
  // 会議をクリックして詳細を開く
  await global.calendarPage.page.click(':text("チームミーティング")');
  await global.calendarPage.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
});

When('オーナーが新しい参加者を招待する', async function () {
  const page = global.calendarPage.page;
  
  // 参加者管理セクションまでスクロール
  const participantSection = await page.locator('text=参加者管理').first();
  await participantSection.scrollIntoViewIfNeeded();
  
  // 参加者入力フォームが表示されるまで待機
  await page.waitForSelector('[placeholder="参加者のメールアドレス"]', { timeout: 10000 });
  
  // 新しい参加者のメールアドレスを入力
  await page.fill('[placeholder="参加者のメールアドレス"]', 'hanako@example.com');
  
  // 参加者追加セクション内のボタンをクリック
  const addButton = await page.locator('[placeholder="参加者のメールアドレス"]').locator('..').locator('button').first();
  await addButton.click();
  
  // 成功メッセージが表示されるまで待機
  await page.waitForSelector('text=参加者が更新されました', { timeout: 10000 });
});

Then('参加者が正常に追加される', async function () {
  const page = global.calendarPage.page;
  
  // 参加者リストに新しい参加者が表示されることを確認
  await page.waitForSelector('text=hanako@example.com', { timeout: 10000 });
  
  // データベースで参加者が追加されたことを確認
  const participants = await prisma.meetingParticipant.findMany({
    where: { meetingId: this.createdMeeting.id },
    include: { user: true }
  });
  
  // 参加者が追加されていることを確認
  const participantEmails = participants.map(p => p.user.email);
  expect(participantEmails).toContain('hanako@example.com');
});

// After hook moved to auth.steps.js for unified cleanup