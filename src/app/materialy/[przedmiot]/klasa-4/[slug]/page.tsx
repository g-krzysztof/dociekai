import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getMaterial,
  materialHref,
  MATERIALY,
  PRZEDMIOTY,
  URL_SERWISU,
} from '../../../data';
import type { Material, WariantPdf } from '../../../data/types';
import { FiszkiEkran } from '../../../components/fiszki-ekran';
import { Linijka, PozycjaMaterialu } from '../../../components/lista';
import { Miniatura } from '../../../components/miniatura';
import { PanelPobierania } from '../../../components/panel-pobierania';
import { Sciaga } from '../../../components/sciaga';

export const dynamicParams = false;

export function generateStaticParams() {
  return MATERIALY.map((m) => ({ przedmiot: m.przedmiot, slug: m.slug }));
}

type Props = { params: Promise<{ przedmiot: string; slug: string }> };

const tytulSeo = (m: Material) =>
  `${m.modul.tytul} — ${m.rodzaj === 'sciaga' ? 'ściąga' : 'fiszki'} do druku, ${PRZEDMIOTY[m.przedmiot].nazwa.toLowerCase()} klasa 4 | DociekAI`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { przedmiot, slug } = await params;
  const m = getMaterial(przedmiot, slug);
  if (!m) return {};
  return {
    title: tytulSeo(m),
    description: m.opis,
    alternates: { canonical: materialHref(m) },
    openGraph: { title: tytulSeo(m), description: m.opis, url: materialHref(m), type: 'article' },
  };
}

const LITERA: Record<Material['przedmiot'], string> = {
  matematyka: 'M',
  informatyka: 'I',
  historia: 'H',
  'jezyk-polski': 'P',
};

export default async function MaterialPage({ params }: Props) {
  const { przedmiot, slug } = await params;
  const m = getMaterial(przedmiot, slug);
  if (!m) notFound();

  const { nazwa } = PRZEDMIOTY[m.przedmiot];
  const numer = `${LITERA[m.przedmiot]}${m.klasa}-${String(m.modul.numer).padStart(2, '0')}-${m.rodzaj === 'sciaga' ? 'S' : 'F'}`;
  const strony: Record<WariantPdf, number> =
    m.rodzaj === 'sciaga'
      ? { dwustronne: 1, skladane: 1 }
      : { dwustronne: Math.ceil(m.karty.length / 8) * 2, skladane: Math.ceil(m.karty.length / 4) };
  const pokrewne = MATERIALY.filter(
    (x) => x.przedmiot === m.przedmiot && x.slug !== m.slug && x.modul.numer === m.modul.numer,
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: m.tytul,
    description: m.opis,
    url: `${URL_SERWISU}${materialHref(m)}`,
    inLanguage: 'pl',
    educationalLevel: 'klasa 4 szkoły podstawowej',
    learningResourceType: m.rodzaj === 'sciaga' ? 'ściąga' : 'fiszki',
    teaches: m.zakres,
    about: nazwa,
    isAccessibleForFree: true,
    dateModified: m.aktualizacja,
    isPartOf: { '@type': 'Course', name: `${nazwa} klasa 4`, url: `${URL_SERWISU}${m.modul.href}` },
    publisher: { '@type': 'Organization', name: 'DociekAI', url: URL_SERWISU },
  };

  return (
    <div className="mata min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
            <li>
              <Link
                href={`/materialy/${m.przedmiot}/klasa-4`}
                className="underline-offset-4 hover:text-[var(--mata-tekst)] hover:underline"
              >
                {nazwa} klasa 4
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-[var(--mata-tekst)]">
              {m.tytul}
            </li>
          </ol>
        </nav>

        <header className="mt-8 max-w-3xl">
          <h1 className="text-[clamp(2.1rem,5vw,3.5rem)] font-black leading-[1] tracking-[-0.035em] text-balance">
            {m.tytul}
          </h1>
          <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-[var(--mata-tekst-cichy)]">{m.opis}</p>
        </header>

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-14">
          <div className="min-w-0">
            {m.rodzaj === 'sciaga' ? (
              <div className="kartka-ramka mx-auto max-w-[52rem]">
                <div className="znaczniki-ciecia">
                  <div className="cien-kartki">
                    <Sciaga sciaga={m} tryb="czytaj" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <FiszkiEkran zestaw={m} />
                <section aria-labelledby="arkusz" className="mt-16">
                  <h2 id="arkusz" className="text-xl font-bold tracking-tight">
                    Tak wygląda arkusz do druku
                  </h2>
                  <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-[var(--mata-tekst-cichy)]">
                    Osiem kart na stronie A4. Rewersy są ułożone w lustrzanym odbiciu, więc po druku dwustronnym
                    każda odpowiedź trafia dokładnie pod swoje pytanie.
                  </p>
                  <div className="mt-8 grid max-w-2xl grid-cols-2 gap-8 sm:gap-12">
                    {['awers', 'rewers'].map((s, i) => (
                      <figure key={s}>
                        <div className="znaczniki-ciecia">
                          <div className="cien-kartki">
                            <Miniatura material={m} strona={i} />
                          </div>
                        </div>
                        <figcaption className="mt-5 text-sm text-[var(--mata-tekst-cichy)]">
                          Strona {i + 1}: {s === 'awers' ? 'pytania' : 'odpowiedzi'}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          <div className="order-first space-y-8 lg:sticky lg:top-24 lg:order-none">
            <PanelPobierania
              przedmiot={m.przedmiot}
              slug={m.slug}
              tytul={m.tytul}
              rodzaj={m.rodzaj}
              numer={numer}
              strony={strony}
              karty={m.rodzaj === 'fiszki' ? m.karty.length : undefined}
              aktualizacja={m.aktualizacja}
              modulHref={m.modul.href}
            />
            <section aria-labelledby="zakres" className="hidden lg:block">
              <h2 id="zakres" className="text-sm font-bold text-[var(--mata-tekst)]">
                Co obejmuje · moduł {m.modul.numer}
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-[var(--mata-tekst-cichy)]">
                {m.zakres.map((z) => (
                  <li key={z} className="flex gap-2">
                    <span aria-hidden className="mt-[0.55em] h-px w-3 shrink-0 bg-current" />
                    {z}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {pokrewne.length > 0 && (
          <section aria-labelledby="pokrewne" className="mt-24">
            <h2 id="pokrewne" className="mb-10 text-2xl font-bold tracking-tight">
              Z tego samego modułu
            </h2>
            <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {pokrewne.map((x) => (
                <PozycjaMaterialu key={x.slug} material={x} naglowek="h3" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
