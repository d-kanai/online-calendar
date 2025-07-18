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