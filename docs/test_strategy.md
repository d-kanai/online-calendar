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