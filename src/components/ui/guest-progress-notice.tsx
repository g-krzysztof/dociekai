'use client';

import Link from 'next/link';
import { GoogleIcon } from '@/components/ui/google-icon';
import { useAuth } from '@/components/auth-context';

interface GuestProgressNoticeProps {
  color?: string;
  className?: string;
}

/**
 * Stały komunikat dla gościa: postęp kursu żyje tylko w tej karcie
 * przeglądarki (sessionStorage) i znika po jej zamknięciu. Renderuje się
 * dopóki user jest niezalogowany — celowo bez przycisku zamknięcia, żeby
 * zostać naprawdę „stale widoczny” tam, gdzie postęp faktycznie powstaje
 * (przyklejony pasek lekcji/przewodnika) i tam, gdzie się go ogląda (hub kursu).
 */
export function GuestProgressNotice({ color = '#ea580c', className = '' }: GuestProgressNoticeProps) {
  const { isAuthenticated, initialLoading } = useAuth();

  if (initialLoading || isAuthenticated) return null;

  return (
    <div
      className={`flex flex-col gap-2 border-l-2 pl-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${className}`}
      style={{ borderColor: color }}
    >
      <p className="text-muted-foreground">
        Twój postęp zniknie po zamknięciu przeglądarki —{' '}
        <span className="font-semibold text-foreground">zaloguj się lub załóż konto</span>, żeby go
        zachować.
      </p>
      <div className="flex shrink-0 items-center gap-4">
        <Link
          href="/auth"
          className="inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
          style={{ color }}
        >
          <GoogleIcon />
          Zaloguj się
        </Link>
        <Link
          href="/auth?mode=register"
          className="inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
          style={{ color }}
        >
          <GoogleIcon />
          Załóż konto
        </Link>
      </div>
    </div>
  );
}
