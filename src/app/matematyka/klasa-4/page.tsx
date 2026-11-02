import type { Metadata } from 'next';
import { Klasa4Client } from './klasa-4-client';

export const metadata: Metadata = {
  title: 'Matematyka dla klasy 4 — kurs online | DociekAI',
  description:
    'Kurs matematyki dla klasy 4 szkoły podstawowej: 10 modułów zgodnych z podstawą programową — liczby naturalne, działania pisemne, geometria, ułamki zwykłe i dziesiętne, pola figur i bryły.',
  alternates: {
    canonical: 'https://dociekai.pl/matematyka/klasa-4',
  },
  openGraph: {
    title: 'Matematyka dla klasy 4 — kurs online | DociekAI',
    description:
      'Cały rok matematyki w jednym miejscu. 10 modułów, ~65 lekcji online zgodnych z podstawą programową MEiN.',
    url: 'https://dociekai.pl/matematyka/klasa-4',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Klasa4Page() {
  return <Klasa4Client />;
}
