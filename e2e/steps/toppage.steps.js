const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
const CalendarPage = require('../page-objects/CalendarPage');

let browser;
let page;
let calendarPage;

Given('ユーザーがブラウザを開いている', async function () {
  browser = await chromium.launch({ headless: false });
  page = await browser.newPage();
  
  // Page Objectインスタンスを作成
  calendarPage = new CalendarPage(page);
});

When('トップページにアクセスする', async function () {
  await calendarPage.navigate();
});

Then('ページタイトルに {string} が含まれている', async function (expectedTitle) {
  await calendarPage.waitForTitle(expectedTitle);
});

Then('メインコンテンツが表示されている', async function () {
  await calendarPage.waitForMainContentVisible();
});

Then('{string} ボタンが表示されている', async function (buttonText) {
  await calendarPage.waitForButtonVisible(buttonText);
});

Then('カレンダーが表示されている', async function () {
  await calendarPage.waitForCalendarVisible();
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