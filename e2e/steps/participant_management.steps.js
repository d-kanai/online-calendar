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

Given('オーナーが作成した会議がある', async function () {
  // データベースリセット - 全テーブルをクリア
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();
  
  // ブラウザとページを初期化
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  
  // Page Objectインスタンスを作成
  calendarPage = new CalendarPage(page);
  meetingFormPage = new MeetingFormPage(page);
  
  // オーナーユーザーを作成
  const owner = await prisma.user.create({
    data: {
      email: 'taro@example.com',
      name: 'taro'
    }
  });
  
  // 明日の会議を作成
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(15, 0, 0, 0);
  
  // テスト用会議をPrisma直接でDBに作成
  const meeting = await prisma.meeting.create({
    data: {
      title: 'チームミーティング',
      startTime: tomorrow,
      endTime: endTime,
      isImportant: false,
      ownerId: owner.id
    }
  });
  
  createdMeetingId = meeting.id;
  
  // トップページにアクセス
  await calendarPage.navigate();
  
  // ページが読み込まれて会議が表示されるまで待機
  await page.waitForTimeout(3000);
  
  // 会議をクリックして詳細を開く
  await page.click(':text("チームミーティング")');
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
});

When('オーナーが新しい参加者を招待する', async function () {
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
  // 参加者リストに新しい参加者が表示されることを確認
  await page.waitForSelector('text=hanako@example.com', { timeout: 10000 });
  
  // データベースで参加者が追加されたことを確認
  const participants = await prisma.meetingParticipant.findMany({
    where: { meetingId: createdMeetingId },
    include: { user: true }
  });
  
  // 参加者が追加されていることを確認
  const participantEmails = participants.map(p => p.user.email);
  expect(participantEmails).toContain('hanako@example.com');
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