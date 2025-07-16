const { Given, When, Then, After } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');

let browser;
let page;

Given('オーナーがログインしている', async function () {
  // ブラウザとページを初期化
  browser = await chromium.launch({ headless: true }); // headlessにして高速化
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
});

Then('会議が正常に作成される', async function () {
  // 成功トーストメッセージが表示されることを確認
  await page.waitForSelector('text=会議が作成されました', { timeout: 5000 });
  
  // フォームが閉じていることを確認
  await page.waitForSelector('[data-testid="meeting-title-input"]', { state: 'hidden' });
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
});