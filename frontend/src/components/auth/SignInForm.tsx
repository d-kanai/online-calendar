'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../lib/ui/button';
import { Input } from '../../lib/ui/input';
import { Label } from '../../lib/ui/label';
import { Alert, AlertDescription } from '../../lib/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { SignInData } from '../../types/auth';
import { AlertCircle, Mail, Lock } from 'lucide-react';

interface SignInFormProps {
  onSwitchToSignUp?: () => void;
}

export function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('すべての項目を入力してください');
      return;
    }

    try {
      await signIn(formData);
    } catch {
      // エラーはAuthContextでtoastとして表示される
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl">ログイン</h1>
        <p className="text-muted-foreground">
          アカウントにログインしてカレンダーアプリを使用する
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">パスワード</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="パスワードを入力"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          アカウントをお持ちでないですか？
        </p>
        <Button 
          variant="link" 
          onClick={() => onSwitchToSignUp ? onSwitchToSignUp() : router.push('/signup')}
          className="p-0 h-auto"
          disabled={isLoading}
        >
          新規登録
        </Button>
      </div>
    </div>
  );
}