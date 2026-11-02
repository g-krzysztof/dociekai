'use client';

import Image from 'next/image';
import { FileCheck2, Heading, Highlighter, ListOrdered, Tag } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { OutlineBuilder } from './outline-builder';
import { TitleTest } from './title-test';
import { StepShuffle } from './step-shuffle';
import { GreenOnly } from './green-only';
import { RecipeStudio } from './recipe-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Trzecia lekcja modułu 4 i dwudziesty kształt lekcji w kursie. Realizuje temat
 * „podział tekstu na części — tytuł i śródtytuły, kopiowanie fragmentów,
 * wyróżnianie kolorem” i niesie zadanie obowiązkowe **Z-10** (przepis na koktajl
 * truskawkowy, cztery podpunkty).
 *
 * Wszystkie cztery widżety pracują na **tym samym przepisie** ([recipe.ts]), czyli
 * na dokumencie, który dziecko za chwilę napisze samo — każdy blok jest próbą
 * generalną innego podpunktu zadania:
 *  - `OutlineBuilder` — podział na etapy; panel nawigacji buduje się **wyłącznie
 *    ze stylów**, a pogrubienie nie dodaje do niego nic;
 *  - `TitleTest` — czy te etapy mają sensowne tytuły; treść zostaje zasłonięta i
 *    dziecko zdaje egzamin **na własnych tytułach**;
 *  - `StepShuffle` — kolejność kroków sprawdzana **wykonaniem**, nie porównaniem
 *    z wzorcem; most do algorytmów z modułu 5;
 *  - `GreenOnly` — wyróżnianie kolorem, w którym automat dopasowuje napisy, a nie
 *    znaczenia, więc łapie o dwa słowa za dużo.
 *
 * Samo **Z-10 odbiera `RecipeStudio`** — zadanie wykonywane w lekcji
 * w `MiniWriter`, bez pliku: surowy tekst przepisu, style tytułu i śródtytułów,
 * akapity bez pustych linii i zielone przedmioty. Cztery próby generalne
 * z bloków 1–4 zamieniają się w sześć werdyktów z dokumentu, a nagrodą jest
 * **panel nawigacji zbudowany z nagłówków dziecka** — to samo okno, które
 * w bloku 1 zostawało puste po pogrubieniu.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/podzial-tekstu/przekladki-w-papierach.jpg',
  drogowskaz: '/images/informatyka/lekcje/podzial-tekstu/drogowskaz-bez-napisow.jpg',
  przepis: '/images/informatyka/lekcje/podzial-tekstu/skladniki-na-blacie.jpg',
  zakladki: '/images/informatyka/lekcje/podzial-tekstu/zielone-zakladki.jpg',
  koktajl: '/images/informatyka/lekcje/podzial-tekstu/koktajl-truskawkowy.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'panel-nawigacji',
    kind: 'haczyk',
    title: 'Pogrubienie kontra nagłówek',
    time: '7 min',
    icon: Heading,
  },
  {
    id: 'tytuly-etapow',
    kind: 'cwiczenie',
    title: '„Etap 2” nie mówi nic',
    time: '7 min',
    icon: Tag,
  },
  {
    id: 'kolejnosc-krokow',
    kind: 'symulator',
    title: 'Kucharz robi dokładnie to, co napisałeś',
    time: '6 min',
    icon: ListOrdered,
  },
  {
    id: 'zielone-przedmioty',
    kind: 'cwiczenie',
    title: 'Zielony ma znaczyć jedno',
    time: '6 min',
    icon: Highlighter,
  },
  {
    id: 'koktajl-z10',
    kind: 'zadanie',
    title: 'Przepis na koktajl truskawkowy',
    time: '15 min',
    icon: FileCheck2,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function PodzialTekstuLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zapełniłeś/zapełniłaś panel nawigacji stylami, a nie pogrubieniem, zdałeś/zdałaś egzamin na własnych tytułach z zasłoniętą treścią, doprowadziłeś/doprowadziłaś przepis do stanu, w którym da się go wykonać, i zostawiłeś/zostawiłaś na zielono dokładnie to, co trzeba. Na koniec oddałeś/oddałaś własny przepis do sprawdzenia i zobaczyłeś/zobaczyłaś swój panel nawigacji — zbudowany z twoich nagłówków, nie z moich. Zdanie do zapamiętania: dokument dzieli się na części nie dla ozdoby, tylko po to, żeby dało się do nich trafić bez czytania wszystkiego."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const outline = useBlockDone('panel-nawigacji');
  const titles = useBlockDone('tytuly-etapow');
  const steps = useBlockDone('kolejnosc-krokow');
  const green = useBlockDone('zielone-przedmioty');
  const task = useBlockDone('koktajl-z10');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="panel-nawigacji">
        <OutlineBuilder color={color} onComplete={outline.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="tytuly-etapow">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.drogowskaz}
          alt="Drewniany drogowskaz stoi na rozstaju polnych dróg, a jego dwie strzałki wskazują w przeciwne strony — obie deski są gładkie i zupełnie puste, nie ma na nich żadnego napisu"
          lead="Dwie strzałki, żadnej nazwy. Którą wybierasz?"
        >
          Dokładnie to robi czytelnikowi tytuł „Etap 2”. Strzałka jest, kierunek jest, a informacji
          nie ma żadnej. Zaraz zobaczysz, ile jest wart taki tytuł — a potem napiszesz własne.
        </LessonImageCard>
        <TitleTest color={color} onComplete={titles.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="kolejnosc-krokow">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.przepis}
          alt="Na jasnym blacie leżą przygotowane truskawki, obrany i pokrojony banan, szklany słoik jogurtu bez etykiety oraz drewniana deska z nożem"
          reverse
        >
          <p>
            Przepis to nie opowiadanie — to <strong>lista poleceń do wykonania po kolei</strong>.
            Poniżej kroki pomieszały się. Ustaw je i wciśnij „Wykonaj”: kucharz zrobi dokładnie to,
            co napisałeś/napisałaś, i nie domyśli się niczego.
          </p>
        </LessonImageCard>
        <StepShuffle color={color} onComplete={steps.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zielone-przedmioty">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zakladki}
          alt="Dwie zamknięte książki leżą obok siebie — z lewej wystają dwie zielone papierowe zakładki, a prawa jest najeżona kilkudziesięcioma zakładkami w wielu kolorach, stłoczonymi jedna przy drugiej"
          lead="Dwie zakładki prowadzą do dwóch miejsc. Pięćdziesiąt nie prowadzi nigdzie."
          reverse
        >
          Z kolorem w dokumencie jest tak samo. Za chwilę powiesz edytorowi, czego ma szukać, a on
          zaznaczy wszystkie wystąpienia naraz — i przy okazji pokaże ci, czym{' '}
          <strong>dopasowanie napisu</strong> różni się od zrozumienia zdania.
        </LessonImageCard>
        <GreenOnly color={color} onComplete={green.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="koktajl-z10">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.koktajl}
          alt="Dwie wysokie szklanki różowego koktajlu truskawkowego stoją na jasnym blacie, a obok leży kilka świeżych truskawek i dwie papierowe słomki"
        >
          <p>
            Teraz ten sam przepis, ale twój i na tej stronie. Wszystkie cztery podpunkty zadania
            właśnie przećwiczyłeś/przećwiczyłaś na tej stronie —{' '}
            <strong>zostało ułożyć je w jeden dokument</strong>.
          </p>
        </LessonImageCard>
        <RecipeStudio color={color} onComplete={task.markBlockDone} />
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
          W segregatorze z przekładkami znajdujesz sprawdzian z ułamków w dwie sekundy. W tym samym
          segregatorze bez przekładek — po dwóch minutach kartkowania. Kartki są te same.{' '}
          <strong>Różnicę robi to, że ktoś podzielił je na części i ponazywał.</strong>
        </p>
        <p className="mt-3">
          Tak samo dzieli się dłuższy tekst. W tej lekcji zobaczysz, czym nagłówek różni się od
          pogrubienia (program widzi tylko jedno z nich), sprawdzisz z zasłoniętą treścią, ile są
          warte twoje własne tytuły, każesz kucharzowi wykonać przepis dokładnie tak, jak go
          ustawisz, i wyróżnisz kolorem to — i tylko to — co naprawdę tego potrzebuje.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Gruby plik czystych kartek leży na jasnym blacie, a zza jego prawej krawędzi wystają schodkowo trzy kolorowe kartonowe przekładki — wszystkie zupełnie gładkie, bez żadnych napisów"
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
