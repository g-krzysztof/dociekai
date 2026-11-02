'use client';

import Image from 'next/image';
import { BookOpen, HardDrive, ImageIcon, Layers, ListChecks } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { PhotoWeightHook } from './photo-weight-hook';
import { ByteLadder } from './byte-ladder';
import { MediaFit } from './media-fit';
import { SourceScan } from './source-scan';
import { WhereMyFiles } from './where-my-files';
import { FloppyPour } from './floppy-pour';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o nośnikach danych — i piąty różny kształt lekcji w kursie. Niesie
 * zadanie obowiązkowe Z-1 (porównanie pojemności dyskietek z CD, DVD, BD),
 * więc cała lekcja prowadzi do niego: od „ile waży zdjęcie” (haczyk), przez
 * jednostki (wyjaśnienie) i porównanie nośników (symulator), po ćwiczenie
 * wyłuskiwania faktów z dwóch źródeł (bo Z-1 każe szukać „w różnych źródłach”).
 * Zamyka refleksja o kopii zapasowej.
 *
 * Kształt: haczyk → wyjaśnienie → symulator → wyszukiwanie w źródłach →
 * zadanie praktyczne [Z-1] → refleksja. Dwa bloki są bez ilustracji: jednostki
 * są abstrakcyjne, a blok źródeł niesie własny tekst do czytania.
 *
 * Z-1 dzieje się **w całości w lekcji** (`FloppyPour`): dziecko wybiera dwie
 * dyskietki z pojemnościami ze źródeł bloku wyżej, sypie je do płyt CD, DVD i
 * Blu-ray przytrzymanym przyciskiem, a potem uzupełnia notatkę w makiecie
 * edytora — każdy punkt jest sprawdzany. Wcześniejsza wersja (szukanie w sieci,
 * dzielenie na kalkulatorze, plik z Notatnika wrzucany do sprawdzenia) była dla
 * dziesięciolatka za trudna i została zastąpiona 2026-09-16.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/nosniki-danych/od-dyskietki-po-chmure.jpg',
  zdjecie: '/images/informatyka/lekcje/nosniki-danych/telefon-i-dyskietka.jpg',
  plyta: '/images/informatyka/lekcje/nosniki-danych/dyskietka-i-plyta.jpg',
  notatka: '/images/informatyka/lekcje/nosniki-danych/spostrzezenia-w-punktach.jpg',
  kopia: '/images/informatyka/lekcje/nosniki-danych/dysk-obok-laptopa.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'zdjecie',
    kind: 'haczyk',
    title: 'Ile „waży” jedno zdjęcie z telefonu?',
    time: '4 min',
    icon: ImageIcon,
  },
  {
    id: 'drabinka',
    kind: 'wyjasnienie',
    title: 'Bit, bajt i drabinka do terabajta',
    time: '6 min',
    icon: Layers,
  },
  {
    id: 'nosniki',
    kind: 'symulator',
    title: 'Co się na czym zmieści',
    time: '7 min',
    icon: HardDrive,
  },
  {
    id: 'zrodla',
    kind: 'zrodla',
    title: 'Dwa źródła, różne liczby',
    time: '5 min',
    icon: BookOpen,
  },
  {
    id: 'zadanie-z1',
    kind: 'zadanie',
    title: 'Zadanie Z-1: ile dyskietek zmieści płyta',
    time: '10 min',
    icon: ListChecks,
  },
  {
    id: 'kopia',
    kind: 'refleksja',
    title: 'Gdzie leży to, czego nie chcesz stracić',
    time: '3 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function NosnikiDanychLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Nośniki się zmieniają — dyskietka, płyta, pendrive, chmura — ale jedno zostaje: plik istnieje naprawdę dopiero wtedy, gdy ma drugą kopię w innym miejscu."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const hook = useBlockDone('zdjecie');
  const ladder = useBlockDone('drabinka');
  const media = useBlockDone('nosniki');
  const sources = useBlockDone('zrodla');
  const task = useBlockDone('zadanie-z1');
  const backup = useBlockDone('kopia');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="zdjecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zdjecie}
          alt="Smartfon z wyświetlonym zdjęciem krajobrazu leży obok kwadratowej dyskietki 3,5 cala z pustą białą naklejką"
          lead="Jedno dzisiejsze zdjęcie nie zmieściłoby się na jednej takiej dyskietce."
        >
          Najpierw zgadnij, ile „waży” zdjęcie z twojego telefonu. Potem zobaczysz to zestawione z
          dyskietką sprzed trzydziestu lat — i zrozumiesz, po co komu jednostki z następnego bloku.
        </LessonImageCard>
        <PhotoWeightHook color={color} onComplete={hook.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="drabinka">
        <ByteLadder color={color} onComplete={ladder.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="nosniki">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.plyta}
          alt="Zbliżenie: kwadratowa dyskietka 3,5 cala z pustą białą naklejką leży na srebrnej, błyszczącej płycie bez żadnego nadruku"
        >
          <p>
            Ta sama informacja — twoje pliki — mieści się na różnych nośnikach w bardzo różnej
            ilości. <strong>Dobierz nośnik</strong> do tego, co chcesz zapisać, i policz, ile się na
            nim zmieści.
          </p>
        </LessonImageCard>
        <MediaFit color={color} onComplete={media.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zrodla">
        <SourceScan color={color} onComplete={sources.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zadanie-z1">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.notatka}
          alt="Dłoń wpisuje krótkie punkty w zeszyt w kropki, obok leżą dyskietka i srebrna płyta"
          lead="Teraz twoja kolej: sprawdź, ile dyskietek zmieści jedna płyta."
          reverse
        >
          To jest zadanie obowiązkowe kursu, ale nie musisz nigdzie wychodzić. Nasypiesz dyskietek
          do płyt, a potem zapiszesz w notatce, co zauważysz.
        </LessonImageCard>
        <FloppyPour color={color} onComplete={task.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="kopia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.kopia}
          alt="Mały przenośny dysk zewnętrzny podłączony krótkim kablem do zamkniętego laptopa na drewnianym biurku"
          reverse
        >
          <p>
            Nośniki poznane, liczby policzone. Zostaje najważniejsze pytanie: co z{' '}
            <strong>twoimi</strong> plikami? Gdzie leży teraz to, czego naprawdę nie chcesz stracić?
          </p>
        </LessonImageCard>
        <WhereMyFiles color={color} onComplete={backup.markBlockDone} />
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
          Trzydzieści lat temu twój plik z pracą domową jechał do szkoły na{' '}
          <strong>dyskietce</strong>, która mieściła jedną stronę zdjęć albo żadnego. Dziś ten sam
          plik leży w <strong>chmurze</strong>, której limitu prawie nie widać.
        </p>
        <p className="mt-3">
          Ta lekcja jest o tej drodze: jak mierzy się „ile waży” plik, ile mieściły kolejne nośniki
          i co to znaczy dla ciebie, gdy chcesz czegoś nie stracić. Po drodze zrobisz{' '}
          <strong>zadanie obowiązkowe Z-1</strong> — porównasz pojemność dyskietek z płytami.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Rząd nośników danych na drewnianym stole, od najstarszego: kwadratowa dyskietka, srebrna płyta CD, płyta DVD, mały pendrive i przenośny dysk zewnętrzny — wszystkie bez naklejek i napisów"
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
