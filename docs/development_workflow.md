# 🚀 開発ワークフロー

## 🎯 ATDD開発プロセス（必須）

**すべての機能開発はATDD（Acceptance Test-Driven Development）で実施すること** 🔥

### 📋 開発プロセス手順

**以下のプロセスをclaude code TODOとして利用し開発を進めること**

**1. 📝 対象のシナリオを確認**
- `e2e/features/` ディレクトリのGherkinシナリオを確認
- 実装対象の `@develop` タグ付きシナリオを特定
- ビジネス要件とユーザーアクションを理解

**2. 🚨 E2E実行（AT Red）**
```bash
yarn e2e:develop
```
- まず失敗することを確認（Red段階）
- failしたstepを詳細に確認・分析
- **📋 チェックリスト確認**: [E2E Spec Rule](./e2e_spec_rule.md)のE2Eテスト実装チェックリストを参照

**3. 🎨 Frontend実装**
- failをパスさせるためにstep定義を実装
- 必要に応じてfrontendコンポーネント・フックを実装
- UI動作・状態管理・エラーハンドリングを実装
- yarn front:ut in root
- **📋 チェックリスト確認**: [Frontend Architecture](./frontend_architecture.md)の各実装チェックリストを参照
  - Custom Hooks Pattern実装チェックリスト
  - Next.js App Router実装チェックリスト
  - Zodバリデーション実装チェックリスト
  - React Hook Form統合チェックリスト
  - TanStack Query実装チェックリスト

**4. 🧪 Backend TDD開始（TestA実装）**
- backend連携がある場合はTDDプロセス開始
- **TestA**をまずは実装・実行してfail確認
- frontendと結合するAPIの開発をする
- **📋 チェックリスト確認**: [Test Strategy](./test_strategy.md)のTestA実装チェックリストを参照
  - 基本設定チェックリスト
  - 正常系テストチェックリスト
  - 異常系テストチェックリスト
  - レスポンス検証チェックリスト
  - DB変更時の必須チェック

**5. 🔴 Backend Test実行（UT Red）**
```bash
yarn back:ut
```
- APIテストが失敗することを確認（Red）
- 期待するエラーメッセージ・振る舞いを確認

**6. ⚡ Backend実装（UT Green）**
- backend testをpassするように実装
- Controller・Application・Domain層を順次実装
- Exception設計とエラーハンドリング統一
- **📋 チェックリスト確認**: [Backend Architecture](./backend_architecture.md)の各実装チェックリストを参照
  - Presentation層実装チェックリスト
  - Application層実装チェックリスト
  - Domain層実装チェックリスト
  - Domain Validation実装チェックリスト
  - Infrastructure層実装チェックリスト

**7. 🧪 Frontend Test実装（TestC）**
- TestCルールに従ってFrontendページの振る舞いテストを実装
- Backend APIとの結合が正しく動作することを確認
- Frontend単体でのエラーがないことを保証
- yarn front:ut in root
- **📋 チェックリスト確認**: [Test Strategy](./test_strategy.md)のTestC実装チェックリストを参照
  - テスト管理（新機能追加時）チェックリスト
  - Query（取得API）テストチェックリスト
  - Mutation（更新API）テストチェックリスト
  - バリデーションテストチェックリスト
  - エラーハンドリングテストチェックリスト
- **📊 カバレッジ確認**: テスト実行後にカバレッジレポートを確認
  - 80%以下のファイル（特にカスタムフック）を特定
  - 使用されている機能 → page.spec.tsxで振る舞いテスト追加
  - 未使用の機能 → 実装を削除してコードベースをクリーンに保つ
  - 詳細は[Test Strategy](./test_strategy.md)のATDDプロセス - ステップ7参照

**8. 🔧 TypeCheck & Fix（品質保証段階）**
```bash
yarn typecheck
```
- Frontend/Backend全体の型安全性を確認
- 型エラーが発生した場合は即座に修正
- 型安全な実装で回帰バグを予防

