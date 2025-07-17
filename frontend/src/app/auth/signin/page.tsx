'use client';

import React from 'react';
import { SignInForm } from '../components/SignInForm.component';
import { Calendar } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* 左側: ブランディング */}
      <div className="hidden lg:flex lg:flex-1 bg-primary text-primary-foreground items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="h-12 w-12" />
            <span className="text-3xl">Awesome Calendar</span>
          </div>
          <h2 className="text-2xl">
            効率的な会議管理で、<br />チームの生産性を向上
          </h2>
          <p className="text-lg opacity-90">
            会議のスケジュール管理から参加者管理、リマインダー送信まで、
            すべてを一つのプラットフォームで。
          </p>
        </div>
      </div>

      {/* 右側: 認証フォーム */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* モバイル用ヘッダー */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <Calendar className="h-8 w-8" />
            <span className="text-2xl">Awesome Calendar</span>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}