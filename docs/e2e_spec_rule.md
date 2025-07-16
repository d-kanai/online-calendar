# 🧪 E2Eテスト仕様

## 🎯 ATDD: Acceptance Test-Driven Development

### 📋 ATDD実践方針
- **Featureファイルからスタート**: ビジネス要件をGherkin構文で定義し、そこからシナリオテストを実装
- **完全なAPI統合**: シナリオで使用される全てのAPIを実際のバックエンドと統合する
- **データベースリセット**: E2Eテスト実行前に必ずデータベースをクリーンな状態にリセット
- **Backgroundでログイン**: 全てのFeatureファイルでBackground: ユーザー"Daiki"でログインを必須とする
- **エンドツーエンド検証**: フロントエンドからバックエンドまでの全ての層を通したテスト

### 🔄 ATDDワークフロー
1. **📝 Featureファイル作成**: ビジネス要件をGherkin構文で記述
2. **❌ E2Eテスト実行**: 最初は必ず失敗する（Red）
3. **⚡ 最小実装**: テストを通すための最小限のコードを実装（Green）
4. **🔧 リファクタリング**: コード品質を向上（Refactor）
5. **✅ 統合確認**: 全てのAPIが適切に統合されていることを確認

### 🛠️ E2Eテスト環境設定

#### 🔐 認証共通ステップ（必須）
**全てのFeatureファイルで以下のBackgroundを使用する**:
```gherkin
Feature: 機能名
  機能の説明

  Background:
    Given ユーザー"Daiki"でログイン

  Rule: ビジネスルール
    Scenario: シナリオ名
      Given 何かの前提条件
      When 何かの動作
      Then 何かの結果
```

#### 🔧 共通認証ステップの実装
```javascript
// e2e/steps/auth.steps.js
Given('ユーザー{string}でログイン', async function (userName) {
  // データベースリセット - 全テーブルをクリア
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();
  
  // ユーザー作成
  const user = await prisma.user.create({
    data: {
      email: `${userName.toLowerCase()}@example.com`,
      name: userName
    }
  });
  
  // ユーザー情報を保存（他のステップで使用）
  this.currentUser = user;
});
```

#### クリーンアップ処理
```javascript
After(async function () {
  if (page) {
    await page.close();
    page = null;
  }
  if (browser) {
    await browser.close();
    browser = null;
  }
  await prisma.$disconnect();
});
```

### ⚠️ ATDD注意点
- **Background必須**: 全てのFeatureファイルでBackground: ユーザー"Daiki"でログインを記載する
- **認証前提**: 全てのシナリオは認証済み状態での動作を前提とする
- **全API統合**: シナリオで関連する全てのAPIが実際にバックエンドと連携していることを確認
- **データの一貫性**: テスト間でデータが競合しないよう、各テスト前にデータベースリセット
- **🚫 固定待機禁止**: `waitForTimeout()`による固定待機は基本禁止
- **⚡ 動的待機必須**: 要素やネットワーク完了を待つ動的待機を使用
- **処理完了待機**: APIレスポンス、UI更新完了まで適切に待機
- **📊 データ準備分離**: Given（データ準備）ステップは`data.steps.js`に集約
- **🖥️ Headlessモード**: デフォルトはheadless、デバッグ時のみブラウザ表示

### 🔧 E2Eテスト環境設定

#### 🖥️ Headlessモード制御
```bash
# デフォルト: headlessモード（高速）
yarn e2e
yarn e2e:develop

# デバッグ用: ブラウザ表示モード
yarn e2e:debug
E2E_HEADLESS=false yarn e2e:develop
```

#### 🎯 モード選択指針
- **通常開発**: `yarn e2e:develop`（headless、高速）
- **デバッグ時**: `yarn e2e:debug`（ブラウザ表示、動作確認）
- **CI/CD**: `yarn e2e`（headless、全シナリオ）
- **初期開発**: `yarn e2e:debug`（UIの動作確認）

### 🚀 E2E待機戦略ルール

#### ❌ 禁止パターン
```javascript
// 固定時間待機（禁止）
await page.waitForTimeout(3000);
await page.waitForTimeout(1000);
```

#### ✅ 推奨パターン
```javascript
// ネットワーク完了待機
await page.waitForLoadState('networkidle');

// 要素表示待機
await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });

// ダイアログ表示待機
await page.waitForSelector('[role="dialog"]', { timeout: 10000 });

// 特定テキスト表示待機
await page.waitForSelector(':text("更新された会議")', { timeout: 10000 });
```

