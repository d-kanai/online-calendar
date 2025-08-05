# 🧪 テスト戦略

## 📋 テスト種別一覧

| テスト種別 | 対象領域 | テスト内容 |
|-----------|---------|-----------|
| **TestA** | Backend | API in-out Test |
| **TestB** | Backend | Domain Layer Pattern Test |
| **TestC** | Web Frontend UT | Page Event Test |
| **TestD** | E2E Web | Scenario Test |
| **TestE** | IOS Frontend UT | Page Event Test |
| **TestF** | E2E IOS | Scenario Test |

## 🎯 TestA: Controller API テスト

### 📋 テスト方針
- **Controller 1 methodに対してのspec**: 各Controllerメソッドごとに独立したテストケースを作成
- **API in-out test**: HTTPリクエスト/レスポンスの入出力テスト
- **no mock**: モックを使用せず、実際のデータベースとサービス層を使用
- **use real database**: 実際のSQLiteデータベースを使用した統合テスト

### 🛡️ TestA実装チェックリスト

#### ✅ 基本設定
- [ ] 各Controllerメソッドに対して独立したspecファイルを作成
- [ ] `beforeEach`でデータベースをリセット（`deleteMany()`）
- [ ] 実際のSQLiteデータベースを使用（モックなし）
- [ ] Factoryパターンでテストデータを作成

#### ✅ 正常系テスト
- [ ] **GET系**: データ取得が正しく動作することを確認
  - [ ] 空配列の場合（データなし）
  - [ ] 単一データの場合
  - [ ] 複数データの場合
  - [ ] ソート順の確認（必要な場合）
  - [ ] フィルタリングの確認（必要な場合）
- [ ] **POST系**: データ作成が正しく動作することを確認
  - [ ] 必須項目のみでの作成
  - [ ] 全項目指定での作成
  - [ ] 作成後のレスポンス検証
  - [ ] データベースへの保存確認
- [ ] **PUT/PATCH系**: データ更新が正しく動作することを確認
  - [ ] 部分更新の動作
  - [ ] 全項目更新の動作
  - [ ] 更新後のレスポンス検証
  - [ ] データベースの更新確認
- [ ] **DELETE系**: データ削除が正しく動作することを確認
  - [ ] 削除成功のレスポンス
  - [ ] データベースからの削除確認
  - [ ] 関連データの処理確認（カスケード削除など）

#### ✅ 異常系テスト
- [ ] **バリデーションエラー**
  - [ ] 必須項目の欠落（400エラー）
  - [ ] 不正な型・形式（400エラー）
  - [ ] 文字列長の制限違反（400エラー）
- [ ] **認証・認可エラー**
  - [ ] 未認証の場合（401エラー）
  - [ ] 権限不足の場合（403エラー）
- [ ] **リソース不在エラー**
  - [ ] 存在しないIDの指定（404エラー）
  - [ ] 削除済みリソースへのアクセス（404エラー）
- [ ] **ビジネスロジックエラー**
  - [ ] 業務ルール違反（409エラーなど）
  - [ ] 状態遷移の不正（400エラー）

#### ✅ レスポンス検証
- [ ] HTTPステータスコードが正しい
- [ ] レスポンスボディの構造が正しい（success, data, error）
- [ ] エラーメッセージが適切
- [ ] 日付のフォーマットが正しい（ISO 8601）
- [ ] 数値の精度が正しい

#### ✅ DB変更時の必須チェック（スキーマ変更時）
- [ ] **ドメインモデル**: 新フィールドのプロパティとgetter追加
  ```typescript
  get status(): string { return this._status; }
  ```
- [ ] **Repository**: `fromPersistence`に新フィールド追加
  ```typescript
  static fromPersistence(data: { status: string; ... }) {}
  ```
- [ ] **Repository**: `mapToDomain`で新フィールドマッピング
  ```typescript
  status: p.status,
  ```
- [ ] **Output型**: インターフェースに新フィールド定義
  ```typescript
  interface ParticipantOutput { status: string; }
  ```
- [ ] **変換関数**: 全ての`toXXXOutput`で新フィールドマッピング
  ```typescript
  status: p.status
  ```
- [ ] **テスト**: 新フィールドがAPIレスポンスに含まれることを確認

### 🔄 テストデータ管理チェックリスト

#### ✅ データ準備
- [ ] `beforeEach`で必ずデータベースをクリア
- [ ] Factoryを使用してテストデータを作成
- [ ] テストケースごとに独立したデータを準備
- [ ] 関連データも適切に準備（外部キー制約）

#### ✅ Factory使用方針
- [ ] **特定の値が重要な場合**: 明示的に値を指定
  ```typescript
  // Given - 開始時刻が重要なテスト
  await meetingFactory.create({
    startTime: new Date('2025-01-15T10:00:00Z'),
    endTime: new Date('2025-01-15T11:00:00Z')
  });
  ```
