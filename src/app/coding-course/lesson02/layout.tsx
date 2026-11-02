import type { Metadata } from 'next';

// Strona jest komponentem klienckim ('use client'), więc metadane muszą żyć w layoucie.
export const metadata: Metadata = {
  title: 'Bugi, czyli błędy w kodzie — kurs kodowania dla dzieci | DociekAI',
  description:
    'Lekcja 2 kursu kodowania dla dzieci: skąd biorą się błędy w programach i jak je znaleźć. Napraw program robota w interaktywnej grze.',
  alternates: {
    canonical: 'https://dociekai.pl/coding-course/lesson02',
  },
  openGraph: {
    title: 'Bugi, czyli błędy w kodzie — kurs kodowania dla dzieci | DociekAI',
    description:
      'Lekcja 2 kursu kodowania dla dzieci: skąd biorą się błędy w programach i jak je znaleźć. Napraw program robota w interaktywnej grze.',
    url: 'https://dociekai.pl/coding-course/lesson02',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
