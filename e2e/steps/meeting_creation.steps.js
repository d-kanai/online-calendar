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

Then('{string} エラーが表示される', async function (expectedErrorMessage) {
  // Page Objectを使用したエラー確認
  await global.meetingFormPage.waitForErrorMessage(expectedErrorMessage);
  await global.meetingFormPage.waitForFormStillVisible();
});

// After hook moved to auth.steps.js for unified cleanup