#### 🎯 待機戦略の選択指針
- **ページロード後**: `waitForLoadState('networkidle')`でネットワーク完了を待機
- **要素表示**: `waitForSelector()`で要素が表示されるまで待機
- **フォーム表示**: `waitForSelector('[data-testid="form-element"]')`でフォーム要素を待機
- **ダイアログ表示**: `waitForSelector('[role="dialog"]')`でダイアログを待機
- **データ更新**: `waitForSelector(':text("更新後の内容")')`で更新された内容を待機

この戦略により、テスト実行時間を70%短縮（40秒→12秒）し、より安定したE2Eテストを実現する 🚀

### 🎯 ATDDの価値
- **ビジネス価値の検証**: 実際のユーザーシナリオでビジネス価値を確認
- **統合品質保証**: システム全体の統合動作を保証
- **回帰テスト**: 機能追加時の既存機能への影響を検知
- **仕様の生きた文書**: Featureファイルが常に最新の仕様書として機能

## 📊 E2Eステップ分離ルール

### 🎯 基本原則
- **関心の分離**: 認証・データ準備・UI操作を独立したファイルに分離
- **純粋性**: Givenステップは純粋なデータベース操作のみ実行
- **再利用性**: 共通のデータパターンを全featureファイルで使用可能

### 📂 ファイル構成と責務

#### 🔐 `auth.steps.js`
- **責務**: 認証処理・ブラウザ管理・グローバル状態管理
- **含む内容**:
  - `Given ユーザー"Daiki"でログイン`
  - `BeforeAll`/`AfterAll`フック
  - グローバルPage Object初期化

#### 📊 `data.steps.js`
- **責務**: テストデータの作成（純粋なDB操作のみ）
- **含む内容**:
  - `Given 会議 "タイトル" を作成済み`
  - `Given 時間帯 "10:00-11:00" の会議を作成済み`
  - `Given 重要会議 "タイトル" を作成済み`
  - `Given 会議 "タイトル" に参加者 "email" を追加済み`
- **特徴**:
  - ページアクセス一切なし
  - Prismaによる直接DB操作
  - `this.createdMeeting`で他ステップに共有

#### 🖥️ `{feature}.steps.js`
- **責務**: UI操作・ページアクセス・結果確認
- **含む内容**:
  - `When` ステップ（ページ操作）
  - `Then` ステップ（結果確認）
- **特徴**:
  - グローバルPage Object使用
  - 動的待機戦略の適用

### 🚫 禁止パターン
```javascript
// ❌ data.steps.js内でのページ操作（禁止）
Given('会議を作成済み', async function () {
  await page.goto('http://localhost:3000'); // NG
  await page.click('button'); // NG
});

// ❌ UI操作ステップ内でのデータ作成（禁止）
When('会議を作成する', async function () {
  await prisma.meeting.create({...}); // NG
});
```

### ✅ 推奨パターン
```javascript
// ✅ data.steps.js - 純粋なDB操作
Given('会議 {string} を作成済み', async function (title) {
  const meeting = await prisma.meeting.create({
    data: { title, startTime: tomorrow, endTime: endTime, ownerId: this.currentUser.id }
  });
  this.createdMeeting = meeting;
});

// ✅ {feature}.steps.js - UI操作
When('カレンダー画面で会議詳細を開く', async function () {
  await global.calendarPage.navigate();
  await global.calendarPage.page.click(':text("会議タイトル")');
});
```

### 🎯 データパターンの設計指針
- **柔軟性**: パラメータ化でさまざまなデータパターンに対応
- **デフォルト**: 合理的なデフォルト値（明日14:00-15:00等）
- **組み合わせ**: 複数のGivenステップを組み合わせて複雑なシナリオを構成
- **命名規約**: `Given {エンティティ} "{パラメータ}" を{状態}済み`

### 🔄 ステップ実行フロー
```
1. Background: ユーザー"Daiki"でログイン (auth.steps.js)
2. Given: 会議 "タイトル" を作成済み (data.steps.js)
3. When: カレンダー画面で会議詳細を開く ({feature}.steps.js)
4. Then: 会議詳細が表示される ({feature}.steps.js)
```

この構成により、保守性・再利用性・テスト実行速度の全てを向上させる 🎯

## 🎭 Page Objectパターン

### 🎯 基本原則
- **DOM情報の集約**: 各ページのDOM構造とセレクターを1つのクラスに集約
- **ビジネス操作の抽象化**: 低レベルなDOM操作を高レベルなビジネス操作に変換
- **保守性の向上**: UI変更時の修正箇所を最小限に抑制
- **可読性の向上**: step定義をビジネスロジック中心に簡素化

