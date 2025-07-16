import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, SignUpData, SignInData } from '../types/auth';
import { toast } from 'sonner@2.0.3';

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOADING'; payload: boolean }
  | { type: 'SIGN_IN'; payload: User }
  | { type: 'SIGN_OUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: action.payload };
    case 'SIGN_IN':
      return {
        user: action.payload,
        isLoading: false,
        isAuthenticated: true
      };
    case 'SIGN_OUT':
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false
      };
    default:
      return state;
  }
};

// モックユーザーデータベース（実際のアプリではAPIを使用）
const USERS_KEY = 'calendar_app_users';
const CURRENT_USER_KEY = 'calendar_app_current_user';

const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const storeCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  // 初期化時に保存されたユーザー情報をチェック
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      dispatch({ type: 'SIGN_IN', payload: currentUser });
    } else {
      dispatch({ type: 'LOADING', payload: false });
    }
  }, []);

  const signUp = async (data: SignUpData) => {
    dispatch({ type: 'LOADING', payload: true });

    try {
      const users = getStoredUsers();
      
      // 既存ユーザーチェック
      if (users.some(user => user.email === data.email)) {
        throw new Error('このメールアドレスは既に登録されています');
      }

      // 新しいユーザーを作成
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        createdAt: new Date()
      };

      // ストレージに保存
      const updatedUsers = [...users, newUser];
      storeUsers(updatedUsers);
      storeCurrentUser(newUser);

      dispatch({ type: 'SIGN_IN', payload: newUser });
      toast.success('アカウントが作成されました');
    } catch (error) {
      dispatch({ type: 'LOADING', payload: false });
      toast.error(error instanceof Error ? error.message : 'サインアップに失敗しました');
      throw error;
    }
  };

  const signIn = async (data: SignInData) => {
    dispatch({ type: 'LOADING', payload: true });

    try {
      const users = getStoredUsers();
      const user = users.find(u => u.email === data.email);

      if (!user) {
        throw new Error('メールアドレスまたはパスワードが間違っています');
      }

      // 実際のアプリではパスワードの検証を行う
      // ここではシンプルにするため、メールアドレスの存在のみチェック

      storeCurrentUser(user);
      dispatch({ type: 'SIGN_IN', payload: user });
      toast.success('ログインしました');
    } catch (error) {
      dispatch({ type: 'LOADING', payload: false });
      toast.error(error instanceof Error ? error.message : 'ログインに失敗しました');
      throw error;
    }
  };

  const signOut = () => {
    storeCurrentUser(null);
    dispatch({ type: 'SIGN_OUT' });
    toast.success('ログアウトしました');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}