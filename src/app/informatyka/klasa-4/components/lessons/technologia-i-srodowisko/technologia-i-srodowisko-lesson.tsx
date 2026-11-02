'use client';

import Image from 'next/image';
import { Cable, CalendarClock, Flashlight, Hourglass, Zap } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { DynamoCrank } from './dynamo-crank';
import { DayRace } from './day-race';
import { NightHouse } from './night-house';
import { HiddenEnergy } from './hidden-energy';
import { TimerStudio } from './timer-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Pierwsza lekcja modułu 8 i trzydziesty czwarty kształt lekcji w kursie.
 * Realizuje wymaganie nowe w reformie 2026: `[4.5]` *omawia wpływ technologii
 * na środowisko oraz stosuje zasady oszczędzania energii*. Bez zadania
 * obowiązkowego.
 *
 * **Cała lekcja stoi na jednym zdaniu: liczy się moc razy czas — dlatego
 * najwięcej prądu marnuje się po cichu.** Czajnik ma rekordową moc, ale pracuje
 * minuty; dekoder w czuwaniu bierze mało, ale całą dobę. Z tego wypada reszta:
 * że oszczędzanie to wyłączanie tego, co pracuje na darmo, a nie rezygnowanie
 * z tego, co potrzebne (lodówka), i że zasadę można raz zapisać jako program.
 *
 * Program proponuje dla tej lekcji kształt „haczyk → dane
 * w symulatorze → dylemat → refleksja”. Zostały haczyk i symulator; dylemat
 * i refleksję zastąpiło to, co dziecko robi samo — przeszukanie domu nocą
 * i programatory ustawione w zadaniu — bo lekcja ma się kończyć czymś, co
 * dziecko zrobiło, a „stosuje zasady oszczędzania” da się zrobić, nie tylko
 * omówić.
 *
 * Pięć bloków, pięć różnych gestów, trzy z nich nowe w kursie:
 *
 *  - `DynamoCrank` — **kręcenie korbą, w którym liczy się tempo** (nowe):
 *    moc czuta w ręce, od lampki po czajnik poza skalą;
 *  - `DayRace` — **rozdzielanie puli żetonów** jako przewidywanie, potem doba
 *    toczy się sama, a zegar zwalnia na czajniku;
 *  - `NightHouse` — **szukanie latarką w ciemności** (nowe): czuwanie, którego
 *    nie widać, i lodówka, której nie wolno wyłączyć;
 *  - `HiddenEnergy` — **prowadzenie iskry po trasie**: prąd filmu daleko od domu
 *    i życie tabletu od kopalni do elektrośmieci;
 *  - `TimerStudio` — **wciskanie bolców po pierścieniu doby** (nowe): zadanie
 *    w lekcji, programatory czterech gniazdek z werdyktem w pięciu punktach.
 *
 * Te same urządzenia i te same waty wracają w blokach 2, 3 i 5 (`energy.ts`),
 * a miarką całej lekcji jest czajnik: zagotowanie litra wody ≈ 100 Wh.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/technologia-i-srodowisko/rower-z-dynamem.jpg',
  kran: '/images/informatyka/lekcje/technologia-i-srodowisko/kapiacy-kran.jpg',
  salon: '/images/informatyka/lekcje/technologia-i-srodowisko/salon-noca.jpg',
  linia: '/images/informatyka/lekcje/technologia-i-srodowisko/linia-do-elektrowni.jpg',
  pozytywka: '/images/informatyka/lekcje/technologia-i-srodowisko/pozytywka.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'korba',
    kind: 'haczyk',
    title: 'Zostań elektrownią',
    time: '5 min',
    icon: Zap,
  },
  {
    id: 'doba',
    kind: 'symulator',
    title: 'Doba w przyspieszeniu',
    time: '6 min',
    icon: Hourglass,
  },
  {
    id: 'noc',
    kind: 'cwiczenie',
    title: 'Dom po zmroku',
    time: '6 min',
    icon: Flashlight,
  },
  {
    id: 'trasa',
    kind: 'wyjasnienie',
    title: 'Prąd, którego nie widać',
    time: '5 min',
    icon: Cable,
  },
  {
    id: 'programator',
    kind: 'zadanie',
    title: 'Zadanie: programatory dla całego domu',
    time: '8 min',
    icon: CalendarClock,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function TechnologiaISrodowiskoLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zabierz z tej lekcji jedno zdanie: liczy się moc razy czas. Czajnik bierze dużo, ale przez chwilę; dekoder w czuwaniu bierze mało, ale całą dobę — i dlatego najwięcej prądu marnuje się po cichu. Oszczędzać to nie znaczy z czegoś rezygnować, tylko wyłączać to, co pracuje na darmo. A urządzenie, które już masz, używaj długo — i kiedy się zepsuje, oddaj je do elektrośmieci, nie do kosza."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const crank = useBlockDone('korba');
  const day = useBlockDone('doba');
  const night = useBlockDone('noc');
  const route = useBlockDone('trasa');
  const task = useBlockDone('programator');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="korba">
        <DynamoCrank color={color} onComplete={crank.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="doba">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kran}
          alt="Stary mosiężny kran nad białym zlewem; z kranu spada pojedyncza kropla do metalowego wiadra, które jest już pełne po brzegi, a obok na drewnianym blacie stoi pusta szklanka"
          lead="Kapiący kran nie robi hałasu. A po dobie wiadro jest pełne."
        >
          Z prądem jest tak samo. Urządzenie, które bierze mało, ale nie wyłącza się nigdy, przez całą dobę potrafi zjeść
          więcej niż takie, które bierze bardzo dużo, ale tylko przez chwilę. Sprawdź to na pięciu urządzeniach z jednego
          domu — najpierw zgadnij, potem patrz.
        </LessonImageCard>
        <DayRace color={color} onComplete={day.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="noc">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.salon}
          alt="Salon nocą oglądany od drzwi, oświetlony tylko księżycem: pod ciemnym telewizorem stoją dwa płaskie pudełka, na jednym świeci czerwona kropka, na drugim zielona, a na kanapie śpi zwinięty szary kot"
          reverse
        >
          <p>
            W nocy wszystko wygląda na wyłączone. Ale kropki w ciemności mówią co innego: te urządzenia nie śpią, tylko{' '}
            <strong>czuwają</strong> — czekają na pilota, na aktualizację, na poranek. A czuwanie też bierze prąd. Czasem
            całkiem sporo — i nie zawsze tam, gdzie świeci najjaśniej.
          </p>
        </LessonImageCard>
        <NightHouse color={color} onComplete={night.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="trasa">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.linia}
          alt="Szeroki wiejski krajobraz z polami: rząd stalowych słupów wysokiego napięcia niesie przewody od kilku domów z czerwonymi dachami aż po horyzont, gdzie dwie chłodnie kominowe elektrowni wypuszczają białe obłoki pary"
          lead="Prąd w gniazdku przyjechał z daleka. Twój film też."
        >
          Za każdym gniazdkiem stoją słupy, kable i elektrownia. A za każdym filmem w internecie — jeszcze router, sieć
          i serwerownia. Tego prądu nie ma na twoim liczniku, ale ktoś go wytwarza. I to też jest wpływ technologii na
          środowisko — tak samo jak to, skąd wziął się twój tablet i dokąd trafi, kiedy się zepsuje.
        </LessonImageCard>
        <HiddenEnergy color={color} onComplete={route.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="programator">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.pozytywka}
          alt="Otwarta drewniana pozytywka na lnianym obrusie: w środku mosiężny walec gęsto nabity drobnymi kolcami i stalowy grzebień, który ich dotyka, a z boku skrzynki wystaje mosiężny kluczyk do nakręcania"
          reverse
        >
          <p>
            W pozytywce melodia jest zapisana w kolcach na mosiężnym walcu: walec się obraca, a kolce w odpowiednich
            chwilach trącają stalowy grzebień. <strong>Programator czasowy działa tak samo</strong> — tylko zamiast nut są
            bolce, a zamiast dźwięku: prąd albo cisza. Zapiszesz w bolcach cały dzień jednego domu. Cała praca dzieje się
            tutaj, na stronie.
          </p>
        </LessonImageCard>
        <TimerStudio color={color} onComplete={task.markBlockDone} />
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
          Każde urządzenie w twoim domu potrzebuje prądu. A prąd nie bierze się z gniazdka — coś musi go{' '}
          <strong>w tej samej chwili</strong> wytwarzać, zwykle daleko stąd, w elektrowni. To, ile go zużywamy, ma więc
          znaczenie nie tylko dla rachunku, ale i dla powietrza, ziemi i wody.
        </p>
        <p className="mt-3">
          Najpierw sam/sama będziesz elektrownią. Potem zmierzysz dobę jednego domu, przeszukasz go w nocy z latarką
          i zobaczysz, dokąd płynie prąd, którego nie widać. Na końcu ustawisz programatory, które będą oszczędzać za
          ciebie. Wszystko stoi na jednym zdaniu: <strong>liczy się moc razy czas</strong> — i dlatego najwięcej prądu
          marnuje się po cichu.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Stary rower oparty o drewniany płot w ogrodzie o zmierzchu; przy przednim kole ma małe dynamo, a przednia lampka świeci ciepłym światłem na żwirową ścieżkę"
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
