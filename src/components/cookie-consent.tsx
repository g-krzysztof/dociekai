'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Cookie } from 'lucide-react';
import Link from 'next/link';

export type ConsentChoice = 'accepted' | 'rejected';

export const CONSENT_KEY = 'cookie_consent_choice';

const OPEN_EVENT = 'cookie-consent:open';
export const BANNER_EVENT = 'cookie-consent:banner';

// Cookies, które Clarity i Meta Pixel zostawiają po zgodzie — przy jej
// wycofaniu kasujemy je, żeby wycofanie nie było tylko deklaracją.
const TRACKING_COOKIES = ['_clck', '_clsk', '_fbp', '_fbc'];

export function readConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    if (v === 'accepted' || v === 'rejected') return v;
    return null;
  } catch {
    return null;
  }
}

/** Otwiera baner ponownie — np. z linku „Ustawienia cookies” w stopce. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Link-przycisk otwierający baner — do stopki i strony /cookies (obie są serwerowe). */
export function CookieSettingsButton({ className, children = 'Ustawienia cookies' }: { className?: string; children?: ReactNode }) {
  return (
    <button type="button" onClick={openCookieSettings} className={`cursor-pointer ${className ?? ''}`}>
      {children}
    </button>
  );
}

function clearTrackingCookies() {
  const host = window.location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  for (const name of TRACKING_COOKIES) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

function writeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
    const days = 180;
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `cookie_consent=${choice}; expires=${expires}; path=/; SameSite=Lax`;
    // Let the app know consent changed (for analytics hooks etc.)
    window.dispatchEvent(new CustomEvent('cookie-consent:change', { detail: { choice } }));
  } catch {
    // no-op
  }
}

function AcceptButton({ onClick }: { onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  // Fokus od razu na zgodzie: Enter albo spacja klika ją bez sięgania po mysz.
  // Bez globalnego nasłuchu klawiszy — Enter w formularzach i lekcjach zostaje nietknięty.
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <span className="cc-accept-frame flex rounded-[14px] p-[2.5px]">
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className="cc-accept inline-flex cursor-pointer h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Check className="size-5" strokeWidth={2.6} aria-hidden />
        Zgadzam się
      </button>
    </span>
  );
}

const quietLink =
  'cursor-pointer text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/60 outline-none focus-visible:text-foreground';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Show if no prior choice stored
    setVisible(readConsent() === null);
    const open = () => {
      setExpanded(false);
      setVisible(true);
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(BANNER_EVENT, { detail: { visible } }));
  }, [visible]);

  const choose = (choice: ConsentChoice) => {
    const previous = readConsent();
    writeConsent(choice);
    setVisible(false);
    // Skrypty już załadowane po wcześniejszej zgodzie nie dają się czysto
    // wyładować — kasujemy ich cookies i przeładowujemy stronę bez nich.
    if (choice === 'rejected' && previous === 'accepted') {
      clearTrackingCookies();
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <section
        aria-label="Zgoda na pliki cookies"
        className="cc-banner mx-auto max-w-3xl rounded-2xl border bg-card p-5 text-card-foreground md:p-6"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <div className="flex flex-1 items-start gap-4">
            <span className="cc-cookie mt-0.5 hidden size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
              <Cookie className="size-6" strokeWidth={1.9} aria-hidden />
            </span>
            <div className="space-y-1.5">
              <p className="text-lg font-semibold leading-snug text-foreground">Pomóż nam ulepszać lekcje</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Dzięki plikom cookies widzimy, które lekcje działają, a które trzeba poprawić, żeby
                dzieciom łatwiej się uczyło. Nie sprzedajemy Twoich danych.
              </p>
            </div>
          </div>

          {!expanded && (
            <div className="flex shrink-0 flex-col items-stretch gap-3 md:items-center">
              <AcceptButton onClick={() => choose('accepted')} />
              <button type="button" onClick={() => setExpanded(true)} aria-expanded={false} className={quietLink}>
                Dostosuj
              </button>
            </div>
          )}
        </div>

        {expanded && (
          <div className="cc-details mt-5 border-t pt-5">
            <dl className="grid gap-4 text-sm sm:grid-cols-2 sm:gap-6">
              <div className="space-y-1">
                <dt className="font-semibold text-foreground">Niezbędne · zawsze włączone</dt>
                <dd className="leading-relaxed text-muted-foreground">
                  Logowanie, zapamiętanie postępu w lekcjach i Twoich ustawień.
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="font-semibold text-foreground">Analityczne · za Twoją zgodą</dt>
                <dd className="leading-relaxed text-muted-foreground">
                  Microsoft Clarity pokazuje nam, w których miejscach lekcje sprawiają trudność.
                  Meta Pixel mówi, ile osób trafia do nas z Facebooka i Instagrama.{' '}
                  <Link href="/cookies" className="underline underline-offset-4 hover:text-foreground">
                    Szczegóły
                  </Link>
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
              <AcceptButton onClick={() => choose('accepted')} />
              <button type="button" onClick={() => choose('rejected')} className={quietLink}>
                Odrzuć
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
