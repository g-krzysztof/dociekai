'use client';

import Image from 'next/image';
import { FolderOpen, Layers, MonitorSmartphone, Wrench } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { DeskAudit } from './desk-audit';
import { WorkstationSim } from './workstation-sim';
import { EyeBreakTimer } from './eye-break-timer';
import { MyRuleCard } from './my-rule-card';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Ilustracje lekcji — hostowane na Cloudinary (`informatyka4/`), rozwiązywane
 * przez `imgMap()`/`img()` po ścieżce-kluczu. Styl i gęstość (4–6 na lekcję)
 * jak w `/matematyka`; komponent karty jest współdzielony.
 */
const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/jak-sie-uczyc/plan-pracy.jpg',
  ustawienie: '/images/informatyka/lekcje/jak-sie-uczyc/dobra-postawa.jpg',
  przerwa: '/images/informatyka/lekcje/jak-sie-uczyc/przerwa-przy-oknie.jpg',
  stanowisko: '/images/informatyka/lekcje/jak-sie-uczyc/folder-na-prace.jpg',
  zasada: '/images/informatyka/lekcje/jak-sie-uczyc/jedna-zasada.jpg',
});

/**
 * Pierwsza lekcja kursu — i pierwszy przykład tego, że kształt lekcji wynika
 * z tematu. Nie ma tu rozgrzewki ani quizu: BHP przy komputerze nie jest
 * wiedzą do odpytania, tylko zestawem nastaw do ustawienia u siebie. Dlatego
 * lekcja idzie od cudzego błędu (haczyk), przez własne ustawienia (symulator)
 * i prawdziwą przerwę (ćwiczenie), do roboty przy własnym biurku (zadanie
 * praktyczne) i jednego postanowienia (refleksja).
 */

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'biurko',
    kind: 'haczyk',
    title: 'Znajdź pięć błędów przy tym biurku',
    time: '5 min',
  },
  {
    id: 'ustawienie',
    kind: 'symulator',
    title: 'Ustaw ekran, stopy i odległość',
    time: '5 min',
  },
  {
    id: 'przerwa',
    kind: 'cwiczenie',
    title: 'Przerwa 20-20-20 — zrób ją teraz',
    time: '3 min',
  },
  {
    id: 'stanowisko',
    kind: 'zadanie',
    title: 'Ustaw swoje biurko i załóż teczkę na efekty pracy',
    time: '5 min',
  },
  {
    id: 'zasada',
    kind: 'refleksja',
    title: 'Jedna zasada, którą wprowadzasz od dziś',
    time: '2 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function JakSieUczycLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Najważniejsze zostało poza ekranem: to, co ustawisz przy swoim biurku i czy naprawdę wstaniesz na przerwę."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const audit = useBlockDone('biurko');
  const setup = useBlockDone('ustawienie');
  const pause = useBlockDone('przerwa');
  const practice = useBlockDone('stanowisko');
  const rule = useBlockDone('zasada');

  return (
    <>
      <CourseIntro color={color} />

      <LessonBlock id="biurko">
        <DeskAudit color={color} onComplete={audit.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="ustawienie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.ustawienie}
          alt="Dziewczynka około dziewięciu lat siedzi bokiem prawidłowo przy biurku: plecy oparte, stopy płasko na podłodze, oczy na wysokości górnej krawędzi wyłączonego monitora, ekran na wyciągnięcie ręki"
          lead="Dobre stanowisko poznasz po tym, że nie boli po godzinie."
        >
          Wiesz już, co było źle u Antka. Teraz to samo stanowisko dostajesz w wersji z pokrętłami —
          i to ty ustawiasz je tak, żeby dało się przy nim wysiedzieć bez bólu karku.
        </LessonImageCard>
        <WorkstationSim color={color} onComplete={setup.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="przerwa">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.przerwa}
          alt="Chłopiec około dziewięciu lat stoi przy dużym oknie i patrzy w dal na zielone drzewa, odwrócony od biurka; w tle nieostry ekran"
          reverse
        >
          <p>
            Zasada 20-20-20: co <strong>20 minut</strong> patrz przez <strong>20 sekund</strong> na
            coś oddalonego o co najmniej <strong>20 kroków</strong>. Oczy przy ekranie prawie nie
            mrugają i się nie przestawiają — dopiero patrzenie w dal je rozluźnia.
          </p>
        </LessonImageCard>
        <EyeBreakTimer color={color} onComplete={pause.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="stanowisko">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.stanowisko}
          alt="Otwarta tekturowa teczka na dokumenty na drewnianym biurku, w środku kilka czystych kartek i ołówek, obok zamknięty laptop"
          lead="Teraz najważniejsze pięć minut całej lekcji: wstań i zrób to naprawdę."
          reverse
        >
          Ustaw stanowisko przy swoim biurku i na swoim komputerze, a potem załóż jedno miejsce na
          wszystko, co zrobisz w tym kursie. Odhaczaj pozycje dopiero, gdy coś jest zrobione — lista
          jest dla ciebie, nie dla nauczyciela.
        </LessonImageCard>
        <PracticeTask
          color={color}
          onComplete={practice.markBlockDone}
          brief={
            <>
              <strong>Ustaw swoje stanowisko pracy dokładnie tak, jak przed chwilą na suwakach,
              a potem załóż jedno miejsce na wszystko, co zrobisz w tym kursie.</strong>{' '}
              Do końca roku będziesz tu wracać po każdą swoją pracę.
            </>
          }
          sections={[
            {
              label: 'Twoje miejsce pracy',
              items: [
                'Odsunąłem/odsunęłam ekran na wyciągnięcie ręki — wyciągnięte palce ledwo go dotykają.',
                'Górna krawędź ekranu jest na wysokości moich oczu albo odrobinę niżej (jeśli było za nisko — podłożyłem/podłożyłam pod monitor książki).',
                'Siedzę oparty/oparta plecami o oparcie, a stopy stoją płasko na podłodze albo na podnóżku.',
                'Lampa oświetla biurko, a nie ekran — na ekranie nie ma jasnej plamy.',
                'Kubek i butelka stoją poza biurkiem z klawiaturą.',
                'Ustawiłem/ustawiłam sobie przypomnienie o przerwie: minutnik, budzik w telefonie albo zegarek obok.',
              ],
            },
            {
              label: 'Twoja teczka na efekty pracy',
              items: [
                'Założyłem/założyłam na komputerze jeden folder o nazwie „Informatyka 4”.',
                'Wiem, gdzie ten folder leży — potrafię do niego trafić od nowa, bez szukania.',
                'Zapisałem/zapisałam w nim pierwszy plik: pusty dokument o nazwie „lekcja-1”. Chodzi o to, żeby raz przejść całą drogę: program → Zapisz jako → mój folder.',
              ],
            },
          ]}
          hint={
            <>
              <strong>Nie musisz nic kupować ani instalować.</strong> Edytor tekstu masz już na
              komputerze: Notatnik (Windows) albo TextEdit (Mac). Jeśli chcesz czegoś więcej —
              MS Word, darmowy LibreOffice Writer albo Dokumenty Google w przeglądarce. Do tego
              zadania wystarczy dowolny z nich.
            </>
          }
          doneText="Masz stanowisko i masz teczkę. Od następnej lekcji wszystko, co zrobisz, ląduje w tym jednym folderze."
        />
      </LessonBlock>

      <LessonBlock id="zasada">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.zasada}
          alt="Mała pusta karteczka przypięta jedną pinezką do korkowej tablicy nad biurkiem"
        >
          <p>
            Cała lekcja zmieści się w jednym nawyku, jeśli ten jeden naprawdę wejdzie ci w krew.
            Wybierz <strong>jedną</strong> rzecz z dzisiaj — postawę, odległość, przerwę albo folder
            — i to ją wprowadzasz od teraz.
          </p>
        </LessonImageCard>
        <MyRuleCard color={color} onComplete={rule.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/**
 * Wejście w lekcję i w cały kurs: czego dotyczy, jak zbudowana jest lekcja
 * i czego dziecko będzie potrzebować poza przeglądarką. Bez numeru — nie jest
 * blokiem, więc nie liczy się do postępu.
 */
function CourseIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div>
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Ta lekcja nie jest o komputerze. Jest <strong>o tobie przy komputerze</strong>: jak
          usiąść, jak ustawić ekran, kiedy zrobić przerwę i gdzie trzymać to, co zrobisz. Zajmie
          jakieś dwadzieścia minut, z czego pięć spędzisz z dala od tej strony — przy własnym biurku.
        </p>

        <ul className="grid gap-2.5 sm:grid-cols-2">
          {[
            {
              icon: Layers,
              text: 'Każda lekcja to ponumerowane bloki. Pasek u góry pokazuje, ile z nich masz za sobą.',
            },
            {
              icon: MonitorSmartphone,
              text: 'Bloki są różne w różnych lekcjach — informatyka nie ma jednego szablonu.',
            },
            {
              icon: Wrench,
              text: 'Część zadań robisz w prawdziwych programach na swoim komputerze. Zawsze podajemy kilka do wyboru, w tym darmowe.',
            },
            {
              icon: FolderOpen,
              text: 'Efekty pracy zapisujesz u siebie — dziś założysz na nie jeden folder na cały rok.',
            },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Uporządkowane dziecięce biurko przy oknie: cienki laptop na wyciągnięcie ręki z wygaszonym ekranem, lampka skierowana na blat, wsunięte krzesło, obok na osobnym stoliku zamknięty zeszyt i szklanka wody"
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
