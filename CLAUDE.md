# 🎯 CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します 🤖✨

# 🚀 開発ワークフロー

## 🎪 BDD駆動開発とFigma Make連携ワークフロー

このプロジェクトでは、ビジネス要件をGherkin仕様で定義し、Figma Makeを活用してUIを作成、Next.jsに統合する開発手法を採用している 🌟

### 🎬 ワークフローの4段階

**1. 📝 ガーキンで仕様を表現**
- 📂 ビジネス要件をGherkin構文で`features/`ディレクトリに記述
- 🎯 `Feature` → `Rule` → `Scenario`の階層で整理
- 💼 ビジネスルールのみを記載し、UIの詳細は含めない
- 🔍 実装前に仕様レビューを実施してビジネス価値を確認

**2. 🎨 Figma MakeにGherkinを入力してUIを作成**
- 📋 作成したGherkin仕様をFigma Makeにプロンプトとして入力
- 💬 「このGherkin仕様に基づいてUIを作成してください」として依頼
- 🤖 Figma Makeが仕様を理解してUI設計とコンポーネントを自動生成
- ⚙️ 必要に応じてUI調整や追加要件を指示

**3. 📦 Figma Makeで作成されたCodeをコピーして設置**
- 📤 Figma Makeの「Export Code」機能でReactコンポーネントを出力
- 📁 出力されたコードを`frontend/figma-make-code/`ディレクトリに保存
- 🔗 生成されたファイル構造と依存関係を確認
- 🧩 UIコンポーネントとビジネスロジックの分離を検証

**4. ⚡ Figma Make CodeをNext.jsに組み込み**
- 🔄 `frontend/figma-make-code/`のコードをNext.jsプロジェクトに統合
- 📐 「Figma Make Code統合ルール」に従って以下を実行：
  - 📂 ファイル配置（types → src/types、ui → src/lib/ui、components → src/components）
  - 🔗 importパス修正（相対パス調整、バージョン指定削除）
  - ⚛️ Next.js対応（'use client'追加、App Router形式変換）
  - 📦 依存関係インストール（必須パッケージ追加）
  - 🎨 CSS設定更新（shadcn/ui互換変数追加）

### ⚠️ ワークフロー実行時の注意点

**📝 仕様作成フェーズ：**
- 🎯 ビジネスルールとUIルールを明確に分離
- 💡 実装詳細ではなく、ビジネス価値に焦点を当てる
- 🤝 ステークホルダーとの合意形成を重視

**🎨 UI作成フェーズ：**
- 📋 Gherkin仕様をそのままFigma Makeに入力
- ✅ 生成されたUIがビジネス要件を満たしているか検証
- 🔧 必要に応じてUIの微調整を依頼

**⚙️ コード統合フェーズ：**
- 📏 既存のコード規約とアーキテクチャに準拠
- 🛡️ バリデーション・エラーハンドリングの実装確認
- 🧪 テスト実行とビルド確認

**🔍 品質保証：**
- ✅ 実装後にGherkin仕様との整合性を確認
- 🎯 UIルールとビジネスルールの適切な分離を維持
- 🔗 統合テストでエンドツーエンドの動作を検証

このワークフローにより、ビジネス要件の明確化からUI実装まで一貫性のある開発プロセスを実現できる 🎉

## 🎯 ATDD開発プロセス（必須）

**すべての機能開発はATDD（Acceptance Test-Driven Development）で実施すること** 🔥

### 📋 開発プロセス手順

**1. 📝 対象のシナリオを確認**
- `e2e/features/` ディレクトリのGherkinシナリオを確認
- 実装対象の `@develop` タグ付きシナリオを特定
- ビジネス要件とユーザーアクションを理解

**2. 🚨 E2E実行（Red段階）**
```bash
yarn e2e:develop
```
- まず失敗することを確認（Red段階）
- failしたstepを詳細に確認・分析

