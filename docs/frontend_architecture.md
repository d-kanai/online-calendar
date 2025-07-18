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

## 🪝 カスタムフックパターン

### 基本原則
- **ロジックの分離**: ビジネスロジックとUI表示ロジックを明確に分離
- **再利用性**: 複雑なステート管理やAPIコールをフックに集約
- **テスタビリティ**: フックを独立してテスト可能に
- **単一責任**: 1つのフックは1つの責務に集中

### 実装例
```typescript
// ✅ Good: フォームロジックをカスタムフックに分離
// hooks/useMeetingForm.ts
export function useMeetingForm({ meeting, onSubmit, onClose }) {
  const form = useForm({
    resolver: zodResolver(MeetingFormSchema),
    defaultValues: getDefaultValues(meeting)
  });

  // フォーム初期化ロジック
  useEffect(() => {
    if (meeting) {
      form.reset(convertMeetingToFormData(meeting));
    }
  }, [meeting]);

  // ビジネスルールバリデーション
  const validateBusinessRules = (data) => {
    // 時間重複チェック、開始済みチェックなど
  };

  // 送信処理
  const handleSubmit = async (data) => {
    if (!validateBusinessRules(data)) return;
    await onSubmit(data);
    onClose();
  };

  return {
    ...form,
    handleSubmit,
    isEditing: !!meeting
  };
}

// components/MeetingForm.tsx
export function MeetingForm(props) {
  // ロジックは全てカスタムフックに委譲
  const { register, handleSubmit, errors } = useMeetingForm(props);
  
  // コンポーネントはUIの表示のみに集中
  return (
    <form onSubmit={handleSubmit}>
      <TitleInput register={register} />
      <TimeInputs register={register} />
      <SubmitButton />
    </form>
  );
}
```

### カスタムフックの命名規則
- `use` プレフィックスを必須とする
- 機能を明確に表す名前にする（例: `useMeetingForm`, `useAuthStatus`）
- 汎用的なフックは `useBoolean`, `useDebounce` など簡潔に

### メリット
- **保守性向上**: ロジックとUIの関心事が分離される
- **再利用性**: 同じロジックを複数のコンポーネントで使い回せる
- **テスト容易性**: フックとコンポーネントを独立してテスト可能
- **可読性**: コンポーネントがシンプルになり、構造を理解しやすい

## 🚫 アンチパターンと推奨パターン

### ❌ リテラル型ユニオンによる分岐処理
```typescript
// ❌ Bad: type引数で処理を分岐
const handleParticipantsChange = async (
  type: 'add' | 'remove',
  meetingId: string,
  data: { email?: string; participantId?: string }
) => {
  if (type === 'add' && data.email) {
    // 追加処理
  } else if (type === 'remove' && data.participantId) {
    // 削除処理
  }
};
```

### ✅ 専用メソッドへの分離
```typescript
// ✅ Good: それぞれの処理を専用メソッドに分離
const handleAddParticipant = async (meetingId: string, email: string) => {
  // 追加処理
};

const handleRemoveParticipant = async (meetingId: string, participantId: string) => {
  // 削除処理
};
```

### 原則
- **単一責任の原則**: 1つの関数は1つの責務のみを持つ
- **if文の最小化**: 条件分岐は可能な限り削減する
- **型安全性**: 各関数は必要なパラメータのみを受け取る
- **命名の明確性**: 関数名から動作が明確にわかるようにする

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

## 🛠️ React Hook Form統合パターン

### 🎯 基本原則
- **React Hook Form**: フォーム状態管理はuseFormフックを使用
- **Zodバリデーション**: zodResolverでReact Hook FormとZodを連携
- **型安全性**: TypeScriptとの完全な統合でコンパイル時エラー検出
- **パフォーマンス**: 非制御コンポーネントによる最適化

### 🏗️ 実装パターン
```typescript
// フォームコンポーネント実装例
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const MeetingForm = ({ meeting, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(MeetingFormSchema) as any, // Next.js互換性対応
    defaultValues: {
      title: meeting?.title || '',
      startTime: meeting?.startTime || '',
      endTime: meeting?.endTime || '',
      isImportant: meeting?.isImportant || false
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  );
};
```

### ✅ メリット
- **フォーム再レンダリング最小化**: 非制御コンポーネントによる高パフォーマンス
- **宣言的バリデーション**: Zodスキーマによる型安全なバリデーション
- **開発効率**: ボイラープレート大幅削減
- **統一性**: 全フォームで統一されたAPIとパターン

## ⚡ TanStack Query データフェッチパターン

