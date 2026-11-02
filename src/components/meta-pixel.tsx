'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { readConsent } from '@/components/cookie-consent';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

function isEnabled() {
  return Boolean(PIXEL_ID) && process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod';
}

function hasConsent() {
  return readConsent() === 'accepted';
}

// Używa oficjalnego snippeta Meta: tworzy fbq z *własną kolejką*, ładuje fbevents.js,
// a dopiero w onload woła consent/init/track. Dzięki temu zdarzenia z kolejki
// są poprawnie przetwarzane przez prawdziwy fbq.
function bootstrap() {
  if (window.fbq) return; // już zainicjalizowane

  // Oficjalny snippet Meta (z https://developers.facebook.com/docs/meta-pixel/implementation)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = window as any;
  if (f.fbq) return;

  const n = (f.fbq = function (...args: unknown[]) {
    // fbq.callMethod jest ustawiany przez skrypt Meta po załadowaniu;
    // do tego momentu zdarzenia trafiają do n.queue.
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  }) as unknown as { queue: unknown[]; callMethod?: (...args: unknown[]) => void; loaded: boolean; version: string; push: typeof n };

  if (!f._fbq) f._fbq = n;
  n.queue = [];
  n.loaded = true;
  n.version = '2.0';
  n.push = n;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.onload = () => {
    // Skrypt załadowany — teraz bezpiecznie wołamy consent/init/track.
    // Kolejka n.queue zostanie automatycznie przepuszczona przez fbq.callMethod.
    window.fbq?.('consent', 'grant');
    window.fbq?.('init', PIXEL_ID as string);
    window.fbq?.('track', 'PageView');
  };
  document.head.appendChild(script);
}

export function MetaPixel() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (!isEnabled()) return;

    // Skrypt Meta ładujemy dopiero po zgodzie — bez niej nie łączymy się z Facebookiem wcale.
    if (hasConsent()) {
      bootstrap();
      return;
    }

    const onConsentChange = (event: Event) => {
      const choice = (event as CustomEvent<{ choice: string }>).detail?.choice;
      if (choice === 'accepted') {
        bootstrap();
        window.removeEventListener('cookie-consent:change', onConsentChange);
      }
    };

    window.addEventListener('cookie-consent:change', onConsentChange);
    return () => window.removeEventListener('cookie-consent:change', onConsentChange);
  }, []);

  // PageView przy nawigacji (App Router nie robi pełnego reloadu)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (isEnabled() && hasConsent()) window.fbq?.('track', 'PageView');
  }, [pathname]);

  return null;
}
