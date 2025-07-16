const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { PrismaClient } = require('@prisma/client');

// タイムアウトを60秒に設定
setDefaultTimeout(60000);

const prisma = new PrismaClient();

// 古いGivenステップは削除 - auth.steps.jsの共通ステップを使用

When('カレンダー画面で会議をクリックする', async function () {
  
  // カレンダーページにアクセス
  await global.calendarPage.navigate();
  
  // カレンダーが表示されているか確認
  await global.calendarPage.page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  
  // 会議要素を探してクリック
  const meetingElements = await global.calendarPage.page.locator('.text-xs.p-1.rounded.truncate').all();
  
  if (meetingElements.length > 0) {
    await meetingElements[0].click();
  } else {
    throw new Error('No meeting elements found on the calendar');
  }
});

Then('会議詳細画面に {string} と表示される', async function (expectedTime) {
  
  // 会議詳細モーダルが表示されるまで待機
  await global.calendarPage.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  
  // 時刻表示を確認
  const timeText = await global.calendarPage.page.textContent('[role="dialog"]');
  expect(timeText).toContain(expectedTime);
});

When('編集ボタンをクリックする', async function () {
  await global.calendarPage.page.click('button:has-text("編集")');
  await global.calendarPage.page.waitForSelector('[data-testid="meeting-title-input"]', { timeout: 10000 });
});

Then('編集フォームの開始時刻に {string} が表示される', async function (expectedStartTime) {
  // フォームが表示されるまで待機
  await global.calendarPage.page.waitForSelector('#startTime', { timeout: 10000 });
  
  // 開始時刻の値を確認
  const startTimeValue = await global.calendarPage.page.inputValue('#startTime');
  
  // 時刻部分のみを抽出（HH:MM形式）
  const timeOnly = startTimeValue.split('T')[1]?.substring(0, 5) || startTimeValue.substring(11, 16);
  
  expect(timeOnly).toBe(expectedStartTime);
});

Then('編集フォームの終了時刻に {string} が表示される', async function (expectedEndTime) {
  // 終了時刻の値を確認
  const endTimeValue = await global.calendarPage.page.inputValue('#endTime');
  
  // 時刻部分のみを抽出（HH:MM形式）
  const timeOnly = endTimeValue.split('T')[1]?.substring(0, 5) || endTimeValue.substring(11, 16);
  
  expect(timeOnly).toBe(expectedEndTime);
});

When('タイトルを {string} に変更する', async function (newTitle) {
  await global.calendarPage.page.fill('[data-testid="meeting-title-input"]', '');
  await global.calendarPage.page.fill('[data-testid="meeting-title-input"]', newTitle);
});

When('開始時刻を {string} に変更する', async function (newStartTime) {
  // 現在の日付を保持したまま時刻だけ変更
  const currentValue = await global.calendarPage.page.inputValue('#startTime');
  const datePart = currentValue.split('T')[0];
  const newValue = `${datePart}T${newStartTime}`;
  
  await global.calendarPage.page.fill('#startTime', newValue);
});

When('終了時刻を {string} に変更する', async function (newEndTime) {
  // 現在の日付を保持したまま時刻だけ変更
  const currentValue = await global.calendarPage.page.inputValue('#endTime');
  const datePart = currentValue.split('T')[0];
  const newValue = `${datePart}T${newEndTime}`;
  
  await global.calendarPage.page.fill('#endTime', newValue);
});

When('更新ボタンをクリックする', async function () {
  await global.calendarPage.page.click('[data-testid="meeting-submit-button"]');
  
  // 成功メッセージが表示されるまで待機
  await global.calendarPage.page.waitForSelector('text=会議が更新されました', { timeout: 10000 });
  
  // フォームが閉じるまで待機
  await global.calendarPage.page.waitForSelector('[data-testid="meeting-title-input"]', { state: 'hidden', timeout: 10000 });
  
  // カレンダーが更新されるまで待機
  await global.calendarPage.page.waitForTimeout(3000);
});

Then('カレンダー画面に {string} が表示される', async function (expectedTitle) {
  // カレンダーに更新された会議が表示されることを確認
  // 会議要素のテキストには時刻も含まれるため、部分一致で検索
  await global.calendarPage.page.waitForSelector(`:text("${expectedTitle}")`, { timeout: 10000 });
});

When('更新された会議をクリックする', async function () {
  // 更新された会議をクリック（部分一致）
  await global.calendarPage.page.click(':text("更新された会議")');
  await global.calendarPage.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
});

// After hook moved to hook.steps.js for unified cleanup