### 🎯 基本原則
- **サーバー状態管理**: TanStack Queryでサーバー状態を一元管理
- **キャッシュ戦略**: Query Key factoryによる階層的キャッシュ管理
- **楽観的更新**: 即座のUI反映でユーザー体験向上
- **リアルタイム**: 自動的なデータ同期とキャッシュ無効化

### 🏗️ Query Key Factory パターン
```typescript
// lib/query-keys.ts
export const queryKeys = {
  all: ['online-calendar'] as const,
  meetings: () => [...queryKeys.all, 'meetings'] as const,
  meetingsList: (filters?: { date?: Date; ownerId?: string }) => 
    [...queryKeys.meetings(), 'list', filters] as const,
  meetingDetail: (id: string) => 
    [...queryKeys.meetings(), 'detail', id] as const,
  users: () => [...queryKeys.all, 'users'] as const,
  userDetail: (id: string) => [...queryKeys.users(), 'detail', id] as const,
};

// キャッシュヘルパー
export const cacheHelpers = {
  invalidateMeetings: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.meetings() });
  },
  updateMeetingInAllCaches: (queryClient: QueryClient, id: string, updater: (old: Meeting) => Meeting) => {
    // 個別詳細キャッシュ更新
    queryClient.setQueryData(queryKeys.meetingDetail(id), updater);
    
    // リストキャッシュ更新
    queryClient.setQueryData(queryKeys.meetingsList(), (old: Meeting[] = []) => 
      old.map(meeting => meeting.id === id ? updater(meeting) : meeting)
    );
  }
};
```

### 🔄 Optimistic Updates パターン
```typescript
// hooks/useMeetingsQuery.ts
export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMeetingData }) => {
      const response = await meetingApi.update(id, data);
      if (!response.success) {
        throw new Error(response.error || '会議の更新に失敗しました');
      }
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // 楽観的更新前のキャンセル
      await queryClient.cancelQueries({ queryKey: queryKeys.meetings() });
      
      // 前の状態をバックアップ
      const previousMeeting = queryClient.getQueryData(queryKeys.meetingDetail(id));
      const previousList = queryClient.getQueryData(queryKeys.meetingsList());
      
      // 楽観的更新実行
      const updater = (old: Meeting) => ({
        ...old,
        ...data,
        updatedAt: new Date()
      });
      
      cacheHelpers.updateMeetingInAllCaches(queryClient, id, updater);
      
      return { previousMeeting, previousList };
    },
    onError: (err, { id }, context) => {
      // エラー時はロールバック
      if (context?.previousMeeting) {
        queryClient.setQueryData(queryKeys.meetingDetail(id), context.previousMeeting);
      }
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.meetingsList(), context.previousList);
      }
      toast.error(err instanceof Error ? err.message : '会議の更新に失敗しました');
    },
    onSettled: (data, error, { id }) => {
      // 最終的にサーバーデータで同期
      queryClient.invalidateQueries({ queryKey: queryKeys.meetingDetail(id) });
    },
    onSuccess: () => {
      toast.success('会議が更新されました');
    },
  });
};
```

### 📊 Suspense統合パターン
```typescript
// hooks/useMeetingsQuerySuspense.ts
export const useMeetingsSuspense = () => {
  const { data: meetings } = useSuspenseQuery({
    queryKey: queryKeys.meetingsList(),
    queryFn: async () => {
      const response = await meetingApi.getAll();
      if (!response.success) {
        throw new Error(response.error || '会議の取得に失敗しました');
      }
      return response.data;
    },
    staleTime: 30 * 1000, // 30秒間は新鮮とみなす
    gcTime: 5 * 60 * 1000, // 5分間ガベージコレクション猶予
  });

  return { meetings };
};

// コンポーネントでの使用
function CalendarContent() {
  const { meetings } = useMeetingsSuspense(); // Suspenseが自動的にローディング処理
  
  return <CalendarView meetings={meetings} />;
}

export function CalendarPage() {
  return (
    <ErrorBoundary FallbackComponent={CalendarError}>
      <Suspense fallback={<CalendarLoading />}>
        <CalendarContent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### ✅ メリット
- **自動キャッシュ**: 重複リクエスト削減とパフォーマンス向上
- **リアルタイム同期**: バックグラウンド更新と自動invalidation
- **楽観的更新**: 即座のUI反映でレスポンシブな操作感
- **エラーハンドリング**: 一貫したエラー処理とロールバック機能
- **開発体験**: React DevToolsとTanStack Query DevToolsでの可視化

### 📁 React Query hooksの命名規則とファイル構成

#### 命名規則
- **Query系（データ取得）**: `useXxxQuery.ts`
  - Suspense版も同じファイルに含める
  - 例: `useMeetingsQuery.ts`
- **Mutation系（データ変更）**: `useXxxMutations.ts`
  - ビジネスロジックを含むラッパー関数
  - 例: `useMeetingMutations.ts`
- **内部実装**: `_useXxxMutations.ts`
  - React Query の mutation 定義
  - 外部から直接使用しない
  - 例: `_useMeetingMutations.ts`

#### ファイル構成例
```typescript
// hooks/useMeetingsQuery.ts - Query系（データ取得）
export function useMeetingsSuspense() {
  const { data: meetings } = useSuspenseQuery({
    queryKey: queryKeys.meetingsList(),
    queryFn: getMeetings
  });
  return { meetings };
}

