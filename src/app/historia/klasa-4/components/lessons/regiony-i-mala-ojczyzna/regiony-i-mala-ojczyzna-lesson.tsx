'use client';

import Image from 'next/image';
import { Map, MessageCircle, Shirt, ScrollText } from 'lucide-react';
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
import { SlowaZGeografia } from './slowa-z-geografia';
import { UkladankaRegionow } from './ukladanka-regionow';
import { ObcyElement } from './obcy-element';
import { TrzyPytania } from './trzy-pytania';
import { KoronaZLegendy } from './korona-z-legendy';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L12 — regiony i mała ojczyzna. `[2.2]` `[3.3]`, doświadczenie 2c (część).
 * Trzecia lekcja modułu 3.
 *
 * **Zdanie lekcji: mieszkamy w jednym kraju, ale każdy region ma swoją historię —
 * i dlatego trochę inaczej mówi, gotuje i świętuje.**
 *
 * Cztery bloki:
 *  - `SlowaZGeografia` — dziecko mówi, **jak samo mówi**, a mapa zapala obszar,
 *    gdzie mówi się tak samo; na końcu przecięcie wszystkich odpowiedzi;
 *  - `UkladankaRegionow` — **układa Polskę z kawałków-regionów** (kształt jest
 *    dowodem), zbiera cztery powody różnic, stuka swój region, **wiezie koronę**
 *    przez trzy stolice w kolejności dat; pinezka „Warszawa stolicą”;
 *  - `ObcyElement` — **wyłapuje przybysza na stroju i odsyła go na mapę** do
 *    stroju, który go nosi (stroje rysowane kodem);
 *  - `TrzyPytania` — **przypina pytania do zdań** opisów trzech tradycji;
 *    nagroda: karta badacza do tradycji z domu.
 *
 * Przypominajka: miejsce koronacji z legendy mapy (L9, dystans 3). Mapa
 * regionów: silnik `hist-map` (wypromowany w tej lekcji).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/regiony-i-mala-ojczyzna/wies.jpg',
  baltyk: '/images/historia/lekcje/regiony-i-mala-ojczyzna/baltyk.jpg',
  tatry: '/images/historia/lekcje/regiony-i-mala-ojczyzna/tatry.jpg',
  koledy: '/images/historia/lekcje/regiony-i-mala-ojczyzna/koledy.jpg',
});

const LESSON_KEY = 'mala-i-duza-ojczyzna/regiony-i-mala-ojczyzna';

const BLOCKS: HistBlockMeta[] = [
  { id: 'slowa', kind: 'haczyk', title: 'Na dwór czy na pole?', time: '4 min', icon: MessageCircle },
  { id: 'regiony', kind: 'mapa', title: 'Układanka regionów', time: '8 min', icon: Map },
  { id: 'stroje', kind: 'cwiczenie', title: 'Przybysz na stroju', time: '5 min', icon: Shirt },
  { id: 'tradycje', kind: 'zadanie', title: 'Trzy pytania do tradycji', time: '7 min', icon: ScrollText },
];

const L9_LESSON = getLesson('czas-i-miejsce', 'mapa-i-plan');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function RegionyIMalaOjczyznaLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Sprawdziłeś/łaś, że twoje słowa mają swoje miejsce na mapie. Ułożyłeś/łaś Polskę z jedenastu regionów i zebrałeś/łaś cztery powody, dla których się różnią: inne państwo, krajobraz i praca, sąsiedzi, stolica. Przewiozłeś/łaś koronę z Gniezna przez Kraków do Warszawy, odesłałeś/łaś do domu ciupagę, pasiak i krakuskę, a trzy tradycje rozłożyłeś/łaś na trzy pytania. Mieszkamy w jednym kraju, ale każdy region ma swoją historię — i dlatego trochę inaczej mówi, gotuje i świętuje."
      entry={
        L9_LESSON ? (
          <Przypominajka from={L9_LESSON} distance={3} color={histModule.color}>
            <KoronaZLegendy color={histModule.color} />
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
  const slowa = useBlockDone('slowa');
  const regiony = useBlockDone('regiony');
  const stroje = useBlockDone('stroje');
  const tradycje = useBlockDone('tradycje');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="slowa">
        <SlowaZGeografia color={color} onComplete={slowa.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="regiony">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.baltyk}
          alt="Akwarela: nadbałtycka plaża rano — drewniana kładka przez wydmę porośniętą trawą, trzy drewniane łodzie rybackie wyciągnięte na piasek, spokojne fale i biała latarnia morska na brzegu w oddali"
          lead="Pomorze."
        >
          Morze, wydmy, porty. Ludzie stąd od wieków żyli z morza i handlu — i to widać do dziś
          w ich domach, potrawach, a nawet w języku. Każdy region ma takie swoje „dlaczego”.
        </LessonImageCard>
        <div className="mt-4">
          <UkladankaRegionow color={color} lesson={LESSON_KEY} done={regiony.done} onComplete={regiony.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="stroje">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.tatry}
          alt="Akwarela: hala w Tatrach późnym latem — stado białych owiec pasie się na zielonym zboczu, przed drewnianym szałasem z dymiącym kominem leży duży biało-brązowy pies pasterski, w tle szare skaliste szczyty i świerkowe lasy"
          lead="Podhale."
          reverse
        >
          W górach pasło się owce, więc z owczej wełny szyło się ciepłe ubrania. Strój mówił, skąd
          ktoś jest — zanim jeszcze się odezwał.
        </LessonImageCard>
        <div className="mt-4">
          <ObcyElement color={color} onComplete={stroje.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="tradycje">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.koledy}
          alt="Akwarela: zimowy wieczór we wsi — przed drzwiami drewnianej chaty z oświetlonymi oknami stoją kolędnicy: chłopiec z dużą papierową gwiazdą na kiju, dziewczynka w białym kożuszku i chuście oraz przebieraniec w kudłatym kożuchu z rogatą, kłapiącą głową zwierzęcia na kiju; w tle zaśnieżone domy i wieża kościoła"
          lead="Wieczór po Bożym Narodzeniu."
        >
          Za oknem pukają kolędnicy, a wśród nich ktoś przebrany za dziwne, rogate zwierzę. Skąd się
          wziął taki zwyczaj? Co znaczył kiedyś — i co znaczy dziś?
        </LessonImageCard>
        <div className="mt-4">
          <TrzyPytania color={color} onComplete={tradycje.markBlockDone} />
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
          11 listopada rano tysiące ludzi w całej Polsce biegną w biało-czerwonych koszulkach.
          Nie znają się. Nie umawiali się. A jednak wszyscy wiedzą, dlaczego biegną właśnie dziś.
        </p>
        <p className="mt-3">
          Dziś sprawdzisz, jak sam/a mówisz, ułożysz Polskę z regionów, odeślesz do domu
          zabłąkane części strojów i zbadasz trzy tradycje. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            mieszkamy w jednym kraju, ale każdy region ma swoją historię — i dlatego trochę inaczej
            mówi, gotuje i świętuje.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: polska wieś latem — pasy pól ze złotym zbożem, zielonymi ziemniakami i niebieskim lnem, polna droga z wierzbami, drewniane chałupy pod strzechą, płot i bocianie gniazdo na słupie; w oddali kościółek i jezioro"
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
