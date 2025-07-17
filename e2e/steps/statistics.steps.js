const { Given, When, Then } = require('@cucumber/cucumber');
const { PrismaClient } = require('@prisma/client');
const { UserFactory } = require('../support/factories');

const prisma = new PrismaClient();

Given('過去7日間の会議時間が以下の通りである:', async function (dataTable) {
  // 今日を基準に日付を計算
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  
  // テーブルデータを処理
  const rows = dataTable.hashes();
  
  for (const row of rows) {
    const daysAgo = parseInt(row['日前']);
    const minutes = parseInt(row['合計時間(分)']);
    
    if (minutes > 0) {
      // 指定された日数前の日付を計算
      const meetingDate = new Date(today);
      meetingDate.setDate(today.getDate() - daysAgo);
      
      // 会議の開始時刻と終了時刻を設定
      const startTime = new Date(meetingDate);
      startTime.setHours(10, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + minutes);
      
      
      // 会議を作成
      await prisma.meeting.create({
        data: {
          title: `${daysAgo}日前の会議`,
          startTime: startTime,
          endTime: endTime,
          ownerId: this.currentUser.id,
          isImportant: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  }
  
});

When('会議統計画面を開く', async function () {
  if (global.calendarPage && global.calendarPage.page) {
    
    // 統計画面に移動
    await global.calendarPage.page.goto('http://localhost:3000/stats');
    
    // 統計画面が読み込まれるまで待機
    await global.calendarPage.page.waitForSelector('[data-testid="stats-view"]', { timeout: 10000 });
    
  }
});

Then('1日あたりの平均会議時間は {string} と表示される', async function (expectedAverage) {
  if (global.calendarPage && global.calendarPage.page) {
    // 平均会議時間の表示を確認
    const averageElement = await global.calendarPage.page.waitForSelector('[data-testid="daily-average-time"]', { timeout: 5000 });
    const displayedAverage = await averageElement.textContent();
    
    if (displayedAverage !== expectedAverage) {
      throw new Error(`Expected average: ${expectedAverage}, but got: ${displayedAverage}`);
    }
    
  }
});