'use client';

import Image from 'next/image';
import { ArrowLeftRight, Cable, Cpu, Target } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { SignalSort } from './signal-sort';
import { IoMap } from './io-map';
import { PickForTask } from './pick-for-task';
import { UseItRight } from './use-it-right';
import { DeskWiring } from './desk-wiring';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o zestawie komputerowym — i czwarty różny kształt lekcji w tym kursie.
 * Nowa podstawa skreśliła osobne „opisuje funkcje elementów komputera”; został
 * `[4.1]`: korzystać z urządzeń cyfrowych celowo i bezpiecznie. Dlatego lekcja
 * nie jest wyliczanką części, tylko ćwiczeniem jednej różnicy — którędy przez
 * urządzenie płynie informacja — i dobierania sprzętu do zadania.
 *
 * Kształt: haczyk (podziel sześć urządzeń na dwie grupy) → wyjaśnienie (te same
 * pojęcia na całym zestawie, plus urządzenia dwukierunkowe) → ćwiczenie (dobierz
 * urządzenie do zadania z życia) → zadanie praktyczne (podłącz własny zestaw
 * kablami) → refleksja (jeden nawyk do poprawy). Bez symulatora i bez
 * quizu — temat jest o decyzjach, nie o wiedzy do odpytania.
 *
 * Zadanie praktyczne dzieje się **w całości w lekcji** (`DeskWiring`): dziecko
 * zbiera swój zestaw z półki i wpina każdemu urządzeniu kabel po stronie
 * wejść albo wyjść — a dwukierunkowym dwa. To dalej jest odpowiedź, którą da
 * się porównać z prawdą (więc nie odhaczamy niczego sami), tylko bez wyjścia
 * do edytora tekstu i bez pliku: wersję z plikiem użytkownik odrzucił
 * 2026-09-19 jako za trudną dla dziesięciolatka i zbyt kruchą.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/zestaw-komputerowy/zestaw-na-biurku.jpg',
  porty: '/images/informatyka/lekcje/zestaw-komputerowy/gniazda-z-tylu.jpg',
  urzadzenia: '/images/informatyka/lekcje/zestaw-komputerowy/urzadzenia-peryferyjne.jpg',
  spis: '/images/informatyka/lekcje/zestaw-komputerowy/spis-zestawu.jpg',
  kable: '/images/informatyka/lekcje/zestaw-komputerowy/kable-pod-biurkiem.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'grupy',
    kind: 'haczyk',
    title: 'Podziel te urządzenia na dwie grupy',
    time: '5 min',
    icon: ArrowLeftRight,
  },
  {
    id: 'mapa',
    kind: 'wyjasnienie',
    title: 'Wejście, wyjście i to, co pośrodku',
    time: '6 min',
    icon: Cpu,
  },
  {
    id: 'dobierz',
    kind: 'cwiczenie',
    title: 'Dobierz urządzenie do zadania',
    time: '6 min',
    icon: Target,
  },
  {
    /*
     * Identyfikator z pierwszej wersji bloku (spis w pliku). Zostaje mimo
     * zmiany zadania: po identyfikatorach liczy się postęp zapisany u dziecka,
     * a zmiana nazwy skasowałaby ukończony blok każdemu, kto zrobił tę lekcję
     * wcześniej.
     */
    id: 'spis',
    kind: 'zadanie',
    title: 'Podłącz swój własny zestaw',
    time: '8 min',
    icon: Cable,
  },
  {
    id: 'nawyk',
    kind: 'refleksja',
    title: 'Jeden nawyk, który poprawiasz',
    time: '2 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function ZestawKomputerowyLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zestaw jest tyle wart, ile świadomości przy nim: wiesz, którędy płynie informacja, dobierasz urządzenie do zadania i nie niszczysz sprzętu przez pośpiech."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const sort = useBlockDone('grupy');
  const map = useBlockDone('mapa');
  const pick = useBlockDone('dobierz');
  const practice = useBlockDone('spis');
  const habit = useBlockDone('nawyk');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="grupy">
        <SignalSort color={color} onComplete={sort.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="mapa">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.porty}
          alt="Zbliżenie tylnej ścianki komputera stacjonarnego: rząd różnych gniazd i wtyczek z podłączonymi kablami w kilku kolorach"
          lead="Każdy kabel z tyłu komputera to jedna droga informacji — w tę albo w tamtą stronę."
        >
          Z przodu widzisz urządzenia, z tyłu miejsca, w które są wpięte. Stuknij po kolei każde
          urządzenie na schemacie i sprawdź, do której grupy należy.
        </LessonImageCard>
        <IoMap color={color} onComplete={map.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="dobierz">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.urzadzenia}
          alt="Kilka urządzeń peryferyjnych ułożonych obok siebie na jasnym blacie: słuchawki z mikrofonem, mała drukarka, kamera internetowa i pendrive"
          reverse
        >
          <p>
            Do każdego z pięciu zadań pasuje <strong>jedno</strong> urządzenie — to, bez którego
            zadania po prostu nie da się wykonać. Zła odpowiedź nie zamyka pytania; spróbujesz
            jeszcze raz.
          </p>
        </LessonImageCard>
        <PickForTask color={color} onComplete={pick.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="spis">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.spis}
          alt="Otwarty zeszyt na biurku z odręcznym schematem z prostokątów i strzałek, obok ołówek i zamknięty laptop"
          lead="Teraz to samo, co na schemacie, ale dla twojego własnego sprzętu."
          reverse
        >
          Zbierz zestaw, którego naprawdę używasz, i <strong>wepnij każdemu urządzeniu kabel</strong>{' '}
          po tej stronie, po której płynie przez nie informacja. Sprawdzę każdy kabel z osobna —
          a przy niektórych urządzeniach jeden nie wystarczy.
        </LessonImageCard>
        <DeskWiring color={color} onComplete={practice.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="nawyk">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.kable}
          alt="Zwinięte w schludną pętlę kable pod biurkiem, spięte materiałową opaską przy nodze biurka, z dala od miejsca na stopy"
        >
          <p>
            Wiedza o urządzeniach przydaje się dopiero wtedy, gdy zmienia coś przy twoim biurku.
            Wybierz <strong>jedną</strong> rzecz z listy i to ją poprawiasz od dziś.
          </p>
        </LessonImageCard>
        <UseItRight color={color} onComplete={habit.markBlockDone} />
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
          Zestaw komputerowy to nie lista części do zapamiętania. To kilka urządzeń, przez które
          <strong> informacja płynie w jedną albo w drugą stronę</strong>: jedne coś komputerowi
          podają, inne coś przez nie oddaje tobie, a pośrodku jest część, która wszystko spina.
        </p>
        <p className="mt-3">
          Kiedy znasz tę różnicę, przestajesz zgadywać. Wiesz, czego użyć, żeby zeskanować rysunek,
          nagrać głos albo zabrać pracę do szkoły — i wiesz, czego <strong>nie</strong> robić, żeby
          nie zepsuć sprzętu.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Kompletne stanowisko komputerowe na drewnianym biurku: monitor z małą kamerką na górze, klawiatura i mysz, głośniki po bokach, jednostka centralna na podłodze i mała drukarka z boku"
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
