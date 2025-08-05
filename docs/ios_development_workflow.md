# iOS開発ワークフロー

## 概要

このドキュメントでは、iOS開発における効率的なテスト駆動開発（TDD）ワークフローを定義します。ガーキン記法によるシナリオ定義から始まり、Maestroテストの作成、Swift単体テストによる開発、統合テストまでの一連の流れを説明します。

## ワークフロー

### 1. ガーキン記法でシナリオを定義

まず、実装したい機能をガーキン記法で明確に定義します。

```gherkin
Feature: 会議作成機能
  ユーザーとして
  新しい会議を作成したい
  チームメンバーと予定を共有するために

  Scenario: 新規会議の作成
    Given ユーザーがサインイン済みである
    When 会議一覧画面で「＋」ボタンをタップする
    And 会議タイトルに「週次定例会」と入力する
    And 開始日時を「2024年8月10日 14:00」に設定する
    And 終了日時を「2024年8月10日 15:00」に設定する
    And 「作成」ボタンをタップする
    Then 会議一覧画面に「週次定例会」が表示される
    And 会議の開始時刻が「14:00」と表示される
```

### 2. Maestroテスト（TestF）の作成

ガーキンシナリオをベースに、Maestro用のYAMLテストファイルを作成します。

```yaml
# ios_e2e/flows/create_meeting.yaml
appId: dkanai.OnlineCalendar
---

# Feature: 会議作成機能
# Scenario: 新規会議の作成
# Given ユーザーがサインイン済みである
- tapOn: "メールアドレス"
- inputText: "test@example.com"
- tapOn: "パスワード"
- inputText: "password123"
- tapOn: "サインイン"

# When 会議一覧画面で「＋」ボタンをタップする
- assertVisible: "会議一覧"
- tapOn: "＋"

# And 会議タイトルに「週次定例会」と入力する
- assertVisible: "新規会議作成"
- tapOn: "会議タイトル"
- inputText: "週次定例会"

# And 開始日時を「2024年8月10日 14:00」に設定する
- tapOn: "開始日時"
- tapOn: "2024年8月10日 14:00"

# And 終了日時を「2024年8月10日 15:00」に設定する
- tapOn: "終了日時"
- tapOn: "2024年8月10日 15:00"

# And 「作成」ボタンをタップする
- tapOn: "作成"

# Then 会議一覧画面に「週次定例会」が表示される
- assertVisible: "週次定例会"

# And 会議の開始時刻が「14:00」と表示される
- assertVisible: "14:00"
```

### 3. iOS単体テスト（TestE）でTDD開発

実行速度が速い単体テストを使って、TDDサイクルで開発を進めます。

#### 3.1 ViewModelのテストから開始

```swift
// Tests/CoreTests/CreateMeetingViewModelSpec.swift
import Testing
@testable import Core

@Suite("CreateMeetingViewModel振る舞いテスト")
struct CreateMeetingViewModelSpec {
    
    @Test("会議作成フォームの初期値が正しい")
    @MainActor
    func testInitialFormValues() {
        let viewModel = CreateMeetingViewModel()
        
        #expect(viewModel.form.title == "")
        #expect(viewModel.form.startDate != nil)
        #expect(viewModel.form.endDate != nil)
    }
    
    @Test("有効な入力で会議が作成される")
    @MainActor
    func testCreateMeetingWithValidInput() async throws {
        let mockRepository = MockMeetingRepository()
        let viewModel = CreateMeetingViewModel(repository: mockRepository)
        
        // フォームに入力
        viewModel.form.title = "週次定例会"
        viewModel.form.startDate = Date()
        viewModel.form.endDate = Date().addingTimeInterval(3600)
        
        // 会議作成
        try await viewModel.createMeeting()
        
        // 検証
        #expect(mockRepository.createMeetingCalled == true)
        #expect(viewModel.isCompleted == true)
    }
}
```

#### 3.2 Viewのテストを追加

```swift
// Tests/CoreTests/CreateMeetingScreenSpec.swift
import Testing
import SwiftUI
import ViewInspector
@testable import Core

@Suite("CreateMeetingScreen振る舞いテスト")
struct CreateMeetingScreenSpec {
    
    @Test("会議作成画面のUIが正しく表示される")
    @MainActor
    func testUIElements() throws {
        let viewModel = CreateMeetingViewModel()
        let view = CreateMeetingScreen(viewModel: viewModel)
        
        let inspection = try view.inspect()
        
        // タイトル入力フィールドの確認
        let titleField = try inspection.find(ViewType.TextField.self)
        #expect(try titleField.label().string() == "会議タイトル")
        
        // 作成ボタンの確認
        let createButton = try inspection.find(button: "作成")
        #expect(createButton != nil)
    }
}
```

