'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, SignUpData, SignInData } from '../types/auth';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';

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

const CURRENT_USER_KEY = 'calendar_app_current_user';

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

  // 初期化時に保存されたユーザー情報とトークンをチェック
  useEffect(() => {
    const currentUser = getCurrentUser();
    const token = authService.getToken();
    
    if (currentUser && token) {
      dispatch({ type: 'SIGN_IN', payload: currentUser });
    } else {
      // トークンがない場合はユーザー情報もクリア
      storeCurrentUser(null);
      dispatch({ type: 'LOADING', payload: false });
    }
  }, []);

  const signUp = async (data: SignUpData) => {
    dispatch({ type: 'LOADING', payload: true });

    try {
      const response = await authService.signUp(data);
      
      // トークンとユーザー情報を保存
      authService.setToken(response.token);
      storeCurrentUser(response.user);

      dispatch({ type: 'SIGN_IN', payload: response.user });
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
      const response = await authService.signIn(data);
      
      // トークンとユーザー情報を保存
      authService.setToken(response.token);
      storeCurrentUser(response.user);

      dispatch({ type: 'SIGN_IN', payload: response.user });
      toast.success('ログインしました');
    } catch (error) {
      dispatch({ type: 'LOADING', payload: false });
      toast.error(error instanceof Error ? error.message : 'ログインに失敗しました');
      throw error;
    }
  };

  const signOut = () => {
    authService.removeToken();
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