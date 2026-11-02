import type { Metadata } from 'next';
import { MatematykaClient } from './matematyka-client';

export const metadata: Metadata = {
  title: 'Kursy matematyki online — wybierz klasę | DociekAI',
  description:
    'Kursy matematyki dla szkoły podstawowej, zgodne z podstawą programową MEiN. Kurs dla klasy 4 dostępny już teraz — kolejne roczniki w przygotowaniu.',
  alternates: {
    canonical: 'https://dociekai.pl/matematyka',
  },
  openGraph: {
    title: 'Kursy matematyki online — wybierz klasę | DociekAI',
    description:
      'Kursy matematyki dla szkoły podstawowej, zgodne z podstawą programową MEiN. Kurs dla klasy 4 dostępny już teraz — kolejne roczniki w przygotowaniu.',
    url: 'https://dociekai.pl/matematyka',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function MatematykaPage() {
  return <MatematykaClient />;
}
