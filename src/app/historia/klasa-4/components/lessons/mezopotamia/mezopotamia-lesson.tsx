'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Hand, Scale, Waves } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { KanalyWidget } from './kanaly-widget';
import { PalceSzescdziesiat } from './palce-szescdziesiat';
import { SadHammurabiego } from './sad-hammurabiego';
import { OdPolaDoMiasta } from './od-pola-do-miasta';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L17 — Mezopotamia, pierwsze miasta. Rozszerzenie; niesie `[5.4]`.
 *
 * **Zdanie lekcji: wspólna praca przy kanałach wymagała kogoś, kto liczy,
 * zapisuje i rozkazuje — tak rodziło się miasto-państwo.**
 *
 * Trzy bloki + D poza postępem:
 *  - `KanalyWidget` — **rysuje kanał palcem** po terenie z wysokościami
 *    (woda tylko w dół), potem kopanie z licznikiem kopaczy i **nadzorcą
 *    z tabliczką** przeciąganym na budowę; epilog: władca i miasto-państwo,
 *    pinezka „miasta-państwa Sumerów”;
 *  - `PalceSzescdziesiat` — **liczy kciukiem po paliczkach** (12), tuziny
 *    na palcach drugiej dłoni (5 × 12 = 60) — hipoteza, podpisana;
 *  - `SadHammurabiego` — **przykłada sprawy do praw na steli**, porównanie
 *    obywatel/niewolnik, perspektywy wtedy i dziś; pinezka „Hammurabi”;
 *  - D: Brama Isztar (fotografia) i zikkurat.
 *
 * Przypominajka: kroki od pola do miasta w kolejności (L16, dystans 1).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/mezopotamia/miasto.jpg',
  kopanie: '/images/historia/lekcje/mezopotamia/kopanie.jpg',
  zikkurat: '/images/historia/lekcje/mezopotamia/zikkurat.jpg',
  stela: '/images/historia/lekcje/mezopotamia/stela-hammurabiego.jpg',
  isztar: '/images/historia/lekcje/mezopotamia/brama-isztar.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'kanaly', kind: 'symulator', title: 'Kanały', time: '8 min', icon: Waves },
  {
    id: 'palce',
    kind: 'cwiczenie',
    title: 'Dlaczego godzina ma 60 minut?',
    time: '4 min',
    icon: Hand,
  },
  { id: 'sad', kind: 'perspektywy', title: 'Sąd Hammurabiego', time: '7 min', icon: Scale },
];

