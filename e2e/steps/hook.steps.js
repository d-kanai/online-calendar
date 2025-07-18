const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('@playwright/test');
const CalendarPage = require('../page-objects/CalendarPage');
const MeetingFormPage = require('../page-objects/MeetingFormPage');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
let browser;
let page;

// グローバル変数としてPage Objectを定義
global.calendarPage = null;
global.meetingFormPage = null;

// テストスイート開始時にブラウザを起動
BeforeAll(async function () {
  // スクリーンショット保存ディレクトリを作成
  const screenshotsDir = path.join(process.cwd(), 'e2e', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // 環境変数でheadlessモードを制御（デフォルトはheadless）
  const headless = process.env.E2E_HEADLESS !== 'false';
  const isDebugMode = process.env.E2E_HEADLESS === 'false';
  
  browser = await chromium.launch({ headless });
  page = await browser.newPage();
  
  // ブラウザのコンソールログを常に出力
  page.on('console', async msg => {
    const type = msg.type();
    const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => arg.toString())));
    console.log(`[Browser ${type}]`, ...args);
  });
  
  page.on('pageerror', error => {
    console.error('[Browser Error]', error.message);
  });
  
  page.on('requestfailed', request => {
    if (!request.url().includes('_next/static')) {
      console.error('[Network Error]', `${request.method()} ${request.url()} failed: ${request.failure().errorText}`);
    }
  });
  
  // APIレスポンスをログ出力
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log(`[API] ${response.status()} ${response.url()}`);
      if (response.status() >= 400) {
        try {
          const body = await response.text();
          console.error('[API Error Response]', body);
        } catch (e) {
          console.error('[API Error] Could not read response body');
        }
      }
    }
  });
  
  // Page Objectインスタンスを作成
  global.calendarPage = new CalendarPage(page);
  global.meetingFormPage = new MeetingFormPage(page);
});

// テストスイート終了時にブラウザを終了
AfterAll(async function () {
  try {
    if (page) {
      await page.close();
      page = null;
    }
    if (browser) {
      await browser.close();
      browser = null;
    }
    await prisma.$disconnect();
  } catch (error) {
    console.log('Cleanup error:', error);
  }
});

// Before hook for scenario logging
Before(async function (scenario) {
  console.log(`\n🚀 Starting scenario: ${scenario.pickle.name}`);
});

// After hook for cleanup between scenarios
After(async function (scenario) {
  const status = scenario.result.status;
  
  // FAILEDの場合、スクリーンショットとデバッグ情報を取得
  if (status === Status.FAILED && page) {
    try {
      // デバッグ情報を収集
      console.log('\n=== 🐛 Debug Information ===');
      
      // ブラウザのコンソールログを取得
      const consoleLogs = await page.evaluate(() => {
        const logs = [];
        // ブラウザの履歴からログを取得（実際のブラウザAPIでは不可能なので、代替案）
        return logs;
      });
      
      // 現在のURLを出力
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // ページタイトルを出力
      const pageTitle = await page.title();
      console.log(`Page Title: ${pageTitle}`);
      
      // エラーメッセージが表示されているか確認
      const errorElements = await page.locator('[role="alert"]').all();
      if (errorElements.length > 0) {
        console.log('\n🚨 Error Messages Found:');
        for (const element of errorElements) {
          const text = await element.textContent();
          console.log(`  - ${text}`);
        }
      }
      
      // スクリーンショットを保存
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const featureName = scenario.pickle.uri.split('/').pop().replace('.feature', '');
      const scenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
      const screenshotPath = path.join(
        process.cwd(),
        'e2e',
        'screenshots',
        `${featureName}_${scenarioName}_${timestamp}.png`
      );
      
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
      console.log('=== End Debug Information ===\n');
      
    } catch (error) {
      console.error('Error capturing debug information:', error);
    }
  }
  
  // シナリオ間でページを再利用するため、各シナリオ後はページをクリアのみ
  if (page) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
  
  const statusEmoji = status === 'PASSED' ? '✅' : '❌';
  console.log(`${statusEmoji} Scenario completed: ${scenario.pickle.name} (${status})`);
});