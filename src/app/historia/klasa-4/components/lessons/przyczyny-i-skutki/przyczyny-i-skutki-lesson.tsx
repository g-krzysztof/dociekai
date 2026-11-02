'use client';

import Image from 'next/image';
import { GitBranch, Printer, Shapes } from 'lucide-react';
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
import { DominoPoranka } from './domino-poranka';
import { SkryptoriumDrukarnia } from './skryptorium-drukarnia';
import { LancuchMiasteczka } from './lancuch-miasteczka';
import { ZakreslaczMini } from './zakreslacz-mini';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L4 — przyczyny i skutki. Cel 6 (podstawa pod `[5.1]` i `[8.4]`), filar 2.
 *
 * **Zdanie lekcji: każde wydarzenie ma swoje „dlaczego” i swoje „co z tego
 * wynikło” — a skutek jednego zdarzenia bywa przyczyną następnego.**
 *
 * Trzy bloki, gesty nowe w kursie:
 *
 *  - `DominoPoranka` — **popycha pierwszą kostkę** (przeciągnięcie w prawo)
 *    i **wstawia brakujące ogniwo**; zła kostka zatrzymuje łańcuch;
 *  - `SkryptoriumDrukarnia` — **przepisuje linijkę piórem** (atrament,
 *    tempo), **składa ją z czcionek** (lustro na wierszowniku) i **ściąga
 *    dźwignię prasy**; z jego trzech czasów liczy się dzień pracy i cena
 *    książki, z liczb — schemat przyczyn i skutków; pinezka „druk”;
 *  - `LancuchMiasteczka` — **rysuje strzałki przyczyna → skutek** na osi
 *    lat; strzałka pod prąd czasu odbija się z regułą, role kart liczą się
 *    ze strzałek dziecka.
 *
 * Przypominajka wraca do zakreślacza z L3 (dystans 1).
 */

const LESSON_KEY = 'warsztat-historyka/przyczyny-i-skutki';

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/przyczyny-i-skutki/kopista.jpg',
  domino: '/images/historia/lekcje/przyczyny-i-skutki/domino.jpg',
  prasa: '/images/historia/lekcje/przyczyny-i-skutki/prasa.jpg',
  miasteczko: '/images/historia/lekcje/przyczyny-i-skutki/miasteczko-most.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'domino', kind: 'haczyk', title: 'Domino poranka', time: '4 min', icon: Shapes },
  { id: 'drukarnia', kind: 'symulator', title: 'Skryptorium kontra drukarnia', time: '9 min', icon: Printer },
  { id: 'lancuch', kind: 'os-czasu', title: 'Łańcuch miasteczka', time: '6 min', icon: GitBranch },
];

const L3_LESSON = getLesson('warsztat-historyka', 'wiarygodnosc-zrodla');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function PrzyczynySkutkiLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przewróciłeś/łaś domino poranka, przepisałeś/łaś, złożyłeś/łaś i wydrukowałeś/łaś tę samą linijkę — i z własnych liczb zbudowałeś/łaś schemat druku. Na koniec narysowałeś/łaś łańcuch miasteczka, w którym strzałki płyną tylko z prądem czasu."
      entry={
        L3_LESSON ? (
          <Przypominajka from={L3_LESSON} distance={1} color={histModule.color}>
            <ZakreslaczMini color={histModule.color} />
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
  const domino = useBlockDone('domino');
  const drukarnia = useBlockDone('drukarnia');
  const lancuch = useBlockDone('lancuch');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="domino">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.domino}
          alt="Akwarela: długi, łagodnie wygięty rząd gładkich drewnianych kostek domina stoi na jasnej podłodze w dziecięcym pokoju; pierwsza kostka z przodu właśnie się przechyla, w tle rozmyte skarpetka i plecak"
          lead="Jedno popchnięcie — i reszta dzieje się sama."
        >
          Niektóre zdarzenia są jak kostki domina: jedno przewraca następne. Zanim zajrzymy do dawnych wieków, sprawdź to
          na zwykłym poranku.
        </LessonImageCard>
        <DominoPoranka color={color} onComplete={domino.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="drukarnia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.prasa}
          alt="Akwarela: drewniana prasa drukarska z długą dźwignią w warsztacie z belkami pod sufitem; na stole skrzynka z przegródkami pełnymi drobnych czcionek, dwa skórzane tampony na trzonkach i stos czystych arkuszy papieru, przez małe okno wpada dzienne światło"
          reverse
          lead="Dwa sposoby na książkę. Zmierz je na sobie."
        >
          Kopista przy pulpicie i drukarz przy prasie robią to samo — książkę. Ty zrobisz obie rzeczy, a stoper powie, co z
          tego wynika.
        </LessonImageCard>
        <SkryptoriumDrukarnia color={color} lesson={LESSON_KEY} done={drukarnia.done} onComplete={drukarnia.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="lancuch">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.miasteczko}
          alt="Akwarela: małe średniowieczne miasteczko widziane ze wzgórza — drewniany most na palach nad spokojną rzeką, obok targ z płóciennymi straganami, workami zboża i koszami jabłek, wozy na kamiennej drodze, wysoki szachulcowy spichlerz i kamienny kościółek; ludzie w prostych średniowiecznych strojach"
          lead="Miasteczko, w którym jedno wynikało z drugiego."
        >
          Ilustracja i kronika są wymyślone — ale tak właśnie rosły prawdziwe miasta. Twoje zadanie: odtworzyć, co z czego
          wynikło.
        </LessonImageCard>
        <LancuchMiasteczka color={color} onComplete={lancuch.markBlockDone} />
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
          Historyk nie tylko pyta „co się stało?”. Pyta też <strong>„dlaczego do tego doszło?”</strong> i{' '}
          <strong>„co z tego wynikło?”</strong>. Bez tych dwóch pytań przeszłość to tylko lista dat.
        </p>
        <p className="mt-3">
          Dziś przewrócisz domino jednego poranka, zmierzysz się z kopistą i drukarzem, a potem odtworzysz dzieje
          miasteczka nad rzeką. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            każde wydarzenie ma swoje „dlaczego” i swoje „co z tego wynikło” — a skutek jednego zdarzenia bywa przyczyną
            następnego.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: mnich-kopista w brązowym habicie siedzi nocą przy pochyłym pulpicie w kamiennej celi, przy świecy; trzyma gęsie pióro nad pustą kartą pergaminu, obok kałamarz, a na półce za nim stos grubych ksiąg w skórzanych oprawach"
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
