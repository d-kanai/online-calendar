# 🖥️ Backendアーキテクチャルール

## 🏗️ DDD/Clean Architecture 構造

```
backend/src/modules/{module}/
├── presentation/{module}.controller.ts    # Controller層
├── application/                           # Application層
│   ├── queries/get-*.query.ts            # 読み取り操作
│   └── commands/create-*.command.ts       # 書き込み操作
├── domain/{entity}.model.ts               # Domain層
├── infra/{entity}.repository.ts           # Infrastructure層
└── {module}.routes.ts                     # ルート定義
```

## 🛡️ Presentation層実装チェックリスト

#### ✅ 基本設計
- [ ] Controllerクラスで実装
- [ ] 各エンドポイントに対応するメソッド定義
- [ ] ハッピーパスのみ処理（try-catch無し）
- [ ] Application層のQuery/Commandのみに依存

#### ✅ Output型設計
- [ ] 1 APIエンドポイント = 1 Output型
- [ ] `presentation/output.ts`にすべてのOutput型定義
- [ ] 各APIに対応する`to{ApiName}Output()`変換関数
- [ ] ドメインモデルの隠蔽保証
- [ ] API仕様に合わせたフィールド命名

#### ✅ レスポンス返却
- [ ] 成功時: `c.json({ success: true, data: output })`
- [ ] エラーは捕捉せずグローバルハンドラーに任せる
- [ ] HTTPステータスコードはデフォルト200
- [ ] ドメインオブジェクトからOutput型へ変換

#### ✅ 禁止事項
- [ ] ビジネスロジック実装禁止
- [ ] バリデーション処理実装禁止
- [ ] データ整合性チェック実装禁止
- [ ] Controller内での404/500チェック禁止
## 🛡️ Application層実装チェックリスト

#### ✅ 基本設計
- [ ] Query（読み取り）とCommand（書き込み）で分離
- [ ] 各クラスは`run()`メソッドのみ持つ
- [ ] クラス名はユーザーアクション名（例: `CreateMeetingCommand`）
- [ ] 単一責任: 1クエリ/コマンド = 1処理

#### ✅ 依存関係
- [ ] Command: Domain層とInfra層Repositoryのみ依存
- [ ] Query: Prisma直接使用可（Repository不要）
- [ ] ドメインオブジェクトをそのまま返却
- [ ] DTOへの変換禁止（Presentation層の責務）

#### ✅ 許可される処理
- [ ] Repositoryからのデータ取得
- [ ] ドメインメソッドの呼び出し
- [ ] NotFoundExceptionのスロー（データ未発見時のみ）
- [ ] トランザクション管理

#### ✅ 禁止事項
- [ ] 権限チェック禁止（Domain層の責務）
- [ ] ビジネスルール判定禁止（Domain層の責務）
- [ ] 存在確認以外のバリデーション禁止
- [ ] 状態遷移判定禁止（Domain層の責務）

#### ✅ エラーハンドリング
- [ ] Exception駆動でHTTPException発生
- [ ] null返却禁止
- [ ] ビジネスエラーを具体的Exceptionで表現
#### ✅ Query層計算ロジック分離
- [ ] インフラ依存しない処理は専用クラスに切り出し
- [ ] `XxxCalculator`クラスで`run()`メソッド実行
- [ ] Domain Model通さず（読み取り専用）
- [ ] 複雑な計算は専用Calculatorクラスへ委譲

## 🛡️ Domain層実装チェックリスト

#### ✅ 基本設計
- [ ] ビジネスルール・ドメインモデル定義・データvalidation担当
- [ ] エンティティクラス・作成用データ型・更新用データ型定義
- [ ] 他の層に依存しない（最も内側の層）
- [ ] テーブル対応モデルクラス作成

#### ✅ 処理集約ルール
- [ ] すべてのビジネス判定はドメイン層で実行
- [ ] 権限が必要な操作は`requesterId`を引数に含める
- [ ] 関連エンティティの存在確認もドメインが担当
- [ ] 状態遷移はビジネス的振る舞いの名前で実行

#### ✅ モデル設計原則
- [ ] Private Constructor使用（直接インスタンス化防止）
- [ ] `create`メソッドで全validation実行
- [ ] Static Factory Methods実装（`create`, `fromPersistence`）
#### ✅ モデル間コミュニケーション
- [ ] プリミティブ型引数を避け、ドメインモデルを引数に使用
- [ ] ビジネスロジック表現力と型安全性向上
- [ ] 永続化詳細の排除（`toPersistence`メソッド禁止）

#### ✅ 認証関連モデル設計
- [ ] 認証用モデル（AuthUser）とビジネス用モデル（User）を分離
- [ ] AuthUser: 認証・認可特化（パスワード管理、サインイン/サインアップ）
- [ ] User: ビジネスロジック特化（パスワード情報持たない）
- [ ] 具体的ビジネス振る舞い命名（`signup()`, `signin()`）

#### ✅ Transaction Script回避
- [ ] Application層に手続き的ビジネスロジック書かない
- [ ] Repository操作以外は全てDomain層へ
- [ ] 権限チェック・ビジネスルール判定・状態遷移はドメインモデル担当

## 🛡️ Domain Validation実装チェックリスト

#### ✅ Zodバリデーション原則
- [ ] 全validationはZodスキーマで実装
- [ ] セキュリティ最優先（悪意ある入力からの最終防護）
- [ ] データ整合性保証（データベース制約の確実維持）
#### ✅ Zodバリデーション実装
- [ ] 必須項目チェック（`.min(1, 'エラーメッセージ')`）
- [ ] データ形式チェック（`.date()`, `.number()`等）
- [ ] ビジネスルール検証（`.refine()`でドメイン固有制約）
- [ ] 具体的エラーメッセージ（日本語）
- [ ] 統一エラーハンドリング（ZodError → Error変換）
- [ ] Frontend連携（同じルールを堅牢に実装）

## 🛡️ Infrastructure層実装チェックリスト

#### ✅ Repository設計
- [ ] Repositoryパターンでデータアクセス抽象化
- [ ] Prismaクライアント直接使用
- [ ] Domain Model変換（永続化データ ↔ ドメインモデル）
- [ ] CRUD操作（`create`, `save`, `findById`, `findAll`）

#### ✅ Mapping責務
- [ ] Domain ModelとPersistence Data間マッピング処理
- [ ] `toPersistence`でドメインモデル → 永続化データ変換
- [ ] `fromPersistence`で永続化データ → ドメインモデル復元
- [ ] エラーハンドリングは基本的成功/失敗のみ

## 📐 実装指針

### 🎯 依存関係の方向
```
Presentation → Application → Domain ← Infra
```

### 🏷️ 命名規約
- **Query**: `Get{Entity}By{Criteria}Query`
- **Command**: `{Action}{Entity}Command`
- **Repository**: `{Entity}Repository`
- **Controller**: `{Entity}Controller`

### ❌ 廃止パターン
- **Service層廃止**: Query/Commandパターンで責務分離明確化

