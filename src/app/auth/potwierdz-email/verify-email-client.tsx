'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleIcon } from '@/components/ui/google-icon';
import { CheckCircle, Loader2, MailWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/components/auth-context';
import { authApi } from '@/lib/auth-api';

type Status = 'verifying' | 'verified' | 'failed';

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { isAuthenticated, refreshUser } = useAuth();
  const [status, setStatus] = useState<Status>(code ? 'verifying' : 'failed');
  const [message, setMessage] = useState<string | null>(code ? null : 'W linku brakuje kodu potwierdzającego.');
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent'>('idle');
  // Kod jest jednorazowy — drugie wywołanie (np. podwójny efekt w trybie deweloperskim)
  // trafiłoby już w usunięty token i pokazało fałszywy błąd.
  const attempted = useRef(false);

  useEffect(() => {
    if (!code || attempted.current) return;
    attempted.current = true;

    authApi
      .verifyEmail(code)
      .then(() => {
        setStatus('verified');
        void refreshUser();
      })
      .catch((err: unknown) => {
        setStatus('failed');
        setMessage(err instanceof Error ? err.message : 'Nie udało się potwierdzić adresu e-mail.');
      });
  }, [code, refreshUser]);

  const handleResend = async () => {
    setResend('sending');
    try {
      await authApi.resendVerification();
      setResend('sent');
    } catch (err) {
      setResend('idle');
      setMessage(err instanceof Error ? err.message : 'Nie udało się wysłać wiadomości.');
    }
  };

  return (
    <div className="flex justify-center py-64 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="space-y-6 text-center">
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <Typography variant="muted">Potwierdzamy Twój adres e-mail…</Typography>
            </div>
          )}

          {status === 'verified' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <Typography variant="h2" className="text-2xl font-bold">
                  Adres potwierdzony
                </Typography>
                <Typography variant="muted" className="text-sm">
                  Dziękujemy! Twoje konto jest w pełni gotowe.
                </Typography>
              </div>
              <Button asChild className="w-full">
                <Link href={isAuthenticated ? '/profil' : '/auth?mode=login'}>
                  {!isAuthenticated && <GoogleIcon />}
                  {isAuthenticated ? 'Przejdź do profilu' : 'Zaloguj się'}
                </Link>
              </Button>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                <MailWarning className="h-6 w-6 text-amber-600" />
              </div>
              <div className="space-y-2">
                <Typography variant="h2" className="text-2xl font-bold">
                  Nie udało się potwierdzić adresu
                </Typography>
                <Typography variant="muted" className="text-sm">
                  {message}
                </Typography>
              </div>
              {isAuthenticated ? (
                resend === 'sent' ? (
                  <Typography className="text-sm font-medium">
                    Wysłaliśmy nowy link. Sprawdź skrzynkę (także folder spam).
                  </Typography>
                ) : (
                  <Button className="w-full" onClick={handleResend} disabled={resend === 'sending'}>
                    {resend === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
                    Wyślij nowy link
                  </Button>
                )
              ) : (
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth?mode=login&returnUrl=/profil">
                      <GoogleIcon />
                      Zaloguj się
                    </Link>
                  </Button>
                  <Typography variant="muted" className="text-xs">
                    Po zalogowaniu wyślesz nowy link z profilu.
                  </Typography>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
