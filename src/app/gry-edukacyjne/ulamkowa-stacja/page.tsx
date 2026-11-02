import type { Metadata } from 'next';
import { UlamkowaStacjaClient } from './ulamkowa-stacja-client';

export const metadata: Metadata = {
  title: 'Ułamkowa Stacja Paliw — gra edukacyjna z ułamkami | DociekAI',
  description:
    'Darmowa gra edukacyjna do nauki ułamków dla dzieci. Policz ułamek zbiornika, porównuj ułamki, rozszerzaj i skracaj, dodawaj ułamki zwykłe i dziesiętne. 4 poziomy trudności, gra na czas, bez rejestracji.',
  alternates: {
    canonical: 'https://dociekai.pl/gry-edukacyjne/ulamkowa-stacja',
  },
  openGraph: {
    title: 'Ułamkowa Stacja Paliw — gra edukacyjna z ułamkami | DociekAI',
    description:
      'Obsługuj kosmiczną stację paliw: dolej dokładną dawkę policząc ułamki. Części całości, porównywanie, rozszerzanie, dodawanie ułamków i ułamki dziesiętne.',
    url: 'https://dociekai.pl/gry-edukacyjne/ulamkowa-stacja',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
    images: [
      {
        url: '/images/games/ulamkowa-stacja.jpg',
        width: 1360,
        height: 768,
        alt: 'Ułamkowa Stacja Paliw — kosmiczna stacja dolewania paliwa z wizualizacją ułamków na zbiornikach',
      },
    ],
  },
};

export default function UlamkowaStacjaPage() {
  return <UlamkowaStacjaClient />;
}