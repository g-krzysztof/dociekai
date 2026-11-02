import type { Metadata } from 'next';
import { RakietaLiczbClient } from './rakieta-liczb-client';

export const metadata: Metadata = {
  title: 'Rakieta Liczb — gra matematyczna online | DociekAI',
  description:
    'Rakieta Liczb to gra edukacyjna do ćwiczenia dodawania, odejmowania, mnożenia i kolejności działań na czas. 4 poziomy trudności, darmowa gra online dla dzieci.',
  alternates: {
    canonical: 'https://dociekai.pl/gry-edukacyjne/rakieta-liczb',
  },
  openGraph: {
    title: 'Rakieta Liczb — gra matematyczna online | DociekAI',
    description:
      'Ćwicz dodawanie, odejmowanie, mnożenie i kolejność działań, pilotując rakietę przez kosmiczny korytarz.',
    url: 'https://dociekai.pl/gry-edukacyjne/rakieta-liczb',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function RakietaLiczbPage() {
  return <RakietaLiczbClient />;
}
