import { Metadata } from 'next';
import { Suspense } from 'react';
import { ForgotPasswordClient } from './forgot-password-client';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Zapomniałem hasła - DociekAI',
  description: 'Zresetuj swoje hasło w DociekAI',
  robots: { index: false, follow: false },
};

function ForgotPasswordFallback() {
  return (
    <div className="flex items-center py-64 justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Ładowanie...</span>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
