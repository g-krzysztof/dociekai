import type { Metadata } from 'next';

// Strona jest komponentem klienckim ('use client'), więc metadane muszą żyć w layoucie.
export const metadata: Metadata = {
  title: 'Pierwszy program i robot — kurs kodowania dla dzieci | DociekAI',
  description:
    'Lekcja 1 kursu kodowania dla dzieci: czym jest program i jak komputer wykonuje polecenia krok po kroku. Zaprogramuj robota w grze online.',
  alternates: {
    canonical: 'https://dociekai.pl/coding-course/lesson01',
  },
  openGraph: {
    title: 'Pierwszy program i robot — kurs kodowania dla dzieci | DociekAI',
    description:
      'Lekcja 1 kursu kodowania dla dzieci: czym jest program i jak komputer wykonuje polecenia krok po kroku. Zaprogramuj robota w grze online.',
    url: 'https://dociekai.pl/coding-course/lesson01',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
