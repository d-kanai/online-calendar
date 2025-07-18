# 🧪 テスト戦略

## 📋 テスト種別一覧

| テスト種別 | 対象領域 | テスト内容 |
|-----------|---------|-----------|
| **TestA** | Backend | API in-out Test |
| **TestB** | Backend | Domain Layer Pattern Test |
| **TestC** | Frontend | Page Event Test |
| **TestD** | E2E Test | Scenario Test |

## 🎯 TestA: Controller API テスト

### 📋 テスト方針
- **Controller 1 methodに対してのspec**: 各Controllerメソッドごとに独立したテストケースを作成
- **API in-out test**: HTTPリクエスト/レスポンスの入出力テスト
- **no mock**: モックを使用せず、実際のデータベースとサービス層を使用
- **use real database**: 実際のSQLiteデータベースを使用した統合テスト

### 🔄 テストデータ管理
- **test caseごとにデータは用意する**: 各テストケース内でテスト用データを準備
- **before each 毎回リセットする**: `beforeEach`でデータベースをクリアして独立性を保証
- **ファクトリ使用ルール**: テストの意図に応じてデータ作成方法を選択する

```typescript
beforeEach(async () => {
  // テーブルの全データを削除してクリーンな状態にする
  await prisma.meeting.deleteMany();
});
```

#### 🏭 ファクトリ使用方針
**特定の値が重要な場合**: 明示的に値を指定してビジネスロジックをテスト
```typescript
// Given - 開始時刻が重要なテスト
await meetingFactory.create({
  startTime: new Date('2025-01-15T10:00:00Z'),
  endTime: new Date('2025-01-15T11:00:00Z')
});
```

**件数や存在だけが重要な場合**: デフォルト値を使用してシンプルに
```typescript
// Given - データの存在のみが重要（全てデフォルト値）
await meetingFactory.create({});
await meetingFactory.create({});
```

### 📝 テスト構成例
```typescript
test('getAllMeetings - 複数の会議データが開始時刻順でソートされて取得できる', async () => {
  // Given - テストデータ準備
  await prisma.meeting.create({
    data: {
      title: 'テスト会議1',
      startTime: new Date('2025-01-15T10:00:00Z'),
      endTime: new Date('2025-01-15T11:00:00Z'),
      isImportant: false,
      ownerId: 'user123'
    }
  });

  // When - 実行
  const mockContext = createMockContext();
  const response = await meetingController.getAllMeetings(mockContext);

  // Then - 検証
  expect(response.data.success).toBe(true);
  expect(response.data.data).toHaveLength(1);
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
- **APIレイヤーでのモック**: APIレイヤーのみをモックし、それ以外は実装を使用
- **結合度の最大化**: Context、Hooks、コンポーネントは実際の実装を使用してモック領域を最小化
- **副作用の確認**: ルーティング、トースト通知などの副作用を検証
- **⚠️ 重要**: TestCは必ずpage.tsxファイルに対するテストであること
- **🚫 コンポーネントモック禁止**: 子コンポーネントは実際の実装を使用し、モックしない

### 📊 テスト観点別の実装パターン

| API種別 | テスト観点 | 実装方法 |
|---------|-----------|----------|
| **取得API (Query)** | データ表示の検証 | **Given**: APIレスポンスをモック定義<br>**When**: ページをレンダリング<br>**Then**: 取得した値が画面に表示されていることを確認 |
| **更新API (Mutation)** | フォーム送信の検証 | **Given**: フォーム入力とsubmit<br>**When**: ユーザー操作をシミュレート<br>**Then**: ①APIに正しいパラメータが渡される<br>②成功時のルーティング<br>③トースト通知の表示 |
| **フォームバリデーション** | 入力検証の確認 | **Given**: 不正な入力値<br>**When**: フォーム送信を試行<br>**Then**: ①エラーメッセージが表示される<br>②APIが呼ばれないことを確認 |
| **イベントハンドリング** | 全イベントのカバー | **Given**: ページ/コンポーネントのレンダリング<br>**When**: クリック等のユーザーイベント発生<br>**Then**: 期待される振る舞い（ルーティング、状態変更等）を確認<br>**注**: カバレッジレポートで未カバーのイベントを特定 |
| **APIレスポンス検証** | データの包括的アサート | **原則**: APIで返すデータは基本的に画面で使用されるため、モックで設定した値は可能な限り画面でアサートする<br>**実装**: モックデータの全フィールドが画面に表示されることを確認 |

### 📝 実装例

#### 取得API（データ表示）のテスト
```typescript
it('会議一覧が表示される', async () => {
  // Given - APIレスポンスをモック
  (meetingApi.getMeetings as jest.Mock).mockResolvedValue({
    meetings: [
      { id: '1', title: 'チームミーティング', startTime: '2025-01-20T10:00:00Z' },
      { id: '2', title: '進捗確認', startTime: '2025-01-20T14:00:00Z' }
    ]
  });

  // When - ページをレンダリング
  renderWithProviders(<MeetingListPage />);

  // Then - データが画面に表示されていることを確認
  await waitFor(() => {
    expect(screen.getByText('チームミーティング')).toBeVisible();
    expect(screen.getByText('進捗確認')).toBeVisible();
  });
});
```

#### APIレスポンス包括的アサートのテスト
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

  // When - ページをレンダリング
  renderWithProviders(<StatsPage />);

  // Then - APIで返す全データが画面に表示されることを確認
  await waitFor(() => {
    // 平均値のアサート
    expect(screen.getByTestId('daily-average-time')).toHaveTextContent('120.5分');
    
    // 週次データの全項目をアサート
    expect(screen.getByText('月')).toBeVisible();
    expect(screen.getByText('火')).toBeVisible();
    expect(screen.getByText('水')).toBeVisible();
    expect(screen.getByText('木')).toBeVisible();
    expect(screen.getByText('金')).toBeVisible();
    expect(screen.getByText('土')).toBeVisible();
    expect(screen.getByText('日')).toBeVisible();
    
    // 実際の時間データもアサート
    expect(screen.getByText('90分')).toBeVisible();
    expect(screen.getByText('150分')).toBeVisible();
    expect(screen.getByText('120分')).toBeVisible();
    expect(screen.getByText('180分')).toBeVisible();
    expect(screen.getByText('60分')).toBeVisible();
  });
});
```