#### 3.3 実装コードの開発

テストをパスさせるために実装を進めます：

```swift
// 1. swift test を実行（実行が速い）
yarn ios:ut

// 2. テストが失敗することを確認
// 3. 実装を追加
// 4. テストがパスすることを確認
// 5. リファクタリング
```

### 4. Maestroテストで統合確認

単体テストがすべてパスしたら、Maestroテストを実行して統合動作を確認します。

```bash
# Maestroテストの実行
yarn e2e:ios

# 特定のテストだけ実行する場合
cd ios_e2e && maestro test flows/create_meeting.yaml
```

#### 4.1 Maestroテストがfailした場合のデバッグチェックリスト

Maestroテストが失敗した場合は、以下の順番で確認します：

1. **スクリーンショットの確認**
   ```bash
   # 最新のテスト結果のスクリーンショットを確認
   ls -la ~/.maestro/tests/*/screenshot-*.png
   open ~/.maestro/tests/[最新のディレクトリ]/screenshot-*.png
   ```

2. **Maestroログの確認**
   ```bash
   # 詳細なログを確認
   cat ~/.maestro/tests/[最新のディレクトリ]/maestro.log
   
   # エラー部分だけを抽出
   grep -E "(ERROR|FAILED|Failed)" ~/.maestro/tests/[最新のディレクトリ]/maestro.log
   ```

3. **バックエンドログの確認**
   ```bash
   # バックエンドをログ出力付きで起動している場合
   tail -f backend.log
   
   # APIエラーレスポンスを確認
   grep -E "(error|Error|ERROR|4[0-9]{2}|5[0-9]{2})" backend.log
   ```

4. **一般的な問題と解決策**
   - **要素が見つからない**: スクリーンショットで実際のUI要素を確認
   - **APIエラー**: バックエンドログでエンドポイントとレスポンスを確認
   - **データ不整合**: テストデータのセットアップスクリプトを確認
   - **タイミング問題**: `waitForAnimationToEnd` や `waitFor` を追加

5. **デバッグ例**
   ```yaml
   # デバッグ用の待機時間を追加
   - waitForAnimationToEnd
   - waitFor:
       visible: "要素名"
       timeout: 5000
   
   # スクリーンショットを明示的に取得
   - takeScreenshot: "debug-point-1"
   ```

## 利点

### 1. 高速なフィードバックループ
- Swift単体テストは2-3秒で実行完了
- Maestroテストは10-20秒かかるため、最後の確認として使用

### 2. 明確な仕様定義
- ガーキン記法により、実装前に仕様が明確化される
- ステークホルダーとの認識合わせが容易

### 3. 段階的な品質保証
- 単体テスト：ビジネスロジックの正確性を保証
- 統合テスト（Maestro）：ユーザー視点での動作を保証

### 4. 保守性の向上
- ガーキンシナリオがドキュメントとして機能
- テストコードが実装の使用例となる

## テストの実行コマンド

```bash
# iOS単体テスト（高速）
yarn ios:ut

# iOSカバレッジレポート生成
yarn ios:ut  # カバレッジレポートは自動生成される

# iOS E2Eテスト（Maestro）
yarn e2e:ios

# すべてのテストを実行
yarn test
```

## ベストプラクティス

1. **ガーキンは簡潔に**：技術的な詳細は避け、ビジネス価値に焦点を当てる

2. **TDDサイクルを守る**：Red → Green → Refactor のサイクルを確実に実行

3. **モックを活用**：外部依存（API、データベース）はモックで高速化

4. **CI/CDに組み込む**：すべてのテストを自動実行できるようにする

5. **カバレッジ目標**：ビジネスロジックは80%以上のカバレッジを目指す

## 参考資料

- [Gherkin記法リファレンス](https://cucumber.io/docs/gherkin/)
- [Maestroドキュメント](https://maestro.mobile.dev/)
- [Swift Testing Framework](https://github.com/apple/swift-testing)
- [ViewInspector](https://github.com/nalexn/ViewInspector)