**3. 🎨 Frontend実装（Green段階）**
- failをパスさせるためにstep定義を実装
- 必要に応じてfrontendコンポーネント・フックを実装
- UI動作・状態管理・エラーハンドリングを実装

**4. 🧪 Backend TDD開始（TestA実装）**
- backend連携がある場合はTDDプロセス開始
- **TestA: API test**をまずは実装・実行してfail確認

**5. 🔴 Backend Test実行（Red確認）**
```bash
yarn ut
```
- APIテストが失敗することを確認（Red段階）
- 期待するエラーメッセージ・振る舞いを確認

**6. ⚡ Backend実装（Green段階）**
- backend testをpassするように実装
- Controller・Application・Domain層を順次実装
- Exception駆動設計とエラーハンドリング統一

**7. 🔄 統合確認（Refactor段階）**
- 対象のシナリオがpassするまで繰り返し
- **backend test** と **e2e test** 両方がパスするように実装を進める
- コード品質・設計原則を確認してリファクタリング

### ⚠️ ATDD実施時の注意点

- **🚫 実装ファーストの禁止**: テストなしでの実装は絶対に行わない
- **🎯 一つずつ進める**: 複数シナリオを並行実装しない
- **✅ 両方パス必須**: backend test単体 + e2e test統合の両方が成功するまで完了としない
- **📊 継続確認**: 実装中も定期的にテスト実行して状態確認

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
```

## 🌿 Git運用ルール

- 💬 Commitコメントは日本語で箇条書きスタイルで記述すること
- 🤔 変更の理由（why）をできる限り含めること
- 🚀 git pushは自動実行（確認なし）で行うこと

## 🎨 Figma Make Code統合ルール

### 🏗️ プロジェクト構造
Figma Make Codeから出力されたコードをNext.jsプロジェクトに統合する際は以下の構造を使用すること：

```
frontend/src/
├── types/              # 📝 型定義ファイル（meeting.ts等）
├── lib/ui/            # 🧩 UIコンポーネントライブラリ（shadcn/ui互換）
├── components/        # ⚛️ 機能コンポーネント（CalendarView等）
└── app/
    ├── globals.css    # 🎨 Tailwind設定とCSS変数
    └── page.tsx       # 📄 メインページ
```

### 🔧 統合手順

#### 1. 📂 ファイル配置
- 📝 型定義: `figma-make-code/types/` → `src/types/`
- 🧩 UIライブラリ: `figma-make-code/components/ui/` → `src/lib/ui/`
- ⚛️ 機能コンポーネント: `figma-make-code/components/` → `src/components/`
- 📄 メインアプリ: `App.tsx` → `src/app/page.tsx`

#### 2. 🔗 importパス修正
- 📂 `./ui/` → `../lib/ui/`
- 📂 `../types/` → `../types/`
- ❌ バージョン指定削除: `@radix-ui/react-dialog@1.1.6` → `@radix-ui/react-dialog`

#### 3. ⚛️ Next.js対応
- 📝 `'use client';`ディレクティブ追加（Client Componentの場合）
- 🔄 App Router形式への変換
- 🖥️ React Server Components対応

#### 4. 📦 依存関係管理
必須パッケージのインストール:
```bash
# 🔧 基本パッケージ
npm install lucide-react sonner

