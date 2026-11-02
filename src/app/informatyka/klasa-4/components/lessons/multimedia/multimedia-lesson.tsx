'use client';

import Image from 'next/image';
import { Clapperboard, Eye, Film, MoveHorizontal, Wrench } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { MomentScrub } from './moment-scrub';
import { FlipFrames } from './flip-frames';
import { EyeTrap } from './eye-trap';
import { FixMaterial } from './fix-material';
import { MediaStudio } from './media-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Trzecia lekcja modułu 7 i trzydziesty drugi kształt lekcji w kursie.
 * Realizuje `[3.5 — moduł medialny]`: *przygotowuje materiały multimedialne,
 * łącząc tekst, obraz i proste animacje, także wspomagające naukę innych
 * dziedzin i przedmiotów szkolnych*. Bez zadania obowiązkowego.
 *
 * **Cała lekcja stoi na jednym zdaniu: ruch ma coś pokazywać.** Animacja nie
 * jest ozdobą ani nagrodą za starania — jest jedynym sposobem pokazania
 * **zmiany**, a tam, gdzie nic się nie zmienia, nie pokazuje niczego i tylko
 * zabiera oczy podpisowi. Z tego jednego zdania wypada cała reszta: po co
 * animacja, ile klatek, jak szybko, co jeszcze może się ruszać i kiedy.
 *
 * Lekcja ma budowę, jakiej w kursie jeszcze nie było: **trzy pierwsze bloki
 * dają trzy przyrządy, czwarty każe nimi rozebrać cudzą pracę, a piąty wycelować
 * je we własną**. Dzięki temu widżety wracają w bloku 4 nie jako powtórka, tylko
 * jako narzędzia w ręku — a to jest inna czynność niż ta, w której powstały.
 *
 * Pięć bloków, pięć różnych gestów:
 *
 *  - `MomentScrub` — **ciąganie palcem po osi czasu**: szukanie chwili, w której
 *    coś się dzieje, a potem materiał, w którym takiej chwili nie ma i dziecko
 *    samo to ogłasza;
 *  - `FlipFrames` — **animacja robiona ręką**, klatka po klatce, z kalką pod
 *    spodem; dziecko rusza tylko słońcem, a cień liczy się z podobieństwa
 *    trójkątów;
 *  - `EyeTrap` — **symulator uwagi widza** z jawnie wypisaną regułą; ten sam
 *    ekran trzy razy, za każdym razem z innym celem i inną odpowiedzią;
 *  - `FixMaterial` — **przybornik**: trzy usterki w cudzym materiale, z których
 *    każdą widzi tylko jeden z trzech przyrządów;
 *  - `MediaStudio` — **trzy własne sceny składane tutaj**, werdykt punkt po
 *    punkcie, a w nagrodę własny materiał obejrzany przyrządami z tej lekcji.
 *    Zadanie dzieje się w lekcji, nie przez plik (decyzja z 2026-09-19).
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/multimedia/papierowy-wiatraczek.jpg',
  kropla: '/images/informatyka/lekcje/multimedia/kropla-na-lisciu.jpg',
  ptaszki: '/images/informatyka/lekcje/multimedia/piec-glinianych-ptaszkow.jpg',
  przyrzady: '/images/informatyka/lekcje/multimedia/trzy-przyrzady.jpg',
  harmonijka: '/images/informatyka/lekcje/multimedia/papierowa-harmonijka.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'moment',
    kind: 'haczyk',
    title: 'Moment, którego nie ma na obrazku',
    time: '5 min',
    icon: MoveHorizontal,
  },
  {
    id: 'klatki',
    kind: 'pokaz',
    title: 'Pięć klatek i ruch gotowy',
    time: '6 min',
    icon: Film,
  },
  {
    id: 'oko',
    kind: 'symulator',
    title: 'Gdzie patrzy oko widza',
    time: '6 min',
    icon: Eye,
  },
  {
    id: 'przybornik',
    kind: 'debugowanie',
    title: 'Trzy przyrządy, jeden zepsuty materiał',
    time: '5 min',
    icon: Wrench,
  },
  {
    id: 'moj-material',
    kind: 'zadanie',
    title: 'Zadanie: materiał, z którego ktoś się nauczy',
    time: '8 min',
    icon: Clapperboard,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function MultimediaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zabierz z tej lekcji cztery pytania do każdego materiału, który zrobisz. Czy tu w ogóle coś się zmienia — bo jeśli nie, to jest rysunek, a nie animacja. Czy da się to prześledzić w tym tempie. Czy nie rusza się kilka rzeczy naraz — bo widz ma jedną parę oczu. I czy podpis mówi coś, czego na obrazku nie widać. Ruch nie jest nagrodą za wysiłek. Ruch ma coś pokazywać."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const moment = useBlockDone('moment');
  const frames = useBlockDone('klatki');
  const eye = useBlockDone('oko');
  const tools = useBlockDone('przybornik');
  const task = useBlockDone('moj-material');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="moment">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kropla}
          alt="Przejrzysta kropla wody oderwała się właśnie od czubka wąskiego zielonego liścia i wisi w powietrzu tuż pod nim; niżej, w płytkiej glinianej misie pełnej wody, rozchodzą się kręgi po poprzedniej kropli"
          lead="Ta kropla zaraz spadnie. Albo już spadła — z obrazka tego nie wyczytasz."
        >
          Rysunek pokazuje <strong>stan</strong>: jak coś wygląda w jednej chwili. Nie pokazuje, co się z tym dzieje.
          Zaraz dostaniesz przyrząd, którym da się po materiale jeździć w tę i z powrotem — i dwa materiały, w których
          trzeba czegoś w środku poszukać.
        </LessonImageCard>
        <MomentScrub color={color} onComplete={moment.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="klatki">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.ptaszki}
          alt="Pięć jednakowych małych glinianych ptaszków stoi w równym rzędzie na jasnej drewnianej półce; każdy kolejny jest obrócony odrobinę bardziej w bok niż poprzedni, od patrzącego wprost do odwróconego profilem"
          reverse
        >
          <p>
            Żaden z tych ptaszków się nie rusza. Ruch jest <strong>między</strong> nimi — w tym, że każdy następny jest
            odrobinę inny niż poprzedni. Tak właśnie robi się animację: nie jednym ruchomym obrazkiem, tylko kilkoma
            zwykłymi, które różnią się <strong>jednym drobiazgiem</strong>.
          </p>
        </LessonImageCard>
        <FlipFrames color={color} onComplete={frames.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="oko">
        <EyeTrap color={color} onComplete={eye.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="przybornik">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyrzady}
          alt="Na pofałdowanym lnianym płótnie leżą obok siebie trzy proste przyrządy: mosiężny pion na skręconym sznurku, stalowy kamerton i drewniany cyrkiel z mosiężnym przegubem, wszystkie gładkie i bez żadnych oznaczeń"
          lead="Pion sprawdza, czy coś stoi prosto. Kamerton — czy dźwięk jest ten sam. Cyrkiel — czy odległość się zgadza."
        >
          Żaden z nich nie zrobi roboty pozostałych i to jest ich zaletą, a nie wadą. Masz już <strong>trzy przyrządy</strong>{' '}
          z tej lekcji. Teraz dostaniesz cudzy materiał z trzema usterkami — i każdą z nich widzi{' '}
          <strong>tylko jeden</strong> z nich.
        </LessonImageCard>
        <FixMaterial color={color} onComplete={tools.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="moj-material">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.harmonijka}
          alt="Biała kartka złożona w harmonijkę o trzech płaszczyznach stoi pionowo na drewnianym blacie; jej płaszczyzny są zupełnie puste, a światło z boku kładzie na kolejnych zagięciach coraz ciemniejszy cień"
        >
          <p>
            Trzy puste płaszczyzny — dokładnie tyle, ile ma twój materiał. Zanim zaczniesz je zapełniać, odpowiedz
            sobie na jedno pytanie: <strong>czego ktoś ma się z tego nauczyć?</strong> Wszystko inne — obrazek, podpis,
            ruch — jest już tylko odpowiedzią na nie. Cała praca dzieje się tutaj, na stronie.
          </p>
        </LessonImageCard>
        <MediaStudio color={color} onComplete={task.markBlockDone} />
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
          „Materiał multimedialny” brzmi poważnie, a znaczy coś prostego: <strong>obraz, tekst i ruch w jednym</strong>.
          Taki materiał robi się wtedy, kiedy chcesz komuś coś wytłumaczyć — koledze, młodszemu bratu, całej klasie na
          lekcji przyrody.
        </p>
        <p className="mt-3">
          Jest w tym jednak jedna pułapka i wpadają w nią także dorośli. <strong>Ruch przyciąga oczy</strong> —
          zawsze, niezależnie od tego, czy ma coś do pokazania. Dlatego w tej lekcji nie będziemy się uczyć,{' '}
          <em>jak</em> coś zanimować, tylko <strong>kiedy w ogóle warto</strong>: poszukasz chwili, w której coś się
          dzieje, zrobisz własną animację klatka po klatce, sprawdzisz, dokąd ucieka wzrok widza, i znajdziesz trzy
          usterki w cudzej pracy.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Papierowy wiatraczek o czterech ramionach — dwa kremowe, dwa jasnoniebieskie — spięty mosiężną pinezką na cienkim drewnianym patyku wbitym w ziemię w glinianej doniczce; doniczka stoi na drewnianym parapecie przy jasnym oknie, za którym widać zieleń i dach sąsiedniego domu"
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
