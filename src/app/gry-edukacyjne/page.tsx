import type { Metadata } from 'next';
import { GryClient } from './gry-client';

export const metadata: Metadata = {
  title: 'Gry edukacyjne online — ćwicz matematykę | DociekAI',
  description:
    'Darmowe gry edukacyjne do nauki matematyki dla dzieci: dodawanie, odejmowanie, mnożenie i liczenie pieniędzy. Graj online, bez rejestracji, na czas.',
  alternates: {
    canonical: 'https://dociekai.pl/gry-edukacyjne',
  },
  openGraph: {
    title: 'Gry edukacyjne online — ćwicz matematykę | DociekAI',
    description:
      'Darmowe gry edukacyjne do nauki matematyki dla dzieci: dodawanie, odejmowanie, mnożenie i liczenie pieniędzy.',
    url: 'https://dociekai.pl/gry-edukacyjne',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function GryEdukacyjne() {
  return <GryClient />;
}
