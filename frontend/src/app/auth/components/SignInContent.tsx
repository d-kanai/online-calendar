'use client';

import React from 'react';
import { SignInForm } from './SignInForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui/card';

export function SignInContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}