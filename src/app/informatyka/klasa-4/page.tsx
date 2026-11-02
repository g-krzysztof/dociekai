import type { Metadata } from 'next';
import { Klasa4Client } from './klasa-4-client';

/**
 * Hub kursu informatyki klasy 4 — serwerowa otoczka na metadane; cała treść
 * i stan postępu żyją w `klasa-4-client.tsx` (ta sama para co w matematyce).
 */

const URL = 'https://dociekai.pl/informatyka/klasa-4';
const TITLE = 'Informatyka dla klasy 4 — kurs online | DociekAI';
const DESCRIPTION =
  'Kurs informatyki dla klasy 4 szkoły podstawowej: 10 działów zgodnych z podstawą programową 2026 — komputer i pliki, internet i bezpieczeństwo, grafika, dokumenty, myślenie komputacyjne, Scratch oraz dane i sztuczna inteligencja.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Klasa4Page() {
  return <Klasa4Client />;
}
