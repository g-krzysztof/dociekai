import type { Metadata } from 'next';
import { StraznicyKonstelacjiClient } from './straznicy-konstelacji-client';

export const metadata: Metadata = {
  title: 'Strażnicy Konstelacji — gra edukacyjna z geometrii online | DociekAI',
  description:
    'Strażnicy Konstelacji to gra edukacyjna do ćwiczenia geometrii na czas: rozpoznawanie kształtów, liczenie boków, rodzaje kątów i symetria. 4 poziomy trudności, darmowa gra online dla dzieci.',
  alternates: {
    canonical: 'https://dociekai.pl/gry-edukacyjne/straznicy-konstelacji',
  },
  openGraph: {
    title: 'Strażnicy Konstelacji — gra edukacyjna z geometrii online | DociekAI',
    description:
      'Sortuj kosmiczne kryształy do właściwych doków — ćwicz rozpoznawanie kształtów, liczenie boków, kąty i symetrię.',
    url: 'https://dociekai.pl/gry-edukacyjne/straznicy-konstelacji',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function StraznicyKonstelacjiPage() {
  return <StraznicyKonstelacjiClient />;
}
