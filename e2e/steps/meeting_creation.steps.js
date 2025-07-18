const { When, Then, setDefaultTimeout } = require('@cucumber/cucumber');

// タイムアウトを60秒に設定
setDefaultTimeout(60000);

When('title {string}, period {string}, important flag {string} で会議を作成する', async function (title, period, importantFlag) {
  // Page Objectを使用した会議作成フロー
  await global.meetingFormPage.createMeeting(title, period, importantFlag);
});

When('period {string} で会議を作成する', async function (period) {
  // Page Objectを使用した期間指定会議作成
  await global.meetingFormPage.createMeetingWithPeriod(period);
});

Then('会議が正常に作成される', async function () {
  // Page Objectを使用した成功確認
  await global.meetingFormPage.waitForSuccessMessage();
  await global.meetingFormPage.waitForFormClosed();
});

When('title, period, important flag のいずれかが未入力で会議を作成する', async function () {
  // Page Objectを使用した空フィールド会議作成試行
  await global.meetingFormPage.createMeetingWithEmptyFields();
});

Then('フォームに {string} エラーが表示される', async function (expectedErrorMessage) {
  // フォーム内のエラーメッセージ用
  await global.meetingFormPage.waitForErrorMessage(expectedErrorMessage);
});


When('参加者が会議を更新しようとする', async function () {
  // カレンダー画面に移動
  await global.calendarPage.navigate();
  await global.calendarPage.page.waitForLoadState('networkidle');
  
  // 会議をクリックして詳細画面を開く
  await global.calendarPage.page.click(':text("他のユーザーの会議")');
  await global.calendarPage.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  
  // 参加者には編集ボタンが表示されないことを確認するため、何もしない
  // エラーメッセージのチェックは次のThenステップで行う
});

When('オーナーが会議を更新しようとする', async function () {
  // カレンダー画面に移動
  await global.calendarPage.navigate();
  await global.calendarPage.page.waitForLoadState('networkidle');
  
  // 会議をクリックして詳細画面を開く
  await global.calendarPage.page.click(':text("開始済みの会議")');
  await global.calendarPage.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  
  
  // 開始済みの会議では編集ボタンが表示されないことを確認するため、
  // このステップでは何もしない（検証は次のThenステップで行う）
});

// After hook moved to auth.steps.js for unified cleanup