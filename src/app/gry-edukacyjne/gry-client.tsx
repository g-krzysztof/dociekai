'use client';

import { useEffect, useState } from 'react';
import { Starfield } from './components/starfield';
import { GameOrbitNode } from './components/game-orbit-node';
import { SoonOrbitNode } from './components/soon-orbit-node';
import { GAMES } from './data/games';
import { LEVELS as RAKIETA_LEVELS } from './rakieta-liczb/data/levels';
import { readLevelBest as readRakietaLevelBest } from './rakieta-liczb/lib/rocket-progress';
import { LEVELS as KUPIEC_LEVELS } from './kupiec-kosmiczny/data/levels';
import { readLevelBest as readKupiecLevelBest } from './kupiec-kosmiczny/lib/trader-progress';
import { LEVELS as STRAZNICY_LEVELS } from './straznicy-konstelacji/data/levels';
import { readLevelBest as readStraznicyLevelBest } from './straznicy-konstelacji/lib/guardian-progress';
import { LEVELS as ULAMKOWA_LEVELS } from './ulamkowa-stacja/data/levels';
import { readLevelBest as readUlamkowaLevelBest } from './ulamkowa-stacja/lib/fuel-progress';

const FAQS = [
  {
    question: 'Dla jakiego wieku są te gry edukacyjne?',
    answer:
      'Gry są dopasowane do dzieci w wieku szkoły podstawowej (ok. 8–12 lat), ćwiczących dodawanie, odejmowanie, mnożenie, dzielenie, ułamki i liczenie pieniędzy — materiał typowy dla klas 3–5.',
  },
  {
    question: 'Czy gry edukacyjne są darmowe?',
    answer:
      'Tak. Wszystkie gry na tej stronie są bezpłatne i dostępne od razu w przeglądarce, bez rejestracji i logowania.',
  },
  {
    question: 'Czy wyniki z gier są zapisywane?',
    answer:
      'Tak — Twój najlepszy wynik z każdego poziomu zapisuje się lokalnie w przeglądarce, dzięki czemu widzisz swój postęp i możesz próbować go pobić przy kolejnej grze.',
  },
] as const;

function useBestScore<Id extends string>(
  levels: readonly { id: Id }[],
  readBest: (id: Id) => { bestScore: number },
): number | null {
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    const scores = levels.map((level) => readBest(level.id).bestScore);
    const max = Math.max(0, ...scores);
    if (max > 0) setBest(max);
  }, [levels, readBest]);

  return best;
}

export const GryClient = () => {
  const rakietaBest = useBestScore(RAKIETA_LEVELS, readRakietaLevelBest);
  const kupiecBest = useBestScore(KUPIEC_LEVELS, readKupiecLevelBest);
  const straznicyBest = useBestScore(STRAZNICY_LEVELS, readStraznicyLevelBest);
  const ulamkowaBest = useBestScore(ULAMKOWA_LEVELS, readUlamkowaLevelBest);

  const statBySlug: Record<string, string | null> = {
    'rakieta-liczb': rakietaBest ? `Twój rekord: ${rakietaBest} pkt` : null,
    'kupiec-kosmiczny': kupiecBest ? `Twój rekord: ${kupiecBest} pkt` : null,
    'straznicy-konstelacji': straznicyBest ? `Twój rekord: ${straznicyBest} pkt` : null,
    'ulamkowa-stacja': ulamkowaBest ? `Twój rekord: ${ulamkowaBest} pkt` : null,
  };

  return (
    <div className="relative overflow-hidden bg-[#05070f]">
      <Starfield count={160} className="pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
      />

      <div className="relative container mx-auto px-3 py-14 sm:px-4 sm:py-20 flex flex-col items-center justify-between">
        {/* Hero */}
        <div className="pb-12 max-w-4xl text-center sm:pb-16">
          <h1
            className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ textShadow: '0 0 50px rgba(59,130,246,0.35), 0 0 90px rgba(34,197,94,0.18)' }}
          >
            Galaktyka Gier Edukacyjnych
          </h1>
          <p className="mx-auto mt-4 max-w-xxxl text-base leading-relaxed text-white/70 sm:text-lg">
            Wybierz misję, wsiądź do kokpitu i sprawdź, ile potrafisz policzyć, zanim skończy się czas. Darmowe
            ćwiczenia z matematyki w formie gry — bez rejestracji.
          </p>
          <p className="mt-3 text-sm text-white/40">
            {GAMES.length} gry gotowe do startu — kolejne w drodze.
          </p>
        </div>

        {/* Ścieżka misji */}
        <div className="flex flex-col max-w-4xl">
          {GAMES.map((game, i) => (
            <GameOrbitNode
              key={game.slug}
              game={game}
              index={i + 1}
              hasTop={i > 0}
              hasBottom
              statLabel={statBySlug[game.slug] ?? null}
            />
          ))}
          <SoonOrbitNode delay={GAMES.length * 0.12} />
        </div>

        {/* Treść SEO — kontekst i FAQ */}
        <div className="mt-16 border-t border-white/10 pt-12 sm:mt-20 sm:pt-16">
          <div className="mx-auto">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Gry edukacyjne, które uczą matematyki
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              Nauka przez zabawę to jedna z najskuteczniejszych metod utrwalania wiedzy u dzieci. Nasze gry
              edukacyjne łączą prawdziwe ćwiczenia z matematyki — dodawanie, odejmowanie, mnożenie, dzielenie,
              ułamki i liczenie pieniędzy — z formą gry na czas, w której liczy się szybkość i dokładność, a nie tylko
              poprawny wynik.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              Każda gra ma kilka poziomów trudności, dzięki czemu dziecko może zacząć od podstaw i stopniowo
              przechodzić do trudniejszych zadań. Wszystkie gry są darmowe, działają w przeglądarce i nie
              wymagają rejestracji — wystarczy kliknąć „Zagraj” i zaczynasz misję.
            </p>
            {/* <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              Jeśli szukasz pełnego programu nauki, a nie tylko doraźnych ćwiczeń, zajrzyj do naszego{' '}
              <Link
                href="/matematyka/klasa-4"
                className="font-medium text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
              >
                kursu matematyki dla klasy 4
              </Link>{' '}
              — gry edukacyjne świetnie się z nim uzupełniają.
            </p> */}

            <dl className="mt-10 space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <dt className="text-base font-semibold text-white">{faq.question}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-white/60">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
};
