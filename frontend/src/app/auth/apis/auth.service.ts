import { SignInData, SignUpData, User } from '../../../types/auth';
import { API_BASE_URL } from '../../../lib/config';
import { getToken, setToken, removeToken, isAuthenticated } from '../../../lib/auth-token';

interface AuthResponse {
  token: string;
  user: User;
}


export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'サインアップに失敗しました');
    }

    return result.data;
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'ログインに失敗しました');
    }

    return result.data;
  },

  getToken,
  setToken,
  removeToken,
  isAuthenticated
};