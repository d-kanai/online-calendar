'use client';

import React from 'react';
import { SignInForm } from '../components/SignInForm.component';
import { AuthLayout } from '../components/AuthLayout.component';

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}