# ⚛️ Radix UI基盤
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# 🧩 必要なRadix UIコンポーネント
npm install @radix-ui/react-dialog @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-separator
```

#### 5. 🎨 Tailwind CSS設定
`globals.css`にshadcn/ui互換のCSS変数を追加:
- 🌈 カラーパレット変数（primary, secondary, muted等）
- 🌙 ライト/ダークテーマ対応
- ⚡ Tailwind CSS v4の@theme構文使用

#### 6. 🤖 自動修正コマンド
```bash
# ❌ バージョン指定削除
find src/lib/ui -name "*.tsx" -exec sed -i '' 's/@[0-9][^"]*//g' {} \;
```

### 🧪 検証手順
1. 🚀 `npm run dev`で開発サーバー起動確認
2. 🔧 依存関係エラーの解決
3. 🎨 CSSスタイル適用確認
4. ✅ 全機能の動作テスト

### 🚨 トラブルシューティング
- **🎨 CSSが当たらない**: CSS変数の不足、@theme構文エラー
- **🔗 import文エラー**: パス間違い、バージョン指定残存
- **📦 依存関係エラー**: 必須パッケージの未インストール

この手順に従うことで、Figma Make Codeから出力されたコードを効率的にNext.jsプロジェクトに統合できる 🎉

# 🏗️ アーキテクチャ

## 🚨 エラーハンドリング共通設計

### 🎯 基本原則
- **🎪 Presentation層**: ハッピーパスのみ処理
- **⚙️ Application層**: Exception駆動でビジネスエラーを表現
- **🔄 共通処理**: Honoのグローバルエラーハンドラーで統一レスポンス

### 🏗️ 実装構成
```
shared/
├── exceptions/
│   └── http-exceptions.ts    # HTTPException基底クラス
└── middleware/
    └── error-handler.ts      # Honoグローバルエラーハンドラー
```

### 🔄 エラーフロー
```
Application Layer → throw HttpException
       ↓
Hono Error Handler → catch HttpException
       ↓
Unified JSON Response → { success: false, error: message }
```

### 📋 実装例
```typescript
// Route設定
meetingRoutes.onError(errorHandler);

// Application Layer
if (!meeting) {
  throw new NotFoundException('Meeting not found');
}

// Error Handler
if (err instanceof HttpException) {
  return c.json({ success: false, error: err.message }, err.statusCode);
}
```

この設計により、エラーハンドリングが統一され、Controller層が大幅に簡素化される 🎯

# 🖥️ Backendアーキテクチャルール

## 🏗️ DDD/Clean Architecture 構造

Backendモジュールは以下のDDD（ドメイン駆動設計）とClean Architectureの原則に従って構成する：

```
backend/src/modules/{module}/
├── presentation/          # 🎯 プレゼンテーション層
│   └── {module}.controller.ts
├── application/          # ⚙️ アプリケーション層
│   ├── queries/         # 📖 クエリ（読み取り操作）
│   │   ├── get-all-{entities}.query.ts
│   │   ├── get-{entity}-by-id.query.ts
│   │   └── get-{entities}-by-{criteria}.query.ts
│   └── commands/        # ✏️ コマンド（書き込み操作）
│       ├── create-{entity}.command.ts
│       ├── update-{entity}.command.ts
│       └── delete-{entity}.command.ts
├── domain/              # 🎭 ドメイン層
│   └── {entity}.model.ts
└── infra/              # 🏭 インフラ層
    └── {entity}.repository.ts
