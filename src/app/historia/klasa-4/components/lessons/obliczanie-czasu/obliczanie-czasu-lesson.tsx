'use client';

import Image from 'next/image';
import { CalendarX2, Footprints, Hourglass, Route } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { PiechurAugusta } from './piechur-augusta';
import { TrzyDrogi } from './trzy-drogi';
import { DawneZegary } from './dawne-zegary';
import { Pazdziernik1582 } from './pazdziernik-1582';
import { DwudziestyDziewiaty } from './dwudziesty-dziewiaty';
import { WiekiDat } from './wieki-dat';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L8 — obliczanie czasu. `[4.2]`, filar 2.
 *
 * **Zdanie lekcji: między 1 r. p.n.e. a 1 r. n.e. jest tylko jeden krok —
 * dlatego przy datach z dwóch er odejmujemy jedynkę.**
 *
 * Cztery bloki, gesty nowe w kursie:
 *  - `PiechurAugusta` — **przewiduje**, potem **prowadzi piechura rok po roku**
 *    (ciągnie drogę), licznik liczy sam; szczelina zabiera „rok zero”;
 *  - `TrzyDrogi` — **ustawia działanie na liczydle lat** (okienka, dźwignia
 *    − / +, zapadka − 1) i puszcza piechura, który sprawdza;
 *  - `DawneZegary` — **przesuwa słońce po niebie** (cień patyka), **obraca
 *    klepsydrę**, **suwakiem lat** przesuwa kalendarz księżycowy;
 *  - `Pazdziernik1582` — **zrywa kartki kalendarza**: po 4 od razu 15;
 *    pinezka „kalendarz gregoriański”.
 *
 * Przypominajka wraca do wieków z L7 (dystans 1). D — 29 lutego poza postępem.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/obliczanie-czasu/klepsydra.jpg',
  zegar: '/images/historia/lekcje/obliczanie-czasu/zegar-sloneczny.jpg',
  nil: '/images/historia/lekcje/obliczanie-czasu/nil-wylew.jpg',
  kartki: '/images/historia/lekcje/obliczanie-czasu/kartki-kalendarza.jpg',
});

const LESSON_KEY = 'czas-i-miejsce/obliczanie-czasu';

const BLOCKS: HistBlockMeta[] = [
  { id: 'piechur', kind: 'haczyk', title: 'Ile lat żył August?', time: '5 min', icon: Footprints },
  { id: 'drogi', kind: 'cwiczenie', title: 'Trzy drogi', time: '6 min', icon: Route },
  { id: 'zegary', kind: 'symulator', title: 'Jak dawniej mierzono czas', time: '6 min', icon: Hourglass },
  { id: 'pazdziernik', kind: 'os-czasu', title: 'Październik 1582', time: '5 min', icon: CalendarX2 },
];

