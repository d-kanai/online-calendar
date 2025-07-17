import React from 'react';
import { Button } from '@/lib/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center space-y-4">
        <p className="text-destructive text-lg font-semibold">エラーが発生しました</p>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={resetErrorBoundary} variant="outline">
          再試行
        </Button>
      </div>
    </div>
  );
}