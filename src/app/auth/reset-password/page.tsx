import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordClient } from './reset-password-client';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Resetuj hasło - DociekAI',
  description: 'Ustaw nowe hasło dla swojego konta DociekAI',
  robots: { index: false, follow: false },
};

function ResetPasswordFallback() {
  return (
    <div className="flex items-center py-64 justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Ładowanie...</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
