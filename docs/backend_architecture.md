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
├── infra/              # 🏭 インフラ層
│   └── {entity}.repository.ts
└── {module}.routes.ts   # 🛣️ ルート定義
```

## 🎯 層別責務

### 🎪 Presentation層（プレゼンテーション層）

### 🛡️ Presentation層実装チェックリスト

#### ✅ 基本設計
- [ ] Controllerクラスで実装
- [ ] 各エンドポイントに対応するメソッドを定義
- [ ] ハッピーパスのみ処理（try-catch無し）
- [ ] Application層のQuery/Commandのみに依存

#### ✅ Output型設計
- [ ] 1 APIエンドポイント = 1 Output型
- [ ] `presentation/output.ts`にすべてのOutput型を定義
- [ ] 各APIに対応する`to{ApiName}Output()`変換関数
- [ ] ドメインモデルの隠蔽を保証
- [ ] API仕様に合わせたフィールド命名

#### ✅ レスポンス返却
- [ ] 成功時: `c.json({ success: true, data: output })`
- [ ] エラーは捕捉せずグローバルハンドラーに任せる
- [ ] HTTPステータスコードはデフォルト200
- [ ] ドメインオブジェクトからOutput型へ変換

#### ✅ 禁止事項
- [ ] ビジネスロジックの実装禁止
- [ ] バリデーション処理の実装禁止
- [ ] データ整合性チェックの実装禁止
- [ ] Controller内での404/500チェック禁止

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
- **依存**: 
  - Command: Domain層とInfra層のRepositoryのみ
  - Query: Prismaの直接使用可（Repository不要）

#### 🎯 Application層の役割を最小化
- **🚫 禁止事項**: Application層での以下の処理は厳禁
  - 権限チェック（例: if (meeting.ownerId !== requesterId)）
  - ビジネスルール判定（例: 開始時刻のチェック、参加者数制限）
  - 存在確認以外のバリデーション（例: 参加者の重複チェック）
  - 状態遷移の判定（例: 会議が開始済みかどうか）
- **✅ 許可される処理**: 
  - Repositoryからのデータ取得
  - ドメインメソッドの呼び出し（すべての判定はドメイン内で）
  - NotFoundExceptionのスロー（データが見つからない場合のみ）
  - トランザクション管理

#### 🎯 Application層の返却値ルール
- **✅ ドメインオブジェクトをそのまま返却**: Application層はドメインモデルや値オブジェクトを直接返す
- **🚫 DTOへの変換禁止**: toJSON()などのマッピング処理はPresentation層の責務
- **📦 返却値の例**:
  ```typescript
  // ✅ 推奨：ドメインオブジェクトを返却
  class SignInCommand {
    async execute(dto): Promise<{ authToken: AuthToken; authUser: AuthUser }> {
      const authUser = await repo.findByEmail(dto.email);
      const authToken = await authUser.signin(dto.password);
      return { authToken, authUser };  // ドメインオブジェクトをそのまま返す
    }
  }
  
  // ❌ 避けるべき：Application層でDTO変換
  class SignInCommand {
    async execute(dto): Promise<{ token: string; user: any }> {
      const authUser = await repo.findByEmail(dto.email);
      const authToken = await authUser.signin(dto.password);
      return { 
        token: authToken.value,      // NG: マッピング処理
        user: authUser.toJSON()      // NG: DTO変換
      };
    }
  }
  ```
- **🎪 Presentation層の役割**: ドメインオブジェクトからAPIレスポンス形式への変換
  ```typescript
  // Presentation層でのマッピング
  const { authToken, authUser } = await command.execute(dto);
  const response = {
    token: authToken.value,
    user: authUser.toJSON()
  };
  ```

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

#### 🧮 Query層の計算ロジック分離
- **🎯 原則**: Queryのインフラ依存しない処理は専用クラスに切り出す
- **📐 実装パターン**: `XxxCalculator`クラスで`run()`メソッド実行
- **🚫 Query制約**: 
  - Domain Modelを通さない（読み取り専用のため）
  - Repositoryも不要（Prismaを直接使用可）
  - 複雑な計算は専用Calculatorクラスへ委譲

```typescript
// ✅ 推奨：計算ロジックを分離
export class GetDailyAverageQuery {
  async run(userId: string): Promise<DailyAverageData> {
    // Prismaを直接使用（Repository不要）
    const meetings = await this.findMeetingsByDateRange(userId);
    
    // 計算ロジックは専用クラスへ委譲
    const calculator = new DailyAverageStatCalculator(meetings);
    return calculator.run();
  }
  
  private async findMeetingsByDateRange(userId: string) {
    return await prisma.meeting.findMany({
      where: { /* ... */ }
    });
  }
}

// 計算専用クラス
export class DailyAverageStatCalculator {
  constructor(private readonly meetings: Meeting[]) {}
  
