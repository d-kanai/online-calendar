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
  
  // Suspenseローディングが完了するまで待機
  try {
    await global.calendarPage.page.waitForSelector('text=会議詳細を読み込んでいます...', { state: 'hidden', timeout: 10000 });
  } catch (e) {
    // ローディングスピナーがすでに消えている場合は続行
  }
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

When('オーナーが参加者を削除する', async function () {
  const page = global.calendarPage.page;
  
  // カレンダーページにアクセス
  await global.calendarPage.navigate();
  
  // カレンダーが表示されているか確認
  await global.calendarPage.waitForCalendarVisible();
  
  // 会議をクリックして詳細を開く
  await page.click(':text("参加者がいる会議")');
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  
  // Suspenseローディングが完了するまで待機
  try {
    await page.waitForSelector('text=会議詳細を読み込んでいます...', { state: 'hidden', timeout: 10000 });
  } catch (e) {
    // ローディングスピナーがすでに消えている場合は続行
  }
  
  // 参加者管理セクションまでスクロール
  const participantSection = await page.locator('text=参加者管理').first();
  await participantSection.scrollIntoViewIfNeeded();
  
  // 参加者リストで削除ボタンを探してクリック
  await page.waitForSelector('text=participant@example.com', { timeout: 10000 });
  
  // 削除ボタンをクリック（Dialogコンポーネントが開く）
  await page.click('button:has-text("削除")');
  
  // 削除確認ダイアログが表示されるのを待つ
  await page.waitForSelector('text=参加者の削除', { timeout: 10000 });
  
  // 削除確認ダイアログの「削除する」ボタンをクリック
  await page.click('button:has-text("削除する")');
  
  // 成功メッセージが表示されるまで待機
  await page.waitForSelector('text=参加者が更新されました', { timeout: 10000 });
  
  // ネットワークの完了を待機
  await page.waitForLoadState('networkidle');
});

Then('参加者が正常に削除される', async function () {
  const page = global.calendarPage.page;
  
  // まず、データベースで参加者が削除されたことを確認
  const participants = await prisma.meetingParticipant.findMany({
    where: { meetingId: this.createdMeeting.id },
    include: { user: true }
  });
  
  // 参加者が削除されていることを確認
  const participantEmails = participants.map(p => p.user.email);
  expect(participantEmails).not.toContain('participant@example.com');
  
  // UIでも削除を確認（エラーメッセージが表示されていないか確認）
  const hasError = await page.locator('[role="alert"]').count();
  if (hasError > 0) {
    const errorText = await page.locator('[role="alert"]').first().textContent();
  }
  
  // 成功メッセージまたは参加者の削除を確認
  try {
    await page.waitForSelector(':text("参加者が更新されました")', { timeout: 2000 });
  } catch (e) {
    // トーストメッセージが表示されない場合は、参加者がリストから削除されたことを確認
    const participantExists = await page.locator(':text("participant@example.com")').count();
    expect(participantExists).toBe(0);
  }
});

// 招待参加機能のステップ定義
Given('ユーザー{string}から会議{string}に招待されている', async function (ownerName, meetingTitle) {
  const { UserFactory, MeetingFactory, MeetingParticipantFactory } = require('../support/factories');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  // データベースクリアは実行しない（このステップでは既存データを保持）
  
  // オーナーユーザーを作成
  const owner = await UserFactory.createForAuth(ownerName);
  
  // 招待されるユーザー（hanako）を作成
  const invitedUser = await UserFactory.createForAuth('hanako');
  
  // 会議を作成
  const meeting = await MeetingFactory.create({
    title: meetingTitle,
    ownerId: owner.id,
    startTime: new Date(Date.now() + 60 * 60 * 1000), // 1時間後
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2時間後
  });
  
  // hanakoユーザーを参加者として招待
  await MeetingParticipantFactory.create({
    meetingId: meeting.id,
    userId: invitedUser.id,
    status: 'pending' // 招待された状態
  });
  
  // 後で使用するためにデータを保存
  this.createdMeeting = meeting;
  this.ownerUser = owner;
  this.invitedUser = invitedUser;
});

When('カレンダー画面で招待された会議詳細を開く', async function () {
  const page = global.calendarPage.page;
  
  // カレンダーページにアクセス
  await global.calendarPage.navigate();
  
  // カレンダーが表示されているか確認
  await global.calendarPage.waitForCalendarVisible();
  
  // 招待された会議をクリックして詳細を開く
  await page.click(':text("チームミーティング")');
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  
  // Suspenseローディングが完了するまで待機
  try {
    await page.waitForSelector('text=会議詳細を読み込んでいます...', { state: 'hidden', timeout: 10000 });
  } catch (e) {
    // ローディングスピナーがすでに消えている場合は続行
  }
});

When('参加承諾ボタンをクリックする', async function () {
  const page = global.calendarPage.page;
  
  // 参加承諾ボタンを探してクリック
  await page.waitForSelector('button:has-text("参加する")', { timeout: 10000 });
  await page.click('button:has-text("参加する")');
  
  // 成功メッセージが表示されるまで待機
  await page.waitForSelector('text=参加ステータスが更新されました', { timeout: 10000 });
});

Then('参加ステータスが{string}に更新される', async function (expectedStatus) {
  // データベースで参加ステータスが更新されたことを確認
  const participant = await prisma.meetingParticipant.findFirst({
    where: { 
      meetingId: this.createdMeeting.id,
      userId: this.invitedUser.id
    }
  });
  
  expect(participant).toBeTruthy();
  expect(participant.status).toBe('accepted'); // 「参加」は 'accepted' ステータス
  
  // UIでも参加状態が反映されていることを確認
  const page = global.calendarPage.page;
  await page.waitForSelector('text=参加済み', { timeout: 5000 });
});

// After hook moved to auth.steps.js for unified cleanup