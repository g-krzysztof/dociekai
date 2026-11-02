import type { Metadata } from 'next';

// Strona jest komponentem klienckim ('use client'), więc metadane muszą żyć w layoucie.
export const metadata: Metadata = {
  title: 'Zmienne i stałe — kurs kodowania dla dzieci | DociekAI',
  description:
    'Lekcja 4 kursu kodowania dla dzieci: czym zmienna różni się od stałej i kiedy używać każdej z nich. Sprawdź to w interaktywnym ćwiczeniu.',
  alternates: {
    canonical: 'https://dociekai.pl/coding-course/lesson04',
  },
  openGraph: {
    title: 'Zmienne i stałe — kurs kodowania dla dzieci | DociekAI',
    description:
      'Lekcja 4 kursu kodowania dla dzieci: czym zmienna różni się od stałej i kiedy używać każdej z nich. Sprawdź to w interaktywnym ćwiczeniu.',
    url: 'https://dociekai.pl/coding-course/lesson04',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
