'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Film, MessageSquareText, Search } from 'lucide-react';
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
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { Tasma } from './tasma';
import { CoNaprawde } from './co-naprawde';
import { PowiedzInaczej } from './powiedz-inaczej';

/**
 * L7 — co czuję, czego potrzebuję. `[1.4]` `[5.5]`, filary 2 i 3.
 *
 * **Zdanie lekcji: kiedy mówię, co czuję i czego potrzebuję, zamiast
 * oskarżać, druga strona może mi pomóc.**
 *
 *  - `Tasma` — **kłótnia przewijana suwakiem jak taśma**, stuknięcia zdań, po
 *    których robi się gorzej (skutek w twarzach i na mierniku, `klotnia.ts`);
 *  - `CoNaprawde` — uczucie z palety (wybór dziecka) i dowody w tekście:
 *    zdanie z uczuciem i zdanie z potrzebą (kotwice z właścicielem);
 *  - `PowiedzInaczej` — **wyrzut wyjęty z taśmy, w lukę komunikat z trzech
 *    pasków** („Czuję… kiedy… Proszę, …”; „kiedy” wycięte z klatek taśmy),
 *    taśma toczy się inaczej, „było” i „teraz” obok siebie (przebudowa
 *    2026-10-19, R4; własne słowa w Pisarni bez werdyktu).
 *
 * Bez nagrań (zwrot 2026-10-19, § 3a) — scena idzie dymkami i twarzami SVG.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/emocje-i-potrzeby/biurko-model.jpg',
  zuzia: '/images/jezyk-polski/lekcje/emocje-i-potrzeby/zuzia-skrzydlo.jpg',
  drzwi: '/images/jezyk-polski/lekcje/emocje-i-potrzeby/drzwi-uchylone.jpg',
  razem: '/images/jezyk-polski/lekcje/emocje-i-potrzeby/klejenie-razem.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'tasma', kind: 'haczyk', title: 'Kłótnia toczy się sama', time: '5 min', icon: Film },
  { id: 'naprawde', kind: 'tekst', title: 'Co tam naprawdę jest?', time: '6 min', icon: Search },
  { id: 'inaczej', kind: 'rozmowa', title: 'Powiedz inaczej', time: '8 min', icon: MessageSquareText },
];

const L6 = POL_LESSONS.find((l) => l.slug === 'moje-zdanie')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function EmocjeIPotrzebyLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Kłótnia skończyła się klejeniem. Twój komunikat „ja” leży w Teczce autora."
      entry={<PrzypominajkaOdbita color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const tasma = useBlockDone('tasma');
  const naprawde = useBlockDone('naprawde');
  const inaczej = useBlockDone('inaczej');
  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="tasma">
        <LessonImageCard variant="secondary" color={color} image={IMAGES.zuzia} alt="Akwarela: mała jasnowłosa dziewczynka z kucykami siedzi na podłodze plecami do widza, w rękach trzyma skrzydło modelu samolotu" lead="Pokój Tymka, sobota rano.">
          Zuzia wzięła skrzydło samolotu, który Tymek kleił od rana. Za chwilę zrobi się głośno.
        </LessonImageCard>
        <Tasma color={color} onComplete={tasma.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="naprawde">
        <LessonImageCard variant="secondary" color={color} image={IMAGES.drzwi} alt="Akwarela: uchylone drzwi pokoju, przez szparę na korytarz pada smuga światła" reverse lead="Ta sama kłótnia, spisana.">
          Krzyk mówi, kto jest winny. A co mówi tekst o tym, co czuli i czego chcieli?
        </LessonImageCard>
        <CoNaprawde color={color} onComplete={naprawde.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="inaczej">
        <PowiedzInaczej color={color} onComplete={inaczej.markBlockDone} />
        <div className="mt-4">
          <LessonImageCard variant="secondary" color={color} image={IMAGES.razem} alt="Akwarela: rudy chłopiec i mała jasnowłosa dziewczynka siedzą razem przy biurku i kleją model samolotu" lead="Tak też może się skończyć.">
            Te same osoby, ten sam model. Inne słowa.
          </LessonImageCard>
        </div>
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L6: karta odbita — powtórzenie czy nie na temat? */
const KARTY = [
  { text: 'Kino, bo kino jest lepsze.', id: 'pow' },
  { text: 'Mój kot lubi mleko.', id: 'obok' },
];
function PrzypominajkaOdbita({ color }: { color: string }) {
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState('');
  const k = KARTY[i];
  const done = i >= KARTY.length;
  const odp = (wybor: string) => {
    if (!k) return;
    if (wybor === k.id) {
      setMsg(k.id === 'pow' ? 'Tak — to samo zdanie dwa razy, z „bo” w środku.' : 'Tak — kot nie ma nic wspólnego ze sporem o wycieczkę.');
      setI((x) => x + 1);
    } else setMsg('Przeczytaj jeszcze raz: czy po „bo” stoi powód?');
  };
  return (
    <Przypominajka from={L6} distance={1} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Klasa wybiera: wycieczka do kina czy do lasu? Pan Bogdan odbił te karty. Dlaczego?</p>
      {!done ? (
        <div className="mt-2">
          <p className="font-serif text-lg">„{k.text}”</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => odp('pow')} className="border px-3 py-1.5 text-sm" style={{ borderColor: color }}>
              to zdanie jeszcze raz
            </button>
            <button type="button" onClick={() => odp('obok')} className="border px-3 py-1.5 text-sm" style={{ borderColor: color }}>
              nie na temat
            </button>
          </div>
        </div>
      ) : null}
      <p className="mt-2 min-h-[2.5rem] text-sm" aria-live="polite">
        {msg}
        {done && ' Dziś zobaczysz trzeci sposób, w jaki zdania psują rozmowę: oskarżenie.'}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Każdy się czasem kłóci. Kłótnia ma jednak swoje słowa — takie, po których robi się coraz gorzej.</p>
        <p className="mt-3">
          Dziś przewiniesz kłótnię Tymka i Zuzi jak film, znajdziesz w tekście, co naprawdę czuli, i wstawisz w scenę zdanie,
          które ją odwróci. Wszystko stoi na jednym zdaniu:{' '}
          <strong>kiedy mówię, co czuję i czego potrzebuję, zamiast oskarżać, druga strona może mi pomóc.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image src={IMAGES.intro} alt="Akwarela: biurko w pokoju chłopca z nieskończonym drewnianym modelem samolotu, tubką kleju i zapaloną lampką" width={260} height={195} className="absolute inset-0 h-full w-full object-contain" priority />
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
