const { Given, When, Then, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
const { PrismaClient } = require('@prisma/client');

// タイムアウトを60秒に設定
setDefaultTimeout(60000);

const prisma = new PrismaClient();

let browser;
let page;

Given('オーナーがログインしている', async function () {
  // データベースリセット - 全テーブルをクリア
  await prisma.meeting.deleteMany();
  
  // ブラウザとページを初期化
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  
  // トップページにアクセス（ログイン済み状態と仮定）
  await page.goto('http://localhost:3000');
});

When('title {string}, period {string}, important flag {string} で会議を作成する', async function (title, period, importantFlag) {
  // 会議を作成ボタンをクリック
  await page.click('text=会議を作成');
  
  // フォームが表示されるまで待機
  await page.waitForSelector('[data-testid="meeting-title-input"]');
  
  // タイトルを入力
  await page.fill('[data-testid="meeting-title-input"]', title);
  
  // 開始時刻と終了時刻を設定（30分の期間の場合）
  const now = new Date();
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
  const endTime = new Date(startTime);
  if (period === '30分') {
    endTime.setMinutes(startTime.getMinutes() + 30);
  }
  
  const startTimeString = startTime.toISOString().slice(0, 16);
  const endTimeString = endTime.toISOString().slice(0, 16);
  
  await page.fill('#startTime', startTimeString);
  await page.fill('#endTime', endTimeString);
  
  // 重要フラグを設定
  const isImportant = importantFlag === 'true';
  const switchElement = page.locator('[data-testid="meeting-important-switch"]');
  const isChecked = await switchElement.getAttribute('aria-checked') === 'true';
  
  if (isImportant !== isChecked) {
    await switchElement.click();
  }
  
  // 作成ボタンをクリック
  await page.click('[data-testid="meeting-submit-button"]');
  
  // フォームが閉じるまで待つ（処理完了の指標）
  await page.waitForSelector('[data-testid="meeting-title-input"]', { state: 'hidden', timeout: 10000 });
});

Then('会議が正常に作成される', async function () {
  // 成功トーストメッセージが表示されることを確認
  await page.waitForSelector('text=会議が作成されました', { timeout: 10000 });
  
  // フォームが閉じていることを確認
  await page.waitForSelector('[data-testid="meeting-title-input"]', { state: 'hidden' });
});

When('title, period, important flag のいずれかが未入力で会議を作成する', async function () {
  // 会議を作成ボタンをクリック
  await page.click('text=会議を作成');
  
  // フォームが表示されるまで待機
  await page.waitForSelector('[data-testid="meeting-title-input"]');
  
  // 必須項目を空のままにして作成ボタンをクリック
  // タイトルは空のまま
  // 開始時刻、終了時刻も空のまま
  
  // 作成ボタンをクリック
  await page.click('[data-testid="meeting-submit-button"]');
});

Then('{string} エラーが表示される', async function (expectedErrorMessage) {
  // エラーメッセージが表示されることを確認
  await page.waitForSelector(`text=${expectedErrorMessage}`, { timeout: 10000 });
  
  // フォームがまだ開いていることを確認（エラーのため閉じない）
  await page.waitForSelector('[data-testid="meeting-title-input"]', { state: 'visible' });
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