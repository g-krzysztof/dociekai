import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isPrzedmiot, materialyPrzedmiotu, PRZEDMIOTY, przedmiotyZMaterialami } from '../../data';
import { Linijka, ModulyPrzedmiotu } from '../../components/lista';

export const dynamicParams = false;

export function generateStaticParams() {
  return przedmiotyZMaterialami().map((przedmiot) => ({ przedmiot }));
}

type Props = { params: Promise<{ przedmiot: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { przedmiot } = await params;
  if (!isPrzedmiot(przedmiot)) return {};
  const nazwa = PRZEDMIOTY[przedmiot].nazwa;
  const title = `${nazwa} klasa 4 — ściągi i fiszki do druku | DociekAI`;
  const description = `Ściągi i fiszki do druku z kursu: ${nazwa.toLowerCase()}, klasa 4. Jeden moduł na stronie A4 i karty do wycięcia. Treść online za darmo, PDF z darmowym kontem.`;
  return {
    title,
    description,
    alternates: { canonical: `/materialy/${przedmiot}/klasa-4` },
    openGraph: { title, description, url: `/materialy/${przedmiot}/klasa-4` },
  };
}

export default async function MaterialyPrzedmiotuPage({ params }: Props) {
  const { przedmiot } = await params;
  if (!isPrzedmiot(przedmiot) || !materialyPrzedmiotu(przedmiot).length) notFound();
  const { nazwa, kurs } = PRZEDMIOTY[przedmiot];

  return (
    <div className="mata min-h-screen">
      <Linijka />
      <div className="container mx-auto px-4 pb-24 pt-10">
        <nav aria-label="Ścieżka" className="text-sm text-[var(--mata-tekst-cichy)]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/materialy" className="underline-offset-4 hover:text-[var(--mata-tekst)] hover:underline">
                Pobierz
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-[var(--mata-tekst)]">
              {nazwa} klasa 4
            </li>
          </ol>
        </nav>

        <header className="mb-14 mt-8 max-w-3xl">
          <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-black leading-[1] tracking-[-0.035em] text-balance">
            {nazwa} klasa 4 — ściągi i fiszki do druku
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--mata-tekst-cichy)]">
            Materiały ułożone w kolejności modułów{' '}
            <Link href={kurs} className="font-semibold text-[var(--mata-tekst)] underline underline-offset-4">
              kursu online
            </Link>
            . Treść czytasz za darmo, plik PDF pobierasz z darmowym kontem.
          </p>
        </header>

        <ModulyPrzedmiotu przedmiot={przedmiot} poziom="h2" />
      </div>
    </div>
  );
}
