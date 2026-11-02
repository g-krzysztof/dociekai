'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Footprints, Music, PenLine, Stamp } from 'lucide-react';
import {
  LessonBlock,
  POL_BLOCK_KINDS,
  PolLessonShell,
  Przypominajka,
  useBlockDone,
  type PolBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { addBook } from '../../../lib/polka/model';
import { useShelf } from '../../../lib/polka/use-shelf';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { ZaMaloNut } from './za-malo-nut';
import { PieczecObietnicy } from './pieczec-obietnicy';
import { GdzieJestMy } from './gdzie-jest-my';
import { NaszaObietnica } from './nasza-obietnica';

/**
 * L9 — „my” w hymnie i w „Rocie”. `[7.6c]` `[5.2]` `[2.8]` `[1.1]`, filary 3 i 1.
 *
 * **Zdanie lekcji: hymn i „Rota” to obietnice pisane w liczbie mnogiej —
 * „my” to także ja.**
 *
 * Cztery bloki, cztery gesty nowe dla kursu:
 *
 *  - `ZaMaloNut` — **wers przyłożony do taktu melodii**: dzisiejsze
 *    „przejdziemy” nie mieści się w nutach, dziecko ściska słowa, aż wers
 *    zabrzmi jak w hymnie (`takt.ts`); nad nim hymn ze słowniczkiem;
 *  - `PieczecObietnicy` — **pieczęć przykładana do wersów „Roty”**: zostaje na
 *    obietnicy, rozmazuje się na opisie i prośbie (`pieczec.ts`);
 *  - `GdzieJestMy` — **figurka „ja” prowadzona przez tekst**: zapala każde
 *    „my”, także w końcówkach; typ kontra wynik (`my.ts`);
 *  - `NaszaObietnica` — obietnica wspólnoty w Pisarni, sędzia struktury
 *    (`obietnica.ts`), **podpis palcem** i pieczęć → Teczka autora.
 *
 * Mazurek i „Rota” stają na Półce czytelnika po blokach 1 i 2.
 */

const LESSON = 'ja-i-my/mazurek-i-rota';

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/mazurek-i-rota/ola-tymek-listopad.jpg',
  spiewnik: '/images/jezyk-polski/lekcje/mazurek-i-rota/spiewnik.jpg',
  pieczec: '/images/jezyk-polski/lekcje/mazurek-i-rota/pieczec.jpg',
  apel: '/images/jezyk-polski/lekcje/mazurek-i-rota/apel.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'takt', kind: 'tekst', title: 'Za mało nut', time: '7 min', icon: Music },
  { id: 'pieczec', kind: 'tekst', title: 'Pieczęć obietnicy', time: '5 min', icon: Stamp },
  { id: 'my', kind: 'odkrycie', title: 'Gdzie jest „my”?', time: '5 min', icon: Footprints },
  { id: 'obietnica', kind: 'refleksja', title: 'Nasza obietnica', time: '6 min', icon: PenLine },
];

