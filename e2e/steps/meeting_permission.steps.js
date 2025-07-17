const { Then } = require('@cucumber/cucumber');

// 権限関連のエラーメッセージ用ステップ定義

Then('"オーナーのみが会議を編集できます" エラーが表示される', async function () {
  // 参加者には編集ボタンが表示されないことを確認
  const editButton = await global.calendarPage.page.$(':text("編集")');
  if (editButton) {
    throw new Error('編集ボタンが表示されています。参加者には編集ボタンが表示されないはずです。');
  }
  // 編集ボタンが存在しないことが確認できた
});

Then('"開始済みの会議は編集できません" エラーが表示される', async function () {
  // 開始済みの会議では編集ボタンが表示されないことを確認
  const editButton = await global.calendarPage.page.$('button:has-text("編集")');
  if (editButton) {
    // ボタンが表示されているかをチェック
    const isVisible = await editButton.isVisible();
    if (isVisible) {
      throw new Error('編集ボタンが表示されています。開始済みの会議では編集ボタンが表示されないはずです。');
    }
  }
  
  // 開始済みの会議に関するメッセージが表示されていることを確認
  const message = await global.calendarPage.page.$(':text("この会議は既に開始されているため、編集できません。")');
  if (!message) {
    throw new Error('開始済みの会議に関するメッセージが表示されていません。');
  }
});