- [ ] **件数や存在だけが重要な場合**: デフォルト値を使用
  ```typescript
  // Given - データの存在のみが重要
  await meetingFactory.create({});
  await meetingFactory.create({});
  ```

### 📝 テスト構成チェックリスト

#### ✅ テストケース構造
- [ ] テスト名に「メソッド名 - 期待する動作」を記載
- [ ] Given-When-Thenコメントを必ず記載
- [ ] 日本語でテストケース名を記述
- [ ] 意図とWHYが明確なテスト名

#### ✅ テスト実装例
```typescript
test('getAllMeetings - 複数の会議データが開始時刻順でソートされて取得できる', async () => {
  // Given - テストデータ準備
  await meetingFactory.create({
    title: '午後の会議',
    startTime: new Date('2025-01-15T14:00:00Z')
  });
  await meetingFactory.create({
    title: '朝の会議',
    startTime: new Date('2025-01-15T10:00:00Z')
  });

  // When - 実行
  const mockContext = createMockContext();
  const response = await meetingController.getAllMeetings(mockContext);

  // Then - 検証
  expect(response.data.success).toBe(true);
  expect(response.data.data).toHaveLength(2);
  expect(response.data.data[0].title).toBe('朝の会議');
  expect(response.data.data[1].title).toBe('午後の会議');
});
```

## 🚀 テスト共通ルール

### 🏭 データ準備ルール
- **Factory必須**: Given データ準備はUT（Unit Test）、AT（Acceptance Test）両方でFactoryを必ず利用すること
- **直接のDB操作禁止**: `prisma.user.create()` などの直接的なDB操作は避け、必ずFactoryを経由する
- **保守性向上**: スキーマ変更時の影響をFactoryに集約し、テストコードの保守性を高める

```typescript
// ❌ 悪い例 - 直接DB操作
await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User',
    password: await bcrypt.hash('password', 10)
  }
});

// ✅ 良い例 - Factory使用
await UserFactory.create({
  email: 'test@example.com',
  name: 'Test User'
});

// ✅ より良い例 - ヘルパーメソッド使用
await UserFactory.createWithName('Test User');
```

### 📝 テストケース命名規約
- **日本語で記述**: テストケース名は日本語で記述すること
- **意図とWHYを込める**: テストの目的と検証したい理由を明確にする
- **具体的な期待動作**: どのような結果を期待するかを具体的に記述

```typescript
// ❌ 悪い例
test('getAllMeetings', async () => {

// ✅ 良い例  
test('getAllMeetings - 複数の会議データが開始時刻順でソートされて取得できる', async () => {
test('createMeeting - 必須項目が全て入力されている場合に会議が正常に作成される', async () => {
test('deleteMeeting - 存在しないIDを指定した場合に404エラーが返される', async () => {
```

### 📖 コメント規約
**必須**: 全てのテストケースで以下のコメントを使用すること

```typescript
test('メソッド名 - 期待する動作の詳細説明', async () => {
  // Given - テストデータの準備、前提条件の設定
  
  // When - テスト対象メソッドの実行
  
  // Then - 結果の検証、期待値との比較
});
```

### 🎨 コメントの役割
- **`// Given`**: テストデータ準備、モック設定、前提条件
- **`// When`**: テスト対象の実際の実行
- **`// Then`**: 結果検証、アサーション、期待値チェック

### 🛠️ 実装指針
- **可読性**: テストコードは仕様書として機能するよう明確に記述
- **独立性**: 各テストは他のテストに依存しない独立した状態で実行
- **網羅性**: 正常系・異常系の両方をカバー
- **保守性**: コード変更時にテストも同時にメンテナンス

この規約により、品質の高いテストコードと継続的な品質保証を実現する 🎯

## 🎯 TestC: Frontend Page Behavior テスト

### 📋 テスト方針
- **Page.tsx に対する振る舞いテスト**: 各ページコンポーネント（page.tsx）の振る舞いを検証
- **ユーザー視点のテスト**: 実際のユーザー操作をシミュレート
- **最小限のモック戦略**: 3つのみモック（APIレイヤー、Navigation、ErrorBoundary）
- **結合度の最大化**: Context、Hooks、コンポーネントは実際の実装を使用してモック領域を最小化
- **副作用の確認**: ルーティング、トースト通知などの副作用を検証
- **⚠️ 重要**: TestCは必ずpage.tsxファイルに対するテストであること
- **🚫 カスタムフックのモック禁止**: カスタムフックは実際の実装を使用し、モックしない

### ⚠️ 最重要: 必ず守るべきテスト観点

