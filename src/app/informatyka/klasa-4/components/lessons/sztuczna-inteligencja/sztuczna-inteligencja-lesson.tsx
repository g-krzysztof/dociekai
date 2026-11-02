'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Database, FlaskConical, PenLine, Shapes, Wand2 } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { BibiSwipe } from './bibi-swipe';
import { DrawTrainer, type Trained } from './draw-trainer';
import { DataLab } from './data-lab';
import { PromptLab } from './prompt-lab';
import { DatasetStudio } from './dataset-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Czwarta, ostatnia lekcja modułu 7 i trzydziesty trzeci kształt lekcji
 * w kursie. Realizuje dwa wymagania nowe w reformie 2026: `[3.6]` *tworzy
 * treści z wykorzystaniem prostych narzędzi sztucznej inteligencji* oraz
 * `[4.4]` *trenuje prosty model sztucznej inteligencji i obserwuje, jak dane
 * wpływają na jego wyniki*. Bez zadania obowiązkowego.
 *
 * **Cała lekcja stoi na jednym zdaniu: model uczy się tego, co naprawdę jest
 * w przykładach — nie tego, co miałeś na myśli.** Z niego wypada reszta: po co
 * dobre przykłady, dlaczego pomyłka w danych staje się pomyłką w odpowiedzi,
 * dlaczego maszyna nigdy nie mówi „nie wiem” i dlaczego generator dopowiada to,
 * czego mu nie powiesz.
 *
 * Wszystko dzieje się w przeglądarce dziecka, na danych wytworzonych na miejscu
 * — bez kont, bez sieci, bez zdjęć (uwaga o AI w klasie 4 ).
 * Modele są prawdziwe, tylko małe: najbliżsi sąsiedzi na rysunkach i wybór
 * jednej cechy na stworkach — oba dają się pokazać palcem, a to jest warunek,
 * żeby pomyłka maszyny była skutkiem danych, a nie magią.
 *
 * Pięć bloków, pięć różnych gestów:
 *
 *  - `BibiSwipe` — **rzucanie kartami w lewo i w prawo**: dziecko samo jest
 *    modelem i uczy się z przykładów, w których dwie cechy idą w parze;
 *  - `DrawTrainer` — **rysowanie danych**: własne przykłady do dwóch tac
 *    i sprawdzian na rysunkach, których maszyna nie widziała;
 *  - `DataLab` — **przekładanie i zabieranie przykładów** z werdyktem
 *    przeliczanym po każdym ruchu; rysunek do rozpoznania stoi w miejscu;
 *  - `PromptLab` — **ta sama prośba powtórzona kilka razy** i patrzenie, co się
 *    zmienia, a potem stukanie błędów w wynikach generatora;
 *  - `DatasetStudio` — **dobór danych dla maszyny**, z panelem „na co patrzy
 *    maszyna” przeliczanym po każdym stuknięciu i werdyktem, który uruchamia
 *    model dziecka na stworkach spoza kolekcji. Zadanie dzieje się w lekcji.
 *
 * Tace z bloku 2 przechodzą do bloku 3 — stąd stan w `LessonBody`.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/sztuczna-inteligencja/szyszki-i-zoledzie.jpg',
  slonca: '/images/informatyka/lekcje/sztuczna-inteligencja/slonca-na-sznurku.jpg',
  czeresnie: '/images/informatyka/lekcje/sztuczna-inteligencja/czeresnie-i-pomidorek.jpg',
  papuga: '/images/informatyka/lekcje/sztuczna-inteligencja/papuga-na-drazku.jpg',
  jablka: '/images/informatyka/lekcje/sztuczna-inteligencja/szesc-jablek.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'bibi',
    kind: 'haczyk',
    title: 'Bibi czy nie bibi?',
    time: '5 min',
    icon: Shapes,
  },
  {
    id: 'tace',
    kind: 'symulator',
    title: 'Naucz maszynę swoich rysunków',
    time: '8 min',
    icon: PenLine,
  },
  {
    id: 'dane',
    kind: 'cwiczenie',
    title: 'Zmień dane, zobacz wynik',
    time: '6 min',
    icon: FlaskConical,
  },
  {
    id: 'generator',
    kind: 'wyjasnienie',
    title: 'Generator dopowiada to, czego nie powiesz',
    time: '7 min',
    icon: Wand2,
  },
  {
    id: 'przyklady',
    kind: 'zadanie',
    title: 'Zadanie: przykłady, z których maszyna się nauczy',
    time: '7 min',
    icon: Database,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function SztucznaInteligencjaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zabierz z tej lekcji jedno zdanie: model uczy się tego, co naprawdę jest w przykładach, a nie tego, co ktoś miał na myśli. Dlatego zła taca daje złą odpowiedź, mała taca przegrywa z dużą, a to, czego w przykładach nie było, i tak dostaje jakąś etykietę. I dlatego to, co zrobi dla ciebie sztuczna inteligencja — obrazek, tekst, odpowiedź — trzeba sprawdzić, zanim komuś to dasz. Ona nie powie ci, że nie wie."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const bibi = useBlockDone('bibi');
  const trays = useBlockDone('tace');
  const data = useBlockDone('dane');
  const generator = useBlockDone('generator');
  const task = useBlockDone('przyklady');
  /** Tace z bloku 2 — blok 3 robi na nich doświadczenia. */
  const [trained, setTrained] = useState<Trained | null>(null);
  /** Wersja tac: blok 3 montuje się od nowa, kiedy dziecko wróci do bloku 2 i coś zmieni. */
  const traysVersion = trained ? `${trained.pair.id}-${trained.examples.length}-${trained.tests.length}` : 'wzor';

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="bibi">
        <BibiSwipe color={color} onComplete={bibi.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="tace">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.slonca}
          alt="Na sznurku rozpiętym pod jasną ścianą wiszą na drewnianych klamerkach kartki z dziecięcymi rysunkami słońca — każde słońce trochę inne: z długimi promieniami, z krótkimi, małe, duże i jedno krzywe"
          lead="Żadne z tych słońc nie jest takie samo. Wszystkie są słońcami."
        >
          Ty to wiesz od razu. Maszyna — nie: dla niej każdy rysunek to tylko kreski. Żeby odróżniła słońce od domku,
          musi dostać <strong>kilka różnych</strong> słońc i kilka różnych domków, i sama znaleźć, co jest w nich
          wspólne. Tym się teraz zajmiesz — twoimi rysunkami.
        </LessonImageCard>
        <DrawTrainer color={color} onComplete={trays.markBlockDone} onTrained={setTrained} />
      </LessonBlock>

      <LessonBlock id="dane">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.czeresnie}
          alt="Biała miseczka pełna ciemnoczerwonych czereśni z ogonkami, a między nimi jeden mały okrągły pomidorek koktajlowy z zieloną gwiazdką szypułki — na pierwszy rzut oka prawie nie do odróżnienia"
          reverse
        >
          <p>
            Jeden pomidorek wśród czereśni — ty go wypatrzysz. Maszyna, która dostała tę miskę jako przykład czereśni,
            uzna, że <strong>pomidorek też jest czereśnią</strong>. Nie zgaduje, co miałeś/miałaś na myśli. Uczy się
            tego, co jest w tacy. Zaraz sprawdzisz, co się stanie, kiedy tace zaczniesz psuć.
          </p>
        </LessonImageCard>
        <DataLab key={traysVersion} color={color} onComplete={data.markBlockDone} trained={trained} />
      </LessonBlock>

      <LessonBlock id="generator">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.papuga}
          alt="Szara papuga z czerwonym ogonem siedzi na drewnianym drążku przy jasnym oknie, z przekrzywioną głową i lekko rozchylonym dziobem, jakby za chwilę miała powtórzyć zasłyszane słowo"
          lead="Papuga mówi to, co słyszała najczęściej. Generator rysuje to, co widział najczęściej."
        >
          Generator obrazków to też model — tyle że nauczony na milionach obrazków, a nie na kilku twoich rysunkach.
          I robi to samo, co twoja maszyna: kiedy czegoś mu nie powiesz, bierze to, co w jego przykładach{' '}
          <strong>najczęstsze</strong>. Dlatego prośbę trzeba umieć napisać, a wynik — sprawdzić.
        </LessonImageCard>
        <PromptLab color={color} onComplete={generator.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="przyklady">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.jablka}
          alt="Rząd jabłek na drewnianym stole: małe zielone, duże czerwone, żółte, pasiaste czerwono-żółte, malutkie dzikie i zielone z jednym odgryzionym kęsem — każde inne, a wszystkie to jabłka"
          reverse
        >
          <p>
            Maszyna, której pokażesz same czerwone jabłka, uzna, że jabłko musi być czerwone. Dobre przykłady są{' '}
            <strong>różne we wszystkim, co się nie liczy</strong>, a takie same tylko w tym, co się liczy. W pierwszym
            bloku to ty dostałeś/dostałaś złe przykłady. Teraz ty je dobierasz — cała praca dzieje się tutaj, na stronie.
          </p>
        </LessonImageCard>
        <DatasetStudio color={color} onComplete={task.markBlockDone} />
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
          O sztucznej inteligencji mówi się, że „wie” albo „myśli”. W tej lekcji zobaczysz, co naprawdę robi:{' '}
          <strong>uczy się z przykładów</strong>. Nikt nie wpisuje jej reguł — dostaje dużo przykładów i sama szuka, co
          je łączy.
        </p>
        <p className="mt-3">
          Brzmi mądrze, ale ma swoją pułapkę: maszyna nauczy się dokładnie tego, <strong>co jest w przykładach</strong>,
          a nie tego, co ktoś miał na myśli. Najpierw sam/sama wpadniesz w tę pułapkę, potem nauczysz maszynę swoich
          rysunków i zobaczysz, jak łatwo ją zepsuć, a na końcu poprosisz generator o obrazek i sprawdzisz, co zrobił.
          Wszystko dzieje się w twojej przeglądarce — twoje rysunki nigdzie nie wychodzą.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Płytka drewniana taca przedzielona na dwie połowy: w lewej leży kupka szyszek, w prawej kupka żołędzi; obok tacy, na gołym blacie, leży samotny błyszczący kasztan, jakby czekał, aż ktoś go gdzieś odłoży"
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
