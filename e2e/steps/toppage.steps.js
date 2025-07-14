const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');

let browser;
let page;

Given('ユーザーがブラウザを開いている', async function () {
  browser = await chromium.launch({ headless: false });
  page = await browser.newPage();
});

When('トップページにアクセスする', async function () {
  await page.goto('http://localhost:3000');
});

Then('ページタイトルに {string} が含まれている', async function (expectedTitle) {
  await expect(page).toHaveTitle(new RegExp(expectedTitle));
});

Then('メインコンテンツが表示されている', async function () {
  await expect(page.locator('body')).toBeVisible();
});

Then('{string} ボタンが表示されている', async function (buttonText) {
  await expect(page.locator(`text=${buttonText}`)).toBeVisible();
});

Then('カレンダーが表示されている', async function () {
  await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
});

// After hook to clean up
const { After } = require('@cucumber/cucumber');
After(async function () {
  if (page) {
    await page.close();
  }
  if (browser) {
    await browser.close();
  }
});