  run(): DailyAverageData {
    // インフラ依存のない純粋な計算ロジック
  }
}
```

### 🎭 Domain層（ドメイン層）
- **責務**: ビジネスルールとドメインモデルの定義、データvalidation、すべてのビジネス判定
- **構成**: 
  - エンティティクラス定義
  - 作成用データ型（`CreateXxxData`）
  - 更新用データ型（`UpdateXxxData`）
- **依存**: 他の層に依存しない（最も内側の層）

#### 🛡️ ドメイン層への処理集約ルール
- **🎯 すべての判定はドメイン層で**: ビジネスに関わるあらゆる判定をドメインメソッド内に配置
- **👤 requesterIdパターン**: 権限が必要な操作はrequesterIdを引数に含める
  ```typescript
  // ✅ 権限チェックを含むドメインメソッド
  modifyDetails(data: UpdateData, requesterId: string): void {
    if (this._ownerId !== requesterId) {
      throw new Error('オーナーのみが編集できます');
    }
    // その他のビジネスルールチェック
  }
  ```
- **🔍 存在チェックもドメイン内で**: 関連エンティティの存在確認もドメインが担当
  ```typescript
  removeParticipant(participantId: string, requesterId: string): void {
    // 権限チェック
    if (this._ownerId !== requesterId) {
      throw new Error('オーナーのみが削除可能');
    }
    // 存在チェック
    const participant = this._participants.find(p => p.id === participantId);
    if (!participant) {
      throw new Error('参加者が見つかりません');
    }
    // 削除処理
  }
  ```

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
  class UpdateMeetingCommand {
    async run(id, data, requesterId) {
      const meeting = await repo.findById(id);
      if (!meeting) throw new NotFoundException();
      
      // ❌ Application層での権限チェック
      if (meeting.ownerId !== requesterId) {
        throw new Error('オーナーのみが編集可能');
      }
      
      // ❌ Application層での状態チェック
      if (meeting.startTime <= new Date()) {
        throw new Error('開始済みの会議は編集不可');
      }
      
      meeting.modifyDetails(data);
      return repo.save(meeting);
    }
  }

  // ✅ 良い例：ドメイン層への集約
  class UpdateMeetingCommand {
    async run(id, data, requesterId) {
      const meeting = await repo.findById(id);
      if (!meeting) throw new NotFoundException();
      
      // ✅ すべての判定はドメイン層で
      meeting.modifyDetails(data, requesterId);
      return repo.save(meeting);
    }
  }
  ```
- **🔍 ドメイン層移行のチェックリスト**:
  - 権限チェック → ドメインメソッドの引数にrequesterIdを追加
  - 存在チェック（参加者など） → ドメインメソッド内で実施
  - ビジネスルールの判定 → ドメインモデルのメソッドへ
  - 状態の変更 → ドメインモデルのメソッドへ
  - エラーメッセージ → ドメイン層で具体的なメッセージをthrow

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

## 🔄 モデルライフサイクル管理

### 🎯 基本原則
- **📊 ライフサイクル責務**: モデルは自身のレコードライフサイクル（作成、更新、削除）に責任を持つ
- **🚫 不要な状態遷移の禁止**: ビジネス的に意味のない状態遷移メソッドは実装しない
- **🔒 適切な境界**: ドメインの境界を越えた不適切なcreateメソッドは排除する

### 🏗️ 実装ルール

#### ✅ 適切なモデル作成パターン
```typescript
// ✅ 良い例：AuthUserが自身のライフサイクルを管理
export class AuthUser {
  static async signup(data: SignUpData): Promise<{ authUser: AuthUser; authToken: AuthToken }> {
    // 認証ユーザーの作成はサインアップ時のみ
    const hashedPassword = await bcrypt.hash(data.password, 10);
    // ... バリデーション、トークン生成など
    return { authUser, authToken };
  }
}

// ✅ 良い例：Meetingの作成
export class Meeting {
  static create(data: CreateMeetingData): Meeting {
    // 会議の作成は明確なビジネス文脈で実行
    const validatedData = CreateMeetingDataSchema.parse(data);
    return new Meeting(validatedData);
  }
}
```

#### ❌ 不適切なモデル作成パターン
```typescript
// ❌ 悪い例：Userモデルでの直接作成
export class User {
  static create(data: CreateUserData): User {
    // NG: ユーザーの作成はAuthUser.signupでのみ行うべき
    // ライフサイクル上、User単体での作成は存在しない
    return new User(data);
  }
}
```

### 🏭 Repository層の責務制限

#### 🎯 Repository設計原則
- **💾 必要な操作のみ**: 実際のビジネスユースケースで使用されるメソッドのみ実装
- **🚫 不要なsaveメソッド禁止**: ライフサイクル上存在しない操作のsaveメソッドは作成しない
- **🔍 明確な責務**: 各Repositoryは担当エンティティの適切な永続化操作のみ提供

#### ✅ 適切なRepository実装
```typescript
// ✅ AuthRepository：認証ユーザーの作成・更新を担当
export class AuthRepository {
  async save(authUser: AuthUser): Promise<void> {
    // サインアップ時のユーザー作成
    await this.prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        password: authUser.password,  // パスワードも含む
        createdAt: authUser.createdAt,
        updatedAt: authUser.updatedAt
      }
    });
  }
}

// ✅ UserRepository：既存ユーザーの取得・更新のみ
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    // 既存ユーザーの取得
  }
  
  async save(user: User): Promise<User> {
    // プロフィール更新など、既存ユーザーの更新のみ
    // パスワード情報は含まない
  }
  
  // ❌ create(user: User) は実装しない
  // 理由：User単体での新規作成はビジネス的に存在しない
}
```

