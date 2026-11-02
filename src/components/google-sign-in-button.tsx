'use client';

import { useEffect, useRef, useState } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';

/** Bez Client ID przycisk się nie renderuje — formularz ukrywa wtedy też separator. */
export const googleSignInEnabled = Boolean(CLIENT_ID);

interface GsiCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: GsiCredentialResponse) => void;
            ux_mode?: 'popup' | 'redirect';
            itp_support?: boolean;
          }): void;
          renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
        };
      };
    };
  }
}

// Skrypt Google ładujemy dopiero tam, gdzie stoi przycisk — nie na każdej
// stronie, żeby Google nie dostawał ruchu z lekcji bez powodu.
let gsiPromise: Promise<void> | null = null;

function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error('Nie udało się załadować Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }
  return gsiPromise;
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  /** Napis Google na przycisku: „Kontynuuj z Google” albo „Zarejestruj się przez Google”. */
  text?: 'continue_with' | 'signup_with' | 'signin_with';
}

/**
 * Oficjalny przycisk „Zaloguj przez Google” (Google Identity Services, popup).
 * Oddaje ID token — weryfikuje go i zakłada/łączy konto backend.
 */
export function GoogleSignInButton({ onCredential, text = 'continue_with' }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        const container = containerRef.current;
        if (cancelled || !container || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response.credential) callbackRef.current(response.credential);
          },
          ux_mode: 'popup',
          itp_support: true,
        });

        // Google przyjmuje szerokość w pikselach, 200–400.
        const width = Math.min(400, Math.max(200, Math.round(container.offsetWidth)));
        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          logo_alignment: 'center',
          locale: 'pl',
          width,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="flex min-h-11 w-full justify-center" />
      {failed && (
        <p className="text-center text-xs text-muted-foreground">
          Nie udało się załadować logowania Google. Odśwież stronę albo użyj adresu e-mail.
        </p>
      )}
    </div>
  );
}
