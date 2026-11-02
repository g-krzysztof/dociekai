'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import { YearRing, type NodeBadge, type NodeState } from './year-ring';
import type { LiteralSummary } from './literal-machine';
import type { RushFirstTry } from './rush/rush-roku';
import { SENTENCE } from './literal';
import { YEAR_MODULES, moduleByN } from './year';

/**
 * Blok 4 — **Twoja mapa roku**. Pierścień ośmiu działów ze znakami przy każdym:
 * zielony „pamiętasz”, bursztynowy „do powtórki”. Znak bierze się z tego, co
 * dziecko **zrobiło** w blokach 1 i 2 — z pierwszej próby w mikro-grze i z tego,
 * czy w poleceniach dla Dosłowniaka uwierzyło złemu wynikowi — a nie z jego
 * deklaracji. Gdy odsłoni zdanie roku, od każdego działu do środka biegnie
 * złota linia.
 *
 * Blok kończy się jedną decyzją: który dział powtórzyć przed testem. To jedyna
 * rzecz, którą strona zapisuje; reszta jest odbiciem tego, co się już stało.
 */

type Evidence = { rush: boolean | undefined; trusted: boolean };

export function YearMap({
  color,
  rush,
  literal,
  onComplete,
}: {
  color: string;
  rush: RushFirstTry;
  literal: LiteralSummary | null;
  onComplete?: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const trustedModules = useMemo(
    () => new Set(Object.keys(literal?.trustedTooSoon ?? {}).map(Number)),
    [literal]
  );

  const evidence = (n: number): Evidence => ({ rush: rush[n], trusted: trustedModules.has(n) });
  const hasData = Object.keys(rush).length > 0 || trustedModules.size > 0;

  const status = (n: number): NodeBadge | undefined => {
    const item = evidence(n);
    if (item.rush === undefined && !item.trusted) return undefined;
    return item.rush === false || item.trusted ? 'shaky' : 'ok';
  };

  const shaky = YEAR_MODULES.filter((mod) => status(mod.n) === 'shaky');
  const okCount = YEAR_MODULES.filter((mod) => status(mod.n) === 'ok').length;

  const badges: Partial<Record<number, NodeBadge>> = {};
  const nodeState: Partial<Record<number, NodeState>> = {};
  for (let n = 1; n <= 8; n += 1) {
    const badge = status(n);
    if (badge) badges[n] = badge;
    if (pinned === n) nodeState[n] = 'anchor';
  }
  const centerBadge = status(0);

  const chosen = selected !== null ? moduleByN(selected) : null;
  const reasons = (n: number): string[] => {
    const item = evidence(n);
    const list: string[] = [];
    if (item.rush === false) list.push('mikro-gra nie wyszła za pierwszym razem');
    if (item.trusted) list.push('w poleceniu dla Dosłowniaka uwierzyłeś złemu wynikowi');
    return list;
  };

  const pin = () => {
    if (selected === null) return;
    setPinned(selected);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        To jest <strong>Twoja mapa roku</strong>. Znaki przy działach biorą się z tego, jak poszło w mikro-grach i w
        poleceniach dla Dosłowniaka.{' '}
        {hasData ? (
          <>
            Zielony znak — dział pamiętasz od razu, bursztynowy — warto do niego wrócić przed testem.
          </>
        ) : (
          <>Nie ma jeszcze znaków — zagraj w blok pierwszy, a mapa pokaże, co pamiętasz.</>
        )}
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-7">
        <div className="relative">
          <YearRing
            nodeState={nodeState}
            badges={badges}
            selected={selected}
            onTapNode={(n) => setSelected(n)}
            goldSpokes={Boolean(literal?.sentence)}
            goldColor={SENTENCE.color}
            ariaLabel="Twoja mapa roku: osiem działów wokół ciebie i znaki pamięci."
          />
          {centerBadge && (
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Start (środek): {centerBadge === 'ok' ? 'pamiętasz' : 'do powtórki'}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {shaky.length ? 'Do powtórki przed testem' : hasData ? 'Wszystko pamiętasz' : 'Mapa czeka na dane'}
          </p>
          {shaky.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {shaky.map((mod) => (
                <li key={mod.n} className="border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm leading-snug">
                  <p className="font-semibold" style={{ color: mod.color }}>
                    {mod.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{reasons(mod.n).join(' · ')}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                    {(mod.lessonLinks.length ? mod.lessonLinks : [{ title: 'Cały dział', href: mod.href }]).map((link) => (
                      <Link key={link.href} href={link.href} className="font-medium underline underline-offset-2 hover:text-primary">
                        {link.title}
                      </Link>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {hasData
                ? `Dziewięć działów, ${okCount} zielonych znaków. Test końcowy nie powinien cię zaskoczyć — ale i tak zajrzyj do jednego, który lubisz najmniej.`
                : 'Po zagraniu w Rush roku znajdziesz tu listę działów do powtórki.'}
            </p>
          )}

          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-semibold">Wybierz jeden dział, który powtórzysz przed testem.</p>
            <p className="mt-1 text-xs text-muted-foreground">Stuknij dział na pierścieniu, a potem potwierdź.</p>
            <div className="mt-3 min-h-[5.5rem]" aria-live="polite">
              <AnimatePresence mode="wait">
                {chosen && pinned === null && (
                  <motion.div key={`pick-${chosen.n}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <p className="text-sm">
                      <span className="font-semibold" style={{ color: chosen.color }}>
                        {chosen.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">{chosen.lessons.join(' · ')}</span>
                    </p>
                    <button
                      type="button"
                      onClick={pin}
                      className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 px-5 text-sm font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      <Flag className="h-4 w-4" aria-hidden /> Ten dział powtórzę
                    </button>
                  </motion.div>
                )}
                {pinned !== null && (
                  <motion.div
                    key="pinned"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm leading-snug"
                  >
                    <p className="font-semibold">Plan na dziś: {moduleByN(pinned).title}.</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                      {(moduleByN(pinned).lessonLinks.length ? moduleByN(pinned).lessonLinks : [{ title: 'Cały dział', href: moduleByN(pinned).href }]).map(
                        (link) => (
                          <Link key={link.href} href={link.href} className="font-medium underline underline-offset-2 hover:text-primary">
                            {link.title}
                          </Link>
                        )
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Możesz zajrzeć teraz albo od razu przejść do testu — wolno ci jedno i drugie.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t pt-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: SENTENCE.color }}>
          Zabierz ze sobą
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-lg font-black sm:text-xl">
          <span>Pomyśl</span>
          <span className="text-muted-foreground" aria-hidden>→</span>
          <span>zrób</span>
          <span className="text-muted-foreground" aria-hidden>→</span>
          <span>sprawdź</span>
        </p>
      </div>
    </div>
  );
}