const L16_LESSON = getLesson('poczatki-cywilizacji', 'rewolucja-neolityczna');
const LESSON = 'poczatki-cywilizacji/mezopotamia';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function MezopotamiaLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Poprowadziłeś/łaś kanał tak, żeby woda płynęła w dół, i przekonałeś/łaś się, że bez nadzorcy z tabliczką duża grupa kopaczy nie zdąży przed wylewem. Policzyłeś/łaś na palcach do sześćdziesięciu jak Sumerowie, a potem sądziłeś/łaś według praw Hammurabiego i zobaczyłeś/łaś, że obywatel i niewolnik nie byli wobec nich równi. Od dziś wiesz: wspólna praca przy kanałach wymagała kogoś, kto liczy, zapisuje i rozkazuje — tak rodziło się miasto-państwo."
      entry={
        L16_LESSON ? (
          <Przypominajka from={L16_LESSON} distance={1} color={histModule.color}>
            <OdPolaDoMiasta color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function Fotografia({
  src,
  alt,
  credit,
  w,
  h,
}: {
  src: string;
  alt: string;
  credit: string;
  w: number;
  h: number;
}) {
  return (
    <figure className="space-y-1">
      <Image src={src} alt={alt} width={w} height={h} className="h-auto w-full border" />
      <figcaption className="text-[11px] leading-snug text-muted-foreground">{credit}</figcaption>
    </figure>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const kanaly = useBlockDone('kanaly');
  const palce = useBlockDone('palce');
  const sad = useBlockDone('sad');
  const [dug, setDug] = useState(false);
  const sumer = getCorePin('miasta-panstwa-sumer');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="kanaly">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kopanie}
          alt="Akwarela: mieszkańcy Mezopotamii kopią kanał nawadniający na płaskiej, suchej równinie — mężczyźni z motykami, inni niosą na głowach kosze z ziemią, długi prosty rów prowadzi od rzeki porośniętej trzciną; na brzegu stoi człowiek z glinianą tabliczką i liczy"
          lead="Rzeka daje życie — ale trzeba ją doprowadzić."
        >
          Między Tygrysem a Eufratem pada mało deszczu, ale ziemia przy rzekach jest żyzna. Żeby
          woda dotarła do pól, trzeba było kopać kanały. Jeden człowiek by nie podołał.
        </LessonImageCard>
        <div className="mt-4">
          <KanalyWidget color={color} onDone={() => setDug(true)} />
        </div>
        {(dug || kanaly.done) && sumer && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_260px]">
              <div className="space-y-2 text-sm leading-relaxed">
                <p>
                  Jeden kanał — jeden nadzorca. Ale w dolinie było wiele wiosek i wiele kanałów, a
                  każda wioska chciała wody pierwsza. Ktoś musiał rozstrzygać spory, pilnować
                  nadzorców i zbierać ziarno na wspólne prace. Tak nadzorca nad nadzorcami stawał
                  się <strong>władcą</strong>.
                </p>
                <p>
                  Wokół niego wyrastało <strong>miasto-państwo</strong>: miasto otoczone murem,
                  okoliczne pola i wioski, władca, urzędnicy, którzy liczyli i zapisywali, podatki w
                  ziarnie — i świątynia na wysokim, schodkowym <strong>zikkuracie</strong>. Pierwsze
                  takie miasta zbudowali <strong>Sumerowie</strong> ok. 4000–3000 lat p.n.e., na
                  przykład Ur.
                </p>
              </div>
              <Image
                src={IMAGES.zikkurat}
                alt="Akwarela: ogromny schodkowy zikkurat z cegły mułowej z długimi schodami frontowymi, o zachodzie słońca; u podnóża małe postacie ludzi, mury miasta, palmy i stragany"
                width={260}
                height={195}
                className="h-auto w-full border"
              />
            </div>
            <PrzypnijPinezke
              pin={sumer}
              color={color}
              lesson={LESSON}
              mode="ludzkosc"
              done={kanaly.done}
              onPinned={kanaly.markBlockDone}
            />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="palce">
        <PalceSzescdziesiat color={color} onComplete={palce.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="sad">
        <div className="mb-4 grid gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
          <div className="mx-auto w-full max-w-[160px] sm:max-w-none">
            <Fotografia
              src={IMAGES.stela}
              alt="Fotografia: wysoka ciemna kamienna stela z praw Hammurabiego w muzeum — u góry płaskorzeźba króla stojącego przed siedzącym bogiem, niżej powierzchnia pokryta drobnym pismem klinowym"
              credit="Stela z prawami Hammurabiego, Luwr. Fot. Gil Dbd, Wikimedia Commons, CC BY-SA 4.0."
              w={506}
              h={900}
            />
          </div>
          <div className="text-sm leading-relaxed">
            <p className="font-semibold">To prawdziwe źródło.</p>
            <p className="mt-1">
              Kamień z czarnego bazaltu ma ponad dwa metry wysokości. Na górze król Hammurabi stoi
              przed bogiem sprawiedliwości, niżej wyryto pismem klinowym prawie trzysta praw. To
              jeden z najstarszych spisanych zbiorów praw na świecie.
            </p>
          </div>
        </div>
        <SadHammurabiego color={color} onComplete={sad.markBlockDone} done={sad.done} />

        <div className="mt-6 grid gap-3 border-t pt-4 sm:grid-cols-[220px_1fr] sm:items-center">
          <div className="mx-auto w-full max-w-[200px] sm:max-w-none">
            <Fotografia
              src={IMAGES.isztar}
              alt="Fotografia: zrekonstruowana Brama Isztar w muzeum w Berlinie — wysokie mury z niebieskiej szkliwionej cegły z wizerunkami byków i smoków, zwieńczone blankami; przed bramą zwiedzający"
              credit="Brama Isztar z Babilonu w Muzeum Pergamońskim w Berlinie. Fot. Sinoulpgc, Wikimedia Commons, CC0."
              w={675}
              h={900}
            />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Na koniec, dla ciekawych:</strong> tak wyglądała
            główna brama Babilonu, poświęcona bogini Isztar — z niebieskiej, szkliwionej cegły, ze
            zwierzętami ułożonymi z kolorowych płytek. Zbudowano ją ponad tysiąc lat po Hammurabim.
            Archeolodzy złożyli ją z tysięcy kawałków i dziś stoi w muzeum w Berlinie.
          </p>
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
          Między dwiema rzekami — Tygrysem i Eufratem — leży kraina, którą Grecy nazwali{' '}
          <strong>Mezopotamią</strong>, czyli „Międzyrzeczem”. Tu z wiosek wyrosły pierwsze miasta
          świata.
        </p>
        <p className="mt-3">
          Dziś wykopiesz kanał, policzysz na palcach do sześćdziesięciu i zasiądziesz jako sędzia w
          Babilonie. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            wspólna praca przy kanałach wymagała kogoś, kto liczy, zapisuje i rozkazuje — tak
            rodziło się miasto-państwo.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: sumeryjskie miasto nad szeroką rzeką — domy z cegły mułowej za murem, w tle schodkowy zikkurat, pola jęczmienia przecięte prostymi kanałami, palmy daktylowe, łodzie z trzciny i żaglem; na brzegu ludzie z koszami"
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
