class CalendarPage {
  constructor(page) {
    this.page = page;
    
    // セレクター定義
    this.selectors = {
      // メイン要素
      calendarView: '[data-testid="calendar-view"]',
      
      // ナビゲーション
      createMeetingButton: 'text=会議を作成',
      prevMonthButton: 'button:has(svg)', // ChevronLeftアイコンを含むボタン
      nextMonthButton: 'button:has(svg)', // ChevronRightアイコンを含むボタン
      
      // カレンダー要素
      monthHeader: '.text-2xl.font-semibold',
      calendarGrid: '.grid.grid-cols-7',
      dayHeaders: '.bg-muted.p-3.text-center.text-sm.font-medium',
      dateCells: '.min-h-24.p-2.cursor-pointer',
      
      // 会議要素
      meetingItems: '.text-xs.p-1.rounded.truncate',
      importantMeetings: '.bg-destructive.text-destructive-foreground',
      normalMeetings: '.bg-primary.text-primary-foreground',
      
      // トーストメッセージ
      toastSuccess: 'text=会議が作成されました',
      toastError: '[role="alert"]'
    };
  }

  // 🌐 ページに移動
  async navigate(url = 'http://localhost:3000') {
    await this.page.goto(url);
  }

  // 👁️ カレンダーが表示されているか確認
  async isCalendarVisible() {
    return await this.page.isVisible(this.selectors.calendarView);
  }

  // 👁️ カレンダーの表示を待機
  async waitForCalendarVisible() {
    await this.page.waitForSelector(this.selectors.calendarView);
  }

  // 📅 現在表示されている月を取得
  async getCurrentMonth() {
    return await this.page.textContent(this.selectors.monthHeader);
  }

  // ⬅️ 前月に移動
  async navigateToPreviousMonth() {
    await this.page.click(this.selectors.prevMonthButton);
  }

  // ➡️ 次月に移動
  async navigateToNextMonth() {
    await this.page.click(this.selectors.nextMonthButton);
  }

  // 📝 会議作成ボタンをクリック
  async clickCreateMeeting() {
    await this.page.click(this.selectors.createMeetingButton);
  }

  // 📅 特定の日付をクリック
  async clickDate(dayNumber) {
    await this.page.click(`text=${dayNumber}`);
  }

  // 👁️ 特定のボタンが表示されているか確認
  async isButtonVisible(buttonText) {
    return await this.page.isVisible(`text=${buttonText}`);
  }

  // 👁️ 特定のボタンの表示を待機
  async waitForButtonVisible(buttonText) {
    await this.page.waitForSelector(`text=${buttonText}`);
  }

  // 📋 カレンダー上の会議要素を取得
  async getMeetingElements() {
    return await this.page.locator(this.selectors.meetingItems).all();
  }

  // 📋 特定日の会議数を取得
  async getMeetingCountForDate(dayNumber) {
    const dateCell = this.page.locator(this.selectors.dateCells).filter({ hasText: dayNumber.toString() });
    const meetingElements = dateCell.locator(this.selectors.meetingItems);
    return await meetingElements.count();
  }

  // 🔥 重要な会議要素を取得
  async getImportantMeetings() {
    return await this.page.locator(this.selectors.importantMeetings).all();
  }

  // 📝 通常の会議要素を取得
  async getNormalMeetings() {
    return await this.page.locator(this.selectors.normalMeetings).all();
  }

  // 🎯 特定の会議をクリック
  async clickMeeting(meetingTitle) {
    await this.page.click(`text=${meetingTitle}`);
  }

  // ✅ 成功トーストの表示を待機
  async waitForSuccessToast() {
    await this.page.waitForSelector(this.selectors.toastSuccess, { timeout: 10000 });
  }

  // 🚨 エラートーストの表示を待機
  async waitForErrorToast() {
    await this.page.waitForSelector(this.selectors.toastError, { timeout: 10000 });
  }

  // 📄 ページタイトルを確認
  async hasTitle(expectedTitle) {
    return await this.page.title().then(title => title.includes(expectedTitle));
  }

  // 📄 ページタイトルの確認を待機
  async waitForTitle(expectedTitle) {
    await this.page.waitForFunction(
      (expected) => document.title.includes(expected),
      expectedTitle
    );
  }

  // 🎯 メインコンテンツが表示されているか確認
  async isMainContentVisible() {
    return await this.page.isVisible('body');
  }

  // 🎯 メインコンテンツの表示を待機
  async waitForMainContentVisible() {
    await this.page.waitForSelector('body');
  }

  // 🔍 特定のテキストが含まれているか確認
  async hasText(text) {
    return await this.page.locator(`text=${text}`).isVisible();
  }

  // 🔍 特定のテキストの表示を待機
  async waitForText(text, timeout = 10000) {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }
}

module.exports = CalendarPage;