const L7_LESSON = getLesson('czas-i-miejsce', 'wieki-i-tysiaclecia');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function ObliczanieCzasuLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przewidziałeś/łaś, ile lat żył August, a piechur pokazał, że o jeden mniej — bo roku zero nie było. Ustawiałeś/łaś działania na liczydle lat dla trzech dróg, zatrzymałeś/łaś słońce w południe, przewróciłeś/łaś klepsydrę, zobaczyłeś/łaś, jak kalendarz z Księżyca ucieka porom roku, i zerwałeś/łaś kartki października 1582. Między 1 r. p.n.e. a 1 r. n.e. jest tylko jeden krok — dlatego przy datach z dwóch er odejmujemy jedynkę."
      entry={
        L7_LESSON ? (
          <Przypominajka from={L7_LESSON} distance={1} color={histModule.color}>
            <WiekiDat color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const piechur = useBlockDone('piechur');
  const drogi = useBlockDone('drogi');
  const zegary = useBlockDone('zegary');
  const pazdziernik = useBlockDone('pazdziernik');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="piechur">
        <p className="mb-4 text-base leading-relaxed">
          Gdy obie daty są z naszej ery, liczenie jest proste. A gdy ktoś urodził się <strong>przed naszą erą</strong>, a
          zmarł już <strong>w naszej erze</strong>? Zanim cokolwiek policzysz — zgadnij.
        </p>
        <PiechurAugusta color={color} onComplete={piechur.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="drogi">
        <p className="mb-4 text-base leading-relaxed">
          Piechur zawsze mówi prawdę, ale chodzenie rok po roku trwa długo. Historycy liczą na skróty — działaniem. Na
          liczydle lat ustawisz działanie, a piechur sprawdzi, czy daje tyle, ile kroków naprawdę trzeba zrobić.
        </p>
        <TrzyDrogi color={color} onComplete={drogi.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zegary">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zegar}
          alt="Akwarela: kamienny zegar słoneczny na niskim kamiennym słupku w ogrodzie — gładka okrągła tarcza bez żadnych znaków, z brązową wskazówką rzucającą krótki cień; wokół lawenda, przycięte krzewy i mur porośnięty różą"
          lead="Zanim były zegarki."
        >
          Przez tysiące lat ludzie nie mieli zegarków. Czas mierzyli tym, co widzieli: <strong>Słońcem</strong>,{' '}
          <strong>piaskiem</strong> i <strong>Księżycem</strong>. Każdy z tych przyrządów coś umiał — i czegoś nie umiał.
        </LessonImageCard>
        <div className="mt-4">
          <DawneZegary color={color} nileImage={IMAGES.nil} onComplete={zegary.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="pazdziernik">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kartki}
          alt="Akwarela: na drewnianym stole leży kilka pustych, oderwanych kartek kalendarza i stojący kalendarz z pustą kartką na wierzchu; obok filiżanka herbaty, słoik ze stokrotkami i ołówek"
          reverse
          lead="Dziesięć dni, których nie było."
        >
          Kalendarz, którego używamy, ma swoje urodziny. Tamtej jesieni ludzie w Polsce, we Włoszech i w Hiszpanii
          położyli się spać w czwartek — a obudzili się w piątek, jedenaście dni później według kartek.
        </LessonImageCard>
        <div className="mt-4">
          <Pazdziernik1582 color={color} lesson={LESSON_KEY} done={pazdziernik.done} onComplete={pazdziernik.markBlockDone} />
        </div>
      </LessonBlock>

      {/* D — dopisek poza postępem (jak w L1): bloków opcjonalnych powłoka jeszcze nie ma. */}
      <section className="border border-dashed p-5 sm:p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dla ciekawych · nieobowiązkowe</p>
        <h3 className="mb-3 text-lg font-semibold">Skąd się wziął 29 lutego?</h3>
        <DwudziestyDziewiaty color={color} />
      </section>
    </>
  );
}

/**
 * Wejście w lekcję: pytanie, na które odpowiada, i plan bloków dla ekranów bez
 * bocznej szyny. Bez numeru — nie jest blokiem, więc nie liczy się do postępu.
 */
function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Ile lat minęło od bitwy pod Grunwaldem? To łatwe: od dzisiejszego roku odejmujesz 1410. Ale ile lat żył ktoś,
          kto urodził się przed naszą erą, a umarł już w naszej? Tu prawie wszyscy mylą się o jeden rok.
        </p>
        <p className="mt-3">
          Dziś sprawdzisz to piechurem, który chodzi po osi rok po roku, poznasz zegary bez wskazówek i kalendarz, z
          którego zniknęło dziesięć dni. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            między 1 r. p.n.e. a 1 r. n.e. jest tylko jeden krok — dlatego przy datach z dwóch er odejmujemy jedynkę.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: stara drewniana klepsydra na drewnianym stole przy oknie — piasek przesypuje się z górnej bańki do dolnej; obok suche liście, dzbanuszek z suszonymi kwiatami i ogarek świecy"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

        {/* Plan tej lekcji — dla ekranów bez bocznej szyny; powyżej `lg` szyna go dubluje. */}
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan tej lekcji</p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{HIST_BLOCK_KINDS[block.kind].label}</span>
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