### 🏗️ Page Objectクラス設計

#### 📂 ファイル構成
```
e2e/
├── page-objects/
│   ├── CalendarPage.js      # カレンダー画面のPage Object
│   ├── MeetingFormPage.js   # 会議フォームのPage Object
│   └── [PageName]Page.js    # 各画面のPage Object
├── steps/
│   ├── meeting_creation.steps.js  # Page Objectを使用したstep定義
│   └── toppage.steps.js           # Page Objectを使用したstep定義
└── features/
    └── *.feature             # Gherkinシナリオ
```

#### 🎨 Page Objectクラス構造
```javascript
class MeetingFormPage {
  constructor(page) {
    this.page = page;
    
    // 🎯 セレクター定義を集約
    this.selectors = {
      createMeetingButton: 'text=会議を作成',
      titleInput: '[data-testid="meeting-title-input"]',
      submitButton: '[data-testid="meeting-submit-button"]',
      errorAlert: '[role="alert"]'
    };
  }

  // 🎪 ビジネス操作メソッド
  async createMeeting(title, period, importantFlag) {
    await this.openCreateMeetingForm();
    await this.fillTitle(title);
    await this.setPeriod(period);
    await this.setImportantFlag(importantFlag === 'true');
    await this.submitAndWaitForCompletion();
  }

  // 📝 個別操作メソッド
  async openCreateMeetingForm() {
    await this.page.click(this.selectors.createMeetingButton);
    await this.page.waitForSelector(this.selectors.titleInput);
  }

  // 🚨 検証メソッド
  async waitForErrorMessage(expectedErrorMessage) {
    await this.page.waitForSelector(this.selectors.errorAlert, { timeout: 10000 });
    const alertContent = await this.page.textContent(this.selectors.errorAlert);
    if (!alertContent.includes(expectedErrorMessage)) {
      throw new Error(`Expected error message "${expectedErrorMessage}" not found`);
    }
  }
}
```

### 🔄 step definition変更

#### **Before（DOM操作が散在）:**
```javascript
When('period {string} で会議を作成する', async function (period) {
  // 会議を作成ボタンをクリック
  await page.click('text=会議を作成');
  
  // フォームが表示されるまで待機
  await page.waitForSelector('[data-testid="meeting-title-input"]');
  
  // タイトルを入力（必須項目のため）
  await page.fill('[data-testid="meeting-title-input"]', 'テスト会議');
  
  // 開始時刻と終了時刻を設定（期間に応じて）
  const now = new Date();
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
  const endTime = new Date(startTime);
  
  // 期間の解析
  const periodMatch = period.match(/(\d+)分/);
  if (periodMatch) {
    const minutes = parseInt(periodMatch[1]);
    endTime.setMinutes(startTime.getMinutes() + minutes);
  }
  
  const startTimeString = startTime.toISOString().slice(0, 16);
  const endTimeString = endTime.toISOString().slice(0, 16);
  
  await page.fill('#startTime', startTimeString);
  await page.fill('#endTime', endTimeString);
  
  // 作成ボタンをクリック
  await page.click('[data-testid="meeting-submit-button"]');
});
```

#### **After（Page Object集約）:**
```javascript
When('period {string} で会議を作成する', async function (period) {
  // Page Objectを使用した期間指定会議作成
  await meetingFormPage.createMeetingWithPeriod(period);
});
```

### 🏭 Page Object実装パターン

#### 🎯 セレクター管理
```javascript
class CalendarPage {
  constructor(page) {
    this.page = page;
    
    this.selectors = {
      // ナビゲーション
      calendarView: '[data-testid="calendar-view"]',
      createMeetingButton: 'text=会議を作成',
      
      // カレンダー要素
      monthHeader: '.text-2xl.font-semibold',
      dateCells: '.min-h-24.p-2.cursor-pointer',
      
      // 会議要素
      meetingItems: '.text-xs.p-1.rounded.truncate',
      importantMeetings: '.bg-destructive.text-destructive-foreground'
    };
  }
}
```

#### ⚡ 操作メソッド分類
**基本操作**: `click()`, `fill()`, `navigate()`
```javascript
async clickCreateMeeting() {
  await this.page.click(this.selectors.createMeetingButton);
}

async navigate(url = 'http://localhost:3000') {
  await this.page.goto(url);
}
```