export function useMeetingDetailSuspense(id: string) {
  const { data: meeting } = useSuspenseQuery({
    queryKey: queryKeys.meetingDetail(id),
    queryFn: () => getMeetingById(id)
  });
  return { meeting };
}

// hooks/useMeetingMutations.ts - Mutation系（公開API）
import { useCreateMeeting as _useCreateMeeting } from './_useMeetingMutations';

export function useMeetingActions() {
  const createMutation = _useCreateMeeting();
  
  const handleCreateMeeting = async (data: CreateMeetingData) => {
    // UIステート管理やビジネスロジック
    await createMutation.mutateAsync(data);
    // 後処理
  };
  
  return { handleCreateMeeting };
}

// hooks/_useMeetingMutations.ts - 内部実装
export function useCreateMeeting() {
  return useMutation({
    mutationFn: createMeetingAPI,
    onSuccess: invalidateMeetings
  });
}
```

#### メリット
- **明確な責任分離**: Query（読み取り）とMutation（書き込み）が明確
- **React Query標準への準拠**: 一般的な命名規則に従う
- **内部実装の隠蔽**: _プレフィックスで実装詳細を隠す

## 🔄 統一API クライアントパターン

### 🎯 基本原則
- **DRY原則**: 共通ヘッダーや設定の重複排除
- **型安全性**: レスポンス型定義による静的型チェック
- **エラーハンドリング**: 統一されたエラー処理とログ出力
- **認証**: 自動的なトークン管理と更新

### 🏗️ 実装パターン
```typescript
// lib/api-client.ts
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const authHeaders = await this.getAuthHeaders();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: { ...authHeaders, ...options.headers },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Backend APIResponse形式に対応
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      // 従来形式への互換性
      return { success: true, data } as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('リクエストがタイムアウトしました');
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, options);
  }

  async post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  async put<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }
}

// 使用例
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export const meetingApi = {
  getAll: () => apiClient.get<Meeting[]>('/meetings'),
  getById: (id: string) => apiClient.get<Meeting>(`/meetings/${id}`),
  create: (data: CreateMeetingData) => apiClient.post<Meeting>('/meetings', data),
  update: (id: string, data: UpdateMeetingData) => apiClient.put<Meeting>(`/meetings/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/meetings/${id}`),
};
```

### ✅ メリット
- **保守性**: 共通ロジックの一元管理
- **型安全性**: TypeScriptによる静的型チェック
- **一貫性**: 全APIで統一されたエラーハンドリング
- **デバッグ**: 統一されたログ出力とエラー追跡

## 🎨 Suspense & ErrorBoundary最適化パターン

### 🎯 基本原則
- **階層的制御**: グローバル、ページ、コンポーネントレベルでの適切な粒度
- **ユーザー体験**: 段階的ローディングによる自然な待機体験
- **エラー境界**: 適切なレベルでのエラーキャッチと復旧
- **Next.js互換**: App RouterのServer/Client Component分離

### 🏗️ 階層構造パターン
```typescript
// app/layout.tsx (RootLayout)
// グローバルな基盤のみ、ErrorBoundaryは含めない
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children} // ページが責任を持つ
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

// app/calendar/page.tsx (ページレベル)
// ページ固有のSuspenseで細かい制御
'use client';
export default function CalendarPage() {
  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader currentScreen="calendar" onNavigate={handleNavigate} />
      <CalendarSuspense currentUser={CURRENT_USER} />
    </div>
  );
}

// components/CalendarSuspense.tsx (コンポーネントレベル)
// 具体的なローディング・エラー状態
export function CalendarSuspense({ currentUser }) {
  return (
    <ErrorBoundary FallbackComponent={CalendarError}>
      <Suspense fallback={<CalendarLoading />}>
        <CalendarContent currentUser={currentUser} />
      </Suspense>
    </ErrorBoundary>
  );
}

// 細かい粒度でのSuspense（モーダル等）
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner message="会議詳細を読み込んでいます..." />}>
        <MeetingDetailContent {...props} />
      </Suspense>
    </ErrorBoundary>
  </DialogContent>