#### ❌ 不適切なRepository実装
```typescript
// ❌ UserRepositoryでの不適切なcreate
export class UserRepository {
  async create(user: User): Promise<User> {
    // NG: Userの作成はAuthUser.signupからのみ
    // この操作は実際のビジネスフローに存在しない
    const record = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        // password: ???  <- パスワードが不明
      }
    });
  }
}
```

### 🔍 ライフサイクル検証のチェックリスト
- **❓ 作成タイミング**: このモデルはいつ、どのような文脈で作成されるか？
- **❓ 作成者**: このモデルを作成する責任は誰にあるか？
- **❓ 必要性**: この状態遷移は実際のビジネスシナリオで発生するか？
- **❓ 境界**: このモデルの作成は適切なドメイン境界内で行われているか？

### 📋 実装指針
1. **🎭 ドメイン駆動**: ビジネス的な文脈でのみモデル作成を許可
2. **🔒 境界の尊重**: 各ドメインモデルの責務境界を明確にする  
3. **🚫 機械的実装の回避**: CRUDの完全実装ではなく、必要な操作のみ実装
4. **✅ 意図的設計**: すべてのメソッドに明確なビジネス的意図を持たせる

この原則により、不要な複雑性を排除し、ドメインモデルの整合性とビジネスロジックの明確性を保証する 🎯

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

## 🛣️ ルート定義設計

### 🎯 基本原則
- **📁 配置**: 各モジュールのルートに`{module}.routes.ts`ファイルを配置
- **🔧 責務**: ルート定義、ミドルウェア適用、エラーハンドラー設定
- **🚫 禁止事項**: Controller内でHonoインスタンスを作成しない

### 🏗️ 実装パターン
```typescript
// ✅ 推奨：meeting.routes.ts
import { Hono } from 'hono';
import { MeetingController } from './presentation/meeting.controller.js';
import { errorHandler } from '../../shared/middleware/error-handler.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const meetingRoutes = new Hono();
const meetingController = new MeetingController();

// ミドルウェア適用
meetingRoutes.use('*', authMiddleware());

// エラーハンドラー設定
meetingRoutes.onError(errorHandler);

// ルート定義
meetingRoutes.get('/', (c) => meetingController.getAllMeetings(c));
meetingRoutes.get('/:id', (c) => meetingController.getMeetingById(c));
meetingRoutes.post('/', (c) => meetingController.createMeeting(c));

export { meetingRoutes };
```

```typescript
// ❌ 避けるべき：Controller内でルート定義
export class AuthController {
  private readonly app: Hono;
  
  constructor() {
    this.app = new Hono();
    this.setupRoutes();  // NG: Controller内でルート設定
  }
  
  private setupRoutes(): void {
    this.app.post('/signin', async (c) => { ... });
  }
  
  getApp(): Hono {
    return this.app;  // NG: Honoインスタンスを公開
  }
}
```

### 🎯 Controller設計
- **純粋なクラス**: Honoに依存しない
- **メソッド**: 各エンドポイントに対応するpublicメソッドのみ
- **引数**: Honoの`Context`を受け取る
- **返り値**: Honoの`Response`を返す

```typescript
export class MeetingController {
  constructor() {
    // 依存性注入のみ（Honoインスタンス作成なし）
  }

  async getAllMeetings(c: Context) {
    // ビジネスロジック実行とレスポンス返却
    const result = await this.getAllMeetingsQuery.run();
    return c.json({ success: true, data: result });
  }
}
```

### 📋 メリット
- **関心事の分離**: ルーティングとビジネスロジック処理を分離
- **テスタビリティ**: Controllerを単体でテスト可能
- **一貫性**: 全モジュールで同じパターンを使用
- **柔軟性**: ミドルウェアやエラーハンドラーの管理が容易

## 📋 基本的なコーディングルール

| 項目 | 制限値・ルール | 説明・理由 |
|------|---------------|-----------|
| **メソッド行数** | 30行以下 | 一つのメソッドは簡潔に保つ |
| **引数の数** | 3個以下 | コンストラクタは例外 |
| **クラス行数** | 150行以下 | importなど除く実質的な行数 |
| **循環複雑度** | 10以下 | 条件分岐・ループの複雑さ |
| **認知的複雑度** | 10以下 | 人間の理解しやすさ |
| **ネスト数** | 2以下 | if文、for文の入れ子 |
| **変数** | 基本的に`const`利用 | イミュータブルで安全 |
| **ループ** | 宣言型推奨 | 宣言的スタイル |
| **Data Class** | 避ける | ビジネスロジックを追加 |
| **Feature Envy** | 避ける | 責務を適切に配置 |
| **Tell Don't Ask** | 避ける | オブジェクトに処理を委譲 |
| **Primitive Obsession** | 避ける | Value Objectを活用 |