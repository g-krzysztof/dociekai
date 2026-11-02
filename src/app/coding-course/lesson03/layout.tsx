import type { Metadata } from 'next';

// Strona jest komponentem klienckim ('use client'), więc metadane muszą żyć w layoucie.
export const metadata: Metadata = {
  title: 'Co to jest zmienna? — kurs kodowania dla dzieci | DociekAI',
  description:
    'Lekcja 3 kursu kodowania dla dzieci: zmienna jako pudełko na dane, a tablica jako półka na pudełka. Ćwicz w grze z przeciąganiem wartości.',
  alternates: {
    canonical: 'https://dociekai.pl/coding-course/lesson03',
  },
  openGraph: {
    title: 'Co to jest zmienna? — kurs kodowania dla dzieci | DociekAI',
    description:
      'Lekcja 3 kursu kodowania dla dzieci: zmienna jako pudełko na dane, a tablica jako półka na pudełka. Ćwicz w grze z przeciąganiem wartości.',
    url: 'https://dociekai.pl/coding-course/lesson03',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
