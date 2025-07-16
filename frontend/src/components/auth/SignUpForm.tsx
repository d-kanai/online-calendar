'use client';

import React, { useState } from 'react';
import { Button } from '../../lib/ui/button';
import { Input } from '../../lib/ui/input';
import { Label } from '../../lib/ui/label';
import { Alert, AlertDescription } from '../../lib/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { SignUpData } from '../../types/auth';
import { AlertCircle, User, Mail, Lock } from 'lucide-react';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const { signUp, isLoading } = useAuth();
  const [formData, setFormData] = useState<SignUpData>({
    name: '',
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('名前は必須項目です');
    }

    if (!formData.email.trim()) {
      newErrors.push('メールアドレスは必須項目です');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('有効なメールアドレスを入力してください');
    }

    if (!formData.password) {
      newErrors.push('パスワードは必須項目です');
    } else if (formData.password.length < 6) {
      newErrors.push('パスワードは6文字以上で入力してください');
    }

    if (formData.password !== confirmPassword) {
      newErrors.push('パスワードが一致しません');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signUp(formData);
    } catch {
      // エラーはAuthContextでtoastとして表示される
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl">新規登録</h1>
        <p className="text-muted-foreground">
          新しいアカウントを作成してカレンダーアプリを始める
        </p>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">名前</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="山田太郎"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

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
              placeholder="6文字以上のパスワード"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">パスワード（確認）</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="パスワードを再入力"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'アカウント作成中...' : 'アカウントを作成'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          既にアカウントをお持ちですか？
        </p>
        <Button 
          variant="link" 
          onClick={onSwitchToSignIn}
          className="p-0 h-auto"
          disabled={isLoading}
        >
          ログイン
        </Button>
      </div>
    </div>
  );
}