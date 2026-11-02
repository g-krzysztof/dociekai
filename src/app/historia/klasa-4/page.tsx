import type { Metadata } from 'next';
import { Klasa4Client } from './klasa-4-client';

/** Hub kursu historii klasy 4 — serwerowa otoczka na metadane; treść i postęp w `klasa-4-client.tsx`. */

const URL = 'https://dociekai.pl/historia/klasa-4';
const TITLE = 'Historia dla klasy 4 — kurs online | DociekAI';
const DESCRIPTION =
  'Kurs historii dla klasy 4 szkoły podstawowej zgodny z podstawą programową 2026: warsztat historyka, czas i mapa, mała i duża ojczyzna, początki cywilizacji, Egipt, Grecja, Rzym i narodziny chrześcijaństwa.';

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
