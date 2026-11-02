'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bug, Compass, Grid3x3, PackageCheck, Paintbrush } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import type { Picture } from '../../picture-view';
import { DirectionDial } from './direction-dial';
import { StageGrid } from './stage-grid';
import { SpriteStudio } from './sprite-studio';
import { WalkFix } from './walk-fix';
import { OwnSpriteStudio } from './own-sprite-studio';
import { EMPTY, measure } from './sprite-pic';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Druga lekcja modułu 6 i dwudziesty piąty kształt lekcji w kursie. Realizuje
 * temat „edytor duszków, ruch i układ współrzędnych sceny, styl obrotu” `[2.1]`
 * `[2.2]` i **zadanie obowiązkowe Z-7**.
 *
 * Program opisuje kształt tej lekcji jako „debugowanie (duszek
 * chodzi głową w dół) → wyjaśnienie → zadanie praktyczne”. Zostało to
 * przestawione o jeden krok wcześniej i na tym stoi cała lekcja: **usterkę
 * produkuje palec dziecka w pierwszym bloku**, kręcąc tarczą kierunku. Dzięki
 * temu blok czwarty nie zaczyna się od cudzego zepsutego programu, tylko od
 * czegoś, co dziecko samo przed chwilą zrobiło.
 *
 * Pięć bloków, pięć **różnych gestów** — to jest warunek, którego kurs pilnuje
 * od wpadki z 2026-09-08:
 *  - `DirectionDial` — przeciąganie **po okręgu**: tarcza kierunku, a pod nią
 *    liczba, z której wychodzi, że w lewo to -90, a nie 270;
 *  - `StageGrid` — trzy rundy, w których zmienia się narzędzie, nie temat:
 *    ciągnięcie duszka palcem → **wpisywanie dwóch liczb** w klocek → jedna
 *    liczba i pilnowanie, żeby y nie drgnęło;
 *  - `SpriteStudio` — **malowanie** własnego kostiumu i przesuwanie całego
 *    rysunku na krzyżyk środka;
 *  - `WalkFix` — przeciąganie klocków i **przeklikiwanie wartości** w owalnym
 *    polu (klocek stylu obrotu przychodzi z wartością, która nic nie naprawia);
 *  - `OwnSpriteStudio` — zadanie Z-7 **na stronie**: ten sam rysunek w polu do rysowania,
 *    skrypt na pracowni klocków i scena, na której chodzi **jego** duszek; werdykt czyta
 *    przebieg silnika, a nie listę klocków.
 *
 * **Duszek narysowany w bloku 3 wędruje przez resztę lekcji** — spaceruje po
 * scenie w bloku 4 i w zadaniu Z-7, w którym stoi w tym samym polu do rysowania
 * i można go dopracować. To jedyny w kursie przypadek stanu współdzielonego
 * między blokami i jest tego wart: dziecko poprawia własny rysunek, nie naszego
 * kota.
 *
 * Nagroda za przyjęcie zadania jest inna niż w lekcji 24 (taka jest reguła całej
 * migracji zadań praktycznych): raport pokazuje **jego kostium** w czterech
 * kierunkach przy stylu obrotu, który dziecko samo ustawiło.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/ruch-i-styl-obrotu/dwie-drewniane-figurki.jpg',
  chorogiewka: '/images/informatyka/lekcje/ruch-i-styl-obrotu/choragiewka-na-slupku.jpg',
  kratka: '/images/informatyka/lekcje/ruch-i-styl-obrotu/kratka-i-dwa-sznurki.jpg',
  lampa: '/images/informatyka/lekcje/ruch-i-styl-obrotu/lampa-na-zawieszeniu.jpg',
  farbki: '/images/informatyka/lekcje/ruch-i-styl-obrotu/farbki-i-pusta-kartka.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'kierownica',
    kind: 'haczyk',
    title: 'Kierownica duszka',
    time: '5 min',
    icon: Compass,
  },
  {
    id: 'siatka',
    kind: 'symulator',
    title: 'Gdzie na scenie stoi duszek',
    time: '6 min',
    icon: Grid3x3,
  },
  {
    id: 'pracownia-duszka',
    kind: 'pokaz',
    title: 'Pracownia duszka: rysunek i krzyżyk',
    time: '7 min',
    icon: Paintbrush,
  },
  {
    id: 'na-glowie',
    kind: 'debugowanie',
    title: 'Kot chodzi na głowie',
    time: '7 min',
    icon: Bug,
  },
  {
    id: 'wlasny-duszek',
    kind: 'zadanie',
    title: 'Zadanie Z-7: własny duszek na spacerze',
    time: '10 min',
    icon: PackageCheck,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function RuchIStylObrotuLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Umiesz obrócić duszka, powiedzieć, gdzie stoi, narysować mu własny kostium i ustawić go tak, żeby nie chodził na głowie. Zapamiętaj jedną parę słów z tej lekcji: kierunek mówi, DOKĄD duszek idzie, a styl obrotu — JAK przy tym wygląda. To dwie osobne rzeczy i mylenie ich jest najczęstszą przyczyną „mój duszek dziwnie chodzi”."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const dial = useBlockDone('kierownica');
  const grid = useBlockDone('siatka');
  const studio = useBlockDone('pracownia-duszka');
  const fix = useBlockDone('na-glowie');
  const task = useBlockDone('wlasny-duszek');

  /**
   * Rysunek z bloku 3 idzie dalej przez lekcję. Trzymamy go tutaj, bo powłoka lekcji
   * nie ma pojęcia o treści, a dwa późniejsze bloki mają. Kostium na scenie to ten
   * rysunek dopiero wtedy, gdy jest rysunkiem, a nie dwiema kreskami na próbę.
   */
  const [pic, setPic] = useState<Picture>(EMPTY);
  const costume = measure(pic).drawn ? pic : null;

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="kierownica">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.chorogiewka}
          alt="Miedziana chorągiewka w kształcie strzałki z lotkami, osadzona poziomo na słupku ze starego drewna i wycelowana grotem w prawo; do jej trzonu przywiązany jest pasek jasnego płótna, odwiany daleko w lewo"
          lead="Strzałka na dachu nie mówi, gdzie jest północ. Mówi, którędy wieje."
        >
          W Scratchu każdy duszek ma swoją strzałkę — nazywa się <strong>kierunek</strong> i decyduje
          o jednej rzeczy: <strong>dokąd pójdą kroki</strong>. Zanim cokolwiek o tym przeczytasz,
          poprowadź kota przez trzy przystanki i przekonaj się sam(a).
        </LessonImageCard>
        <DirectionDial color={color} onComplete={dial.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="siatka">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.kratka}
          alt="Arkusz papieru w drobną niebieską kratkę przypięty czterema mosiężnymi pinezkami do drewnianej deski, a nad nim dwa napięte białe sznurki — jeden poziomy, drugi pionowy — krzyżujące się pośrodku; dokładnie w punkcie skrzyżowania leży jeden szary kamyk"
          reverse
        >
          <p>
            Żeby powiedzieć, gdzie leży kamyk, nie wystarczy „gdzieś tam”. Potrzebne są{' '}
            <strong>dwie liczby</strong> i punkt, od którego się je liczy. Scena Scratcha ma dokładnie
            taką kratkę, a zero leży <strong>pośrodku</strong>, nie w rogu.
          </p>
        </LessonImageCard>
        <StageGrid color={color} onComplete={grid.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pracownia-duszka">
        <SpriteStudio color={color} pic={pic} onPicChange={setPic} onComplete={studio.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="na-glowie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lampa}
          alt="Mosiężna lampa naftowa ze szklanym kominkiem, zawieszona w obrotowej mosiężnej obręczy wewnątrz drewnianej ramy stojącej na podstawce; rama jest wyraźnie przechylona w lewo, a lampa mimo to wisi zupełnie pionowo"
          lead="Rama się przechyla, a lampka i tak wisi prosto."
          reverse
        >
          Na statku lampy wiesza się tak specjalnie: <strong>ruch to jedno, a wygląd to drugie</strong>.
          Duszek w Scratchu ma dokładnie takie ustawienie — nazywa się{' '}
          <strong>styl obrotu</strong> i decyduje wyłącznie o tym, jak duszek wygląda, kiedy zmienia
          kierunek. Ani o trasie, ani o szybkości.
        </LessonImageCard>
        <WalkFix color={color} costume={costume} onComplete={fix.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wlasny-duszek">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.farbki}
          alt="Widziana z góry płytka drewniana tacka z sześcioma okrągłymi kostkami farb akwarelowych i leżącym w poprzek pędzlem o gołym drewnianym trzonku, obok całkiem pusty arkusz grubego papieru o postrzępionych brzegach, a przy krawędzi gałązka zielonych liści i drobne białe kwiatki"
        >
          <p>
            Wszystko, czego dziś próbowałeś/próbowałaś, wygląda w prawdziwym Scratchu tak samo: ta
            sama tarcza kierunku, ta sama kratka ze współrzędnymi, ten sam krzyżyk w edytorze
            kostiumów. Czas <strong>namalować własnego duszka</strong> i wyprowadzić go na spacer.
          </p>
        </LessonImageCard>
        <OwnSpriteStudio color={color} pic={pic} onPicChange={setPic} onComplete={task.markBlockDone} />
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
          W poprzedniej lekcji duszek był gotowy — dostałeś/dostałaś kota i trzy klocki. Dziś kota już
          nie będzie: <strong>duszka narysujesz sam(a)</strong>, a potem każesz mu chodzić w bok.
        </p>
        <p className="mt-3">
          Brzmi prosto i takie nie jest. Po drodze czekają dwie pułapki, na które nabiera się
          każdy, kto pierwszy raz rysuje własnego duszka: rysunek, który przy obrocie odlatuje na
          orbitę, i duszek, który dochodzi do celu <strong>głową w dół</strong>. Obie zobaczysz
          dzisiaj na własne oczy — i obie naprawisz jednym klockiem.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Dwie jednakowe figurki z gładkiego, niemalowanego drewna na jasnym blacie: lewa stoi normalnie na swojej okrągłej podstawce, prawa stoi tuż obok na głowie — kulistą główką na blacie i podstawką do góry"
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