| API種別 | テスト観点 | 実装方法 |
|---------|-----------|----------|
| **取得API (Query)** | データ表示の検証 | **Given**: APIレスポンスをモック定義<br>**When**: ページをレンダリング<br>**Then**: 取得した値が画面に表示されていることを確認 |
| **更新API (Mutation)** | フォーム送信の検証 | **Given**: フォーム入力とsubmit<br>**When**: ユーザー操作をシミュレート<br>**Then**: ①APIに正しいパラメータが渡される<br>②成功時のルーティング<br>③トースト通知の表示 |
| **フォームバリデーション** | 入力検証の確認 | **Given**: 不正な入力値<br>**When**: フォーム送信を試行<br>**Then**: ①エラーメッセージが表示される<br>②APIが呼ばれないことを確認 |
| **イベントハンドリング** | 全イベントのカバー | **Given**: ページ/コンポーネントのレンダリング<br>**When**: クリック等のユーザーイベント発生<br>**Then**: 期待される振る舞い（ルーティング、状態変更等）を確認<br>**注**: カバレッジレポートで未カバーのイベントを特定 |
| **APIレスポンス検証** | 動的データの包括的アサート | **原則**: APIで返すデータは基本的に画面で使用されるため、モックで設定した動的データは全て画面でアサートする<br>**実装**: APIレスポンスの各フィールドが画面に表示されることを確認<br>**除外**: 静的な文字列（タイトル等）はアサート不要 |

### 🛡️ TestC実装チェックリスト

#### ✅ テスト管理（新機能追加時）
- **🔥 重要**: 新機能追加時は既存テストを削除せず、新しいテストケースのみ追加
- [ ] 既存の`describe`ブロックとテストケースを保持
- [ ] 新機能のテストは独立した`describe`ブロックに分離
- [ ] 機能別にテストを整理（例：`describe('招待承諾機能', () => {})`）
- [ ] テスト名が機能を明確に表している

#### ✅ Query（取得API）テスト
- [ ] APIが正しく呼ばれることを確認
- [ ] 空データ・複数データなど様々なケースをテスト
- [ ] APIレスポンスの動的データが画面に反映されることを確認

#### ✅ Mutation（更新API）テスト - 3つの観点を必ず実装
- [ ] ①APIに正しいパラメータが渡されることを確認
- [ ] ②成功時のルーティングまたはモーダルクローズを確認
- [ ] ③成功トースト通知が表示されることを確認

#### ✅ バリデーションテスト
- [ ] 必須項目未入力でエラーが表示されることを確認
- [ ] エラー時にAPIが呼ばれないことを確認

#### ✅ エラーハンドリングテスト
- [ ] APIエラー時にエラートーストが表示されることを確認
- [ ] 適切なエラーメッセージが表示されることを確認
- [ ] テスト中のエラーログ出力を抑制（`console.error`をモック）

### 🚫 TestCアンチパターン
- ❌ **既存テストの削除**: 新機能追加時に既存テストを削除すること
- ❌ **テストファイル全体の更新**: 新機能のテストのみで既存テストを置き換えること
- ❌ 静的な文字列（「会議を作成」など）のアサート
- ❌ Mutationテストで3つの観点を省略
- ❌ 過度なモック（コンポーネントやフックの過剰なモック）
- ❌ 実装詳細のテスト（内部stateやメソッド呼び出し）

### 📝 実装例

#### 新機能追加時のテスト構造（推奨）
```typescript
describe('CalendarPage', () => {
  // ✅ 既存機能のテスト（保持）
  describe('会議表示機能', () => {
    it('会議一覧が表示される', () => {});
    it('会議詳細が開ける', () => {});
  });

  describe('会議作成機能', () => {
    it('新しい会議が作成できる', () => {});
    it('フォームバリデーションが動作する', () => {});
  });

  // ✅ 新機能のテスト（追加）
  describe('招待承諾機能', () => {
    it('招待された会議に参加承諾できる - API呼び出し、トースト、ステータス更新を確認', () => {});
    it('既に承諾済みの会議では承諾ボタンが表示されない', () => {});
    it('APIエラー時にエラートーストが表示される', () => {});
  });
});
```

#### ❌ 避けるべきテスト更新例
```typescript
// 新機能のテストのみで既存テストを置き換え
describe('CalendarPage - 招待承諾機能の振る舞いテスト', () => {
  // 既存の会議表示・作成機能のテストが消えている
  it('招待された会議に参加承諾できる', () => {});
});
```

#### 取得API（データ表示）のテスト
```typescript
it('会議一覧が表示される', async () => {
  // Given - APIレスポンスをモック
  (meetingApi.getMeetings as jest.Mock).mockResolvedValue({
    success: true,
    data: [
      { id: '1', title: 'チームミーティング', startTime: '2025-01-20T10:00:00Z' },
      { id: '2', title: '進捗確認', startTime: '2025-01-20T14:00:00Z' }
    ]
  });

  // When - ページをレンダリング
  renderWithAuthProvider(<MeetingListPage />);

  // Then - データが画面に表示されていることを確認
  await waitFor(() => {
    expect(screen.getByText('チームミーティング')).toBeVisible();
    expect(screen.getByText('進捗確認')).toBeVisible();
  });
});
```

