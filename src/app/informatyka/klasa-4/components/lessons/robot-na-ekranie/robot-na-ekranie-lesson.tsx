'use client';

import Image from 'next/image';
import { Car, EyeOff, FlaskConical, PackageCheck, PenLine } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { BlindDrive } from './blind-drive';
import { LineDraw } from './line-draw';
import { TwoBodies } from './two-bodies';
import { TrackLab } from './track-lab';
import { RobotStudio } from './robot-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Piąta lekcja modułu 6 i dwudziesty ósmy kształt lekcji w kursie. Realizuje
 * temat „sterowanie robotem na ekranie (albo fizycznym, jeśli jest dostępny)”
 * `[2.4]`. Bez zadania obowiązkowego — zamówienie jest autorskie.
 *
 * **Cała lekcja stoi na jednym pytaniu: skąd robot wie, gdzie jest?** Odpowiedź
 * ma dwa warianty i oba są w kursie potrzebne: można **odliczyć kroki** albo
 * **zapytać czujnika**. Pierwszy działa, dopóki świat jest dokładnie ten, pod
 * który go napisano; drugi działa zawsze, ale wymaga zrozumienia pętli z
 * warunkiem, czyli tego, czego uczy lekcja poprzednia.
 *
 * Dlatego bloki nie tłumaczą tej różnicy — **dają ją przeżyć czterema różnymi
 * drogami**:
 *  - `BlindDrive` — dziecko jest robotem: prowadzi go po niewidocznym torze,
 *    mając tylko jedną lampkę czujnika. Jedyny blok kursu, w którym *człowiek*
 *    wykonuje program;
 *  - `LineDraw` — **rysuje własną trasę palcem** i patrzy, jak przejeżdża ją ten
 *    sam program, który nic o niej nie wie;
 *  - `TwoBodies` — układa plan i puszcza go **w dwa ciała naraz**; koła się
 *    ślizgają, ekran nie, a błąd narasta z każdym poleceniem `[2.4]`;
 *  - `TrackLab` — **doświadczenie na cztery przejazdy**: dwa programy razy dwa
 *    tory, wniosek wypada z tabelki, nie z akapitu;
 *  - `RobotStudio` — zadanie **na stronie**: skrypt robota w edytorze z lekcji 27,
 *    a werdykt uruchamia go na trzech metach; o zatrzymaniu musi decydować
 *    czujnik, bo licznik trafia najwyżej w jedną.
 *
 * Świat robota jest **osobny od silnika Scratcha** (`robot.ts`) i to jest w tej
 * lekcji konieczne: `run()` liczy przebieg z góry, a tu wszystko zależy od tego,
 * co czujnik widzi w danej chwili na rysunku, którego przed uruchomieniem nie
 * było. Klocki obok są rysunkiem tego programu (`loop-stack.tsx`), nie jego
 * wykonaniem — liczby w obu muszą się zgadzać.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/robot-na-ekranie/tasma-z-dziurkami.jpg',
  klucz: '/images/informatyka/lekcje/robot-na-ekranie/dziurka-od-klucza.jpg',
  kreda: '/images/informatyka/lekcje/robot-na-ekranie/kreda-i-linia.jpg',
  wozek: '/images/informatyka/lekcje/robot-na-ekranie/wozek-i-slady.jpg',
  labirynt: '/images/informatyka/lekcje/robot-na-ekranie/labirynt-z-kulka.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'na-slepo',
    kind: 'haczyk',
    title: 'Prowadź na ślepo',
    time: '6 min',
    icon: EyeOff,
  },
  {
    id: 'twoja-trasa',
    kind: 'symulator',
    title: 'Narysuj trasę, robot ją przejedzie',
    time: '6 min',
    icon: PenLine,
  },
  {
    id: 'dwa-ciala',
    kind: 'pokaz',
    title: 'Ten sam plan, dwa ciała',
    time: '5 min',
    icon: Car,
  },
  {
    id: 'cztery-przejazdy',
    kind: 'cwiczenie',
    title: 'Cztery przejazdy',
    time: '5 min',
    icon: FlaskConical,
  },
  {
    id: 'robot-i-meta',
    kind: 'zadanie',
    title: 'Zadanie: robot i meta',
    time: '8 min',
    icon: PackageCheck,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function RobotNaEkranieLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zapamiętaj jedno pytanie, bo wraca przy każdym robocie: skąd on wie, gdzie jest? Odliczone kroki są proste i działają dokładnie tak długo, jak długo świat wygląda tak, jak wtedy, gdy je liczyłeś/liczyłaś. Czujnik jest trudniejszy do napisania i nie potrzebuje wiedzieć o świecie nic z góry — dlatego prawie każdy prawdziwy robot patrzy, zamiast liczyć."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const hook = useBlockDone('na-slepo');
  const draw = useBlockDone('twoja-trasa');
  const bodies = useBlockDone('dwa-ciala');
  const lab = useBlockDone('cztery-przejazdy');
  const task = useBlockDone('robot-i-meta');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="na-slepo">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.klucz}
          alt="Zbliżenie starej mosiężnej tarczy zamka wpuszczonej w drewniane drzwi, z małym ciemnym otworem na klucz pośrodku; drewno jest surowe i widać jego słoje"
          lead="Przez taką dziurkę widać jeden wycinek pokoju i ani centymetra więcej."
        >
          Robot ma dokładnie tyle. Nie widzi planszy, nie wie, gdzie jest meta — ma{' '}
          <strong>jeden czujnik</strong>, który odpowiada na jedno pytanie. W tym bloku to ty będziesz
          programem i przekonasz się, ile da się z tego wycisnąć.
        </LessonImageCard>
        <BlindDrive color={color} onComplete={hook.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="twoja-trasa">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.kreda}
          alt="Duża szara płyta chodnikowa, a na niej jedna kręta biała linia narysowana kredą, biegnąca łagodnym łukiem od jednej krawędzi do drugiej; obok leży krótki kawałek białej kredy"
          reverse
        >
          <p>
            Prawdziwe roboty jeżdżące za linią trenuje się dokładnie tak: rysuje się im trasę na
            podłodze. <strong>Nikt przy tym nie zmienia programu</strong> — program jest jeden i musi
            sobie poradzić z każdą kreską, jaką mu się narysuje. Teraz ty narysujesz taką kreskę.
          </p>
        </LessonImageCard>
        <LineDraw color={color} onComplete={draw.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="dwa-ciala">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wozek}
          alt="Drewniany wózek na czterech kołach stojący na gładkim jasnym piasku plaży, a za nim dwa ślady kół odciśnięte w piasku, które wyraźnie nie są równoległe — rozchodzą się i odchylają jeden od drugiego"
          lead="Wózek jechał prosto. Ślady mówią co innego."
        >
          Podstawa programowa mówi o robocie <strong>na ekranie albo prawdziwym</strong>. To nie
          jest to samo: prawdziwy ma koła, które się ślizgają, i silniki, które nie kręcą się idealnie
          równo. Zaraz zobaczysz, co robi z planem <strong>ciało</strong>.
        </LessonImageCard>
        <TwoBodies color={color} onComplete={bodies.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="cztery-przejazdy">
        <TrackLab color={color} onComplete={lab.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="robot-i-meta">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.labirynt}
          alt="Drewniany labirynt-plansza leżący płasko: płytka kwadratowa taca z jasnego drewna, w środku wąskie ścianki układające się w kręty korytarz, kilka okrągłych dziur w dnie i jedna mała drewniana kulka w rogu"
        >
          <p>
            W takim labiryncie kulkę prowadzi się, przechylając planszę — czyli{' '}
            <strong>sterując</strong>. Twoje zadanie jest trudniejsze: robot ma dojechać do mety{' '}
            <strong>sam</strong>, a ty masz mu tylko raz napisać, po czym pozna, że już dotarł.
          </p>
        </LessonImageCard>
        <RobotStudio color={color} onComplete={task.markBlockDone} />
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
          Robot to nie jest maszyna, która myśli. To maszyna, która{' '}
          <strong>wykonuje zapisany plan</strong> — i ma czujniki, żeby wiedzieć, co się wokół niej
          dzieje. Pierwsze maszyny sterowane programem czytały go z taśmy z dziurkami, dużo wcześniej
          niż powstał pierwszy komputer.
        </p>
        <p className="mt-3">
          Dziś pytanie brzmi: <strong>skąd robot wie, gdzie jest?</strong> Są dwie odpowiedzi.
          Można odliczyć kroki. Można zapytać czujnika. Sprawdzisz obie — i zobaczysz, dlaczego
          prawie każdy prawdziwy robot wybiera tę drugą.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Zwój jasnej papierowej taśmy leżący na kremowym blacie, częściowo rozwinięty tak, że prosty odcinek taśmy ciągnie się od rolki; wzdłuż całej taśmy biegną równe rzędy małych okrągłych dziurek"
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
