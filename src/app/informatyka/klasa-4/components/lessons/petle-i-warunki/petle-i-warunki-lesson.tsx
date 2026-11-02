'use client';

import Image from 'next/image';
import { Film, Gamepad2, GitBranch, PackageCheck, Repeat } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { LoopFold } from './loop-fold';
import { Flipbook } from './flipbook';
import { EdgeGuard } from './edge-guard';
import { KeyDrive } from './key-drive';
import { WalkStudio } from './walk-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Czwarta lekcja modułu 6 i dwudziesty siódmy kształt lekcji w kursie. Realizuje
 * temat „powtarzanie (pętle) i warunki — animacja, reagowanie na klawisze”
 * `[2.1]`. **Bez zadania obowiązkowego** — program żadnego tutaj
 * nie przewiduje, więc zamówienie jest autorskie i po raz pierwszy w module
 * wymaga od dziecka **klocków obejmujących składanych własnym palcem**: pętli, a
 * w niej warunku.
 *
 * Lekcja stoi na jednym zdaniu, powtórzonym w trzech różnych sytuacjach:
 * **program robi coś wiele razy tylko wtedy, gdy siedzi w czymś, co się kręci.**
 * Blok pierwszy zwija powtórzenie w pętlę, drugi wkłada w pętlę zmianę obrazka,
 * trzeci — warunek, czwarty — pytanie o klawisz. Czwarte wystąpienie tej samej
 * myśli jest już rozpoznaniem, nie nowiną, i dlatego zadanie prosi o wszystkie
 * trzy rzeczy naraz.
 *
 * Pięć bloków, pięć różnych gestów — żaden nie jest „kliknij opcję, przeczytaj
 * wyjaśnienie”:
 *  - `LoopFold` — **stuknięcie klocka, od którego zaczyna się drugi bok** rysunku
 *    na scenie, i zwinięcie powtórzenia w pętlę; ślad linii pokazuje, że wersja
 *    zwinięta rysuje to samo;
 *  - `Flipbook` — **przestawianie klatek w pasku** i suwak czasu, oba działające
 *    w trakcie biegu programu;
 *  - `EdgeGuard` — **jeden klocek, trzy miejsca**: nad pętlą, w pętli i pod nią,
 *    każde naprawdę uruchamiane;
 *  - `KeyDrive` — **trzymane strzałki** i dwa skrypty sterowania porównane
 *    stoperem;
 *  - `WalkStudio` — **zagnieżdżony edytor skryptu na stronie** (klocki do paszczy
 *    pętli i do „jeżeli”, wyciąganie klocków ze skryptu) i podgląd na scenie z
 *    przełącznikiem „trzymam strzałkę”; werdykt czyta program przez
 *    `blocksToProgram`.
 *
 * **Silnik urósł o klocki z paszczą** (`powtorz`, `zawsze`, `jezeli` w
 * `engine.ts`), a `run()` wykonuje je rekurencyjnie i **oddaje ekran na koniec
 * każdego obiegu** — tak samo jak Scratch. Bench celowo został płaski: gest
 * zagnieżdżonego upuszczania to inny problem i inny widżet (patrz nagłówek
 * `loop-stack.tsx`).
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/petle-i-warunki/stempel-i-odbicia.jpg',
  harmonijka: '/images/informatyka/lekcje/petle-i-warunki/harmonijka-z-papieru.jpg',
  zoetrop: '/images/informatyka/lekcje/petle-i-warunki/zoetrop.jpg',
  ster: '/images/informatyka/lekcje/petle-i-warunki/kolo-sterowe.jpg',
  manekin: '/images/informatyka/lekcje/petle-i-warunki/drewniany-manekin.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'zwin-to',
    kind: 'haczyk',
    title: 'Dwanaście klocków, jedna myśl',
    time: '7 min',
    icon: Repeat,
  },
  {
    id: 'klatka-po-klatce',
    kind: 'symulator',
    title: 'Klatka po klatce: animacja z pętli',
    time: '6 min',
    icon: Film,
  },
  {
    id: 'trzy-miejsca',
    kind: 'pokaz',
    title: 'Trzy miejsca dla jednego klocka',
    time: '6 min',
    icon: GitBranch,
  },
  {
    id: 'ster',
    kind: 'cwiczenie',
    title: 'Weź ster',
    time: '6 min',
    icon: Gamepad2,
  },
  {
    id: 'ozyw-duszka',
    kind: 'zadanie',
    title: 'Zadanie: ożyw swojego duszka',
    time: '10 min',
    icon: PackageCheck,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function PetleIWarunkiLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zostają dwa zdania, które będą ci potrzebne w każdym następnym programie. Pierwsze: pętla to nie skrót dla leniwych, tylko zapis myśli „zrób to tyle razy” — i gdy trzeba coś zmienić, zmieniasz to raz zamiast dziesięć. Drugie: warunek sprawdzony raz to prawie zawsze warunek sprawdzony za wcześnie; żeby program pytał bez przerwy, warunek musi siedzieć w czymś, co się kręci."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const hook = useBlockDone('zwin-to');
  const film = useBlockDone('klatka-po-klatce');
  const guard = useBlockDone('trzy-miejsca');
  const drive = useBlockDone('ster');
  const task = useBlockDone('ozyw-duszka');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="zwin-to">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.harmonijka}
          alt="Na jasnym blacie po lewej pasek papieru złożony w ciasną harmonijkę, stojący jako mały zwarty stosik; po prawej taki sam pasek rozłożony w długą harmonijkę, ciągnącą się przez cały kadr"
          lead="To ten sam pasek papieru. Raz złożony, raz rozłożony."
        >
          Z programem jest tak samo. Skrypt, w którym kot rysuje cztery boki kwadratu klocek po
          klocku, i skrypt, który mówi „narysuj bok — i tak cztery razy”, to{' '}
          <strong>ten sam program</strong>: raz rozpisany, raz złożony. Zaraz sam go złożysz.
        </LessonImageCard>
        <LoopFold color={color} onComplete={hook.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="klatka-po-klatce">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.zoetrop}
          alt="Drewniany zoetrop na jasnym blacie: płytki, otwarty bęben z jasnego drewna osadzony na toczonej nóżce, w ściance bębna rząd równo rozmieszczonych wąskich pionowych szpar"
          reverse
        >
          <p>
            Zanim wymyślono film, ruch robiło się tak: kilka nieruchomych rysunków w bębnie i{' '}
            <strong>obrót w kółko</strong>. Rysunki się nie ruszają — rusza się ten, kto je
            pokazuje. Animacja w Scratchu to dokładnie ta sama sztuczka:{' '}
            <strong>pętla przełączająca kostiumy</strong>.
          </p>
        </LessonImageCard>
        <Flipbook color={color} onComplete={film.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="trzy-miejsca">
        <EdgeGuard color={color} onComplete={guard.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="ster">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.ster}
          alt="Drewniane koło sterowe łodzi osadzone pionowo w prostym drewnianym stojaku na jasnym blacie, z ośmioma toczonymi rączkami, z których jedna sterczy prosto do góry"
          lead="Ster nie ma przycisku „skręć”. Działa tak długo, jak długo go trzymasz."
        >
          Sterowanie w grze jest właśnie takie: program musi pytać <strong>bez przerwy</strong>, czy
          klawisz jest w tej chwili wciśnięty. Zaraz sam/sama pokierujesz duszkiem — w dwóch
          wersjach, i zmierzysz, która słucha szybciej.
        </LessonImageCard>
        <KeyDrive color={color} onComplete={drive.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="ozyw-duszka">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.manekin}
          alt="Drewniany manekin plastyczny stojący na jasnym blacie w połowie kroku, z jedną ręką uniesioną w górę; widać kulkowe przeguby i gładkie, niemalowane drewno"
        >
          <p>
            Taki manekin ma wszystkie stawy, jakich trzeba do ruchu — i nie rusza się ani trochę,
            dopóki ktoś mu nie każe. <strong>Twój duszek ma dziś ożyć sam z siebie</strong>:
            animować się bez końca i słuchać twoich klawiszy.
          </p>
        </LessonImageCard>
        <WalkStudio color={color} onComplete={task.markBlockDone} />
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
          Do tej pory każdy twój skrypt robił rzeczy <strong>po kolei i raz</strong>. Dziś dojdą dwa
          klocki, które zmieniają w programowaniu prawie wszystko:{' '}
          <strong>pętla</strong>, czyli „zrób to jeszcze raz”, i <strong>warunek</strong>, czyli
          „zrób to tylko wtedy, gdy…”.
        </p>
        <p className="mt-3">
          Z tych dwóch klocków składa się prawie każda gra, jaką znasz. Postać, która sama chodzi,
          animacja, która nie kończy się po jednym mrugnięciu, i sterowanie, które reaguje na twój
          palec — to wszystko jest <strong>pętla z warunkiem w środku</strong>.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Na jasnym blacie leży drewniany stempel z prostym listkiem na spodzie, a obok długi wąski pasek papieru z rzędem sześciu jednakowych zielonych odbić listka, rozstawionych w równych odstępach"
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