**複合操作**: 複数の基本操作を組み合わせたビジネス操作
```javascript
async createMeeting(title, period, importantFlag) {
  await this.openCreateMeetingForm();
  await this.fillTitle(title);
  await this.setPeriod(period);
  await this.setImportantFlag(importantFlag === 'true');
  await this.submitAndWaitForCompletion();
}
```

**検証操作**: 状態確認・待機・エラー検証
```javascript
async waitForSuccessMessage() {
  await this.page.waitForSelector(this.selectors.successToast, { timeout: 10000 });
}

async waitForErrorMessage(expectedErrorMessage) {
  await this.page.waitForSelector(this.selectors.errorAlert, { timeout: 10000 });
  const alertContent = await this.page.textContent(this.selectors.errorAlert);
  if (!alertContent.includes(expectedErrorMessage)) {
    throw new Error(`Expected error message "${expectedErrorMessage}" not found`);
  }
}
```

### 🚀 Page Object導入効果

#### **1. 保守性向上** 🛠️
- **UI変更対応**: セレクター変更時の修正箇所が1ファイルに集約
- **影響範囲明確化**: DOM構造変更の影響範囲が特定しやすい
- **一元管理**: 画面固有のロジックが1箇所に集約

#### **2. 可読性向上** 📖
- **ビジネス中心**: step定義がビジネス操作中心になり理解しやすい
- **抽象化**: 技術的詳細が隠蔽されてシナリオが読みやすい
- **意図明確**: メソッド名でビジネス意図が明確に表現

#### **3. 再利用性向上** ♻️
- **共通操作**: 画面固有の操作を他のシナリオで簡単に再利用
- **標準化**: 同じ操作が常に同じ方法で実行される
- **DRY原則**: 重複コードの削減

#### **4. テスト安定性向上** 🛡️
- **待機処理統一**: Page Object内で適切な待機処理を実装
- **エラーハンドリング**: 統一されたエラーハンドリング
- **セレクター品質**: data-testid等の推奨セレクターを集約管理

### 📋 Page Object実装ガイドライン

#### ✅ 推奨パターン
- **1画面1クラス**: 各画面に対応する専用Page Objectクラスを作成
- **セレクター集約**: 全セレクターをコンストラクタで定義
- **ビジネス操作**: 高レベルなビジネス操作メソッドを提供
- **適切な待機**: 非同期処理に対する適切な待機処理

#### ❌ アンチパターン
- **巨大クラス**: 複数画面の操作を1つのクラスに混在
- **DOM操作露出**: step定義に直接的なDOM操作が残存
- **重複実装**: 同じ操作を複数のPage Objectで重複実装
- **セレクター散在**: セレクターがメソッド内に散在

この設計により、E2Eテストの保守性・可読性・再利用性が大幅に向上し、チーム開発での品質が確保される 🎉

## 🐛 E2Eデバッグルール

**E2Eテストがfailした場合の必須デバッグ手順：**

1. **📸 スクリーンショット自動取得**
   - テストfail時に自動でスクリーンショットを保存
   - 保存先: `e2e/screenshots/[feature名]_[scenario名]_[timestamp].png`

2. **📋 ブラウザログ出力**
   - console.log、console.error、console.warnを全て出力
   - ネットワークエラーやJavaScriptエラーを即座に確認

3. **🔍 デバッグ情報収集**
   ```javascript
   // E2E失敗時の自動実行
   - ブラウザコンソールログ
   - JavaScriptエラー
   - ネットワークエラー
   - 最後のDOM状態
   ```

4. **🎯 デバッグモード実行**
   ```bash
   # ブラウザログをリアルタイム出力
   yarn e2e:debug
   ```

このプロセスにより、品質の高い機能を確実に実装し、回帰バグを防止できる 🛡️



## ⚡ 基本コマンド

### 🧪 E2Eテスト
```bash
# 🚀 全体のE2Eテスト実行（headlessモード）
yarn e2e

# 🔍 開発用E2Eテスト実行（headlessモード）
yarn e2e:develop

# 🐛 デバッグ用E2Eテスト実行（ブラウザ表示）
yarn e2e:debug

# 📦 E2Eテスト用ブラウザインストール
yarn e2e:install
```

## 📏 実装ルール

- 🔤 Featureファイルのキーワードは英語を使用すること（Feature, Scenario, Given, When, Then, And, Rule）
- FeatureファイルにUIのルールは含めない。ビジネスルールのみ
- 🇯🇵 説明文や手順は日本語で記述すること