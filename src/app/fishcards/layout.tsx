import type { Metadata } from 'next';

// Strona jest komponentem klienckim ('use client'), więc metadane muszą żyć w layoucie.
export const metadata: Metadata = {
  title: 'Fiszki do nauki angielskiego online | DociekAI',
  description:
    'Interaktywna nauka słówek polsko-angielskich na fiszkach. Załóż darmowe konto i ucz się angielskich słów we własnym tempie.',
  alternates: {
    canonical: 'https://dociekai.pl/fishcards',
  },
  openGraph: {
    title: 'Fiszki do nauki angielskiego online | DociekAI',
    description:
      'Interaktywna nauka słówek polsko-angielskich na fiszkach. Załóż darmowe konto i ucz się angielskich słów we własnym tempie.',
    url: 'https://dociekai.pl/fishcards',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