```

## 🎯 層別責務

### 🎪 Presentation層（プレゼンテーション層）
- **責務**: HTTPリクエスト/レスポンスの処理、データ変換、レスポンス形成
- **依存**: Application層のQuery/Commandのみ
- **特徴**: 
  - Controllerクラスで構成
  - 各エンドポイントに対応するメソッドを持つ
  - ハッピーパスのみ処理（エラーハンドリングは共通化）
- **🚫 禁止事項**: 
  - ビジネスロジックvalidationの実装
  - データ整合性チェック
  - ビジネスルールの実装

#### 🚨 エラーハンドリング設計
- **🎯 Controller層の責務**: ハッピーパスのみ処理
- **🚫 避けるべきパターン**: Controller内での404/500チェック
- **✅ 推奨パターン**: Application層でのException throw
- **🔄 統一処理**: Honoのグローバルエラーハンドラーで統一レスポンス

```typescript
// ❌ 避けるべきパターン
async getMeetingById(c: Context) {
  const meeting = await this.query.run(id);
  if (!meeting) {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json({ data: meeting });
}

// ✅ 推奨パターン
async getMeetingById(c: Context) {
  const meeting = await this.query.run(id); // 内部でNotFoundException throw
  return c.json({ success: true, data: meeting });
}
```

### ⚙️ Application層（アプリケーション層）
- **責務**: ビジネスユースケースの実行、処理フローの制御
- **構成**: Query（読み取り）とCommand（書き込み）で分離
- **Query/Command規約**:
  - 🔧 **単一メソッド**: 各クラスは`run()`メソッドのみ持つ
  - 🏷️ **命名規約**: クラス名はユーザーアクション名とする
    - 例: `CreateMeetingCommand`, `GetAllMeetingsQuery`
  - ⚡ **単一責任**: 1つのクエリ/コマンドは1つの処理のみ実行
- **依存**: Domain層とInfra層のRepositoryのみ

#### 🚨 Application層エラーハンドリング
- **🎯 Exception駆動**: 適切なHTTPExceptionを発生させる
- **🚫 null返却の禁止**: Query/Commandはnullを返さない
- **✅ 明示的エラー**: ビジネスエラーを具体的なExceptionで表現

```typescript
// ❌ 避けるべきパターン
async run(id: string): Promise<Meeting | null> {
  const meeting = await this.repository.findById(id);
  return meeting; // nullを返却
}

// ✅ 推奨パターン
async run(id: string): Promise<Meeting> {
  const meeting = await this.repository.findById(id);
  if (!meeting) {
    throw new NotFoundException('Meeting not found');
  }
  return meeting;
}
```

#### 🏗️ 共通Exception設計
```typescript
// HTTPException基底クラス
export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly message: string;
}

// 具体的なException
export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad request') {
    super(400, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not found') {
    super(404, message);
  }
}
```

### 🎭 Domain層（ドメイン層）
- **責務**: ビジネスルールとドメインモデルの定義、データvalidation
- **構成**: 
  - エンティティクラス定義
  - 作成用データ型（`CreateXxxData`）
  - 更新用データ型（`UpdateXxxData`）
- **依存**: 他の層に依存しない（最も内側の層）

#### 🏭 Domain Model設計原則
- **🔒 Private Constructor**: 直接インスタンス化を防止し、適切な生成方法を強制
- **✅ 完全コンストラクタパターン**: `create`メソッドで全validationを実行
- **🏗️ Static Factory Methods**: 意図的なオブジェクト作成を促進
  - `Entity.create(data)`: 新規エンティティ作成
  - `Entity.fromPersistence(data)`: 永続化データからの復元
- **🔄 State Transition Methods**: 状態変更はビジネス的振る舞いの名前で実行
  - 抽象的な`update`ではなく具体的なビジネス的振る舞いを命名
  - `modifyDetails(data)`等、ドメイン知識を表現するメソッド名を使用
  - 個別のupdateメソッドは状態遷移ルールの混乱を招くため禁止
  - `updatedAt`は更新時に自動更新
- **🚫 永続化詳細の排除**: Domain層は永続化の詳細を持たない
  - `toPersistence`等のメソッドは配置しない
  - Repository層でMapping処理を担当
```typescript
import { z, ZodError } from 'zod';

// 🎯 Zodスキーマ定義
export const CreateMeetingDataSchema = z.object({
  title: z.string()
    .min(1, '会議タイトルは必須です')
    .trim(),
  startTime: z.date({
    required_error: '開始時刻は必須です',
    invalid_type_error: '開始時刻の形式が正しくありません'
  }),
  endTime: z.date({
    required_error: '終了時刻は必須です', 
    invalid_type_error: '終了時刻の形式が正しくありません'
  }),
  isImportant: z.boolean().optional().default(false),
  ownerId: z.string()
    .min(1, 'オーナーIDは必須です')
    .trim()
}).refine(
  (data) => data.startTime < data.endTime,
  {
    message: '開始時刻は終了時刻より前である必要があります',
    path: ['startTime']
  }
);

