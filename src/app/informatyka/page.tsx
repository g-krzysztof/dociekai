import type { Metadata } from 'next';
import { InformatykaClient } from './informatyka-client';

const DESCRIPTION =
  'Kursy informatyki dla szkoły podstawowej, zgodne z podstawą programową MEiN. Kurs dla klasy 4 jest już dostępny — moduły 0 i 1 w całości, kolejne w drodze.';

export const metadata: Metadata = {
  title: 'Kursy informatyki online — wybierz klasę | DociekAI',
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://dociekai.pl/informatyka',
  },
  openGraph: {
    title: 'Kursy informatyki online — wybierz klasę | DociekAI',
    description: DESCRIPTION,
    url: 'https://dociekai.pl/informatyka',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function InformatykaPage() {
  return <InformatykaClient />;
}
