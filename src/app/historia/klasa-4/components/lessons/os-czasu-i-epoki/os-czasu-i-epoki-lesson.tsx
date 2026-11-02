'use client';

import Image from 'next/image';
import { BarChart3, Clock, Flag, Spline } from 'lucide-react';
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
import { ZegarLudzkosci } from './zegar-ludzkosci';
import { SznurekIEpoki } from './sznurek-i-epoki';
import { BelkiEpok } from './belki-epok';
import { KoniecSredniowiecza } from './koniec-sredniowiecza';
import { LisieccyPoKolei } from './lisieccy-po-kolei';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L6 — oś czasu i epoki. `[4.1]` `[4.3]`, filar 2.
 *
 * **Zdanie lekcji: na osi czasu liczy się kolejność — a im bliżej dziś, tym
 * gęściej od wydarzeń i tym krótsze epoki.**
 *
 * Cztery bloki, gesty nowe w kursie:
 *  - `ZegarLudzkosci` — **kręci wskazówką zegara-doby** (300 000 lat = 24 h)
 *    i przybliża ostatnią godzinę, potem minutę;
 *  - `SznurekIEpoki` — karty na sznurku w kolejności, potem w prawdziwej skali,
 *    i **przesuwa granice epok** na wydarzenia graniczne (pinezki pismo / 476 /
 *    1492 / 1918 na Osi dziejów);
 *  - `BelkiEpok` — **szacuje długości epok belkami**, potem porównuje;
 *  - `KoniecSredniowiecza` — **wbija flagę** w swoją granicę średniowiecza
 *    i podaje powód, który musi pasować do karty.
 *
 * Przypominajka wraca do drzewa Lisieckich z L5 (dystans 1).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/os-czasu-i-epoki/piramidy-o-zmierzchu.jpg',
  zamek: '/images/historia/lekcje/os-czasu-i-epoki/zamek-na-wzgorzu.jpg',
  rakieta: '/images/historia/lekcje/os-czasu-i-epoki/start-rakiety.jpg',
  zaglowce: '/images/historia/lekcje/os-czasu-i-epoki/trzy-zaglowce.jpg',
});

const LESSON_KEY = 'czas-i-miejsce/os-czasu-i-epoki';

const BLOCKS: HistBlockMeta[] = [
  { id: 'zegar', kind: 'haczyk', title: 'Dzieje ludzkości w jedną dobę', time: '4 min', icon: Clock },
  { id: 'epoki', kind: 'os-czasu', title: 'Pierwsza prawdziwa oś', time: '8 min', icon: Spline },
  { id: 'belki', kind: 'cwiczenie', title: 'Ile trwała epoka?', time: '5 min', icon: BarChart3 },
  { id: 'granica', kind: 'refleksja', title: 'Kiedy skończyło się średniowiecze?', time: '4 min', icon: Flag },
];

const L5_LESSON = getLesson('warsztat-historyka', 'historia-mojej-rodziny');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function OsCzasuIEpokiLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Nakręciłeś/łaś zegar dziejów i zobaczyłeś/łaś, że cała pisana historia mieści się w ostatnich minutach doby. Ułożyłeś/łaś wydarzenia w porządku chronologicznym, rozciągnąłeś/łaś je do prawdziwej skali, wyznaczyłeś/łaś granice pięciu epok, oszacowałeś/łaś ich długości i wybrałeś/łaś własny koniec średniowiecza — z powodem. Na osi liczy się kolejność, a im bliżej dziś, tym gęściej od wydarzeń i tym krótsze epoki."
      entry={
        L5_LESSON ? (
          <Przypominajka from={L5_LESSON} distance={1} color={histModule.color}>
            <LisieccyPoKolei color={histModule.color} />
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
  const zegar = useBlockDone('zegar');
  const epoki = useBlockDone('epoki');
  const belki = useBlockDone('belki');
  const granica = useBlockDone('granica');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="zegar">
        <p className="mb-4 text-base leading-relaxed">
          Ludzie żyją na Ziemi od około 300 000 lat. To liczba tak wielka, że nic nie mówi. Zmieśćmy więc całe dzieje
          ludzkości w jednej dobie: o północy pojawiają się pierwsi ludzie, a następna północ to dzisiaj.
        </p>
        <ZegarLudzkosci color={color} onComplete={zegar.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="epoki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zamek}
          alt="Akwarela: jasny kamienny zamek z wysoką okrągłą wieżą na skalistym, zielonym wzgórzu; w dolinie rzeka, pola i małe miasteczko, w tle łagodne góry"
          lead="Oś czasu czyta się od lewej do prawej."
        >
          Najstarsze wydarzenia stoją po lewej, najnowsze po prawej — to jest <strong>porządek chronologiczny</strong>. Ułóż
          sześć kart na sznurku, rozciągnij je do prawdziwej skali, a potem podziel oś na epoki.
        </LessonImageCard>
        <div className="mt-4">
          <SznurekIEpoki color={color} lesson={LESSON_KEY} done={epoki.done} onComplete={epoki.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="belki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.rakieta}
          alt="Akwarela: daleko za zatoką startuje rakieta, zostawiając za sobą wysoką białą smugę dymu; na pierwszym planie łąka z trawą, stokrotkami i łubinem"
          reverse
          lead="Współczesność wciąż trwa."
        >
          Każda epoka ma swój początek i koniec — oprócz ostatniej, w której żyjesz ty. Sprawdź, czy wyczuwasz, ile lat
          trwała każda z nich.
        </LessonImageCard>
        <div className="mt-4">
          <BelkiEpok color={color} onComplete={belki.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="granica">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zaglowce}
          alt="Akwarela: trzy drewniane żaglowce z białymi żaglami płyną po szerokim, falującym oceanie pod niebem z obłokami"
          lead="Jedna granica, cztery kandydatury."
        >
          Na naszej osi średniowiecze kończy się w 1492 roku, gdy okręty Kolumba docierają do Ameryki. Ale czy to jedyna
          możliwa granica?
        </LessonImageCard>
        <div className="mt-4">
          <KoniecSredniowiecza color={color} onComplete={granica.markBlockDone} />
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
          Piramidy w Egipcie i twoje urodziny dzieli kilka tysięcy lat. Jak pokazać tyle czasu na jednej kartce? Służy
          do tego <strong>oś czasu</strong> — a nauka o mierzeniu czasu i porządkowaniu wydarzeń to{' '}
          <strong>chronologia</strong>.
        </p>
        <p className="mt-3">
          Dziś zmieścisz dzieje ludzkości w jednej dobie, ułożysz wydarzenia na osi, podzielisz ją na epoki i sprawdzisz,
          ile każda trwała. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            na osi czasu liczy się kolejność — a im bliżej dziś, tym gęściej od wydarzeń i tym krótsze epoki.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: trzy piramidy w Gizie o zmierzchu, wokół pusta piaszczysta pustynia, nisko nad horyzontem zachodzi słońce"
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
