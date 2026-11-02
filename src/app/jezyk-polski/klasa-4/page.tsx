import type { Metadata } from 'next';
import { Klasa4Client } from './klasa-4-client';

/** Hub kursu języka polskiego klasy 4 — serwerowa otoczka na metadane; treść i postęp w `klasa-4-client.tsx`. */

const URL = 'https://dociekai.pl/jezyk-polski/klasa-4';
const TITLE = 'Język polski dla klasy 4 — kurs online | DociekAI';
const DESCRIPTION =
  'Kurs języka polskiego dla klasy 4 zgodny z nową podstawą programową 2026: 13 modułów, 48 lekcji online — słowa i części mowy, opowieści, zdanie, ortografia, poezja, pisanie i media.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Klasa4Page() {
  return <Klasa4Client />;
}
