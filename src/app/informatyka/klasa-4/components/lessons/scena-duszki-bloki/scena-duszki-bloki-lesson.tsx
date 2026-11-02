'use client';

import Image from 'next/image';
import { Blocks, Bug, MousePointerClick, PackageCheck, Wrench } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { StageCall } from './stage-call';
import { FirstScript } from './first-script';
import { BlockBench } from './block-bench';
import { FixRun } from './fix-run';
import { ScriptStudio } from './script-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Pierwsza lekcja modułu 6 i dwudziesty czwarty kształt lekcji w kursie.
 * **Otwiera moduł o Scratchu** i realizuje temat „scena, duszki i bloki —
 * pierwszy skrypt, uruchamianie i zatrzymywanie” `[2.1]`. Bez zadania
 * obowiązkowego — Z-7 przypada na lekcję 2, Z-8 na lekcję 3.
 *
 * To **pierwsza lekcja kursu z prawdziwym kodem**, więc cztery bloki są ułożone
 * tak, żeby gest wyprzedzał pojęcie:
 *  - `StageCall` — polecenie wykonuje **zaznaczony** duszek; stąd bierze się to,
 *    że skrypt należy do duszka, a nie do projektu;
 *  - `FirstScript` — pokaz krok po kroku, w którym każdy krok odhacza dopiero
 *    **wykonany gest**: otwarcie kategorii, przeciągnięcie klocka, doczepienie
 *    drugiego, naciśnięcie flagi;
 *  - `BlockBench` — wolna pracownia z trzema zamówieniami sprawdzanymi po tym,
 *    **co duszek zrobił**, nie po tym, z czego dziecko to złożyło;
 *  - `FixRun` — trzy cudze programy, które nie działają z trzech różnych
 *    powodów, z paletą **zablokowaną do pierwszego uruchomienia**;
 *  - `ScriptStudio` — zadanie praktyczne **na stronie**, na tym samym `Benchu` i tej
 *    samej scenie co bloki 2–4; werdykt czyta program przez `blocksToProgram`, a
 *    nagrodą jest ten program pokazany klatka po klatce, tak jak zobaczy go widz.
 *
 * Nowym gestem całego repo jest tu **przeciąganie klocka, który zatrzaskuje się w
 * słupku** (`bench.tsx`) — cała różnica między „klocki leżą obok siebie” a
 * „klocki są doczepione” istnieje wyłącznie w palcach, więc nie dało się jej
 * oddać kliknięciem z listy.
 *
 * Ta lekcja jest też **pierwszą, która nie kończy się listą kontrolną**: zadanie
 * ma trzy etapy (zlecenie z jawnymi kryteriami → warsztat → odbiór z werdyktem
 * punkt po punkcie), a warsztatem jest strona — `components/task-shell.tsx`.
 * Silnik mini-Scratcha (`components/scratch/`) jest wspólny dla całego modułu 6.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/scena-duszki-bloki/teatrzyk-kukielkowy.jpg',
  dzwonki: '/images/informatyka/lekcje/scena-duszki-bloki/dzwonki-na-listwie.jpg',
  pozytywka: '/images/informatyka/lekcje/scena-duszki-bloki/pozytywka-z-walcem.jpg',
  lampki: '/images/informatyka/lekcje/scena-duszki-bloki/lancuch-lampek.jpg',
  skrzynka: '/images/informatyka/lekcje/scena-duszki-bloki/skrzynka-z-czesciami.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'kto-wykona',
    kind: 'haczyk',
    title: 'Kto wykona to polecenie?',
    time: '5 min',
    icon: MousePointerClick,
  },
  {
    id: 'pierwszy-skrypt',
    kind: 'pokaz',
    title: 'Trzy klocki, a to już jest program',
    time: '6 min',
    icon: Blocks,
  },
  {
    id: 'pracownia',
    kind: 'symulator',
    title: 'Pracownia: trzy zamówienia',
    time: '9 min',
    icon: Wrench,
  },
  {
    id: 'nie-dziala',
    kind: 'debugowanie',
    title: 'Trzy projekty, które „nie działają”',
    time: '7 min',
    icon: Bug,
  },
  {
    id: 'wlasny-scratch',
    kind: 'zadanie',
    title: 'Zlecenie: duszek, który wita i odchodzi',
    time: '10 min',
    icon: PackageCheck,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function ScenaDuszkiBlokiLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zbudowałeś/zbudowałaś pierwszy działający skrypt, wykonałeś/wykonałaś trzy zamówienia w pracowni, naprawiłeś/naprawiłaś trzy cudze programy — a na koniec złożyłeś/złożyłaś od zera własny skrypt i zobaczyłeś/zobaczyłaś go oczami widza. Od tej lekcji „program” nie jest już słowem z opowieści: to słupek klocków, który coś robi, i który potrafisz uruchomić, zatrzymać, poprawić i pokazać."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const call = useBlockDone('kto-wykona');
  const first = useBlockDone('pierwszy-skrypt');
  const bench = useBlockDone('pracownia');
  const fix = useBlockDone('nie-dziala');
  const task = useBlockDone('wlasny-scratch');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="kto-wykona">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.dzwonki}
          alt="Trzy jednakowe mosiężne dzwonki wiszą w rzędzie na sznurkach pod drewnianą listwą; środkowy jest przechylony na bok i otoczony kreskami oznaczającymi ruch, dwa pozostałe wiszą nieruchomo"
          lead="Polecenie nigdy nie wisi w powietrzu. Zawsze wykonuje je ktoś konkretny."
        >
          W Scratchu tym kimś jest <strong>duszek</strong> — i to nie dowolny, tylko ten, którego
          masz w tej chwili zaznaczonego. Spróbuj poustawiać trzy duszki na ich miejscach, a
          przekonasz się, jak łatwo o pomyłkę.
        </LessonImageCard>
        <StageCall color={color} onComplete={call.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pierwszy-skrypt">
        <FirstScript color={color} onComplete={first.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pracownia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.pozytywka}
          alt="Otwarta drewniana szkatułka z widocznym mechanizmem pozytywki: mosiężny walec gęsto usiany drobnymi wypustkami, a przy nim stalowy grzebień z kilkudziesięcioma cienkimi zębami"
          reverse
        >
          <p>
            W pozytywce melodia jest <strong>zapisana wypustkami na walcu</strong> — jedna po
            drugiej, w ustalonej kolejności. Nikt nie gra jej ręcznie; walec się obraca i wypustki
            same trącają zęby grzebienia. Skrypt w Scratchu jest tym samym, tylko z klocków.
          </p>
        </LessonImageCard>
        <BlockBench color={color} onComplete={bench.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="nie-dziala">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lampki}
          alt="Stary łańcuch choinkowych lampek rozłożony na jasnym blacie — małe szklane bańki w gładkich mosiężnych oprawkach na skręcanym sznurze, a jedna wykręcona bańka leży obok swojej pustej oprawki"
          lead="„Nie świecą” to nie jest opis usterki. To opis wyniku."
          reverse
        >
          Łańcuch lampek gaśnie w całości, choć luźna jest tylko jedna bańka — i dopóki się jej nie
          znajdzie, wszystkie wyglądają tak samo. Z programami jest identycznie:{' '}
          <strong>„nie działa” wygląda za każdym razem tak samo</strong>, a przyczyna bywa zupełnie
          inna.
        </LessonImageCard>
        <FixRun color={color} onComplete={fix.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wlasny-scratch">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.skrzynka}
          alt="Płytka drewniana skrzynka widziana z góry, a w niej równo poukładane w grupki surowe drewniane części: kupka krótkich walcowatych kołków, szpulka, szprychowe kółko i trzy gładkie listewki z otworami na końcach"
        >
          <p>
            W skrzynce leżą same części — kołki, szpulka, kółko, listewki. Skrzynka niczego nie
            zbuduje, dopóki ktoś nie zdecyduje, <strong>które</strong> części i w{' '}
            <strong>jakiej kolejności</strong>. Paleta klocków jest taką skrzynką: ma ich osiem, a
            zamówienie potrzebuje tylko kilku. Dobierz je sam/sama.
          </p>
        </LessonImageCard>
        <ScriptStudio color={color} onComplete={task.markBlockDone} />
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
          Przez pięć poprzednich lekcji układałeś/układałaś plany, których nikt nie wykonywał — poza
          tobą i kimś z domu. Od dzisiaj jest wykonawca, który nie domyśla się{' '}
          <strong>niczego</strong> i robi dokładnie to, co dostanie. Nazywa się duszek i mieszka w
          Scratchu.
        </p>
        <p className="mt-3">
          W tej lekcji zbudujesz swój pierwszy działający skrypt, wykonasz nim trzy zamówienia i
          naprawisz trzy cudze programy, które „nie działają” — każdy z zupełnie innego powodu.
          Wszystko w makiecie, która wygląda i zachowuje się jak prawdziwy Scratch: te same kolory
          kategorii, ten sam kapelusz z flagą, ta sama zielona flaga nad sceną.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Mały drewniany teatrzyk widziany z przodu — pusta deska sceny, po bokach zebrane w fałdy jasne zasłonki w drobny listek, a na deskach stoją dwie proste drewniane figurki: jedna w stożkowym kapturku, druga z kokiem"
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