export type CreateMeetingData = z.infer<typeof CreateMeetingDataSchema>;

export class Meeting {
  private constructor(/* private fields */) {}

  static create(data: CreateMeetingData): Meeting {
    try {
      // 🎯 Zodによるvalidation実行
      const validatedData = CreateMeetingDataSchema.parse(data);
      return new Meeting(/* validated data */);
    } catch (error) {
      if (error instanceof ZodError) {
        // 🔄 統一エラーハンドリング
        const issues = error.issues || error.errors;
        if (issues && issues.length > 0) {
          throw new Error(issues[0].message);
        }
        throw new Error('Validation failed');
      }
      throw error;
    }
  }

  static fromPersistence(data: PersistenceData): Meeting {
    // 永続化データからの復元（validationスキップ）
  }

  modifyDetails(data: UpdateMeetingData): void {
    // 会議詳細の修正（ビジネス的振る舞い）
  }

  // getterのみ提供（永続化詳細はRepository層で処理）
  get id(): string { return this._id; }
  get title(): string { return this._title; }
  // ... その他のgetterメソッド
}

#### 🎯 Validation設計原則
- **⚡ Zod使用必須**: すべてのvalidationはZodスキーマで実装
- **✅ 必須項目チェック**: `.min(1, 'エラーメッセージ')`で空文字検証
- **📅 データ形式チェック**: `.date()`, `.number()`等の型安全検証  
- **🎯 ビジネスルール検証**: `.refine()`でドメイン固有制約を実装
- **🚫 Controller層での重複実装禁止**: validation責務はDomain層のみ
- **💬 具体的エラーメッセージ**: 日本語でわかりやすいエラー文言
- **🔄 統一エラーハンドリング**: ZodError → Error変換で一貫性確保

### 🏭 Infra層（インフラ層）
- **責務**: データベースアクセス、外部API連携
- **構成**: Repositoryパターンでデータアクセスを抽象化
- **特徴**:
  - Prismaクライアントを直接使用
  - ドメインモデルクラスとの変換を担当
  - エラーハンドリングは基本的な成功/失敗のみ

#### 🗃️ Repository設計原則
- **🔄 Domain Model変換**: 永続化データとドメインモデル間の変換
- **📊 CRUD操作**: ドメインモデルクラスを引数・戻り値とする
  - `create(entity)`: エンティティを永続化
  - `save(entity)`: エンティティの更新を永続化
  - `findById(id)`: IDでエンティティを取得
  - `findAll()`: 全エンティティを取得
- **🗂️ Mapping責務**: Domain ModelとPersistence Data間のマッピング処理

```typescript
export class MeetingRepository {
  async create(meeting: Meeting): Promise<Meeting> {
    const data = this.toPersistence(meeting);
    const record = await prisma.meeting.create({ data });
    return Meeting.fromPersistence(record);
  }

  async save(meeting: Meeting): Promise<Meeting> {
    const data = this.toPersistence(meeting);
    const record = await prisma.meeting.update({
      where: { id: meeting.id },
      data
    });
    return Meeting.fromPersistence(record);
  }

  private toPersistence(meeting: Meeting): PersistenceData {
    return {
      id: meeting.id,
      title: meeting.title,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      isImportant: meeting.isImportant,
      ownerId: meeting.ownerId,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt
    };
  }
}

## 🚫 廃止パターン

### ❌ Service層の廃止
- **理由**: Query/Commandパターンでより明確な責務分離が可能
- **代替**: ApplicationレイヤーのQuery/Commandクラス
- **利点**: 
  - 各処理の意図が明確
  - テストしやすい単位
  - 変更影響範囲の限定

## 📐 実装指針

### 🎯 依存関係の方向
```
Presentation → Application → Domain ← Infra
```
- 外側の層は内側の層に依存可能
- 内側の層は外側の層に依存してはならない
- Infra層のみDomain層に依存（データ型使用のため）

### 🏷️ 命名規約
- **Query**: `Get{Entity}By{Criteria}Query` または `GetAll{Entities}Query`
- **Command**: `{Action}{Entity}Command` (例: `CreateMeetingCommand`)
- **Repository**: `{Entity}Repository`
- **Controller**: `{Entity}Controller`

### 🔄 データフロー

#### 📖 Query（読み取り）フロー
```
Client → Controller → Query → Repository → Database
Database → Repository → Query → Controller → Client
```

#### ✏️ Command（書き込み）フロー
```
Client → Controller → Command → Repository → Database
Database → Repository → Command → Controller → Client
```

#### 🔄 Update Command詳細フロー
```
Client → Controller → UpdateCommand
       ↓
