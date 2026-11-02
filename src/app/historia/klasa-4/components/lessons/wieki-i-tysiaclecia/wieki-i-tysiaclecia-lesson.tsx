'use client';

import Image from 'next/image';
import { FlipHorizontal2, Landmark, Library, Sparkles } from 'lucide-react';
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
import { SznuryKoralikow } from './sznury-koralikow';
import { PolkiWiekow } from './polki-wiekow';
import { LustroPne } from './lustro-pne';
import { TabliceNaMurze } from './tablice-na-murze';
import { KartyWEpokach } from './karty-w-epokach';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L7 — wieki i tysiąclecia. `[4.1]`, filar 2.
 *
 * **Zdanie lekcji: wiek zaczyna się w roku z końcówką 01, bo pierwsze sto lat
 * liczy się od jedynki, nie od zera.**
 *
 * Cztery bloki, gesty nowe w kursie:
 *  - `SznuryKoralikow` — **ciągnie nić, koraliki-lata same się nawlekają**
 *    (setny zamyka sznur), potem **stawia fajerwerk** tam, gdzie naprawdę kończy
 *    się drugie tysiąclecie;
 *  - `PolkiWiekow` — **zasłania kciukiem dwie ostatnie cyfry** i odkłada kartę
 *    na półkę z cyfrą rzymską (pułapki 1900, 1901, 2000, 100);
 *  - `LustroPne` — **składa oś przez lustro roku zero**, odkłada karty p.n.e.;
 *    zaliczenie włącza wieki rzymskie na Osi dziejów;
 *  - `TabliceNaMurze` — **stuka litery napisu od lewej** (liczydło liczy)
 *    i **kręci tarczą wieków**.
 *
 * Przypominajka wraca do epok z L6 (dystans 1).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/wieki-i-tysiaclecia/sylwester-nad-dachami.jpg',
  koraliki: '/images/historia/lekcje/wieki-i-tysiaclecia/koraliki-w-pudelkach.jpg',
  archiwum: '/images/historia/lekcje/wieki-i-tysiaclecia/archiwum-polki.jpg',
  kamienica: '/images/historia/lekcje/wieki-i-tysiaclecia/kamienica-z-tablica.jpg',
});

const LESSON_KEY = 'czas-i-miejsce/wieki-i-tysiaclecia';

const BLOCKS: HistBlockMeta[] = [
  { id: 'koraliki', kind: 'haczyk', title: 'Sylwester 1999', time: '5 min', icon: Sparkles },
  { id: 'polki', kind: 'cwiczenie', title: 'Półki wieków', time: '6 min', icon: Library },
  { id: 'lustro', kind: 'os-czasu', title: 'Lustro p.n.e.', time: '5 min', icon: FlipHorizontal2 },
  { id: 'tablice', kind: 'zrodlo', title: 'Tablica na murze', time: '5 min', icon: Landmark },
];

const L6_LESSON = getLesson('czas-i-miejsce', 'os-czasu-i-epoki');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function WiekiITysiacleciaLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Nawlekłeś/łaś pierwsze sto lat na sznur i zobaczyłeś/łaś, że zamyka go rok 100, a drugie tysiąclecie — rok 2000. Zasłaniałeś/łaś kciukiem dwie ostatnie cyfry i odkładałeś/łaś lata na półki wieków, złożyłeś/łaś oś przez lustro roku zero i odczytałeś/łaś cyfry rzymskie z tablic na murach. Wiek zaczyna się w roku z końcówką 01, bo pierwsze sto lat liczy się od jedynki, nie od zera."
      entry={
        L6_LESSON ? (
          <Przypominajka from={L6_LESSON} distance={1} color={histModule.color}>
            <KartyWEpokach color={histModule.color} />
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
  const koraliki = useBlockDone('koraliki');
  const polki = useBlockDone('polki');
  const lustro = useBlockDone('lustro');
  const tablice = useBlockDone('tablice');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="koraliki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.koraliki}
          alt="Akwarela: na drewnianym stole dwa płytkie drewniane pudełka — jedno pełne sznurów drewnianych koralików, w drugim leży jeden niedokończony sznur; obok kilka luźnych koralików i stokrotki w słoiku"
          lead="Sto lat to jeden sznur."
        >
          Wyobraź sobie, że każdy rok to koralik. Sto koralików to pełny sznur — <strong>wiek</strong>, czyli inaczej{' '}
          <strong>stulecie</strong>. Dziesięć sznurów to <strong>tysiąclecie</strong>.
        </LessonImageCard>
        <div className="mt-4">
          <SznuryKoralikow color={color} onComplete={koraliki.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="polki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.archiwum}
          alt="Akwarela: jasne archiwum z wysokimi drewnianymi regałami pełnymi jednakowych pudeł i związanych plików papierów, drabinka oparta o regał, okno z dziennym światłem"
          reverse
          lead="Wieki pisze się cyframi rzymskimi."
        >
          Historycy układają lata na półkach wieków, a półki podpisują cyframi rzymskimi: <strong>XV wiek</strong>,{' '}
          <strong>XX wiek</strong>. Ty żyjesz w <strong>XXI wieku</strong>. Jest prosty sposób, żeby trafić z rokiem na
          właściwą półkę — masz go pod ręką, dosłownie.
        </LessonImageCard>
        <div className="mt-4">
          <PolkiWiekow color={color} onComplete={polki.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="lustro">
        <p className="mb-4 text-base leading-relaxed">
          Przed narodzinami Jezusa z Nazaretu, od których liczymy naszą erę, lata liczy się <strong>wstecz</strong>: im
          dawniej, tym większa liczba. Czy wieki p.n.e. też liczy się wstecz?
        </p>
        <LustroPne color={color} lesson={LESSON_KEY} done={lustro.done} onComplete={lustro.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="tablice">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kamienica}
          alt="Akwarela: fasada starej kamiennej kamienicy z drewnianymi łukowymi drzwiami, nad nimi gładka prostokątna tablica z kamienia w ramie; po bokach okna z niebieskimi okiennicami, róża pnąca i drzewka w donicach"
          lead="Rok wykuty w kamieniu."
        >
          Ilustracja jest wymyślona, a tablica nad drzwiami — pusta. Za chwilę „wykujemy” na niej kilka napisów — takich,
          jakie wiszą nad wejściami starych domów w całej Europie.
        </LessonImageCard>
        <div className="mt-4">
          <TabliceNaMurze color={color} image={IMAGES.kamienica} onComplete={tablice.markBlockDone} />
        </div>
      </LessonBlock>
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
          W nocy z 31 grudnia 1999 na 1 stycznia 2000 roku na całym świecie strzelały fajerwerki: ludzie żegnali drugie
          tysiąclecie. Tylko że… drugie tysiąclecie wcale się wtedy nie skończyło. Trwało jeszcze cały rok.
        </p>
        <p className="mt-3">
          Dziś sprawdzisz, dlaczego — na sznurach koralików, na półkach wieków, w lustrze roku zero i na tablicach
          starych domów. Wszystko stoi na jednym zdaniu:{' '}
          <strong>wiek zaczyna się w roku z końcówką 01, bo pierwsze sto lat liczy się od jedynki, nie od zera.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: noc nad starym miasteczkiem — kolorowe fajerwerki nad ośnieżonymi dachami, kominami i wieżą kościoła, rzeka z kamiennym mostem i zamek na wzgórzu"
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