#### APIレスポンスの動的データアサートのテスト
```typescript
it('統計データが正しく表示される', async () => {
  // Given - APIレスポンスを詳細にモック
  const mockStatsData = {
    averageDailyMinutes: 120.5,
    weeklyData: [
      { date: '2024-01-15', dayName: '月', totalMinutes: 90 },
      { date: '2024-01-16', dayName: '火', totalMinutes: 150 },
      { date: '2024-01-17', dayName: '水', totalMinutes: 120 },
      { date: '2024-01-18', dayName: '木', totalMinutes: 180 },
      { date: '2024-01-19', dayName: '金', totalMinutes: 60 },
      { date: '2024-01-20', dayName: '土', totalMinutes: 0 },
      { date: '2024-01-21', dayName: '日', totalMinutes: 0 },
    ],
  };
  (statsApi.getDailyAverage as jest.Mock).mockResolvedValue({
    success: true,
    data: mockStatsData,
  });

  // When - ページをレンダリング
  renderWithAuthProvider(<StatsPage />);

  // Then - APIの動的データのみアサート（静的なタイトル等は除外）
  await waitFor(() => {
    // APIレスポンスの averageDailyMinutes を確認
    expect(screen.getByTestId('daily-average-time')).toHaveTextContent('120.5分');
  });

  // 週合計（APIデータから計算される動的な値）
  expect(screen.getByText('週合計: 10時間')).toBeVisible();

  // 週次データのdayName（APIレスポンスの動的データ）
  expect(screen.getByText('月')).toBeVisible();
  expect(screen.getByText('火')).toBeVisible();
  expect(screen.getByText('水')).toBeVisible();
  expect(screen.getByText('木')).toBeVisible();
  expect(screen.getByText('金')).toBeVisible();
  expect(screen.getByText('土')).toBeVisible();
  expect(screen.getByText('日')).toBeVisible();
  
  // totalMinutes（APIレスポンスの動的データ、formatMinutes関数を通した表示）
  expect(screen.getByText('1時間30分')).toBeVisible(); // 90分
  expect(screen.getByText('2時間30分')).toBeVisible(); // 150分
  expect(screen.getByText('2時間')).toBeVisible();     // 120分
  expect(screen.getByText('3時間')).toBeVisible();     // 180分
  expect(screen.getByText('1時間')).toBeVisible();     // 60分
});
```

#### 更新API（フォーム送信）のテスト
```typescript
it('フォーム送信後、正しく処理される', async () => {
  // Given - APIモックとユーザーイベントのセットアップ
  const user = userEvent.setup();
  renderWithAuthProvider(<SignUpPage />);
  
  // When - フォーム入力とsubmit
  await user.type(screen.getByLabelText('名前'), '山田太郎');
  await user.type(screen.getByLabelText('メールアドレス'), 'yamada@example.com');
  await user.click(screen.getByRole('button', { name: '送信' }));

  // Then - 3つの観点で検証
  // ① APIに正しいパラメータが渡される
  await waitFor(() => {
    expect(authApi.signUp).toHaveBeenCalledWith({
      name: '山田太郎',
      email: 'yamada@example.com'
    });
  });
  
  // ② 成功時のルーティング
  expect(mockRouter.push).toHaveBeenCalledWith('/success');
  
  // ③ トースト通知
  expect(toast.success).toHaveBeenCalledWith('登録が完了しました');
});
```

#### フォームバリデーションのテスト
```typescript
it('必須項目が未入力の場合、バリデーションエラーが表示される', async () => {
  // Given
  const user = userEvent.setup();
  renderWithAuthProvider(<SignUpPage />);

  // When - 必須項目を空のまま送信
  await user.click(screen.getByRole('button', { name: '送信' }));

  // Then - バリデーションエラーの検証
  // ① エラーメッセージが表示される
  await waitFor(() => {
    expect(screen.getByText('名前は必須項目です')).toBeVisible();
    expect(screen.getByText('メールアドレスは必須項目です')).toBeVisible();
    expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeVisible();
  });
  
  // ② APIが呼ばれないことを確認
  expect(authApi.signUp).not.toHaveBeenCalled();
});

it('メールアドレスの形式が不正な場合、エラーが表示される', async () => {
  // Given
  const user = userEvent.setup();
  renderWithAuthProvider(<SignUpPage />);

  // When - 不正な形式のメールアドレスを入力
  await user.type(screen.getByLabelText('メールアドレス'), 'invalid-email');
  await user.click(screen.getByRole('button', { name: '送信' }));

  // Then
  await waitFor(() => {
    expect(screen.getByText('有効なメールアドレスを入力してください')).toBeVisible();
  });
  expect(authApi.signUp).not.toHaveBeenCalled();
});
```

