'use client';

import Image from 'next/image';
import { FileSearch, Inbox, PenLine, SplitSquareHorizontal, Timer } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { RushHour } from './rush-hour';
import { TwoSides } from './two-sides';
import { ComposeMail } from './compose-mail';
import { SmallPrint } from './small-print';
import { UnsendClock } from './unsend-clock';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o netykiecie i poczcie elektronicznej — piąta zbudowana w module 2 i
 * dwunasty różny kształt lekcji w kursie. Realizuje `[5.2 — moduł medialny]`.
 *
 * **Cały temat jest tu widziany z drugiej strony: od odbiorcy.** Zasady pisania
 * e-maili są nudne dokładnie do chwili, w której samemu dostanie się sześć
 * wiadomości bez tematu i ma się dwadzieścia sekund. Dlatego:
 *
 *  - `RushHour` — dziecko jest odbiorcą i przegrywa czas przez cudze złe tematy;
 *  - `TwoSides` — pulpit sterowniczy własnej wiadomości obok cudzej skrzynki,
 *    reguły odkrywa się psując wiadomość, nie czytając o nich;
 *  - `ComposeMail` — **pierwsze miejsce w kursie, gdzie dziecko pisze własny
 *    tekst, a strona go czyta** (osiem jawnych kontroli, wolny tekst);
 *  - `SmallPrint` — odpowiedzi trzeba znaleźć w prawdziwym regulaminie;
 *  - `UnsendClock` — o wysyłaniu w złości nie da się przekonać zdaniem, więc
 *    lekcja pisze złośliwą odpowiedź za dziecko i daje pięć sekund na cofnięcie.
 *
 * Bez zadania offline: „wyślij jeden prawdziwy e-mail” domyka `ComposeMail`
 * i kartkę końcową.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/netykieta-i-poczta/biurko-do-pisania.jpg',
  skrzynka: '/images/informatyka/lekcje/netykieta-i-poczta/paczki-z-metka.jpg',
  czesci: '/images/informatyka/lekcje/netykieta-i-poczta/przybory-do-listu.jpg',
  pisanie: '/images/informatyka/lekcje/netykieta-i-poczta/koperta-z-listem.jpg',
  ton: '/images/informatyka/lekcje/netykieta-i-poczta/kamien-i-krzemien.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'skrzynka',
    kind: 'haczyk',
    title: 'Masz 20 sekund i sześć wiadomości',
    time: '6 min',
    icon: Inbox,
  },
  {
    id: 'dwie-strony',
    kind: 'wyjasnienie',
    title: 'Ta sama wiadomość widziana przez odbiorcę',
    time: '7 min',
    icon: SplitSquareHorizontal,
  },
  {
    id: 'pisanie',
    kind: 'symulator',
    title: 'Napisz swój e-mail — naprawdę',
    time: '10 min',
    icon: PenLine,
  },
  {
    id: 'regulamin',
    kind: 'zrodla',
    title: 'Na co właściwie klikasz „akceptuję”',
    time: '6 min',
    icon: FileSearch,
  },
  {
    id: 'zlosc',
    kind: 'cwiczenie',
    title: 'Pięć sekund na cofnięcie',
    time: '6 min',
    icon: Timer,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function NetykietaIPocztaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Napisałeś/napisałaś własny e-mail, który przeszedł wszystkie osiem kontroli, znalazłeś/znalazłaś trzy rzeczy w regulaminie i zobaczyłeś/zobaczyłaś na własne oczy, co robi dziesięć sekund przerwy przed wysłaniem. Zostało jedno: wyślij dziś jeden prawdziwy e-mail — do rodzica, babci albo nauczyciela."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const inbox = useBlockDone('skrzynka');
  const sides = useBlockDone('dwie-strony');
  const compose = useBlockDone('pisanie');
  const rules = useBlockDone('regulamin');
  const anger = useBlockDone('zlosc');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="skrzynka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.skrzynka}
          alt="Kilka zapakowanych w szary papier paczek na stole, do jednej przywiązana sznurkiem pusta papierowa zawieszka, pozostałe bez żadnej etykiety"
          lead="Po której paczce wiesz, co jest w środku?"
        >
          Zacznij nie od pisania, tylko od odbierania. Dostajesz sześć wiadomości i masz dwadzieścia
          sekund — a każde otwarcie kosztuje cztery z nich.
        </LessonImageCard>
        <RushHour color={color} onComplete={inbox.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="dwie-strony">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.czesci}
          alt="Rozłożone na drewnianym stole przybory do napisania listu: pusta złożona kartka, koperta bez adresu, laska pieczętnego laku i zwinięta wstążka"
        >
          <p>
            Teraz pulpit sterowniczy: po lewej twoja wiadomość, po prawej <strong>ta sama
            wiadomość w cudzej skrzynce</strong>. Wyłączaj po kolei jej części i patrz, co wtedy
            myśli odbiorczyni. Zasad nikt ci tu nie poda — zobaczysz je sam/sama.
          </p>
        </LessonImageCard>
        <TwoSides color={color} onComplete={sides.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pisanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pisanie}
          alt="Otwarta pusta koperta leży płasko, do środka do połowy wsunięta złożona czysta kartka, obok jeden zasuszony liść jako coś dołączonego"
          lead="Wiadomość plus to, co do niej dokładasz."
          reverse
        >
          Koniec z wybieraniem gotowych zdań — teraz piszesz własnymi słowami, w prawdziwym polu
          tekstowym. Osiem kontroli przeczyta to, co napiszesz, i powie, czego brakuje. Przycisk
          „Wyślij” ożyje dopiero przy komplecie.
        </LessonImageCard>
        <ComposeMail color={color} onComplete={compose.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="regulamin">
        <SmallPrint color={color} onComplete={rules.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zlosc">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.ton}
          alt="Na jasnym lnie leżą obok siebie dwa kamienie: jeden gładki i zaokrąglony, drugi ostry, z postrzępioną krawędzią"
          reverse
        >
          <p>
            Na koniec najtrudniejsza zasada netykiety — ta, którą wszyscy znają i wszyscy łamią.{' '}
            <strong>Nie będziemy o niej opowiadać.</strong> Odpowiedź napisze się sama, a ty
            zdecydujesz, co z nią zrobić.
          </p>
        </LessonImageCard>
        <UnsendClock color={color} onComplete={anger.markBlockDone} />
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
          „Pisz grzecznie i z tematem” to rada, która nic nie znaczy, dopóki samemu nie siedzi się
          po drugiej stronie. Więc <strong>zaczniemy od odbierania, nie od pisania</strong> — od
          skrzynki pełnej wiadomości bez tematu, w której masz znaleźć tę jedną ważną, zanim skończy
          się czas.
        </p>
        <p className="mt-3">
          Potem napiszesz własny e-mail — naprawdę, własnymi słowami — sprawdzisz w regulaminie gry,
          na co się zgadzasz, i przekonasz się, co robi dziesięć sekund przerwy między złością a
          przyciskiem „Wyślij”.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Spokojny róg biurka do pisania: zamknięty szklany kałamarz, złożona czysta kremowa karta postawiona pionowo i laska czerwonego laku, ciepłe boczne światło"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

        {/* Plan tej lekcji — dla ekranów bez bocznej szyny; powyżej `lg` szyna go dubluje. */}
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Plan tej lekcji
          </p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span
                  className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums"
                  style={{ color }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{BLOCK_KINDS[block.kind].label}</span>
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
