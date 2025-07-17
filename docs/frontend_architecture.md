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
│   ├── auth/
│   │   ├── hooks/            # 認証関連フック
│   │   │   └── useAuth.ts
│   │   ├── apis/             # 認証関連API
│   │   │   └── auth.service.ts
│   │   └── components/       # 認証関連コンポーネント
│   ├── calendar/
│   │   ├── hooks/            # カレンダー関連フック
│   │   │   ├── useMeetings.ts
│   │   │   ├── useMeetingActions.ts
│   │   │   ├── useMeetingModals.ts
│   │   │   └── useReminderService.ts
│   │   ├── apis/             # カレンダー関連API
│   │   │   └── meeting.api.ts
│   │   ├── components/       # カレンダー関連コンポーネント
│   │   └── page.tsx          # 80-100行程度（フック呼び出し+JSX）
│   └── stats/
│       ├── hooks/            # 統計関連フック
│       ├── apis/             # 統計関連API
│       ├── components/       # 統計関連コンポーネント
│       └── page.tsx
├── components/               # 共通コンポーネント
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

## 🛣️ Next.js App Router によるページ構造

### 🎯 基本原則
- **page.tsx必須**: 全てのルートは`page.tsx`ファイルで定義
- **機能別モジュール**: 各機能ごとにディレクトリを作成し、関連するコンポーネントを集約
- **コンポーネント分離**: ページロジックとUIコンポーネントを明確に分離
- **型安全なルーティング**: Next.js App Routerの型システムを最大限活用

### 🏗️ Modular Monolith設計
- **機能の凝集性**: 関連するpage.tsx、components、typesを同一ディレクトリに配置
- **依存関係の明確化**: 機能間の依存関係を最小限に抑制
- **拡張性**: 新機能追加時は新しいモジュールディレクトリを作成
- **保守性**: 機能単位でのコード管理により保守性を向上

### 📂 Modular Monolith構造
```
src/app/
├── page.tsx                    # ルートページ（認証状態によるリダイレクト）
├── auth/                       # 認証機能モジュール
│   ├── signin/
│   │   └── page.tsx           # サインインページ
│   ├── signup/
│   │   └── page.tsx           # サインアップページ
│   └── components/
│       ├── SignInForm.component.tsx
│       └── SignUpForm.component.tsx
├── calendar/                   # カレンダー機能モジュール
│   ├── page.tsx               # カレンダー画面
│   └── components/
│       ├── CalendarView.component.tsx
│       ├── MeetingForm.component.tsx
│       └── MeetingDetail.component.tsx
├── stats/                      # 統計機能モジュール
│   ├── page.tsx               # 統計画面
│   └── components/
│       └── MeetingStats.component.tsx
├── meeting/                    # 会議詳細機能モジュール
│   └── [id]/
│       └── page.tsx           # 会議詳細画面（動的ルーティング）
└── layout.tsx                 # ルートレイアウト

src/components/                 # 共通コンポーネント
├── AppHeader.tsx              # アプリケーション共通ヘッダー
├── ParticipantManager.tsx     # 参加者管理コンポーネント
└── ui/                        # UIコンポーネント
    └── ...
```

### 🏗️ page.tsx 実装パターン

#### ✅ 推奨パターン
```typescript
// app/calendar/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarView } from '@/components/CalendarView';
import { AppHeader } from '@/components/AppHeader';
import { useMeetings } from './hooks/useMeetings';
import { useMeetingModals } from './hooks/useMeetingModals';
import { useMeetingActions } from './hooks/useMeetingActions';

export default function CalendarPage() {
  const router = useRouter();
  
  // Custom Hooks でビジネスロジックを分離
  const { meetings, loadMeetings, updateMeetings } = useMeetings();
  const modals = useMeetingModals();
  const actions = useMeetingActions({ meetings, updateMeetings, loadMeetings, ...modals });
  
  // ナビゲーションハンドラー
  const handleNavigate = (screen: 'calendar' | 'stats') => {
    if (screen === 'stats') {
      router.push('/stats');
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader currentScreen="calendar" onNavigate={handleNavigate} />
      <div className="flex-1 overflow-hidden">
        <CalendarView {...props} />
      </div>
    </div>
  );
}
```

#### ❌ 避けるべきパターン
```typescript
// ❌ 複雑なロジックをページ内に直接記述
export default function CalendarPage() {
  // 大量のuseState、useEffect、イベントハンドラーが混在
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 長いビジネスロジック（100行以上）
  const handleMeetingSubmit = async (data) => {
    // 複雑な処理...
  };
  
  // JSXも複雑になる
  return <div>{/* 複雑なJSX */}</div>;
}
```