### 🛠️ テスト実装のポイント
- **モック最小化の原則**: 3つのみモック（APIレイヤー、Navigation、ErrorBoundary）
- **実装の結合**: AuthContext、カスタムHooks、UIコンポーネントは実際の実装を使用
- **renderWithAuthProvider必須**: 全てのテストで`renderWithAuthProvider`を使用
- **非同期処理の考慮**: `waitFor`を使用して非同期処理を適切に待機
- **ユーザー操作の再現**: `@testing-library/user-event`で実際の操作を忠実に再現
- **複数の検証**: 1つのユーザーアクションに対する複数の結果を包括的に検証
- **バリデーションテスト**: フロントエンドのバリデーションロジックが正しく動作することを確認
- **イベントカバレッジ**: カバレッジレポートを活用し、全てのクリックイベント等をテストでカバー
- **動的データのみアサート**: APIレスポンスの動的データは全てアサート、静的な文字列（タイトル等）はアサート不要
- **テストログのクリーン化**: エラーハンドリングテストでは`console.error`をモックしてログ出力を抑制

### 📊 ATDDプロセス - ステップ7: カバレッジ改善

#### 🎯 目的
TestCテスト実装後、カバレッジレポートを確認し、80%以下のカバレッジを持つ部分を特定して改善する。

#### 🔍 カバレッジ確認手順
1. **カバレッジレポートの生成**
   ```bash
   yarn front:ut
   ```
2. **カバレッジレポート確認**
   - ターミナルで出力されるカバレッジサマリーを確認
   - 特にカスタムフック（hooks/）のカバレッジに注目
   - 80%以下のファイルを特定

#### 🛠️ カバレッジ改善の実装方法

##### ✅ TestCルールに従った改善方法
1. **page.spec.tsxでの振る舞いテスト追加**
   - カスタムフックを直接テストせず、ページコンポーネントを通じてテスト
   - ユーザーインタラクションをシミュレートして間接的にカバー
   
   ```typescript
   // ✅ 良い例 - usePrefetchMeetingsをページコンポーネント経由でテスト
   it('会議リストアイテムにホバーすると詳細データがプリフェッチされる', async () => {
     // Given - 会議リストをモック
     (meetingApi.getMeetings as jest.Mock).mockResolvedValue({
       success: true,
       data: [{ id: '1', title: 'チームミーティング' }]
     });
     
     // When - ページレンダリングとホバー
     const user = userEvent.setup();
     renderWithAuthProvider(<CalendarPage />);
     await waitFor(() => {
       expect(screen.getByText('チームミーティング')).toBeVisible();
     });
     
     // ホバーアクション
     await user.hover(screen.getByText('チームミーティング'));
     
     // Then - プリフェッチAPIが呼ばれる
     await waitFor(() => {
       expect(meetingApi.getById).toHaveBeenCalledWith('1');
     });
   });
   ```

2. **使用されていない機能の削除**
   - カバレッジが低い理由が「未使用」の場合、実装を削除
   - テストを追加するより、不要なコードを削除する方が適切
   
   ```typescript
   // ❌ 削除対象の例 - 実際に使われていない関数
   export const usePrefetchMeetings = () => {
     // ✅ 実際に使われている関数は残す
     const prefetchOnHover = (meetingId: string) => { ... };
     
     // ❌ 使われていない関数は削除
     const prefetchAll = () => { ... };        // 削除
     const prefetchNext = () => { ... };      // 削除
     
     return { prefetchOnHover };
   };
   ```

##### ❌ 避けるべきアプローチ
```typescript
// ❌ 悪い例 - カスタムフックの直接テスト
describe('usePrefetchMeetings', () => {
  it('prefetchOnHover calls queryClient.prefetchQuery', () => {
    const { result } = renderHook(() => usePrefetchMeetings());
    // フックを直接テストしない
  });
});
```

#### 📋 カバレッジ改善チェックリスト
- [ ] `yarn front:ut`でカバレッジレポートを確認
- [ ] 80%以下のカスタムフックを特定
- [ ] 各低カバレッジファイルについて以下を判断：
  - [ ] 実際に使用されている → page.spec.tsxで振る舞いテスト追加
  - [ ] 未使用 → 実装を削除
- [ ] 改善後、再度カバレッジを確認
- [ ] 目標: 使用されているコードは80%以上のカバレッジ

#### 💡 実例: usePrefetchMeetingsの改善
1. **Before**: カバレッジ48.71%（5つの関数中1つのみ使用）
2. **分析**: `prefetchOnHover`のみ実際に使用されている
3. **対応**: 未使用の4関数を削除
4. **After**: カバレッジ93.33%（使用されている部分のみ残る）

この方法により、実際に必要なコードのみを高品質に保つことができる。

