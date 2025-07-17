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
  - **📤 Output型**: 1 APIごとに1つの専用Output型を定義
- **🚫 禁止事項**: 
  - ビジネスロジックvalidationの実装
  - データ整合性チェック
  - ビジネスルールの実装

#### 📤 API Output型設計
- **🎯 原則**: 1 APIエンドポイント = 1 Output型
- **📁 配置**: `presentation/output.ts`にすべてのOutput型を定義
- **🏗️ 構造**: 
  - `GetAllMeetingsOutput`: 一覧取得API用
  - `GetMeetingByIdOutput`: 個別取得API用
  - `CreateMeetingOutput`: 作成API用
  - `UpdateMeetingOutput`: 更新API用
  - 各APIに対応する`to{ApiName}Output()`変換関数
- **✅ メリット**: 
  - API仕様の明確化
  - 将来のAPI個別拡張が容易
  - ドメインモデルの隠蔽を保証

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
- **📊 テーブル対応モデル**: データベーステーブルに対応するモデルクラスを基本的に作成
  - 主要エンティティ（Meeting、User等）は必須
  - 関連エンティティ（MeetingParticipant等）も独立したモデルクラスとして定義
  - 値オブジェクトは必要に応じて作成
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
- **🤝 モデル間コミュニケーション**: ドメイン層ではモデル同士が直接対話
  - プリミティブ型の引数を避け、ドメインモデルを引数に使用
  - 例: `meeting.addParticipant(user)` （userIdではなくUserモデルを渡す）
  - ビジネスロジックの表現力と型安全性を向上

#### 🎯 認証関連モデルの設計原則
- **🔐 関心事の分離**: 認証用モデル（AuthUser）とビジネス用モデル（User）を分離
  - AuthUser: 認証・認可に特化（パスワード管理、サインイン/サインアップ）
  - User: ビジネスロジックに特化（パスワード情報を持たない）
- **🎭 ビジネス的振る舞いの命名**: 
  - `AuthUser.signup()`: 新規ユーザー登録（パスワードハッシュ化含む）
  - `authUser.signin()`: ログイン認証（エラーもドメイン層で管理）
  - 抽象的な`create`や`validatePassword`より具体的な振る舞いを表現
- **🚨 エラーハンドリングの内包**: ビジネスルール違反はドメイン層でthrow
  ```typescript
  // AuthUser.signin()内で
  if (!isValid) {
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  }
  ```

#### 🚫 トランザクションスクリプトの回避とドメイン層への集約
- **❌ Transaction Script反パターンの禁止**: 
  - Application層に手続き的なビジネスロジックを書かない
  - 複数の処理ステップをApplication層で組み立てるのを避ける
- **✅ ドメイン層への責務集約**:
  - インフラとのやり取り（Repository操作）以外は全てドメイン層へ
  - ビジネスロジック、バリデーション、状態遷移はドメインモデルが担当
- **🎯 Application層の役割を最小化**:
  ```typescript
  // ❌ 悪い例：トランザクションスクリプト
  class SignInCommand {
    async execute(dto) {
      const user = await repo.findByEmail(dto.email);
      if (!user) throw new Error();
      const isValid = await bcrypt.compare(dto.password, user.password);
      if (!isValid) throw new Error();
      const token = jwt.sign({...});
      return { token, user };
    }
  }

  // ✅ 良い例：ドメイン層への集約
  class SignInCommand {
    async execute(dto) {
      const authUser = await repo.findByEmail(dto.email);
      if (!authUser) throw new Error();
      const token = await authUser.signin(dto.password); // 全てドメイン層で処理
      return { token, user: authUser.toJSON() };
    }
  }
  ```
- **🔍 ドメイン層移行のチェックリスト**:
  - パスワード検証 → ドメインモデルのメソッドへ
  - トークン生成 → ドメインモデルのメソッドへ
  - ビジネスルールの判定 → ドメインモデルのメソッドへ
  - 状態の変更 → ドメインモデルのメソッドへ

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
```

#### 🎯 Backend Domain Validation設計原則
- **⚡ Zod使用必須**: すべてのvalidationはZodスキーマで実装
- **🔒 セキュリティ最優先**: 悪意ある入力からの最終防護ライン
- **📊 データ整合性保証**: データベース制約の確実な維持
- **🎭 ビジネス不変条件**: ドメインルールの絶対的保証
- **✅ 必須項目チェック**: `.min(1, 'エラーメッセージ')`で空文字検証
- **📅 データ形式チェック**: `.date()`, `.number()`等の型安全検証  
- **🎯 ビジネスルール検証**: `.refine()`でドメイン固有制約を実装
- **🚫 Controller層での重複実装禁止**: validation責務はDomain層のみ
- **💬 具体的エラーメッセージ**: 日本語でわかりやすいエラー文言
- **🔄 統一エラーハンドリング**: ZodError → Error変換で一貫性確保
- **🛡️ Frontend連携**: Frontendと同じルールを堅牢に実装
- **🎯 Backend厳格ルール**: Frontendより厳格な制約で最終保証

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
```

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