</Dialog>
```

### 📊 ローディング状態の設計
```typescript
// 専用ローディングコンポーネント
function CalendarLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">会議データを読み込んでいます...</p>
      </div>
    </div>
  );
}

// 専用エラーコンポーネント
function CalendarError({ error, resetErrorBoundary }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-destructive">エラーが発生しました</p>
        <p className="text-muted-foreground">{error.message}</p>
        <button onClick={resetErrorBoundary}>
          再試行
        </button>
      </div>
    </div>
  );
}
```

### ✅ メリット
- **段階的ローディング**: 全画面ローディングを回避し自然な体験
- **適切な粒度**: エラーレベルに応じた適切な境界設定
- **復旧機能**: ユーザーが自分でエラーから復旧可能
- **開発体験**: Next.js App Routerとの完全な互換性

## 🧪 E2Eテスト Suspense対応パターン

### 🎯 基本原則
- **非同期処理**: Suspenseローディングの完了を適切に待機
- **要素特定**: data-testid等による確実な要素特定
- **メッセージ検証**: 実装と一致するトーストメッセージの確認
- **安定性**: タイミングに依存しない堅牢なテスト

### 🏗️ 実装パターン
```javascript
// E2EテストでのSuspense待機
Then('会議詳細画面に {string} と表示される', async function (expectedTime) {
  // モーダルが表示されるまで待機
  await global.calendarPage.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  
  // Suspenseローディングが完了するまで待機
  try {
    await global.calendarPage.page.waitForSelector('text=会議詳細を読み込んでいます...', { 
      state: 'hidden', 
      timeout: 10000 
    });
  } catch (e) {
    // ローディングスピナーがすでに消えている場合は続行
  }
  
  // 具体的な要素が表示されるまで待機
  await global.calendarPage.page.waitForSelector('[data-testid="meeting-time-display"]', { 
    timeout: 10000 
  });
  
  // 内容を検証
  const timeText = await global.calendarPage.page.textContent('[data-testid="meeting-time-display"]');
  expect(timeText).toContain(expectedTime);
});

// 参加者削除の正しいメッセージ待機
When('オーナーが参加者を削除する', async function () {
  // 削除確認ダイアログの「削除する」ボタンをクリック
  await page.click('button:has-text("削除する")');
  
  // 正しい成功メッセージ（実装に合わせて）を待機
  await page.waitForSelector('text=参加者が更新されました', { timeout: 10000 });
  
  // ネットワークの完了を待機
  await page.waitForLoadState('networkidle');
});
```

### ✅ メリット
- **信頼性**: Suspenseローディングを考慮した安定したテスト
- **保守性**: 実装変更に追従しやすいテスト設計
- **デバッグ**: 適切な待機によりテスト失敗の原因特定が容易

## 📊 統計・分析に最適化されたテストパターン

### 🎯 基本原則
- **日付非依存**: 実行日に関係なく一貫した結果
- **固定データ**: テスト用の決定論的データセット
- **計算検証**: ビジネスロジックの数値計算を正確に検証
- **環境隔離**: テスト間での状態汚染の防止

### 🏗️ 実装パターン
```typescript
// 日付固定のテストパターン
test('getDailyAverage - 過去1週間の日次平均会議時間を正しく計算する', async () => {
  const user = await UserFactory.create();
  
  // 固定された基準日を使用（実行日に依存しない）
  const baseDate = new Date('2024-01-15'); // 月曜日
  
  // 決定論的なテストデータ作成
  const meetings = [
    { ownerId: user.id, startTime: new Date('2024-01-15T10:00:00.000Z'), 
      endTime: new Date('2024-01-15T11:00:00.000Z') }, // 60分
    { ownerId: user.id, startTime: new Date('2024-01-17T14:00:00.000Z'), 
      endTime: new Date('2024-01-17T14:30:00.000Z') }, // 30分
    { ownerId: user.id, startTime: new Date('2024-01-19T09:00:00.000Z'), 
      endTime: new Date('2024-01-19T10:30:00.000Z') }, // 90分
  ];
  
  for (const meeting of meetings) {
    await MeetingFactory.create(meeting);
  }

  // 固定日付範囲で計算
  const endDate = new Date('2024-01-21T23:59:59.999Z');
  const startDate = new Date('2024-01-15T00:00:00.000Z');
  
  // 直接Calculatorをテスト（コントローラー経由ではなく）
  const calculator = new DailyAverageStatCalculator(meetings, startDate, endDate);
  const result = calculator.run();

  // 明確な計算式での検証
  // 計算: (60+0+30+0+90+0+0) ÷ 7 = 180 ÷ 7 = 25.7分
  expect(result.averageDailyMinutes).toBeCloseTo(25.7, 1);
});
```

### ✅ メリット
- **決定論的**: 常に同じ結果が得られる信頼性の高いテスト
- **保守性**: 実装変更時にテストの意図が明確
- **デバッグ**: テスト失敗時の原因特定が容易

## 🚀 Suspense Query パターン

### 🎯 基本原則
- **宣言型UI**: ローディング・エラー状態をコンポーネント外で管理
- **型安全性**: データが必ず存在することが保証される
- **Suspense境界**: React SuspenseとErrorBoundaryで状態を制御
- **パフォーマンス**: TanStack QueryのSuspense機能を活用した最適化

### 🏗️ useSuspenseQuery vs useQuery

#### ❌ 従来のuseQueryパターン
```typescript
// 従来: 各コンポーネントで状態管理が必要
export function DataComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData
  });

  // コンポーネント内で条件分岐が必要
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  if (!data) return null;
  
  return <UI data={data} />;
}
```

#### ✅ useSuspenseQueryパターン
```typescript
// Suspense Query: データロジックに集中
export function DataComponent() {
  const { data } = useSuspenseQuery({
    queryKey: ['data'],
    queryFn: fetchData
  });

  // dataは必ず存在、条件分岐不要
  return <UI data={data} />;
}