#### 更新API（フォーム送信）のテスト
```typescript
it('フォーム送信後、正しく処理される', async () => {
  // Given - APIモックとユーザーイベントのセットアップ
  const user = userEvent.setup();
  renderWithProviders(<SignUpPage />);
  
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
  renderWithProviders(<SignUpPage />);

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
  renderWithProviders(<SignUpPage />);

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
- **モック最小化の原則**: APIレイヤー（`authApi`, `meetingApi`など）のみをモックし、他は実装を使用
- **実装の結合**: AuthContext、カスタムHooks、UIコンポーネントは実際の実装を使用
- **非同期処理の考慮**: `waitFor`を使用して非同期処理を適切に待機
- **ユーザー操作の再現**: `@testing-library/user-event`で実際の操作を忠実に再現
- **複数の検証**: 1つのユーザーアクションに対する複数の結果を包括的に検証
- **バリデーションテスト**: フロントエンドのバリデーションロジックが正しく動作することを確認
- **イベントカバレッジ**: カバレッジレポートを活用し、全てのクリックイベント等をテストでカバー

### 📌 モック戦略
```typescript
// ✅ 良い例 - APIレイヤーのみモック
jest.mock('@/app/auth/apis/auth.api', () => ({
  authApi: {
    signUp: jest.fn(),
    signIn: jest.fn()
  }
}));

// ❌ 悪い例 - Contextやカスタムフックをモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ ... })  // これは避ける
}));
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

## 📂 テストファイル配置ルール

- 📁 **specはコードのそばに置く**: テストファイル（`.spec.ts`）は実装ファイルと同じディレクトリに配置する
- 🔗 **関連性の可視化**: コードとテストが同じ場所にあることで保守性と発見しやすさを向上

```
src/modules/meeting/controllers/
├── meeting.controller.ts      # 実装ファイル
└── meeting.controller.spec.ts # テストファイル（同じディレクトリ）
```