1. Repository.findById(id) → Database
       ↓
2. DomainModel.update(data) → State Transition
       ↓
3. Repository.save(model) → Database
       ↓
Controller → Client
```

この構造により、保守性・テスタビリティ・拡張性の高いBackendアーキテクチャを実現する 🚀

## 🏷️ Domain Model命名規約

### 🎯 メソッド命名原則
- **❌ 抽象的な命名**: `update()`, `change()`, `modify()` 等の汎用的な名前は避ける
- **✅ ビジネス的振る舞い**: ドメイン知識を表現する具体的な名前を使用
- **🎭 ドメイン表現**: エンティティが持つ実際のビジネス的振る舞いを命名に反映

### 📝 命名例（Meeting エンティティ）
```typescript
// ❌ 抽象的な命名
meeting.update(data);
meeting.change(data);
meeting.modify(data);

// ✅ ビジネス的振る舞い
meeting.modifyDetails(data);        // 会議詳細の修正
meeting.reschedule(startTime, endTime); // 会議の再スケジュール
meeting.rename(title);              // 会議名の変更
meeting.markAsImportant();          // 重要度を設定
meeting.markAsNormal();             // 重要度を解除
meeting.cancel();                   // 会議のキャンセル
meeting.postpone(newDate);          // 会議の延期
```

### 🎪 他のエンティティ命名例
```typescript
// User エンティティ
user.activate();              // ユーザーの有効化
user.deactivate();            // ユーザーの無効化
user.updateProfile(data);     // プロフィール更新
user.changePassword(newPwd);  // パスワード変更

// Order エンティティ
order.confirm();              // 注文の確定
order.cancel();               // 注文のキャンセル
order.ship();                 // 注文の発送
order.complete();             // 注文の完了

