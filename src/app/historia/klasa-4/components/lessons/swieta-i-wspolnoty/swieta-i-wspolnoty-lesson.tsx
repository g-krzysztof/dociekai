'use client';

import Image from 'next/image';
import { CalendarDays, ClipboardList, Landmark, Star, Users } from 'lucide-react';
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
import { KregiWspolnot } from './kregi-wspolnot';
import { CzerwoneKartki } from './czerwone-kartki';
import { KtoUstala } from './kto-ustala';
import { ProjektObchodow } from './projekt-obchodow';
import { DwanascieGwiazd } from './dwanascie-gwiazd';
import { IleLatNiepodleglosci } from './ile-lat-niepodleglosci';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L11 — wspólnoty i święta państwowe; symbole Unii. `[3.2]` `[3.4]`, cel 1,
 * doświadczenie 1a (część). Druga lekcja modułu 3.
 *
 * **Zdanie lekcji: święto państwowe to dzień, w którym cała wspólnota pamięta
 * o tym samym.**
 *
 * Pięć bloków (karta miała cztery — dołożony blok źródłowy o ustawach):
 *  - `KregiWspolnot` — **ustawia postacie na planszy zachodzących kręgów**
 *    (Unia, obywatele Polski, naród polski) według tego, co mówią o sobie;
 *  - `CzerwoneKartki` — **przenosi kartkę kalendarza na oś lat 1760–2030**;
 *    od kartki do dziś rośnie pasek lat pamięci; pinezki 1791, 1918, 1920;
 *  - `KtoUstala` — sześć ustaw (1919–1990), **maluje flamastrem kartki
 *    trzech kalendarzy** (1938, 1960, 1995); sędzia wyprowadza prawdę z ustaw;
 *  - `ProjektObchodow` — **układa program obchodów na pasku 45 minut**,
 *    nagroda: zaproszenie z godzinami;
 *  - `DwanascieGwiazd` — **przewiduje suwakiem liczbę gwiazd** przy rosnącej
 *    liczbie państw — zawsze 12; hymn Unii bez słów.
 *
 * Przypominajka: rocznica niepodległości (z L8, dystans 3). Flagi rysowane
 * kodem; z generatora tylko trzy kadry bez symboli.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/swieta-i-wspolnoty/bieg.jpg',
  polonia: '/images/historia/lekcje/swieta-i-wspolnoty/polonia.jpg',
  przygotowania: '/images/historia/lekcje/swieta-i-wspolnoty/przygotowania.jpg',
});

const LESSON_KEY = 'mala-i-duza-ojczyzna/swieta-i-wspolnoty';

const BLOCKS: HistBlockMeta[] = [
  { id: 'wspolnoty', kind: 'haczyk', title: 'Kto jest w której wspólnocie?', time: '6 min', icon: Users },
  { id: 'kalendarz', kind: 'os-czasu', title: 'Czerwone kartki kalendarza', time: '5 min', icon: CalendarDays },
  { id: 'ustawy', kind: 'zrodlo', title: 'Kto ustala, co świętujemy?', time: '6 min', icon: Landmark },
  { id: 'obchody', kind: 'zadanie', title: 'Program obchodów 11 listopada', time: '8 min', icon: ClipboardList },
  { id: 'gwiazdy', kind: 'cwiczenie', title: 'Dwanaście gwiazd', time: '4 min', icon: Star },
];

const L8_LESSON = getLesson('czas-i-miejsce', 'obliczanie-czasu');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function SwietaIWspolnotyLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Postawiłeś/łaś pięć osób w kręgach wspólnot — pani Barbara z Chicago w narodzie, pan Minh w państwie, Kasia z Wilna w narodzie i w Unii, ale nie wśród obywateli Polski. Przeniosłeś/łaś trzy czerwone kartki na oś lat, pomalowałeś/łaś kalendarze według ustaw i zobaczyłeś/łaś, że 11 listopada przez ponad czterdzieści lat nie był świętem, a ludzie i tak pamiętali. Ułożyłeś/łaś program obchodów w 45 minutach i sprawdziłeś/łaś, że gwiazd na fladze Unii jest zawsze dwanaście. Święto państwowe to dzień, w którym cała wspólnota pamięta o tym samym."
      entry={
        L8_LESSON ? (
          <Przypominajka from={L8_LESSON} distance={3} color={histModule.color}>
            <IleLatNiepodleglosci color={histModule.color} />
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
  const wspolnoty = useBlockDone('wspolnoty');
  const kalendarz = useBlockDone('kalendarz');
  const ustawy = useBlockDone('ustawy');
  const obchody = useBlockDone('obchody');
  const gwiazdy = useBlockDone('gwiazdy');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="wspolnoty">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.polonia}
          alt="Akwarela: dziewczynka z warkoczami w stroju krakowskim — haftowany gorset, kwiecista spódnica, wianek ze wstążkami — idzie w paradzie ulicą wielkiego amerykańskiego miasta; za nią tancerze w strojach ludowych, na chodniku klaszczą widzowie, w tle drapacze chmur"
          lead="Parada w Chicago."
        >
          Ta dziewczynka urodziła się w Ameryce i nigdy nie mieszkała w Polsce. Mówi po polsku,
          tańczy w polskim zespole i wie, co się stało 11 listopada. Czy należy do tej samej
          wspólnoty co ty? Zależy, o którą wspólnotę pytasz.
        </LessonImageCard>
        <div className="mt-4">
          <KregiWspolnot color={color} onComplete={wspolnoty.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="kalendarz">
        <CzerwoneKartki color={color} lesson={LESSON_KEY} done={kalendarz.done} onComplete={kalendarz.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="ustawy">
        <KtoUstala color={color} onComplete={ustawy.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="obchody">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przygotowania}
          alt="Akwarela: szkolny stół z przygotowaniami do uroczystości — biało-czerwone kotyliony ze wstążkami, nożyczki, białe i czerwone goździki w słoiku, pusty papier nutowy, stos kartek i biało-czerwony bębenek; za oknem jesienne drzewa"
          lead="Dzień przed świętem."
          reverse
        >
          Kotyliony już są, kwiaty też. Brakuje najważniejszego: programu. To, co się wydarzy na
          sali, decyduje, czy uczniowie wyjdą z apelu, wiedząc, <strong>co świętowali</strong>.
        </LessonImageCard>
        <div className="mt-4">
          <ProjektObchodow color={color} onComplete={obchody.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="gwiazdy">
        <DwanascieGwiazd color={color} onComplete={gwiazdy.markBlockDone} />
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
          11 listopada rano tysiące ludzi w całej Polsce biegną w biało-czerwonych koszulkach.
          Nie znają się. Nie umawiali się. A jednak wszyscy wiedzą, dlaczego biegną właśnie dziś.
        </p>
        <p className="mt-3">
          Dziś sprawdzisz, do jakich wspólnot należysz, skąd się biorą czerwone kartki w
          kalendarzu i kto o nich decyduje, a potem sam/a ułożysz szkolne obchody. Wszystko stoi
          na jednym zdaniu:{' '}
          <strong>święto państwowe to dzień, w którym cała wspólnota pamięta o tym samym.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: ulica starego miasta jesienią, tłum biegaczy w białych i czerwonych koszulkach — rodzice, dzieci, starsza pani — biegnie po bruku między kolorowymi kamienicami, w tle wieże kościoła i żółte drzewa"
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