**9. 🔄 全テスト確認 (All Tests Green)**
- 以下の3つのテストが全てパスすることを確認：
  - **E2E Test (TestD)**: 対象のシナリオがpassする
  - **Backend Test (TestA)**: APIテストがpassする
  - **Frontend Test (TestC)**: ページ振る舞いテストがpassする
- 3つ全てがパスするまで実装を調整
- 予期せぬfailした際は各テストのデバッグルールに沿ってfix
- **🔥 E2E失敗時のデバッグ順序**:
  1. APIレスポンス確認: 新フィールドが正しく返されているか
  2. フロントエンド表示確認: APIデータが正しくUIに反映されているか
  3. React Query Suspenseクエリ: キャッシュ更新が正しく動作しているか

**10. リファクタリング**
- アーキテクチャルール・コード品質・設計原則を確認してリファクタリング

**11. 🧹 Dead Code Detection（最終品質保証段階）**
```bash
yarn dead-code
```
- 未使用ファイル・exports・types・dependenciesを検出
- リファクタリング完了後にコードベースをクリーンアップ
- 保守性向上とバンドルサイズ最適化
- 検出された不要コードは削除を検討

#### 🔍 Dead Code Detection実行パターン
```bash
# 全体スキャン
yarn dead-code

# ワークスペース別詳細確認
yarn dead-code:backend   # Backend専用
yarn dead-code:frontend  # Frontend専用 
yarn dead-code:e2e       # E2E関連

# 自動修正（慎重に使用）
yarn dead-code:fix
```

#### ⚠️ Dead Code Detection時の注意点
- **📝 レビュー必須**: 削除前に未使用コードの影響を確認
- **🔄 段階的削除**: 大量削除せず、少しずつクリーンアップ
- **🧪 テスト実行**: 削除後は必ずテスト実行で動作確認
- **💾 事前コミット**: 削除作業前は必ずgit commitで保存

### ⚠️ ATDD実施時の注意点

- **🚫 実装ファーストの禁止**: テストなしでの実装は絶対に行わない
- **🎯 一つずつ進める**: 複数シナリオを並行実装しない
- **✅ 5つパス必須**: E2E test (TestD) + Backend test (TestA) + Frontend test (TestC) + typecheck + dead-code detection の全てが成功するまで完了としない
- **📊 継続確認**: 実装中も定期的にテスト実行して状態確認
- **🔧 型安全優先**: TypeCheckエラーは他の作業より優先して修正
- **🛡️ Validation二重チェック**: Frontend + Backend両方でvalidation実装必須
- **🧪 Backend修正時のテスト必須**: Backendコードを修正した場合は必ずAPI Test (TestA) も合わせて修正・確認すること

## 📋 開発プロセス別チェックリスト参照

### 📖 Flow 2: E2E実装時
**参照ドキュメント**: [E2E Spec Rule](./e2e_spec_rule.md)
- **🚨 E2Eテスト失敗時の対応手順チェックリスト**: 最優先でスクリーンショットとログ確認
- **⚡ E2E待機戦略ルールチェックリスト**: 固定待機禁止、動的待機必須
- **📊 E2Eステップ分離ルールチェックリスト**: auth/data/feature別ファイル構成
- **🎭 Page Objectパターンチェックリスト**: DOM操作の集約と抽象化

### 🎨 Flow 3: Frontend実装時
**参照ドキュメント**: [Frontend Architecture](./frontend_architecture.md)
- **🪝 Custom Hooks Pattern実装チェックリスト**: 単一責任・フック分類・連携
- **🛣️ Next.js App Router実装チェックリスト**: ページ構造・ルーティング・パフォーマンス
- **🎨 Frontend Zodバリデーション実装チェックリスト**: スキーマ定義・フォーム統合・ビジネスルール
- **🛠️ React Hook Form統合チェックリスト**: 基本設定・フォーム要素・パフォーマンス
- **⚡ TanStack Query実装チェックリスト**: Query Key Factory・データフェッチング・Mutation

