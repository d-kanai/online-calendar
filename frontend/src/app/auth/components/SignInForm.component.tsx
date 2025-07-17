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
import { AlertCircle, Mail, Lock } from 'lucide-react';

// Zodスキーマ定義
const SignInSchema = z.object({
  email: z.string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(1, 'パスワードを入力してください')
});

type FormData = z.infer<typeof SignInSchema>;

interface SignInFormProps {
  onSwitchToSignUp?: () => void;
}

export function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data);
      // 成功時は自動的にリダイレクトされる
    } catch (error) {
      // APIエラーの場合、フォームエラーとして表示
      if (error instanceof Error) {
        setError('root', {
          type: 'manual',
          message: error.message || 'ログインに失敗しました'
        });
      }
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

      {(errors.root || errors.email || errors.password) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.root?.message || errors.email?.message || errors.password?.message}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="パスワードを入力"
              {...register('password')}
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
          onClick={() => onSwitchToSignUp ? onSwitchToSignUp() : router.push('/auth/signup')}
          className="p-0 h-auto"
          disabled={isLoading}
        >
          新規登録
        </Button>
      </div>
    </div>
  );
}