### 📌 モック戦略（3つのみ）

#### 1️⃣ APIレイヤーのモック
```typescript
jest.mock('./apis/stats.api', () => ({
  statsApi: {
    getDailyAverage: jest.fn(),
  },
}));
```

#### 2️⃣ Navigationのモック
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/stats',
}));
```

#### 3️⃣ ErrorBoundaryのモック
```typescript
jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => children,
}));
```

#### ❌ 避けるべきモック
```typescript
// カスタムフックをモックしない
jest.mock('./hooks/useStatsQuery'); // ❌
jest.mock('@tanstack/react-query'); // ❌

// Contextをモックしない  
jest.mock('@/contexts/AuthContext'); // ❌
```


### 🧪 テストユーティリティの設定

#### test-utils.tsx の実装
```typescript
import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

// テスト用のQueryClientを作成
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// カスタムレンダラー - AuthProviderとQueryClientProviderでラップ
export function renderWithAuthProvider(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// re-export everything
export * from '@testing-library/react';
```

### 🎯 Suspense/ErrorBoundary対応

#### Suspenseを使用するコンポーネントのテスト
- **QueryClientProvider必須**: `renderWithAuthProvider`で自動的に提供
- **ErrorBoundaryモック**: シンプルに`({ children }) => children`でモック
- **非同期待機**: `waitFor`で適切に待機

#### エラーハンドリングのテスト
- **APIエラーモック**: `mockRejectedValue`を使用
- **エラー表示確認**: ErrorBoundaryコンポーネントの表示を確認
- **注意**: テスト環境でのSuspense/ErrorBoundaryの動作は実環境と異なる場合がある

## 🎯 TestF: E2E iOS Scenario Test

### 📋 テスト方針
- **Maestroフレームワーク使用**: iOS E2EテストにはMaestroを使用
- **ガーキン記法でシナリオ定義**: 振る舞いを自然言語で定義
- **YAMLでテスト実装**: Maestroの宣言的な記法でテスト作成
- **実機・シミュレーター両対応**: 開発時はシミュレーター、CI/CDでは実機も対応

### 🛡️ TestF実装チェックリスト

#### ✅ 基本設定
- [ ] アプリ起動は必ず`launch_bypass_signin.yaml`を使用
- [ ] テストデータセットアップは`runScript`で`setup_test_data.js`を使用
- [ ] appIdに`dkanai.OnlineCalendar`を指定
- [ ] ガーキンコメントでシナリオを明確に記述

#### ✅ アプリ起動パターン
```yaml
# ✅ 正しい起動方法 - launch_bypass_signin.yamlを使用
- runFlow: ../flows/launch_bypass_signin.yaml

# ❌ 間違った起動方法 - 手動でサインイン操作をしない
- tapOn: "メールアドレス"
- inputText: "test@example.com"
- tapOn: "パスワード"
- inputText: "password123"
- tapOn: "サインイン"
```

#### ✅ テストデータセットアップ
```yaml
# ✅ 正しいデータセットアップ方法
- runScript:
    file: ../scripts/setup_meeting_stats_data.js
    env:
      API_URL: "http://localhost:3001"

# ❌ 間違った方法 - 手動でデータを作成しない
- tapOn: "新規作成"
- inputText: "テスト会議"
```

#### ✅ Maestroデバッグ時のチェックリスト

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

### 📝 TestF実装例

```yaml
# ios_e2e/flows/meeting_stats.yaml
appId: dkanai.OnlineCalendar
---

# Feature: 会議統計表示機能
# Scenario: 過去7日間の平均会議時間を確認する

# Given: 認証済み状態でアプリを起動
- runFlow: ../flows/launch_bypass_signin.yaml

# Given: 過去7日間の会議データをセットアップ
- runScript:
    file: ../scripts/setup_meeting_stats_data.js
    env:
      API_URL: "http://localhost:3001"

# When: 統計画面へ遷移する
- tapOn: "統計"
- waitForAnimationToEnd

# Then: 平均会議時間が表示される
- assertVisible: "1日あたりの平均会議時間"
- assertVisible: "49.3分"

# And: 週次データが表示される
- assertVisible: "過去7日間の会議時間"
- assertVisible: "月"
- assertVisible: "火"
```

### 🚫 TestFアンチパターン
- ❌ 手動でサインイン操作を実装（launch_bypass_signin.yamlを使用すること）
- ❌ runScriptを使わずに手動でテストデータを作成
- ❌ clearText, clearKeyboardなどの無効なMaestroコマンドの使用
- ❌ ハードコーディングされた待機時間（`sleep`）の多用
- ❌ エラーケースの考慮不足

### 🏃 TestF実行コマンド
```bash
# iOS E2Eテスト全体を実行
yarn e2e:ios

# 特定のテストファイルのみ実行
cd ios_e2e && maestro test flows/meeting_stats.yaml

# デバッグモードで実行（より詳細なログ）
maestro test --debug flows/meeting_stats.yaml
```

## 🎭 E2Eテスト特別ルール

### 🚫 条件分岐禁止
- **Step実装内でのif分岐は禁止**: テストステップ内での条件分岐は避ける
- **シナリオワークフローで表現**: 必要な前提条件は明示的にシナリオステップとして追加する
- **可読性と保守性**: シナリオファイルを見るだけで必要な準備がわかるようにする

```javascript
// ❌ 悪い例 - Step内でif分岐
Given('会議 {string} を作成済み', async function (title) {
  const meeting = await MeetingFactory.create({ title });
  
  // 条件分岐でユーザー作成
  if (title === 'チームミーティング') {
    await UserFactory.create({
      email: 'hanako@example.com',
      name: 'hanako'
    });
  }
});

// ✅ 良い例 - 明示的なシナリオステップ
Given('ユーザー {string} が登録済み', async function (email) {
  await UserFactory.create({
    email: email,
    name: email.split('@')[0]
  });
});
```

```gherkin
# ❌ 悪い例 - 前提条件が不明確
Scenario: オーナーが参加者を招待する
  Given 会議 "チームミーティング" を作成済み
  When オーナーが新しい参加者を招待する
  Then 参加者が正常に追加される

# ✅ 良い例 - 前提条件が明確
Scenario: オーナーが参加者を招待する
  Given ユーザー "hanako@example.com" が登録済み
  And 会議 "チームミーティング" を作成済み
  When オーナーが新しい参加者を招待する
  Then 参加者が正常に追加される
```

### 📝 E2Eシナリオ設計原則
- **明示的な前提条件**: 必要なデータはシナリオステップで明示的に準備する
- **再利用可能なStep**: 汎用的なStepを作成して複数シナリオで再利用する
- **シナリオの自己完結性**: シナリオファイルを読むだけで何が必要かわかるようにする

## 🎯 TestE: iOS Frontend UT

### 📋 テスト方針
- **📱 Screenコンポーネントのテスト**: XxxScreen（SignInScreen、MeetingListScreenなど）をテスト対象とする
- **SwiftUI Viewの振る舞いテスト**: 各Screenの振る舞いを検証
- **ViewInspectorを使用**: SwiftUIビューの検査とインタラクションテスト
- **ユーザー視点のテスト**: 実際のユーザー操作をシミュレート
- **View上での操作・アサート優先**: できる限りView上で操作し、View上でアサート
- **ViewModelアサート許可**: ViewInspectorの限界の場合はViewModel上でのイベント発火・stateアサートも許可

### 🛡️ TestE実装チェックリスト

#### ✅ 基本設定
- [ ] Swift Testingフレームワーク（`@Test`）を使用
- [ ] ViewInspectorでビューを検査
- [ ] `@MainActor`でメインスレッドでの実行を保証
- [ ] EnvironmentObjectの適切な注入

#### ✅ テスト対象
- [ ] **Screenコンポーネントのみをテスト対象とする**（SignInScreen、MeetingListScreen、MeetingStatsScreenなど）
- [ ] **個別のUIコンポーネントはテストしない**（AverageTimeCard、SimpleBarChartなどは対象外）
- [ ] **Screenを通じて間接的に全コンポーネントをテスト**

#### ✅ テスト観点
- [ ] **データ表示**: APIレスポンスがView上に正しく表示される（動的データのみ）
- [ ] **空状態**: データがない場合の適切なメッセージ表示
- [ ] **エラー表示**: APIエラー時のエラーメッセージ表示
- [ ] **ユーザーインタラクション**: タップ、スワイプなどの操作
- [ ] **状態変更**: ボタンタップ後の状態変化を確認
- [ ] ⚠️ **静的な文字列の表示確認は不要**（例：アプリタイトル、固定ラベルなど）

#### ✅ カバレッジ戦略
- [ ] カバレッジレポートを確認しながらテストを追加
- [ ] 未カバーの関数・行を特定してテスト追加
- [ ] **除外対象**: `.task`, `.refreshable`などの非同期モディファイアはカバー不要
- [ ] **Screenテストを通じてコンポーネントのカバレッジも向上させる**

### 📝 実装例（MeetingListScreenSpec）

```swift
@Suite("MeetingListScreen振る舞いテスト")
struct MeetingListScreenSpec {
    
    @Test("会議がListに表示される")
    @MainActor
    func test1() async throws {
        // Given - APIレスポンスをモック
        let mockRepository = MockMeetingRepository()
        let mockMeeting = Meeting(
            id: "1",
            title: "テスト会議",
            description: "テスト用の会議",
            startDate: Date(),
            endDate: Date().addingTimeInterval(3600),
            organizer: Organizer(id: "org1", name: "テスト主催者", email: "test@example.com"),
            participants: []
        )
        mockRepository.fetchMeetingsResult = .success([mockMeeting])
        
        // ViewModelとViewを準備
        let viewModel = MeetingListViewModel(repository: mockRepository)
        let authState = AuthState.shared
        let view = MeetingListScreen(viewModel: viewModel).environmentObject(authState)

        // When - loadMeetingsを呼び出してデータをロード
        await viewModel.loadMeetings()
        
        // ViewInspectorでビューを検査
        let inspection = try view.inspect()

        // Then - ビューに会議タイトルが表示されていることを確認
        let elem = try inspection.find(text: "テスト会議")
        #expect(try elem.string() == "テスト会議")
    }
}
```

### 🎨 View操作の実装パターン

#### ✅ View上での操作（推奨）
```swift
@Test("会議をタップするとselectMeetingが呼ばれる")
@MainActor
func test4() async throws {
    // Given - 会議データをモック
    let mockRepository = MockMeetingRepository()
    let mockMeeting = Meeting(/* ... */)
    mockRepository.fetchMeetingsResult = .success([mockMeeting])
    
    // ViewModelとViewを準備
    let viewModel = MeetingListViewModel(repository: mockRepository)
    let authState = AuthState.shared
    let view = MeetingListView(viewModel: viewModel).environmentObject(authState)

    // When - loadMeetingsを呼び出してデータをロード
    await viewModel.loadMeetings()
    
    // ViewInspectorでビューを検査してidでMeetingRowを見つける
    let inspection = try view.inspect()
    let meetingRow = try inspection.find(viewWithId: "meetingRow_1")
    
    // Then - onTapGestureアクションを実行
    try meetingRow.callOnTapGesture()
    
    // selectMeetingが呼ばれたことを確認（ViewModelの状態で確認）
    #expect(viewModel.selectedMeeting?.id == "1")
    #expect(viewModel.selectedMeeting?.title == "テスト会議")
}
```

#### ✅ View内容のアサート（推奨）
```swift
@Test("refreshableで会議一覧が更新される")
@MainActor
func test5() async throws {
    // Given - 初期データと更新後データをモック
    let mockRepository = MockMeetingRepository()
    let initialMeeting = Meeting(/* ... */)
    mockRepository.fetchMeetingsResult = .success([initialMeeting])
    
    // ViewModelとViewを準備
    let viewModel = MeetingListViewModel(repository: mockRepository)
    let authState = AuthState.shared
    let view = MeetingListView(viewModel: viewModel).environmentObject(authState)

    // 初期データをロード
    await viewModel.loadMeetings()
    
    // 初期データが画面に表示されていることを確認
    let initialInspection = try view.inspect()
    let initialMeetingText = try initialInspection.find(text: "初期会議")
    #expect(try initialMeetingText.string() == "初期会議")
    
    // When - 更新後のデータを設定してrefresh
    let updatedMeeting = Meeting(/* ... */)
    mockRepository.fetchMeetingsResult = .success([updatedMeeting])
    await viewModel.refreshMeetings()
    
    // Then - 更新後のデータが画面に表示されていることを確認
    let updatedInspection = try view.inspect()
    let updatedMeetingText = try updatedInspection.find(text: "更新後会議")
    #expect(try updatedMeetingText.string() == "更新後会議")
}
```

### 🚫 TestEアンチパターン
- ❌ Screen以外のViewコンポーネントを直接テスト（Screenコンポーネントのみをテスト対象とする）
- ❌ ViewModelのメソッドを直接呼ぶだけのテスト（Viewの検証なし）
- ❌ カバレッジのためだけの意味のないテスト
- ❌ `.task`や`.refreshable`の内部実装をテスト
- ❌ **静的な表示確認テスト**（例：「オンラインカレンダー」というタイトルが表示されることの確認）
- ❌ **コンポーネントに対する個別テスト**（AverageTimeCard、SimpleBarChartなど個別コンポーネントのテストは書かない）

### 📊 カバレッジ管理
1. **HTML Coverage Report生成**
   ```bash
   npm run ios:ut
   ```
2. **カバレッジ確認**
   - `ios/coverage/index.html`を確認
   - 関数レベル・行レベルのカバレッジを確認
3. **除外設定**
   - APIClient、Repositoryはカバレッジから除外
   - ViewInspectorライブラリも除外

## 📂 テストファイル配置ルール

- 📁 **specはコードのそばに置く**: テストファイル（`.spec.ts`）は実装ファイルと同じディレクトリに配置する
- 🔗 **関連性の可視化**: コードとテストが同じ場所にあることで保守性と発見しやすさを向上

```
src/modules/meeting/controllers/
├── meeting.controller.ts      # 実装ファイル
└── meeting.controller.spec.ts # テストファイル（同じディレクトリ）
```