### 🧪 Flow 4-5: Backend Test実装時（TestA）
**参照ドキュメント**: [Test Strategy](./test_strategy.md) - TestA章
- **✅ 基本設定チェックリスト**: 独立したspecファイル・データベースリセット・Factory使用
- **✅ 正常系テストチェックリスト**: GET/POST/PUT/DELETE系の適切な検証
- **✅ 異常系テストチェックリスト**: バリデーション・認証・リソース不在・ビジネスロジックエラー
- **✅ レスポンス検証チェックリスト**: HTTPステータス・ボディ構造・エラーメッセージ
- **✅ DB変更時の必須チェック**: ドメインモデル・Repository・Output型・変換関数

### 🖥️ Flow 6: Backend実装時
**参照ドキュメント**: [Backend Architecture](./backend_architecture.md)
- **🛡️ Presentation層実装チェックリスト**: 基本設計・Output型設計・レスポンス返却・禁止事項
- **🛡️ Application層実装チェックリスト**: 基本設計・依存関係・許可処理・禁止事項・エラーハンドリング
- **🛡️ Domain層実装チェックリスト**: 基本設計・処理集約・モデル設計・認証関連・Transaction Script回避
- **🛡️ Domain Validation実装チェックリスト**: Zodバリデーション原則・実装
- **🛡️ Infrastructure層実装チェックリスト**: Repository設計・Mapping責務

### 🎭 Flow 7: Frontend Test実装時（TestC）
**参照ドキュメント**: [Test Strategy](./test_strategy.md) - TestC章
- **✅ テスト管理チェックリスト**: 新機能追加時の既存テスト保持・機能別整理
- **✅ Query（取得API）テストチェックリスト**: API呼び出し確認・データ表示検証
- **✅ Mutation（更新API）テストチェックリスト**: APIパラメータ・ルーティング・トースト通知の3観点必須
- **✅ バリデーションテストチェックリスト**: エラー表示・API呼び出し防止確認
- **✅ エラーハンドリングテストチェックリスト**: APIエラー時の適切な処理

このプロセスにより、品質の高い機能を確実に実装し、回帰バグを防止できる 🛡️

## ⚡ 基本コマンド

### 🖥️ Backend開発
```bash
# 🚀 開発サーバー起動（ホットリロード対応）- プロジェクトルートで実行
yarn back:dev

# 🧪 テスト実行（一回のみ）
yarn workspace online-calendar-backend test:run

# 🔄 テスト実行（ウォッチモード）
yarn workspace online-calendar-backend test

# 🏗️ ビルド
yarn workspace online-calendar-backend build

# 🚀 本番サーバー起動
yarn back:start
```

### 🎨 Frontend開発
```bash
# 🚀 開発サーバー起動 - プロジェクトルートで実行
yarn front:dev

# 🏗️ ビルド
yarn front:build

# 🚀 本番サーバー起動
yarn front:start

# 🔍 Lint実行
yarn front:lint

# 🔧 型チェック実行
yarn front:typecheck
```

### 🛡️ 全体品質チェック
```bash
# 🔧 Frontend + Backend 統合型チェック
yarn typecheck

# 🧹 Dead Code Detection（未使用コード検出）
yarn dead-code

# 🔧 Backend のみ型チェック
yarn back:typecheck

# 🔧 Frontend のみ型チェック
yarn front:typecheck

# 🧹 ワークスペース別 Dead Code 検出
yarn dead-code:backend   # Backend専用
yarn dead-code:frontend  # Frontend専用
yarn dead-code:e2e       # E2E関連
```

## 🛡️ Validation二重実装ルール

### 🎯 基本原則
- **✅ Frontend/Backend両方必須**: すべてのvalidationはFrontend + Backend の二重実装が必要
- **⚡ Frontend**: UX向上のためのリアルタイムフィードバック
- **🔒 Backend**: セキュリティとデータ整合性のための堅牢な最終防衛線
- **🚫 片方のみ禁止**: どちらか一方だけの実装は絶対に禁止

