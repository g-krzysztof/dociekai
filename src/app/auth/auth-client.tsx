'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/components/auth-context';
import { useEffect, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function AuthFormWrapper() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  return <AuthForm key={mode} mode={mode} />;
}

export function AuthPageClient() {
  const router = useRouter();
  const { isAuthenticated, initialLoading, error } = useAuth();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  console.log('[AuthPageClient] render - isAuthenticated:', isAuthenticated, 'initialLoading:', initialLoading, 'error:', error);

  // Przekieruj jeśli użytkownik jest już zalogowany
  useEffect(() => {
    console.log('[AuthPageClient] useEffect - checking auth status');
    if (!initialLoading && isAuthenticated) {
      const redirectTo = returnUrl && returnUrl !== '/' ? returnUrl : '/profil';
      console.log('[AuthPageClient] Redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, initialLoading, router, returnUrl]);

  // Pokaż loader podczas sprawdzania stanu autentyfikacji (tylko przy pierwszym ładowaniu)
  if (initialLoading) {
    return (
      <div className="flex items-center py-64 justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Ładowanie...</span>
        </div>
      </div>
    );
  }

  // Jeśli użytkownik jest zalogowany, nie pokazuj formy (będzie przekierowany)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center justify-center py-64 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }>
          <AuthFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}
