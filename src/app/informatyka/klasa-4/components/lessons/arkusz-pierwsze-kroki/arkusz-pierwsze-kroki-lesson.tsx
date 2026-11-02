'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BarChart3, FileSpreadsheet, Hand, MousePointerClick, Skull } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { DeadNumbers } from './dead-numbers';
import { PointFormula } from './point-formula';
import { ChartRange } from './chart-range';
import { TapData } from './tap-data';
import { SheetStudio } from './sheet-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Pierwsza lekcja modułu 7 i trzydziesty kształt lekcji w kursie. Realizuje
 * „pierwsze kroki w arkuszu kalkulacyjnym” `[3.2]` na poziomie wprowadzającym:
 * tabela, proste obliczenie, prosty wykres i wniosek z danych. Bez zadania
 * obowiązkowego.
 *
 * **Cała lekcja stoi na jednym rozróżnieniu: w komórce arkusza widać wynik, a
 * siedzi w niej przepis.** Tabelę z kratkami ma każdy edytor tekstu; arkusz jest
 * czymś innym dopiero dlatego, że liczba może pamiętać, *skąd* się wzięła. Stąd
 * pięć bloków, każdy z innym gestem, a nie z innym tematem:
 *
 *  - `DeadNumbers` — **śledztwo przez zmianę danych**: dwie sumy są wpisane z
 *    ręki, wyglądają identycznie jak formuły i wychodzą na jaw dopiero, gdy
 *    dziecko zmieni liczby i zobaczy, co nie mrugnęło;
 *  - `PointFormula` — **uchwyt wypełniania i wskazywanie komórek**: formuła
 *    z liczbami skopiowana w dół daje wszędzie 12 zł, formuła z adresami — pięć
 *    różnych, poprawnych wyników;
 *  - `ChartRange` — **wykres rysowany z zaznaczenia na żywo**, trzy reklamacje
 *    (słupek „Razem”, brak podpisów, koło zamiast linii) i zdanie „co wyczyta
 *    czytelnik” zmieniające się razem z zaznaczeniem;
 *  - `TapData` — **dane z własnej ręki**: stukanie przez pięć sekund, średnie
 *    formułą i wniosek pisany wolnym tekstem, sprawdzany z liczbami dziecka;
 *  - `SheetStudio` — ten sam eksperyment złożony w jeden arkusz **na stronie**
 *    (edytor z bloku 2, wykres z bloku 3), a w nagrodę **arkusz dziecka liczony na
 *    nowo** — stuka w pomiar i patrzy, czy jego średnie i wykres to zauważą.
 *
 * Pomiary z bloku 4 żyją tutaj, w `LessonBody` (nad blokami), żeby zadanie w
 * bloku 5 mogło je podać dziecku — ten sam wzorzec co rysunek z lekcji 13.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/arkusz-pierwsze-kroki/skrzynka-na-rozsady.jpg',
  okno: '/images/informatyka/lekcje/arkusz-pierwsze-kroki/okno-i-obraz.jpg',
  sloiki: '/images/informatyka/lekcje/arkusz-pierwsze-kroki/sloiki-z-nakretkami.jpg',
  framuga: '/images/informatyka/lekcje/arkusz-pierwsze-kroki/kreski-na-framudze.jpg',
  karb: '/images/informatyka/lekcje/arkusz-pierwsze-kroki/karb-z-nacieciami.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'martwe-liczby',
    kind: 'haczyk',
    title: 'Dwie liczby, które kłamią',
    time: '5 min',
    icon: Skull,
  },
  {
    id: 'formula-z-adresow',
    kind: 'wyjasnienie',
    title: 'Formuła, która wie, skąd brać liczby',
    time: '6 min',
    icon: MousePointerClick,
  },
  {
    id: 'wykres-z-zaznaczenia',
    kind: 'debugowanie',
    title: 'Wykres, który odpowiada źle',
    time: '5 min',
    icon: BarChart3,
  },
  {
    id: 'twoje-dane',
    kind: 'cwiczenie',
    title: 'Twoje dane, twój wniosek',
    time: '6 min',
    icon: Hand,
  },
  {
    id: 'twoj-arkusz',
    kind: 'zadanie',
    title: 'Zadanie: twój pierwszy arkusz',
    time: '10 min',
    icon: FileSpreadsheet,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function ArkuszPierwszeKrokiLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zabierz z tej lekcji trzy zdania. Liczba wpisana z ręki jest prawdziwa tylko w dniu, w którym ją wpisano — formuła pamięta, skąd wzięła wynik. Wykres pokazuje to, co zaznaczysz, a nie to, co masz na myśli. A wniosek, choć arkusz policzy wszystko, zawsze musi napisać człowiek."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const hook = useBlockDone('martwe-liczby');
  const formula = useBlockDone('formula-z-adresow');
  const chart = useBlockDone('wykres-z-zaznaczenia');
  const data = useBlockDone('twoje-dane');
  const task = useBlockDone('twoj-arkusz');
  const [results, setResults] = useState<number[] | null>(null);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="martwe-liczby">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.okno}
          alt="Na jasnej ścianie małe okno, a za szybą szary, deszczowy ogród; tuż obok okna wisi oprawiony obraz przedstawiający ten sam ogród w pełnym słońcu"
          lead="Obraz był prawdziwy w dniu, w którym go namalowano. Za oknem od tamtej pory padało już sto razy."
        >
          Liczba wpisana do arkusza z ręki jest takim obrazem: wygląda dokładnie jak wynik, dopóki świat się nie zmieni.
          Formuła jest oknem. <strong>Z daleka ich nie odróżnisz</strong> — trzeba coś zmienić i popatrzeć.
        </LessonImageCard>
        <DeadNumbers color={color} onComplete={hook.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="formula-z-adresow">
        <PointFormula color={color} onComplete={formula.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wykres-z-zaznaczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.sloiki}
          alt="Na jasnym blacie stoi rząd czterech małych szklanych słoików z różną ilością kolorowych nakrętek, a na końcu tego samego rzędu jeden dużo większy słoik wypełniony nakrętkami prawie po brzegi"
          reverse
        >
          <p>
            Ostatni słoik jest największy — ale nie dlatego, że ktoś zebrał najwięcej. Wsypano do niego{' '}
            <strong>wszystkie pozostałe</strong>. Postawiony w jednym rzędzie z nimi robi z nich karzełki. Program rysujący
            wykres nie wie, który wiersz tabeli jest takim słoikiem; <strong>wie tylko to, co zaznaczysz</strong>.
          </p>
        </LessonImageCard>
        <ChartRange color={color} onComplete={chart.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="twoje-dane">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.framuga}
          alt="Pomalowana na biało drewniana framuga drzwi, a na niej kilka krótkich poziomych kresek ołówkiem na różnych wysokościach, jedna nad drugą; na podłodze pod framugą leży ołówek"
          lead="Najciekawsze dane to te, których nikt przed tobą nie zebrał."
        >
          Kreski na framudze mówią więcej niż jedno mierzenie: widać z nich, <strong>jak coś się zmienia</strong>. Teraz
          zmierzysz siebie — i sam/sama wyciągniesz z tych liczb wniosek, którego nikt nie napisał za ciebie.
        </LessonImageCard>
        <TapData color={color} onData={setResults} onComplete={data.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="twoj-arkusz">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.karb}
          alt="Dwie połówki starego drewnianego patyka rozłupanego wzdłuż leżą złożone obok siebie na jasnym lnianym płótnie; wzdłuż miejsca, w którym się stykają, biegnie rząd nacięć, a każde wcięcie w jednej połówce trafia dokładnie naprzeciw wcięcia w drugiej"
        >
          <p>
            Zanim ludzie pisali, liczby zapisywali nacięciami na patyku — <strong>karbie</strong>. Patyk rozłupywano na pół i
            każda strona brała swoją połówkę, żeby każdy mógł sprawdzić, czy nikt nie dorobił nacięcia. Twój arkusz ma działać
            tak samo: <strong>każdy wynik i każdy wniosek da się sprawdzić w liczbach</strong>, z których powstał.
          </p>
        </LessonImageCard>
        {/* Klucz po pomiarach: nowe stukanie w bloku 4 daje w arkuszu nowe liczby, a nie stare. */}
        <SheetStudio
          key={results ? results.join(',') : 'przykład'}
          color={color}
          results={results}
          onComplete={task.markBlockDone}
        />
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
          Arkusz kalkulacyjny wygląda jak zwykła tabela z kratek. Różnica jest ukryta w środku: w kratce może stać nie liczba,
          tylko <strong>przepis na liczbę</strong> — „weź te trzy komórki i dodaj”. Zmienisz jedną liczbę, a przeliczy się
          wszystko, co od niej zależy.
        </p>
        <p className="mt-3">
          W tej lekcji znajdziesz liczby, które tylko udają wyniki, napiszesz formułę, która wie, skąd brać dane, naprawisz
          trzy wykresy, które odpowiadają źle — a na końcu <strong>zmierzysz siebie</strong> i z własnych pomiarów wyciągniesz
          wniosek.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Płytka drewniana skrzynka podzielona na szesnaście równych kwadratowych przegródek w czterech rzędach i czterech kolumnach; w większości leżą kupki suszonej fasoli różnych odmian i kolorów, a pięć przegródek jest pustych"
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
