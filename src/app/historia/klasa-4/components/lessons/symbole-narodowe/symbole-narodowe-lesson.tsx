'use client';

import Image from 'next/image';
import { Crown, Flag, HeartHandshake, Music } from 'lucide-react';
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
import { FlagaNaMaszcie } from './flaga-na-maszcie';
import { OrzelPrzezWieki } from './orzel-przez-wieki';
import { HymnLegionow } from './hymn-legionow';
import { SzacunekWPraktyce } from './szacunek-w-praktyce';
import { WiekDat } from './wiek-dat';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L10 — symbole narodowe. `[3.1]`, cel 1, filary 4 i 5. Pierwsza lekcja
 * modułu 3 (`mala-i-duza-ojczyzna`).
 *
 * **Zdanie lekcji: symbole mówią „to jesteśmy my” — i dlatego mają swoje zasady.**
 *
 * Cztery bloki, gesty nowe w kursie:
 *  - `FlagaNaMaszcie` — **odwraca flagę przeciągnięciem w pionie** (obok
 *    Monako i Indonezja w prawdziwych proporcjach), **ciągnie linkę masztu**
 *    (święto: szczyt; żałoba: szczyt, potem połowa), **obraca flagę
 *    stuknięciami** i wiesza ją w oknie (biel po lewej patrzącego);
 *  - `OrzelPrzezWieki` — **zatrzymuje suwak lat w chwili zmiany orła**
 *    (dostaje / traci / odzyskuje koronę) na prawdziwych pieczęciach i wzorach
 *    godła; pinezka „orzeł w koronie”;
 *  - `HymnLegionow` — tekst hymnu z nagraniem, paszport pieśni, **prowadzi
 *    legiony palcem po mapie** z Reggio nell'Emilia, a wersy refrenu się
 *    zapalają; pinezka „Mazurek Dąbrowskiego” (+ „hymn państwowy” z bloku);
 *  - `SzacunekWPraktyce` — **podnosi Kubę z krzesełka i zdejmuje mu czapkę**,
 *    **podnosi flagę z trawy**, **rozkłada pamiątki na dwie półki** według
 *    art. 16 ustawy.
 *
 * Przypominajka: wieki trzech dat lekcji (z L7, dystans 3). Żadnego orła ani
 * flagi z generatora — orły to prawdziwe pieczęcie i wzory urzędowe, flaga
 * rysowana kodem w proporcjach z ustawy.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/symbole-narodowe/apel.jpg',
  gniazdo: '/images/historia/lekcje/symbole-narodowe/gniazdo-orla.jpg',
  oboz: '/images/historia/lekcje/symbole-narodowe/oboz-legionow.jpg',
});

const LESSON_KEY = 'mala-i-duza-ojczyzna/symbole-narodowe';

const BLOCKS: HistBlockMeta[] = [
  { id: 'flaga', kind: 'haczyk', title: 'Flaga do góry nogami', time: '5 min', icon: Flag },
  { id: 'orzel', kind: 'os-czasu', title: 'Orzeł przez wieki', time: '5 min', icon: Crown },
  { id: 'hymn', kind: 'zrodlo', title: 'Hymn i jego droga', time: '8 min', icon: Music },
  {
    id: 'szacunek',
    kind: 'refleksja',
    title: 'Szacunek w praktyce',
    time: '5 min',
    icon: HeartHandshake,
  },
];