// 状態管理は外側のSuspense境界で処理
export function DataPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorUI}>
      <Suspense fallback={<LoadingUI />}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 🛡️ 必須ラッパー構成

#### ❗ ErrorBoundaryとSuspenseが必須
```typescript
// useSuspenseQueryは内部でPromise/Errorを throw
const { data } = useSuspenseQuery({ ... });
// ↑ データロード中は Promise を throw
// ↑ エラー時は Error を throw
```

#### 🚫 ラッパーがない場合のエラー
```typescript
// Suspenseなし → エラー
// "A component suspended while responding to synchronous input"

// ErrorBoundaryなし → アプリクラッシュ
// "Uncaught Error: Failed to fetch data"
```

#### ✅ 正しいラッパー構成
```typescript
export function DataSuspense() {
  return (
    <ErrorBoundary FallbackComponent={DataError}>
      <Suspense fallback={<DataLoading />}>
        <DataComponent /> {/* useSuspenseQuery使用 */}
      </Suspense>
    </ErrorBoundary>
  );
}

// エラーフォールバックコンポーネント
function DataError({ error, resetErrorBoundary }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-destructive">データの読み込みでエラーが発生しました</p>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
```

### 🏗️ 実装パターン

#### 1. フック層のSuspense Query対応
```typescript
// hooks/useDataQuery.ts
import { useSuspenseQuery } from '@tanstack/react-query';

export function useDataSuspense() {
  return useSuspenseQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const response = await dataApi.getAll();
      if (!response.success) {
        throw new Error(response.error || 'データの取得に失敗しました');
      }
      return response.data;
    },
    staleTime: 60 * 1000, // 1分
    gcTime: 5 * 60 * 1000, // 5分
    refetchInterval: 5 * 60 * 1000, // 5分ごとに自動更新
  });
}
```

