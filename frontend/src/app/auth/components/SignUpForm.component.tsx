'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/lib/ui/button';
import { Input } from '@/lib/ui/input';
import { Label } from '@/lib/ui/label';
import { Alert, AlertDescription } from '@/lib/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, User, Mail, Lock } from 'lucide-react';

// Zodスキーマ定義
const SignUpSchema = z.object({
  name: z.string()
    .min(1, '名前は必須項目です')
    .trim(),
  email: z.string()
    .min(1, 'メールアドレスは必須項目です')
    .email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z.string()
    .min(1, 'パスワード（確認）は必須項目です')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
});

type FormData = z.infer<typeof SignUpSchema>;

interface SignUpFormProps {
  onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm<FormData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signUp({
        name: data.name,
        email: data.email,
        password: data.password
      });
      // 成功時は自動的にリダイレクトされる
    } catch (error) {
      // APIエラーの場合、該当フィールドにエラーを設定
      if (error instanceof Error && error.message.includes('メールアドレス')) {
        setError('email', {
          type: 'manual',
          message: error.message
        });
      }
    }
  };

  // エラーメッセージを収集
  const errorMessages = Object.values(errors).map(error => error?.message).filter(Boolean);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl">新規登録</h1>
        <p className="text-muted-foreground">
          新しいアカウントを作成してカレンダーアプリを始める
        </p>
      </div>

      {errorMessages.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errorMessages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">名前</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="山田太郎"
              {...register('name')}
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
              {...register('email')}
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
              {...register('password')}
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
              {...register('confirmPassword')}
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
          onClick={() => onSwitchToSignIn ? onSwitchToSignIn() : router.push('/auth/signin')}
          className="p-0 h-auto"
          disabled={isLoading}
        >
          ログイン
        </Button>
      </div>
    </div>
  );
}