'use client';

import Image from 'next/image';
import { Cog, Cpu, Hand, ScanSearch } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { AbacusDrill } from './abacus-drill';
import { PascalinaSim } from './pascalina-sim';
import { MachineTimeline } from './machine-timeline';
import { ComputerOrNot } from './computer-or-not';
import { HomeRound } from './home-round';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Ilustracje lekcji — hostowane na Cloudinary (`informatyka4/`), rozwiązywane
 * przez `imgMap()`/`img()` po ścieżce-kluczu. Styl i gęstość jak w `/matematyka`;
 * karta współdzielona.
 */
const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/historia-komputera/od-liczydla-do-smartfona.jpg',
  liczydlo: '/images/informatyka/lekcje/historia-komputera/liczydlo-z-bliska.jpg',
  pascalina: '/images/informatyka/lekcje/historia-komputera/maszyna-pascala.jpg',
  maszyny: '/images/informatyka/lekcje/historia-komputera/wielki-komputer.jpg',
  notatka: '/images/informatyka/lekcje/historia-komputera/notatka-przy-laptopie.jpg',
});

/**
 * Lekcja o historii maszyn liczących — i trzeci różny kształt lekcji w tym
 * kursie. Historii nie da się opowiedzieć samym czytaniem dat, więc lekcja
 * zaczyna się od tego samego rachunku wykonanego dwa razy: raz ręcznie na
 * liczydle (haczyk), raz na maszynie Pascala (symulator). Różnica między tymi
 * dwoma blokami — kto pilnuje przeniesień — jest całą treścią tej lekcji;
 * reszta tylko ciągnie tę myśl dalej, aż do pytania „czy to już komputer?”.
 *
 * Dlatego wyjaśnienie stoi dopiero na trzecim miejscu, a nie na początku:
 * dziecko ma najpierw poczuć różnicę palcami, a potem przeczytać, jak się
 * nazywa.
 *
 * Zadanie praktyczne dzieje się **w całości w lekcji** (`HomeRound`). Pierwsza
 * wersja kazała napisać notatkę w edytorze tekstu i wrócić z plikiem —
 * użytkownik odrzucił ten model 2026-09-19 jako za trudny dla dziesięciolatka
 * i nie do sprawdzenia; ta sama decyzja co przy Z-1 w `nosniki-danych`.
 */

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'liczydlo',
    kind: 'haczyk',
    title: 'Dodaj 47 i 68 na liczydle',
    time: '5 min',
    icon: Hand,
  },
  {
    id: 'pascalina',
    kind: 'symulator',
    title: 'Ten sam rachunek na maszynie z 1642 roku',
    time: '5 min',
    icon: Cog,
  },
  {
    id: 'maszyny',
    kind: 'wyjasnienie',
    title: 'Sześć maszyn i sześć robót, które nam zabrały',
    time: '6 min',
  },
  {
    id: 'czy-to-komputer',
    kind: 'cwiczenie',
    title: 'Czy to już komputer?',
    time: '4 min',
    icon: Cpu,
  },
  {
    /*
     * Identyfikator został z pierwszej wersji tego bloku (notatka w pliku),
     * choć blok jest dziś obchodem mieszkania. Z rozmysłem: po identyfikatorach
     * bloków liczy się postęp zapisany u dziecka, więc zmiana nazwy skasowałaby
     * ukończony blok każdemu, kto zrobił tę lekcję wcześniej.
     */
    id: 'notatka',
    kind: 'zadanie',
    title: 'Obchód mieszkania: kto tu wykonuje robotę',
    time: '8 min',
    icon: ScanSearch,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function HistoriaKomputeraLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Historia komputera to historia jednej rzeczy: maszyny przejmowały od nas kolejne roboty. Ostatniej nie przejęła żadna — decyzja, co ma być zrobione, dalej należy do ciebie."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const abacus = useBlockDone('liczydlo');
  const pascalina = useBlockDone('pascalina');
  const machines = useBlockDone('maszyny');
  const sorting = useBlockDone('czy-to-komputer');
  const practice = useBlockDone('notatka');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="liczydlo">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.liczydlo}
          alt="Zbliżenie tradycyjnego drewnianego liczydła: kilka poziomych prętów z rzędami okrągłych drewnianych koralików, część przesunięta w bok"
          lead="Tak ludzie liczyli przez cztery tysiące lat — zanim powstał pierwszy komputer."
        >
          Poniżej masz liczydło, takie samo jak sprzed wieków, tylko na ekranie.{' '}
          <strong>Wykonaj na nim jedno dodawanie</strong> i zwróć uwagę na moment, w którym coś
          pójdzie nie tak.
        </LessonImageCard>
        <AbacusDrill color={color} onComplete={abacus.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pascalina">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pascalina}
          alt="Dawna mosiężna maszyna licząca w drewnianej skrzynce z mosiężnymi kołami ze szprychami, na ciemnym suknie"
          lead="Ta sama maszyna, którą w 1642 roku zbudował dziewiętnastoletni Blaise Pascal."
          reverse
        >
          Teraz ten sam rachunek — 47 dodać 68 — ale na maszynie z mosiężnymi kołami.{' '}
          <strong>Zrób to samo co przed chwilą i porównaj, ile roboty zostaje dla ciebie.</strong>
        </LessonImageCard>
        <PascalinaSim color={color} onComplete={pascalina.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="maszyny">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.maszyny}
          alt="Wielki komputer z połowy XX wieku: wysokie szare stalowe szafy w rzędzie, panele pełne małych okrągłych lampek i zwiniętych kabli, w jasnej hali"
        >
          <p>
            Od liczydła do smartfona jest sześć przystanków. Na każdym maszyna przejęła od człowieka
            jedną robotę więcej: <strong>pamiętanie liczby, potem liczenie, potem kolejność
            kroków</strong>. Rozwiń kolejne karty i zobacz, co komu zabrała.
          </p>
        </LessonImageCard>
        <MachineTimeline color={color} onComplete={machines.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="czy-to-komputer">
        <div
          className="mb-4 p-5 text-sm leading-relaxed sm:p-6 sm:text-base"
          style={{ backgroundColor: `${color}0f` }}
        >
          <p>
            Skoro maszyny przejmowały kolejne roboty, to gdzieś przestały być zwykłymi maszynami,
            a stały się komputerami. <strong>Gdzie dokładnie?</strong> Masz dwa warunki i sześć
            urządzeń do rozstrzygnięcia — dwa z nich stoją u ciebie w domu.
          </p>
        </div>
        <ComputerOrNot color={color} onComplete={sorting.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="notatka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.notatka}
          alt="Chłopiec około dziewięciu lat siedzi przy otwartym laptopie w swoim pokoju i rozgląda się dookoła, jedna ręka na klawiaturze"
          lead="Na koniec rozejrzyj się w myślach po własnym mieszkaniu."
        >
          Komputery, o których mówiła ta lekcja, siedzą dziś w rzeczach, których nikt tak nie
          nazywa. <strong>Znajdź trzy z nich</strong> i rozstrzygnij przy każdej robocie, czy
          maszyna wykonuje ją sama, czy jesteś przy niej potrzebny ty.
        </LessonImageCard>
        <HomeRound color={color} onComplete={practice.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/**
 * Wejście w lekcję: pytanie, na które ma odpowiedzieć, i plan bloków dla
 * ekranów bez bocznej szyny. Bez numeru — nie jest blokiem, więc nie liczy się
 * do postępu.
 */
function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Komputer, przy którym siedzisz, nie spadł z nieba. Jest ostatnim ogniwem długiego
          łańcucha maszyn, z których <strong>każda przejęła od człowieka jedną robotę więcej</strong>:
          najpierw pamiętanie liczby, potem samo liczenie, potem kolejność kroków.
        </p>
        <p className="mt-3">
          Tę lekcję zaczynamy nietypowo — od rachunku, który zrobisz dwa razy. Raz na liczydle
          sprzed czterech tysięcy lat i raz na maszynie sprzed niecałych czterystu. Różnica
          między tymi dwoma razami to jest właśnie cała historia komputera.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Rząd przedmiotów na drewnianym stole, od lewej do prawej: drewniane liczydło, kanciasty komputer z lat 80. z wygaszonym ekranem i współczesny smartfon z kolorową tapetą"
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
