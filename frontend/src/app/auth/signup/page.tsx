'use client';

import React from 'react';
import { SignUpForm } from '../components/SignUpForm.component';
import { AuthLayout } from '../components/AuthLayout.component';

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}