const L7_LESSON = getLesson('czas-i-miejsce', 'wieki-i-tysiaclecia');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function SymboleNarodoweLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Odwróciłeś/łaś flagę, która udawała Monako, wciągnąłeś/łaś ją na maszt w święto i opuściłeś/łaś do połowy w żałobie, powiesiłeś/łaś ją w oknie bielą po lewej. Zatrzymałeś/łaś suwak w chwilach, gdy orzeł dostawał, tracił i odzyskiwał koronę, wypełniłeś/łaś paszport pieśni Wybickiego i przeprowadziłeś/łaś legiony z Włoch przez Wisłę i Wartę. Na koniec podniosłeś/łaś Kubę przy hymnie i flagę z trawy. Symbole mówią „to jesteśmy my” — i dlatego mają swoje zasady."
      entry={
        L7_LESSON ? (
          <Przypominajka from={L7_LESSON} distance={3} color={histModule.color}>
            <WiekDat color={histModule.color} />
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
  const flaga = useBlockDone('flaga');
  const orzel = useBlockDone('orzel');
  const hymn = useBlockDone('hymn');
  const szacunek = useBlockDone('szacunek');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="flaga">
        <p className="mb-4 text-base leading-relaxed">
          Flaga to tylko dwa pasy: biały i czerwony. Co tu można zrobić źle? Okazuje się — sporo.
          Zacznij od flagi, którą ktoś powiesił przed szkołą.
        </p>
        <FlagaNaMaszcie color={color} onComplete={flaga.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="orzel">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.gniazdo}
          alt="Akwarela: biały orzeł z rozłożonymi skrzydłami siada na gnieździe z gałęzi na szczycie skały; w dole puszcza, niebo czerwone od zachodzącego słońca"
          lead="Biały orzeł na czerwonym niebie."
        >
          Legenda mówi, że Lech zobaczył takiego orła nad gniazdem i tam założył gród Gniezno. Ile
          w tym prawdy — sprawdzisz w lekcji o legendach. Pewne jest jedno: orzeł jest{' '}
          <strong>najstarszym polskim symbolem</strong>, a przez tysiąc lat zmieniał wygląd razem z
          państwem.
        </LessonImageCard>
        <p className="mb-4 mt-4 text-base leading-relaxed">
          Przesuwaj suwak lat — pod nim zmienia się orzeł. Każdy obraz to prawdziwe źródło:
          pieczęć, herb albo urzędowy wzór.
        </p>
        <OrzelPrzezWieki
          color={color}
          lesson={LESSON_KEY}
          done={orzel.done}
          onComplete={orzel.markBlockDone}
        />
      </LessonBlock>

      <LessonBlock id="hymn">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.oboz}
          alt="Akwarela: wieczorny obóz żołnierzy w granatowych mundurach przy ognisku, jeden czyta kartkę; namioty, karabiny ustawione w kozioł, włoskie wzgórza z cyprysami i zachód słońca"
          lead="Włochy, lato 1797 roku."
          reverse
        >
          Polski od dwóch lat nie ma na mapie. Daleko od domu, we Włoszech, walczą polskie legiony
          generała Dąbrowskiego. Ich żołnierz i poeta pisze dla nich pieśń. Ilustracja pokazuje,
          jak mógł wyglądać taki wieczór — <strong>źródłem jest sama pieśń</strong>.
        </LessonImageCard>
        <div className="mt-4">
          <HymnLegionow
            color={color}
            lesson={LESSON_KEY}
            done={hymn.done}
            onComplete={hymn.markBlockDone}
          />
        </div>
      </LessonBlock>

      <LessonBlock id="szacunek">
        <p className="mb-4 text-base leading-relaxed">
          Szacunek dla symboli to nie uczucie, które trzeba udawać. To kilka prostych zachowań —
          i każde z nich ma swoje źródło w prawie. Trzy sytuacje, trzy ruchy.
        </p>
        <SzacunekWPraktyce color={color} onComplete={szacunek.markBlockDone} />
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
          Na szkolnym apelu wszyscy wstają, gdy gra hymn. Nad wejściem wisi orzeł, w oknach — flagi.
          Widzisz je tak często, że łatwo przestać je zauważać.
        </p>
        <p className="mt-3">
          Dziś powiesisz flagę na trzy sposoby, przejdziesz z orłem przez tysiąc lat i poprowadzisz
          legiony szlakiem z hymnu. Wszystko stoi na jednym zdaniu:{' '}
          <strong>symbole mówią „to jesteśmy my” — i dlatego mają swoje zasady.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: szkolny dziedziniec jesienią, dzieci w białych koszulach i granatowych spódnicach i spodniach stoją w równych rzędach na apelu, przed nimi nauczycielka; ceglana szkoła i żółte drzewa"
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
