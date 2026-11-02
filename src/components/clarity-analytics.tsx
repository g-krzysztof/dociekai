'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';
import { readConsent } from '@/components/cookie-consent';

function start(projectId: string) {
  clarity.init(projectId);
  clarity.consentV2({ ad_Storage: 'granted', analytics_Storage: 'granted' });
}

// Clarity nagrywa sesje, więc w ogóle nie startuje bez zgody z banera —
// samo wstrzymanie trwałego identyfikatora nie wystarcza.
export function ClarityAnalytics() {
  useEffect(() => {
    const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    if (!clarityProjectId || process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod') {
      return;
    }

    if (readConsent() === 'accepted') {
      start(clarityProjectId);
      return;
    }

    const handleConsentChange = (event: Event) => {
      const choice = (event as CustomEvent<{ choice: string }>).detail?.choice;
      if (choice === 'accepted') {
        start(clarityProjectId);
        window.removeEventListener('cookie-consent:change', handleConsentChange);
      }
    };

    window.addEventListener('cookie-consent:change', handleConsentChange);
    return () => window.removeEventListener('cookie-consent:change', handleConsentChange);
  }, []);

  return null;
}
