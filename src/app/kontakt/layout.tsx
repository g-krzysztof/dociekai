import type { Metadata } from 'next';

// Strona jest komponentem klienckim ('use client'), więc metadane muszą żyć w layoucie.
export const metadata: Metadata = {
  title: 'Kontakt | DociekAI',
  description:
    'Masz pytania o kursy i gry DociekAI dla uczniów klasy 4 albo chcesz współpracować? Napisz e-mail lub skorzystaj z formularza kontaktowego.',
  alternates: {
    canonical: 'https://dociekai.pl/kontakt',
  },
  openGraph: {
    title: 'Kontakt | DociekAI',
    description:
      'Masz pytania o kursy i gry DociekAI dla uczniów klasy 4 albo chcesz współpracować? Napisz e-mail lub skorzystaj z formularza kontaktowego.',
    url: 'https://dociekai.pl/kontakt',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
