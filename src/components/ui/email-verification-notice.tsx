'use client';

import { useEffect, useState } from 'react';
import { Loader2, MailCheck, X } from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { authApi } from '@/lib/auth-api';

interface EmailVerificationNoticeProps {
  color?: string;
  className?: string;
}

const DISMISS_KEY = 'dociekai:email-notice-dismissed';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 1)}***@${domain}`;
}

/**
 * Informacja dla zalogowanego, który nie potwierdził adresu e-mail. Na razie
 * niczego nie blokuje — tylko przypomina i pozwala wysłać link ponownie.
 * Zamknięcie działa do końca sesji karty, potem pasek wraca.
 */
export function EmailVerificationNotice({ color = '#ea580c', className = '' }: EmailVerificationNoticeProps) {
  const { user, isAuthenticated, initialLoading } = useAuth();
  const [dismissed, setDismissed] = useState(true);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (initialLoading || !isAuthenticated || !user || user.emailVerified !== false || dismissed) return null;

  const resend = async () => {
    setState('sending');
    try {
      await authApi.resendVerification();
      setState('sent');
    } catch {
      setState('error');
    }
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // bez sessionStorage pasek po prostu wróci przy kolejnym wejściu
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 border-l-2 pl-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${className}`}
      style={{ borderColor: color }}
      role="status"
    >
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">Konto wymaga potwierdzenia adresu e-mail.</span>{' '}
        {state === 'sent'
          ? `Wysłaliśmy link na ${maskEmail(user.email)} — sprawdź skrzynkę (także spam).`
          : state === 'error'
            ? 'Nie udało się wysłać wiadomości. Spróbuj za kilka minut.'
            : 'Kliknij link, który wysłaliśmy po rejestracji.'}
      </p>
      <div className="flex shrink-0 items-center gap-4">
        {state !== 'sent' && (
          <button
            type="button"
            onClick={resend}
            disabled={state === 'sending'}
            className="inline-flex cursor-pointer items-center gap-1.5 font-semibold underline-offset-4 hover:underline disabled:cursor-default disabled:opacity-60"
            style={{ color }}
          >
            {state === 'sending' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <MailCheck className="h-4 w-4" aria-hidden />
            )}
            Wyślij link ponownie
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Ukryj przypomnienie"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