#### 2. コンポーネント層の簡素化
```typescript
// components/DataComponent.tsx
export function DataComponent() {
  // Suspense Query Hook（isLoading, errorは不要）
  const { data } = useDataSuspense();
  
  // 純粋なデータ表示ロジックのみ
  return (
    <div className="space-y-4">
      {data.map(item => (
        <DataItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

#### 3. Suspense境界の作成
```typescript
// components/DataSuspense.component.tsx
export function DataSuspense() {
  return (
    <ErrorBoundary FallbackComponent={DataError}>
      <Suspense fallback={<LoadingSpinner message="データを読み込んでいます..." />}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

#### 4. ページ層での統合
```typescript
// app/data/page.tsx
export default function DataPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-hidden" data-testid="data-view">
        <DataSuspense />
      </div>
    </AuthenticatedLayout>
  );
}
```

### 🎯 設計メリット

#### 📊 コード品質
- **関心の分離**: データロジック、UI状態、表示の明確な分離
- **可読性**: コンポーネントが純粋なデータ表示に集中
- **型安全性**: TypeScriptでdataの存在が保証される
- **テスタビリティ**: ロジック層の独立テストが容易

#### ⚡ パフォーマンス
- **条件分岐削減**: ローディング・エラー状態の条件分岐が不要
- **レンダリング最適化**: Suspense境界による効率的な再レンダリング
- **コード削減**: ボイラープレートコードの大幅削減

#### 🔄 開発体験
- **一貫性**: 全データ取得で統一されたパターン
- **保守性**: エラーハンドリングとローディング状態の一元管理
- **再利用性**: Suspense境界コンポーネントの共通化

### ⚠️ 注意点

#### 🚨 必須要件
- **react-error-boundary**: ErrorBoundaryライブラリが必要
- **TanStack Query**: useSuspenseQueryサポートバージョン
- **適切なラッパー**: ErrorBoundaryとSuspenseの両方が必須

#### 🎯 適用ガイドライン
- **データ取得**: サーバーからのデータ取得に使用
- **ページレベル**: 主要なデータロードにSuspense境界を設定
- **モーダル**: 細かい粒度でもSuspense境界を適用可能

### 📋 実装チェックリスト
- [ ] useSuspenseQueryでフックを実装
- [ ] コンポーネントからisLoading、error条件分岐を削除
- [ ] ErrorBoundary + Suspenseのラッパーコンポーネント作成
- [ ] 専用のローディング・エラーフォールバックコンポーネント作成
- [ ] ページでSuspenseコンポーネントを使用
- [ ] E2Eテストでローディング完了待機を実装

この設計により、React 18のSuspense機能を最大限活用し、宣言型でメンテナブルなデータフェッチング層を実現する 🚀

## 🎨 Component Composition Pattern

### 🎯 基本原則
- **UIイメージの可視化**: コードを読むだけでUIの構造が直感的に分かる
- **適切な粒度**: 大きなJSXを避け、意味のある単位でコンポーネント分割
- **Co-location**: 関連するUIコンポーネントは同一ファイル内に配置
- **再利用性判断**: 2箇所以上で使われない限りファイル分離しない

### 🏗️ 実装パターン

#### ❌ 避けるべきパターン（大きなJSX）
```typescript
export function SignInForm() {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* 100行以上の複雑なJSX */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl">ログイン</h1>
        <p className="text-muted-foreground">...</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" {...register('email')} />
        </div>
      </div>
      {/* さらに続く長いJSX... */}
    </div>
  );
}
```

#### ✅ 推奨パターン（Component Composition）
```typescript
// 🎨 UIコンポーネント群（同一ファイル内）
function FormHeader() {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl">ログイン</h1>
      <p className="text-muted-foreground">
        アカウントにログインしてカレンダーアプリを使用する
      </p>
    </div>
  );
}

function EmailInput({ register, isLoading }: { register: any; isLoading: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">メールアドレス</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          className="pl-10"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

function PasswordInput({ register, isLoading }: { register: any; isLoading: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">パスワード</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="password"
          type="password"
          placeholder="パスワードを入力"
          {...register('password')}
          className="pl-10"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? 'ログイン中...' : 'ログイン'}
    </Button>
  );
}

// 🏗️ メインコンポーネント - 構造が一目瞭然
export function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
  const { signIn, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors }, setError } = useForm({...});

  const onSubmit = async (data: FormData) => { /* ビジネスロジック */ };

  return (
    <div className="w-full max-w-md space-y-6">
      <FormHeader />
      <ErrorAlert errors={errors} />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <EmailInput register={register} isLoading={isLoading} />
        <PasswordInput register={register} isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </form>

      <SignUpLink onSwitchToSignUp={onSwitchToSignUp} isLoading={isLoading} />
    </div>
  );
}
```

### 📂 ファイル分離の判断基準

#### ✅ 同一ファイル内に留める（推奨）
- **単一責任**: 1つのフォーム/画面の専用部品
- **利用箇所**: 1箇所でのみ使用
- **サイズ**: 各コンポーネントが20-50行程度
- **可読性**: ファイル全体が200行以下
- **凝集性**: 親コンポーネントと密結合

```typescript
// SignInForm.component.tsx
function EmailInput() { ... }     // SignInForm専用
function PasswordInput() { ... }  // SignInForm専用
function SubmitButton() { ... }   // SignInForm専用
export function SignInForm() { ... }
```

#### 🔄 ファイル分離を検討する場合
- **真の再利用性**: 2箇所以上で使用される
- **独立性**: 他のコンテキストでも意味を持つ
- **複雑性**: 50行以上の複雑なロジック
- **テスタビリティ**: 独立したテストが必要

```typescript
// components/ui/LoadingButton.tsx - 汎用的
export function LoadingButton() { ... } // 複数フォームで使用

// components/auth/OAuthButtons.tsx - 独立機能
export function OAuthButtons() { 
  // Google/GitHub連携など複雑なロジック
}
```

### 🎯 設計メリット

#### 📖 可読性向上
```typescript
// JSXを見るだけでUIの構造が分かる
return (
  <div>
    <FormHeader />           {/* ヘッダー部分 */}
    <ErrorAlert />           {/* エラー表示 */}
    <form>
      <EmailInput />         {/* メール入力 */}
      <PasswordInput />      {/* パスワード入力 */}
      <SubmitButton />       {/* 送信ボタン */}
    </form>
    <SignUpLink />          {/* 新規登録リンク */}
  </div>
);
```

#### 🔧 保守性向上
- **局所的変更**: 特定のUIパーツのみ修正可能
- **責務明確**: 各コンポーネントの役割が明確
- **テスト容易**: 個別コンポーネントのテストが可能
- **スタイル管理**: CSSの影響範囲が限定的

#### ⚡ 開発効率
- **認知負荷軽減**: 一度に理解する範囲が小さい
- **並行開発**: チームメンバーが異なる部品を担当可能
- **デバッグ効率**: 問題の箇所を素早く特定

### 📋 実装ガイドライン

#### 🎯 コンポーネント分割の判断
1. **意味的なまとまり**: ユーザーが認識する単位（ヘッダー、入力エリア、ボタンなど）
2. **サイズ制限**: 20-50行程度の適切なサイズ
3. **責務単一**: 1つの明確な責任を持つ
4. **UIイメージ**: コンポーネント名からUIが想像できる

#### 🚫 過度な分割を避ける
```typescript
// ❌ 過度な分割（やりすぎ）
function EmailIcon() { return <Mail />; }
function EmailLabel() { return <Label>メール</Label>; }
function EmailTextField() { return <Input />; }

// ✅ 適切な分割
function EmailInput() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">メールアドレス</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input id="email" type="email" />
      </div>
    </div>
  );
}
```

### 📝 命名規約
- **機能的命名**: `EmailInput`, `SubmitButton`, `ErrorAlert`
- **UI構造命名**: `FormHeader`, `FormFooter`, `SidebarNav`
- **状態反映**: `LoadingButton`, `DisabledInput`, `ActiveTab`

### 🧪 テスト戦略
```typescript
// 各コンポーネントの単体テスト
describe('EmailInput', () => {
  test('should display validation error', () => {
    // EmailInput固有のテスト
  });
});

// 統合テスト
describe('SignInForm', () => {
  test('should complete sign in flow', () => {
    // フォーム全体の動作テスト
  });
});
```

### 📋 実装チェックリスト
- [ ] JSXが50行を超える場合、意味的な単位で分割
- [ ] コンポーネント名からUIイメージが想像できる
- [ ] 同一ファイル内で関連コンポーネントをグループ化
- [ ] 2箇所以上で使用される場合のみファイル分離を検討
- [ ] 各コンポーネントが単一責任を持つ
- [ ] メインコンポーネントのJSXが構造的に読みやすい

この設計により、**「コードを読むだけでUIのイメージが湧く」**直感的で保守性の高いコンポーネント設計を実現する 🎨

## 🚪 page.tsx エントリーポイント設計パターン

### 🎯 基本原則
- **構造の可視化**: アプリの構造を一目で理解できることが最重要
- **最小限のJSX**: page.tsxは10行程度の簡潔な構造を維持
- **レイアウト分離**: 共通レイアウトは専用コンポーネントに分離
- **DRY原則**: 複数のpage.tsxで重複するコードは共通化

### 🏗️ 理想的なpage.tsx構造

#### ✅ 推奨パターン（シンプルで明確）
```typescript
// app/calendar/page.tsx - 理想的な例
'use client';

import React from 'react';
import { CalendarSuspense } from './components/CalendarSuspense.component';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalRealtimeSync } from './hooks/useRealtimeSync';

export default function CalendarPage() {
  const { user } = useAuth();
  const CURRENT_USER = user?.email || 'unknown@example.com';
  
  // グローバルリアルタイム同期を有効化
  useGlobalRealtimeSync();

  return (
    <AuthenticatedLayout>
      <CalendarSuspense currentUser={CURRENT_USER} />
      <Toaster />
    </AuthenticatedLayout>
  );
}
```

#### ❌ 避けるべきパターン（大きなJSX）
```typescript
// ❌ JSXが長すぎる例
export default function BadPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* 50行以上の複雑なレイアウトJSX */}
      <div className="hidden lg:flex lg:flex-1 bg-primary">
        <div className="max-w-md text-center space-y-6">
          {/* 大量のレイアウトコード... */}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {/* さらに続くレイアウトコード... */}
      </div>
    </div>
  );
}
```

### 📂 レイアウト共通化パターン

#### 🔄 重複除去前後の比較
```typescript
// Before: 重複だらけ（70行の重複JSX）
// signin/page.tsx: 44行、JSX 35行（80%）
// signup/page.tsx: 44行、JSX 35行（80%）

// After: Component Composition適用
// signin/page.tsx: 13行、JSX 3行（23%）
export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}

// signup/page.tsx: 13行、JSX 3行（23%）
export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}

// 共通化されたAuthLayout.component.tsx
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <BrandingSection />
      <AuthFormSection>
        {children}
      </AuthFormSection>
    </div>
  );
}
```

### 🎯 page.tsx設計ガイドライン

#### 1. **構造の明確性**
- ページの目的が瞬時に理解できる
- 使用するコンポーネントから機能が推測できる
- ビジネスロジックは適切なhooksに分離

#### 2. **JSXサイズ制限**
- **10行以下推奨**: エントリーポイントとして適切なサイズ
- **20行超えは要検討**: レイアウト分離を検討
- **30行超えは禁止**: 必ず共通コンポーネントに分離

#### 3. **レイアウト責務分離**
```typescript
// ✅ 適切な責務分離
export default function MyPage() {
  // 最小限のロジック（hooks呼び出し等）
  const data = usePageData();
  
  return (
    <PageLayout>           {/* レイアウト責務 */}
      <PageContent />      {/* コンテンツ責務 */}
    </PageLayout>
  );
}
```

#### 4. **共通化判断基準**
- **2箇所以上使用**: 必ず共通レイアウトコンポーネント作成
- **類似構造**: 80%以上類似する場合は共通化対象
- **保守性**: 変更時に複数ファイルを修正する必要がある場合

### 🏗️ レイアウトコンポーネント設計

#### Component Compositionパターン適用
```typescript
// components/AuthLayout.component.tsx
function BrandingSection() {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-primary text-primary-foreground items-center justify-center p-12">
      {/* ブランディング内容 */}
    </div>
  );
}

function MobileBranding() {
  return (
    <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
      {/* モバイルブランディング */}
    </div>
  );
}

function AuthFormSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-md">
        <MobileBranding />
        <Suspense fallback={<LoadingSpinner message="読み込み中..." />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

// メインレイアウト - 構造が一目瞭然
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <BrandingSection />
      <AuthFormSection>
        {children}
      </AuthFormSection>
    </div>
  );
}
```

### 📊 品質メトリクス

#### page.tsx品質基準
- **JSX行数**: 10行以下（理想）、20行以下（許容）
- **JSX比率**: 50%以下（理想）、70%以下（許容）
- **import数**: 5個以下（理想）、10個以下（許容）
- **責務**: 単一（ページエントリーポイントのみ）

#### 測定例
```typescript
// ✅ 理想的な品質例
// stats/page.tsx: 15行、JSX 7行（47%）、import 3個
export default function StatsPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-hidden" data-testid="stats-view">
        <StatsSuspense />
      </div>
    </AuthenticatedLayout>
  );
}
```

### 🧪 テスト戦略

#### page.tsx専用テスト
```typescript
// page.tsx単体テスト
describe('CalendarPage', () => {
  test('should render AuthenticatedLayout with CalendarSuspense', () => {
    // レイアウトとコンテンツの組み合わせテスト
  });

  test('should initialize realtime sync', () => {
    // hooks統合テスト
  });
});

// レイアウトコンポーネント単体テスト
describe('AuthLayout', () => {
  test('should render branding and form sections', () => {
    // レイアウト構造のテスト
  });
});
```

### 📋 実装チェックリスト

#### page.tsx作成時
- [ ] JSX行数が10行以下に収まっている
- [ ] ページの目的が一目で理解できる
- [ ] 複雑なレイアウトは専用コンポーネントに分離
- [ ] 他のページとの重複がない
- [ ] 適切なSuspense境界が設定されている
- [ ] testid等のテスタビリティが確保されている

#### レイアウト共通化時
- [ ] 2箇所以上で使用される共通部分を特定
- [ ] Component Compositionパターンで適切に分割
- [ ] レスポンシブ対応が適切に分離されている
- [ ] children propsで柔軟性を確保
- [ ] 共通レイアウトの単体テストを作成

### 🎯 設計効果

#### 🔍 可読性向上
- **エントリーポイント理解**: 3秒でページ構造が把握可能
- **機能推測**: コンポーネント名から機能が明確
- **ナビゲーション効率**: 目的の実装箇所を即座に特定

#### 🛠️ 保守性向上
- **変更局所化**: レイアウト変更は共通コンポーネントのみ
- **リファクタ容易**: ページ構造変更の影響範囲が限定的
- **デバッグ効率**: 問題箇所の特定が迅速

#### ⚡ 開発効率
- **新ページ作成**: 既存レイアウトの再利用で高速開発
- **並行開発**: レイアウトとコンテンツの独立実装
- **コードレビュー**: page.tsxの簡潔性によりレビュー効率向上

この設計により、**「page.tsxを見るだけでアプリの構造が一目で理解できる」**理想的なエントリーポイント設計を実現する 🚪