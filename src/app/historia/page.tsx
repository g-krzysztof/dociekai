import type { Metadata } from 'next';
import { HistoriaClient } from './historia-client';

const DESCRIPTION =
  'Kursy historii dla szkoły podstawowej, zgodne z nową podstawą programową 2026. Kurs dla klasy 4 jest w budowie.';

export const metadata: Metadata = {
  title: 'Kursy historii online — wybierz klasę | DociekAI',
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://dociekai.pl/historia',
  },
  openGraph: {
    title: 'Kursy historii online — wybierz klasę | DociekAI',
    description: DESCRIPTION,
    url: 'https://dociekai.pl/historia',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function HistoriaPage() {
  return <HistoriaClient />;
}