### 🎨 Frontend Validation責務
- **👤 UX最適化**: ユーザーの即座フィードバックとエラー防止
- **⚡ リアルタイム検証**: フォーム入力中の即座バリデーション
- **🎯 UI状態管理**: エラー表示・非表示の制御
- **📱 クライアント最適化**: ネットワーク通信削減

#### Frontend実装パターン
```typescript
const validateForm = () => {
  const newErrors: string[] = [];
  
  // 必須項目チェック
  if (!formData.title.trim()) {
    newErrors.push('タイトルは必須項目です');
  }
  
  // 形式チェック
  if (!formData.startTime) {
    newErrors.push('開始時刻は必須項目です');
  }
  
  // ビジネスルールチェック
  if (formData.startTime && formData.endTime) {
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.push('終了時刻は開始時刻より後に設定してください');
    }
  }
  
  setErrors(newErrors);
  return newErrors.length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ✅ Frontend validation必須実行
  if (!validateForm()) {
    return; // エラー時は送信しない
  }
  
  try {
    await onSubmit(meetingData);
  } catch (error) {
    // Backend validationエラーもハンドリング
    setErrors([error.message]);
  }
};
```

### 🔒 Backend Validation責務  
- **🛡️ セキュリティ防衛**: 悪意ある入力からの最終防護
- **📊 データ整合性**: データベース制約の確実な維持
- **🎭 ドメインルール**: ビジネス不変条件の絶対保証
- **🔒 堅牢性**: Frontendバイパス攻撃からの保護

#### Backend Domain実装パターン
```typescript
export const CreateMeetingDataSchema = z.object({
  title: z.string()
    .min(1, '会議タイトルは必須です')
    .max(100, '会議タイトルは100文字以内で入力してください')
    .trim(),
  startTime: z.date({
    message: '開始時刻は必須です'
  }).refine(
    (date) => !isNaN(date.getTime()),
    { message: '開始時刻の形式が正しくありません' }
  ),
  endTime: z.date({
    message: '終了時刻は必須です'
  }).refine(
    (date) => !isNaN(date.getTime()),
    { message: '終了時刻の形式が正しくありません' }
  ),
  ownerId: z.string()
    .min(1, 'オーナーIDは必須です')
    .trim()
}).refine(
  (data) => data.startTime < data.endTime,
  {
    message: '開始時刻は終了時刻より前である必要があります',
    path: ['startTime']
  }
).refine(
  (data) => {
    const duration = data.endTime.getTime() - data.startTime.getTime();
    return duration >= 15 * 60 * 1000; // 15分以上
  },
  {
    message: '会議は15分以上である必要があります',
    path: ['endTime']
  }
);

export class Meeting {
  static create(data: CreateMeetingData): Meeting {
    try {
      // 🔒 Domain層での堅牢validation
      const validatedData = CreateMeetingDataSchema.parse(data);
      return new Meeting(/* validated data */);
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues;
        if (issues && issues.length > 0) {
          throw new Error(issues[0].message);
        }
        throw new Error('Validation failed');
      }
      throw error;
    }
  }
}
```

### ⚖️ 責務分散原則
- **Frontend**: ユーザビリティとパフォーマンス重視
- **Backend**: セキュリティとデータ整合性重視
- **両方同期**: 同じビジネスルールを両方で実装
- **Backend最終**: 最終的な決定権はBackend Domain層

### 🚨 重要な実装ルール
- **🔄 ルール同期**: Frontend/Backendで同じvalidationルールを維持
- **🎯 Backend厳格**: Backendは常にFrontendより厳格に実装
- **💬 メッセージ統一**: エラーメッセージは可能な限り統一
- **🧪 テスト必須**: Frontend/Backend両方でvalidationテストを実装
- **📝 ドキュメント**: ビジネスルールの変更時は両方を同時更新

## 📚 文書化ルール

- 🇯🇵 ドキュメントファイルは日本語で記述すること