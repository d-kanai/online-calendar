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

Given('作成した会議がある', async function () {
  
  // ブラウザとページを初期化
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  
  // ページエラーをキャッチ（デバッグ用）
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // Page Objectインスタンスを作成
  calendarPage = new CalendarPage(page);
  meetingFormPage = new MeetingFormPage(page);
  
  // 現在のユーザー（Backgroundで作成済み）を取得
  const owner = this.currentUser;
  
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
    id: owner.id,
    email: owner.email,
    name: owner.name,
    createdAt: new Date(owner.createdAt)
  });
  
  // ページをリロードして認証状態を反映
  await page.reload();
  
  // カレンダーが表示されるまで待機（認証完了を確認）
  await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  
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

// After hook moved to auth.steps.js for unified cleanup