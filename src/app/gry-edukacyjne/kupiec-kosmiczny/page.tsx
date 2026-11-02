import type { Metadata } from 'next';
import { KupiecKosmicznyClient } from './kupiec-kosmiczny-client';

export const metadata: Metadata = {
  title: 'Kupiec Kosmiczny — gra z liczeniem pieniędzy | DociekAI',
  description:
    'Kupiec Kosmiczny to gra edukacyjna do ćwiczenia liczenia pieniędzy i wydawania reszty — złotówki, grosze i zakupy na czas. Darmowa gra matematyczna online dla dzieci.',
  alternates: {
    canonical: 'https://dociekai.pl/gry-edukacyjne/kupiec-kosmiczny',
  },
  openGraph: {
    title: 'Kupiec Kosmiczny — gra z liczeniem pieniędzy | DociekAI',
    description:
      'Ćwicz liczenie pieniędzy i wydawanie reszty, prowadząc stragan na stacji kosmicznej.',
    url: 'https://dociekai.pl/gry-edukacyjne/kupiec-kosmiczny',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function KupiecKosmicznyPage() {
  return <KupiecKosmicznyClient />;
}
