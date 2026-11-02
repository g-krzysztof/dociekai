'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FACEBOOK_PAGE_URL, trackFacebookClick, type FacebookPlacement } from '@/lib/social';
import type { StreakEvent } from '@/lib/streak/record';

/**
 * Zaproszenie na fanpage. Zawsze tor dorosły: dziecko ~10 lat nie ma konta na
 * Facebooku (13+), więc przycisk nigdy nie stoi we wnętrzu lekcji, a obietnica
 * mówi, co dostaje rodzic lub nauczyciel — nie „polub nas”.
 *
 * Kolor bierzemy z `currentColor`, bo komponent stoi i w ciepłym świecie
 * kursów, i w chłodnym Atlasie profilu.
 */

const PROMISE = 'Co tydzień nowe lekcje i krótkie zagadki — dla siebie albo dla dziecka.';

export function FacebookIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

function FollowLink({
  placement,
  className,
  children,
  onClick,
}: {
  placement: FacebookPlacement;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href={FACEBOOK_PAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        trackFacebookClick(placement);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

/** Cichy wiersz z ikoną — stopka, profil. Bez ramki, kolor po rodzicu. */
export function FacebookFooterLink({
  className,
  placement = 'footer',
  children = 'Facebook',
}: {
  className?: string;
  placement?: Extract<FacebookPlacement, 'footer' | 'profile'>;
  children?: React.ReactNode;
}) {
  return (
    <FollowLink placement={placement} className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <FacebookIcon />
      <span>{children}</span>
    </FollowLink>
  );
}

/** Ramka pod artykułem i w profilu: obietnica + jeden przycisk. */
export function FacebookFollowBox({
  placement,
  title = 'Obserwuj DociekAI na Facebooku',
  text = PROMISE,
  className,
}: {
  placement: Exclude<FacebookPlacement, 'footer' | 'lesson-end'>;
  title?: string;
  text?: string;
  className?: string;
}) {
  return (
    <aside
      className={`flex flex-col gap-4 rounded-xl border bg-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`}
    >
      <div className="flex items-start gap-3">
        <FacebookIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#1877F2]" />
        <div>
          <p className="font-semibold leading-snug">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <FollowLink placement={placement}>Obserwuj na Facebooku</FollowLink>
      </Button>
    </aside>
  );
}

const NUDGE_KEY = 'dociekai:fb-follow';
/** Od której ukończonej lekcji prosimy. Pierwsza należy do serii, nie do nas. */
const NUDGE_FROM_LESSON = 2;

function readNudge(): string | null {
  try {
    return window.localStorage.getItem(NUDGE_KEY);
  } catch {
    return null;
  }
}

function writeNudge(value: 'clicked' | 'dismissed') {
  try {
    window.localStorage.setItem(NUDGE_KEY, value);
  } catch {
    // bez pamięci prośba po prostu wróci przy następnej lekcji
  }
}

/**
 * Karta końcowa lekcji, tylko u zalogowanych. Gość dostaje w tym miejscu
 * zaproszenie do konta, zalogowany — to: prośby idą po kolei, więc nie
 * konkurują ze sobą. Nie przeszkadza świętowaniu nowej odznaki i znika na
 * zawsze po kliknięciu albo „Nie teraz”.
 */
export function FacebookFollowNudge({ event }: { event: StreakEvent | null }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(readNudge() !== null);
  }, []);

  if (hidden || !event) return null;
  if (event.snapshot.totalLessons < NUDGE_FROM_LESSON || event.newBadges.length > 0) return null;

  const close = (value: 'clicked' | 'dismissed') => {
    writeNudge(value);
    setHidden(true);
  };

  return (
    <div className="mx-auto mb-7 flex max-w-xl flex-col gap-4 border-t-2 border-[#1877F2]/60 bg-[#1877F2]/[0.05] px-5 py-5 text-left sm:px-6">
      <div className="flex items-start gap-3">
        <FacebookIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#1877F2]" />
        <div>
          <p className="font-semibold leading-snug">Nie przegap kolejnych lekcji</p>
          <p className="mt-1 text-sm text-muted-foreground">{PROMISE} Znajdziesz je na naszym Facebooku.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-9">
        <Button asChild size="sm">
          <FollowLink placement="lesson-end" onClick={() => close('clicked')}>
            Obserwuj na Facebooku
          </FollowLink>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => close('dismissed')}>
          Nie teraz
        </Button>
      </div>
    </div>
  );
}
