class MeetingFormPage {
  constructor(page) {
    this.page = page;
    
    // セレクター定義
    this.selectors = {
      // ボタン
      createMeetingButton: 'text=会議を作成',
      submitButton: '[data-testid="meeting-submit-button"]',
      
      // フォーム要素
      titleInput: '[data-testid="meeting-title-input"]',
      startTimeInput: '#startTime',
      endTimeInput: '#endTime',
      importantSwitch: '[data-testid="meeting-important-switch"]',
      
      // メッセージ
      successToast: 'text=会議が作成されました',
      errorAlert: '[role="alert"]'
    };
  }

  // 🎯 会議作成フォームを開く
  async openCreateMeetingForm() {
    await this.page.click(this.selectors.createMeetingButton);
    await this.page.waitForSelector(this.selectors.titleInput);
  }

  // 📝 タイトルを入力
  async fillTitle(title) {
    await this.page.fill(this.selectors.titleInput, title);
  }

  // ⏰ 期間を設定（開始時刻から期間分数で終了時刻を計算）
  async setPeriod(periodText) {
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
    const endTime = new Date(startTime);
    
    // 期間の解析（例: "30分", "10分"）
    const periodMatch = periodText.match(/(\d+)分/);
    if (periodMatch) {
      const minutes = parseInt(periodMatch[1]);
      endTime.setMinutes(startTime.getMinutes() + minutes);
    }
    
    const startTimeString = startTime.toISOString().slice(0, 16);
    const endTimeString = endTime.toISOString().slice(0, 16);
    
    await this.page.fill(this.selectors.startTimeInput, startTimeString);
    await this.page.fill(this.selectors.endTimeInput, endTimeString);
  }

  // ⏰ 開始時刻と終了時刻を直接設定
  async setDateTime(startTime, endTime) {
    const startTimeString = startTime.toISOString().slice(0, 16);
    const endTimeString = endTime.toISOString().slice(0, 16);
    
    await this.page.fill(this.selectors.startTimeInput, startTimeString);
    await this.page.fill(this.selectors.endTimeInput, endTimeString);
  }

  // 🔥 重要フラグを設定
  async setImportantFlag(isImportant) {
    const switchElement = this.page.locator(this.selectors.importantSwitch);
    const isChecked = await switchElement.getAttribute('aria-checked') === 'true';
    
    if (isImportant !== isChecked) {
      await switchElement.click();
    }
  }

  // 📤 フォームを送信
  async submit() {
    await this.page.click(this.selectors.submitButton);
  }

  // 📤 フォームを送信して完了まで待機
  async submitAndWaitForCompletion() {
    await this.submit();
    await this.page.waitForSelector(this.selectors.titleInput, { state: 'hidden', timeout: 10000 });
  }

  // ✅ 成功メッセージの確認
  async waitForSuccessMessage() {
    await this.page.waitForSelector(this.selectors.successToast, { timeout: 10000 });
  }

  // 🚨 エラーメッセージの確認
  async waitForErrorMessage(expectedErrorMessage) {
    await this.page.waitForSelector(this.selectors.errorAlert, { timeout: 10000 });
    
    const alertContent = await this.page.textContent(this.selectors.errorAlert);
    if (!alertContent.includes(expectedErrorMessage)) {
      throw new Error(`Expected error message "${expectedErrorMessage}" not found. Actual content: "${alertContent}"`);
    }
  }

  // 👁️ フォームが開いているかの確認
  async isFormVisible() {
    return await this.page.isVisible(this.selectors.titleInput);
  }

  // 👁️ フォームが閉じているかの確認
  async waitForFormClosed() {
    await this.page.waitForSelector(this.selectors.titleInput, { state: 'hidden' });
  }

  // 👁️ フォームが開いているかの確認（エラー時）
  async waitForFormStillVisible() {
    await this.page.waitForSelector(this.selectors.titleInput, { state: 'visible' });
  }

  // 🎯 完全な会議作成フロー（タイトル、期間、重要フラグ）
  async createMeeting(title, period, importantFlag) {
    await this.openCreateMeetingForm();
    await this.fillTitle(title);
    await this.setPeriod(period);
    await this.setImportantFlag(importantFlag === 'true');
    await this.submitAndWaitForCompletion();
  }

  // 🎯 期間のみ指定の簡単会議作成
  async createMeetingWithPeriod(period) {
    await this.openCreateMeetingForm();
    await this.fillTitle('テスト会議');
    await this.setPeriod(period);
    await this.submit();
  }

  // 🎯 空フィールドでの会議作成試行
  async createMeetingWithEmptyFields() {
    await this.openCreateMeetingForm();
    // 必須項目を空のままにして送信
    await this.submit();
  }
}

module.exports = MeetingFormPage;