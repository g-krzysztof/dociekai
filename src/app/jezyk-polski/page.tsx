import type { Metadata } from 'next';
import { JezykPolskiClient } from './jezyk-polski-client';

const DESCRIPTION =
  'Kursy języka polskiego dla szkoły podstawowej, zgodne z nową podstawą programową 2026. Kurs dla klasy 4 jest w budowie.';

export const metadata: Metadata = {
  title: 'Kursy języka polskiego online — wybierz klasę | DociekAI',
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://dociekai.pl/jezyk-polski',
  },
  openGraph: {
    title: 'Kursy języka polskiego online — wybierz klasę | DociekAI',
    description: DESCRIPTION,
    url: 'https://dociekai.pl/jezyk-polski',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function JezykPolskiPage() {
  return <JezykPolskiClient />;
}
