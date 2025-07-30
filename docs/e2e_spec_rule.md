# 🧪 E2Eテスト仕様

## 🛡️ E2Eテスト環境設定チェックリスト

#### ✅ 認証共通ステップ（必須）
- [ ] 全Featureファイルで`Background: Given ユーザー"Daiki"でログイン`使用
- [ ] 認証済み状態での動作を前提とする
- [ ] `auth.steps.js`でデータベースリセットとユーザー作成実装
- [ ] クリーンアップ処理でページ・ブラウザ・DB接続クローズ

#### ✅ ATDD基本原則
- [ ] 全APIが実際にバックエンドと連携していることを確認
- [ ] テスト間でデータ競合しないよう各テスト前にDBリセット
- [ ] データ準備ステップは`data.steps.js`に集約
- [ ] 処理完了待機（APIレスポンス、UI更新完了）まで適切に待機

#### ✅ Headlessモード制御
- [ ] デフォルト: headlessモード（`yarn e2e:develop`）
- [ ] デバッグ用: ブラウザ表示モード（`yarn e2e:debug`）
- [ ] CI/CD: headless全シナリオ（`yarn e2e`）
- [ ] 初期開発: ブラウザ表示でUI動作確認

## 🛡️ E2E待機戦略実装チェックリスト

#### ✅ 禁止事項
- [ ] `waitForTimeout()`による固定時間待機禁止
- [ ] 推測による待機時間設定禁止

#### ✅ 推奨パターン実装
- [ ] `waitForLoadState('networkidle')`でネットワーク完了待機
- [ ] `waitForSelector()`で要素表示待機
- [ ] `waitForSelector('[role="dialog"]')`でダイアログ表示待機

```javascript
// ✅ 正しい待機パターン
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="meeting-list"]');
await page.waitForSelector('[role="dialog"]', { state: 'visible' });

// ❌ 禁止パターン
await page.waitForTimeout(3000); // 固定時間待機は禁止
```
## 🛡️ 権限制御テスト実装チェックリスト

#### ✅ 基本原則
- [ ] Frontend/Backend二重防御で権限制御実装
- [ ] E2Eテストはユーザー視点の動作確認
- [ ] Backend TestAでAPIレベル保護確認

#### ✅ パターン1: UI要素非表示の場合
- [ ] 編集ボタンが表示されないことを確認
- [ ] Backend TestAで403エラー返却確認
- [ ] 権限のないユーザーでの操作試行テスト

#### ✅ パターン2: エラーメッセージ表示の場合
- [ ] 実際に操作を行いエラーメッセージ表示確認
- [ ] Backend TestAで同じ制約のAPI確認
- [ ] ビジネスルール違反時の適切な表示

#### ✅ テスト責務分担
- [ ] E2Eテスト: ユーザー視点動作確認
- [ ] Backend TestA: APIレベル権限・制約確認
- [ ] Frontend単体テスト: UI要素表示制御ロジック

## 🛡️ E2Eステップ分離実装チェックリスト

#### ✅ ファイル構成原則
- [ ] 認証・データ準備・UI操作を独立したファイルに分離
- [ ] Givenステップは純粋なデータベース操作のみ実行
- [ ] 共通のデータパターンを全featureファイルで使用可能

#### ✅ ファイル別責務
- [ ] `auth.steps.js`: 認証処理・ブラウザ管理・グローバル状態管理
- [ ] `data.steps.js`: テストデータ作成（純粋なDB操作のみ）

```javascript
// auth.steps.js - 認証とブラウザ管理
Given('ユーザー{string}でログイン', async function (userName) {
  await resetDatabase();
  await createUser(userName);
  await this.page.goto('/signin');
});

// data.steps.js - データ準備のみ
Given('会議 {string} を作成済み', async function (meetingTitle) {
  await createMeeting({ title: meetingTitle, ownerId: 'user1' });
});
```
#### ✅ 禁止事項
- [ ] `data.steps.js`内でのページ操作禁止
- [ ] UI操作ステップ内でのデータ作成禁止
- [ ] 関心事の混在禁止

#### ✅ データパターン設計
- [ ] パラメータ化でさまざまなデータパターンに対応
- [ ] 合理的なデフォルト値設定（明日14:00-15:00等）
- [ ] 複数Givenステップ組み合わせで複雑シナリオ構成
- [ ] 命名規約: `Given {エンティティ} "{パラメータ}" を{状態}済み`

```gherkin
# ✅ パラメータ化されたデータパターン
Given 会議 "定期MTG" を作成済み
Given ユーザー "田中" を招待済み
Given 会議 "緊急会議" を "明日 10:00-11:00" で作成済み

# ✅ 複数ステップの組み合わせ
Given 会議 "プロジェクト会議" を作成済み
And ユーザー "佐藤" を招待済み
And ユーザー "佐藤" が招待を承諾済み
```

## 🛡️ Page Object実装チェックリスト

#### ✅ 基本原則
- [ ] 各ページのDOM構造とセレクターを1つのクラスに集約
- [ ] 低レベルDOM操作を高レベルビジネス操作に変換
- [ ] UI変更時の修正箇所を最小限に抑制
- [ ] step定義をビジネスロジック中心に簡素化

#### ✅ ファイル構成
- [ ] `e2e/page-objects/`に各画面のPage Object配置
- [ ] `e2e/steps/`にPage Object使用したstep定義
- [ ] `e2e/features/`にGherkinシナリオ配置

#### ✅ クラス構造
- [ ] セレクター定義を集約
- [ ] ビジネス操作メソッド実装
- [ ] 個別操作メソッド実装
- [ ] 検証メソッド実装

```javascript
// MeetingPage.js - Page Object例
class MeetingPage {
  constructor(page) {
    this.page = page;
    // セレクター集約
    this.selectors = {
      createButton: '[data-testid="create-meeting"]',
      titleInput: '[data-testid="meeting-title"]',
      saveButton: '[data-testid="save-meeting"]'
    };
  }

  // ビジネス操作
  async createMeeting(title) {
    await this.page.click(this.selectors.createButton);
    await this.page.fill(this.selectors.titleInput, title);
    await this.page.click(this.selectors.saveButton);
  }

  // 検証メソッド
  async verifyMeetingExists(title) {
    await this.page.waitForSelector(`text=${title}`);
  }
}
```