// Product エンティティ
product.updatePrice(price);   // 価格の更新
product.discontinue();        // 製品の廃止
product.restock(quantity);    // 在庫の補充
```

### 📐 命名の指針
- **🎯 意図の明確化**: メソッド名からビジネス的な意図が読み取れる
- **📖 可読性**: コードがビジネス要件をそのまま表現する
- **🤝 共通言語**: 開発者とドメインエキスパートが同じ語彙を使用
- **🔍 発見しやすさ**: 機能を探す際に直感的に見つけられる

この命名規約により、ドメイン知識がコードに直接表現され、保守性と理解しやすさが向上する 🎯

## 📏 実装ルール

- 🔤 Featureファイルのキーワードは英語を使用すること（Feature, Scenario, Given, When, Then, And, Rule）
- FeatureファイルにUIのルールは含めない。ビジネスルールのみ
- 🇯🇵 説明文や手順は日本語で記述すること

## 📚 文書化ルール

- 🇯🇵 ドキュメントファイルは日本語で記述すること

# 🧪 Test Code

## 📂 テストファイル配置ルール

- 📁 **specはコードのそばに置く**: テストファイル（`.spec.ts`）は実装ファイルと同じディレクトリに配置する
- 🔗 **関連性の可視化**: コードとテストが同じ場所にあることで保守性と発見しやすさを向上

```
src/modules/meeting/controllers/
├── meeting.controller.ts      # 実装ファイル
└── meeting.controller.spec.ts # テストファイル（同じディレクトリ）
```

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

## 🎯 ATDD: Acceptance Test-Driven Development

### 📋 ATDD実践方針
- **Featureファイルからスタート**: ビジネス要件をGherkin構文で定義し、そこからシナリオテストを実装
- **完全なAPI統合**: シナリオで使用される全てのAPIを実際のバックエンドと統合する
- **データベースリセット**: E2Eテスト実行前に必ずデータベースをクリーンな状態にリセット
- **エンドツーエンド検証**: フロントエンドからバックエンドまでの全ての層を通したテスト

### 🔄 ATDDワークフロー
1. **📝 Featureファイル作成**: ビジネス要件をGherkin構文で記述
2. **❌ E2Eテスト実行**: 最初は必ず失敗する（Red）
3. **⚡ 最小実装**: テストを通すための最小限のコードを実装（Green）
4. **🔧 リファクタリング**: コード品質を向上（Refactor）
5. **✅ 統合確認**: 全てのAPIが適切に統合されていることを確認

### 🛠️ E2Eテスト環境設定

#### データベースリセット
```javascript
Given('オーナーがログインしている', async function () {
  // データベースリセット - 全テーブルをクリア
  await prisma.meeting.deleteMany();
  
  // ブラウザとページを初期化
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  
  // トップページにアクセス
  await page.goto('http://localhost:3000');
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
- **全API統合**: シナリオで関連する全てのAPIが実際にバックエンドと連携していることを確認
- **データの一貫性**: テスト間でデータが競合しないよう、各テスト前にデータベースリセット
- **タイムアウト設定**: 非同期処理を考慮した適切なタイムアウト設定
- **処理完了待機**: APIレスポンス、UI更新完了まで適切に待機

### 🎯 ATDDの価値
- **ビジネス価値の検証**: 実際のユーザーシナリオでビジネス価値を確認
- **統合品質保証**: システム全体の統合動作を保証
- **回帰テスト**: 機能追加時の既存機能への影響を検知
- **仕様の生きた文書**: Featureファイルが常に最新の仕様書として機能

# 🎨 Frontendアーキテクチャルール

## 🪝 Custom Hooks Pattern

### 🎯 基本原則
- **単一責任の原則**: 各フックは1つの責務のみを担当
- **責務の分離**: データ管理・操作・UI状態・副作用を独立したフックに分離
- **再利用性**: 他のコンポーネントでも利用可能な設計
- **テスタビリティ**: ビジネスロジックを独立してテスト可能

### 🏗️ フック分類と責務

#### 📊 データ管理フック (`use{Entity}s.ts`)
- **責務**: APIとの通信、データ取得、キャッシング、エラーハンドリング
- **命名例**: `useMeetings`, `useUsers`, `useProjects`
- **戻り値**: データ、ローディング状態、エラー状態、再取得関数

```typescript
// 例: useMeetings.ts
export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadMeetings = async () => { /* API通信 */ };
  const updateMeetings = (updater: (prev: Meeting[]) => Meeting[]) => { /* 状態更新 */ };
  
  return { meetings, isLoading, error, loadMeetings, updateMeetings };
};
```

#### ⚙️ 操作フック (`use{Entity}Actions.ts`)
- **責務**: CRUD操作、ビジネスロジック、API呼び出し、楽観的更新
- **命名例**: `useMeetingActions`, `useUserActions`
- **戻り値**: 操作関数群（作成、更新、削除など）

```typescript
// 例: useMeetingActions.ts
export const useMeetingActions = ({ meetings, updateMeetings, loadMeetings, ... }) => {
  const handleMeetingSubmit = async (data) => { /* 作成・更新ロジック */ };
  const handleMeetingDelete = (id) => { /* 削除ロジック */ };
  
  return { handleMeetingSubmit, handleMeetingDelete };
};
```

#### 🖥️ UI状態フック (`use{Feature}Modals.ts` / `use{Feature}UI.ts`)
- **責務**: モーダル表示/非表示、選択状態、フォーム状態、UI制御
- **命名例**: `useMeetingModals`, `useFormState`, `useNavigation`
- **戻り値**: UI状態、状態変更関数、イベントハンドラー

```typescript
// 例: useMeetingModals.ts
export const useMeetingModals = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const handleOpen = () => setShowForm(true);
  const handleClose = () => { setShowForm(false); setSelectedItem(null); };
  
  return { showForm, selectedItem, handleOpen, handleClose };
};
```

#### 🔔 副作用フック (`use{Service}.ts`)
- **責務**: タイマー、通知、外部サービス連携、副作用管理
- **命名例**: `useReminderService`, `useNotificationService`, `useWebSocket`
- **戻り値**: 通常は`null`（副作用のみを管理）

```typescript
// 例: useReminderService.ts
export const useReminderService = ({ meetings }) => {
  useEffect(() => {
    const interval = setInterval(() => { /* リマインダーチェック */ }, 60000);
    return () => clearInterval(interval);
  }, [meetings]);
  
  return null; // 副作用のみなので戻り値不要
};
```

### 📂 ファイル構成

```
src/
├── app/
│   └── page.tsx              # 80-100行程度（フック呼び出し+JSX）
├── hooks/
│   ├── use{Entity}s.ts       # データ管理
│   ├── use{Entity}Actions.ts # 操作ロジック
│   ├── use{Feature}Modals.ts # UI状態管理
│   └── use{Service}.ts       # 副作用・サービス
├── components/
│   └── {...}                 # UIコンポーネント
└── types/
    └── {...}                 # 型定義
```

### ⚡ パフォーマンス最適化

#### 🔄 依存関係管理
- **props drilling回避**: 必要な状態のみを関連フックに渡す
- **循環依存回避**: フック間の依存関係を最小限に抑制
- **計算量削減**: `useMemo`でフック内の重い計算をメモ化

#### 🎯 最適化ガイドライン
- **フック分割**: 1つのフックが100行を超える場合は責務を見直して分割
- **状態最小化**: 導出可能な状態は`useMemo`で計算、stateに保存しない
- **再レンダリング制御**: 適切な依存配列でuseEffectの実行を制御

### 🧪 テスト戦略

#### 📋 フック単体テスト
```typescript
// 例: useMeetings.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useMeetings } from './useMeetings';

test('should load meetings on mount', async () => {
  const { result, waitFor } = renderHook(() => useMeetings());
  
  await waitFor(() => {
    expect(result.current.meetings).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });
});
```

#### 🎯 テスト指針
- **Pure Logic**: ビジネスロジック部分を純粋関数として抽出してテスト
- **Mock API**: APIクライアントをモックしてフックをテスト
- **Integration**: 複数フックの連携動作をintegration testで検証

### 🚨 注意点とベストプラクティス

#### ❌ アンチパターン
```typescript
// ❌ 複数責務の混在
export const useMeetingEverything = () => {
  // データ取得 + UI状態 + 操作ロジック + 副作用 が混在
};

// ❌ 過度な依存関係
export const useMeetingActions = () => {
  const modal = useMeetingModals(); // 操作フックがUI状態に依存
  const user = useUserData();       // 過度な依存
};
```

#### ✅ 推奨パターン
```typescript
// ✅ 単一責務
export const useMeetings = () => { /* データ管理のみ */ };
export const useMeetingActions = (props) => { /* 必要な依存のみpropsで受け取り */ };

// ✅ コンポーネントでの統合
export default function MeetingPage() {
  const { meetings, loadMeetings, updateMeetings } = useMeetings();
  const modals = useMeetingModals();
  const actions = useMeetingActions({ meetings, updateMeetings, loadMeetings, ...modals });
  
  return <div>{/* クリーンなJSX */}</div>;
}
```

この設計により、コンポーネントの可読性・保守性・テスタビリティが大幅に向上し、チーム開発での品質が確保される 🎯