### 🔄 ルーティング規約

#### 🎯 ページ間遷移
- **プログラマティック遷移**: `useRouter().push()`を使用
- **宣言的遷移**: `<Link>`コンポーネントを使用
- **条件分岐**: 認証状態に基づく適切なリダイレクト

```typescript
// ナビゲーション例
const handleNavigate = (screen: 'calendar' | 'stats') => {
  if (screen === 'stats') {
    router.push('/stats');
  } else if (screen === 'calendar') {
    router.push('/calendar');
  }
};

// 認証状態による自動リダイレクト
useEffect(() => {
  if (isAuthenticated) {
    router.push('/calendar');
  } else {
    router.push('/signin');
  }
}, [isAuthenticated, router]);
```

#### 🔒 認証保護
- **未認証時**: `/signin`へリダイレクト
- **認証済み時**: `/calendar`へリダイレクト
- **ルートページ**: 認証状態に応じた適切なページへの振り分け

### 📱 レスポンシブ対応
- **モバイルファースト**: 小さな画面から設計
- **ブレークポイント**: Tailwind CSSの標準ブレークポイントを使用
- **タッチ対応**: モバイルデバイスでの操作性を考慮

### 🧩 コンポーネント連携
- **共通ヘッダー**: `AppHeader`コンポーネントでナビゲーション統一
- **レイアウト**: `layout.tsx`で共通レイアウト定義
- **プロバイダー**: 認証・テーマ等のコンテキストを適切に配置

### 🎯 SEO & パフォーマンス
- **メタデータ**: Next.js 13+の`metadata`APIを活用
- **動的インポート**: 必要に応じてコンポーネントの遅延読み込み
- **Client Components**: `'use client'`を適切に使用

### 🏷️ 命名規約
- **機能コンポーネント**: `{ComponentName}.component.tsx`
- **共通コンポーネント**: `{ComponentName}.tsx`
- **相対インポート**: 同一機能内では相対パス（`./components/...`）
- **絶対インポート**: 共通リソースには絶対パス（`@/components/...`）

### 📋 実装チェックリスト
- [ ] 各ルートに`page.tsx`を作成
- [ ] 機能別にcomponentsディレクトリを作成
- [ ] Custom Hooksでビジネスロジックを分離
- [ ] 適切な認証ガード実装
- [ ] ナビゲーション機能の実装
- [ ] レスポンシブデザインの確認
- [ ] 型安全性の確保
- [ ] コンポーネント命名規約の遵守

### 🚀 メリット
- **開発効率**: 機能ごとに必要なファイルが集約され、開発効率が向上
- **チーム開発**: 機能単位での作業分担が容易
- **テスト**: 機能単位でのテストが書きやすい
- **デプロイ**: 機能単位での段階的デプロイが可能
- **拡張性**: 新機能追加時の影響範囲が明確

この構造により、Next.js App Routerの利点を最大限活用し、保守性の高いModular Monolithアーキテクチャを実現する 🚀

## 🎨 Frontend Zodバリデーション実装パターン

### 📝 基本構成
Frontendでは以下のパターンでZodバリデーションを実装する：

```typescript
// Zodスキーマ定義（backendと同期）
const MeetingFormSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須項目です')
    .trim(),
  startTime: z.string()
    .min(1, '開始時刻は必須項目です'),
  endTime: z.string()
    .min(1, '終了時刻は必須項目です'),
  isImportant: z.boolean().optional().default(false)
}).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true;
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
  },
  {
    message: '終了時刻は開始時刻より後に設定してください',
    path: ['endTime']
  }
);

// バリデーション実行
const validateForm = () => {
  const newErrors: string[] = [];
  
  try {
    // 🔒 Zodスキーマによるバリデーション
    MeetingFormSchema.parse({
      title: formData.title,
      startTime: formData.startTime,
      endTime: formData.endTime,
      isImportant: formData.isImportant
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.issues.forEach(issue => {
        newErrors.push(issue.message);
      });
    }
  }
  
  // 追加のビジネスルールバリデーション（Zodでは表現困難なもの）
  // 時間重複チェック、開始済み会議チェック等
  
  setErrors(newErrors);
  return newErrors.length === 0;
};
```

### 🎯 Frontend Zodパターンの特徴
- **📊 フォーム特化**: HTML input要素との連携に最適化
- **⚡ リアルタイム**: ユーザー入力時の即座なフィードバック
- **🔗 Backend同期**: 基本ルールはBackend Zodスキーマと統一
- **🧩 追加ルール**: Zodで表現困難なビジネスルールは個別実装