const L1 = POL_LESSONS.find((l) => l.moduleSlug === 'start' && l.slug === 'jezyk-dziala')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function MazurekIRotaLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Hymn i „Rota” mówią „my” — i twoja obietnica też. Leży z podpisem w Teczce autora."
      entry={<PrzypominajkaMoze color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const takt = useBlockDone('takt');
  const pieczec = useBlockDone('pieczec');
  const my = useBlockDone('my');
  const obietnica = useBlockDone('obietnica');
  const { update } = useShelf();

  const { markBlockDone: taktDone } = takt;
  const { markBlockDone: pieczecDone } = pieczec;
  const onTakt = useCallback(() => {
    update((rec, now) => addBook(rec, `lekcja:${LESSON}#mazurek`, 'lekcja', now));
    taktDone();
  }, [update, taktDone]);
  const onPieczec = useCallback(() => {
    update((rec, now) => addBook(rec, `lekcja:${LESSON}#rota`, 'lekcja', now));
    pieczecDone();
  }, [update, pieczecDone]);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="takt">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.spiewnik}
          alt="Akwarela: stary drewniany pulpit z otwartym śpiewnikiem o pożółkłych kartkach z pustymi pięcioliniami, obok na stoliku zamknięty śpiewnik w brązowej okładce, ołówek i polne kwiaty w dzbanku"
          lead="Słowa hymnu mają ponad dwieście lat."
        >
          Niektóre brzmią dziś dziwnie: „przejdziem”, „będziem”. Czy to błędy? Sprawdź to na nutach.
        </LessonImageCard>
        <ZaMaloNut color={color} onComplete={onTakt} />
      </LessonBlock>

      <LessonBlock id="pieczec">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pieczec}
          alt="Akwarela: dłoń przyciska pieczęć z drewnianym uchwytem do kropli czerwonego laku na czystej kremowej kartce; na drewnianym biurku obok laska laku, świeca w mosiężnym lichtarzu i stare książki"
          reverse
          lead="Dawniej ważne obietnice pieczętowano lakiem."
        >
          „Rotę” Maria Konopnicka napisała w czasach, gdy Polaków zmuszano do porzucenia języka. To wiersz-przysięga. Sprawdź,
          które jego wersy naprawdę coś obiecują.
        </LessonImageCard>
        <PieczecObietnicy color={color} onComplete={onPieczec} />
      </LessonBlock>

      <LessonBlock id="my">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.apel}
          alt="Akwarela: szkolne podwórko jesienią, dzieci z plecakami stoją w równych rzędach na apelu, tyłem do patrzącego; przed nimi na schodach ceglanej szkoły stoi nauczycielka, dookoła złote i rude drzewa"
          lead="Na apelu nikt nie śpiewa sam."
        >
          Kto mówi w hymnie i w „Rocie”? Poprowadź po tekście figurkę „ja” i zobacz, ile razy natknie się na „my”.
        </LessonImageCard>
        <GdzieJestMy color={color} onComplete={my.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="obietnica">
        <NaszaObietnica color={color} onComplete={obietnica.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/**
 * Przypominajka z L1 (osiem lekcji wstecz): w obietnicy jedno słowo zostawia
 * furtkę. Gest: stuknięcie słowa, które trzeba wyrzucić.
 */
const MOZE_WORDS = ['Jutro', 'oddam', 'ci', 'książkę,', 'może.'];

function PrzypominajkaMoze({ color }: { color: string }) {
  const [out, setOut] = useState<number | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const solved = out === 4;

  return (
    <Przypominajka from={L1} distance={8} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">
        Ola dostała taką kartkę. Jedno słowo psuje obietnicę — stuknij je, żeby wypadło.
      </p>
      <p className="mt-3 flex flex-wrap gap-1.5 text-base">
        {MOZE_WORDS.map((w, i) => (
          <button
            key={i}
            type="button"
            disabled={solved}
            onClick={() => {
              if (i === 4) {
                setOut(4);
                setMiss(null);
              } else setMiss(w.replace(/[,.]/, ''));
            }}
            className="border px-2 py-1 transition-opacity"
            style={{
              textDecoration: out === i ? 'line-through' : undefined,
              opacity: out === i ? 0.35 : 1,
              borderColor: out === i ? '#dc2626' : undefined,
            }}
          >
            {w}
          </button>
        ))}
      </p>
      <p className="mt-2 min-h-[2.75rem] text-sm leading-snug" aria-live="polite">
        {solved
          ? '„Jutro oddam ci książkę.” — teraz to obietnica. Dziś zobaczysz obietnice, które składa cały naród.'
          : miss
            ? `Bez „${miss}” kartka się rozsypie. Szukaj słowa, które zostawia furtkę.`
            : ''}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Hymn śpiewa się na apelu, „Rotę” może znasz ze szkoły. Oba teksty mają ponad sto lat i oba mówią tak samo: nie
          „ja”, nie „oni”, tylko <strong>„my”</strong>.
        </p>
        <p className="mt-3">
          Dziś sprawdzisz na nutach, skąd w hymnie dziwne „przejdziem”, przypieczętujesz obietnice „Roty”, poszukasz
          każdego schowanego „my” — i napiszesz własną obietnicę. Wszystko stoi na jednym zdaniu:{' '}
          <strong>hymn i „Rota” to obietnice pisane jako „my” — a „my” to także ja.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: dwoje dzieci widzianych od tyłu idzie brukowaną uliczką małego miasteczka w listopadowy dzień — dziewczynka z kasztanowym warkoczem w miętowej bluzie i rudy chłopiec w koszulce w paski, oboje z przypiętymi biało-czerwonymi kotylionami; na bruku jesienne liście, w głębi wieża kościoła"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan tej lekcji</p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{POL_BLOCK_KINDS[block.kind].label}</span>
                  <span className="block text-xs text-muted-foreground">{block.time}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
