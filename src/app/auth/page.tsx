import { Metadata } from 'next';
import { AuthPageClient } from './auth-client';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Logowanie / Rejestracja - DociekAI',
  description: 'Zaloguj się lub utwórz nowe konto w DociekAI',
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center py-64 justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Ładowanie...</span>
        </div>
      </div>
    }>
      <AuthPageClient />
    </Suspense>
  );
}
