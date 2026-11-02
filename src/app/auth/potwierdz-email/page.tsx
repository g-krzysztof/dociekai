import { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailClient } from './verify-email-client';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Potwierdź adres e-mail - DociekAI',
  description: 'Potwierdzenie adresu e-mail konta DociekAI',
  robots: { index: false, follow: false },
};

function VerifyEmailFallback() {
  return (
    <div className="flex items-center py-64 justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Ładowanie...</span>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
