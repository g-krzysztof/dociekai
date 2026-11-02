'use client';

import Image from 'next/image';
import { MessageCircle, Scale, Swords } from 'lucide-react';
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
import { TrzechSwiadkow } from './trzech-swiadkow';
import { PsiePoleSledztwo } from './psie-pole-sledztwo';
import { BitwaCzyNie } from './bitwa-czy-nie';
import { KronikaNaBramkach } from './kronika-na-bramkach';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L3 — wiarygodność źródła. `[1.4]` `[1.6]`, cele 2 i 4, filary 1 i 3.
 *
 * **Zdanie lekcji: źródłu wierzymy bardziej, gdy wiemy, kto je napisał,
 * kiedy i po co — i gdy potwierdza je inne, niezależne źródło.**
 *
 * Trzy bloki, cztery gesty nowe w kursie:
 *
 *  - `TrzechSwiadkow` — **zakreślacz w dwóch kolorach** (sprawdzalne / czyjeś
 *    zdanie) po wiadomościach, które same przychodzą do czatu; zdania
 *    graniczne przyjęte w obu kolorach; tabela zgodności świadków;
 *  - `PsiePoleSledztwo` — **rozkłada kroniki na osi „kiedy napisano”**,
 *    potem **nakłada kopie na oryginał** (trzy kroniki = jeden głos
 *    Kadłubka) i wypełnia paszport kroniki (silnik `source-desk`, drugi
 *    konsument — wypromowany do `components/source-desk/`);
 *  - `BitwaCzyNie` — **suwak pewności z przypiętymi dowodami**; każde
 *    stanowisko przyjęte, jeśli ma zgodny dowód i dziecko obejrzało drugą
 *    stronę; pinezka `psie-pole` ze znakiem zapytania.
 *
 * R z karty („Kto zyskuje?”) weszło do rdzenia jako pole „po co” paszportu
 * Kadłubka. Przypominajka wraca do dwóch bramek z L2 (dystans 1).
 */

const LESSON_KEY = 'warsztat-historyka/wiarygodnosc-zrodla';

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/wiarygodnosc-zrodla/skryptorium.jpg',
  korytarz: '/images/historia/lekcje/wiarygodnosc-zrodla/korytarz-doniczka.jpg',
  pole: '/images/historia/lekcje/wiarygodnosc-zrodla/pole-o-swicie.jpg',
  kopista: '/images/historia/lekcje/wiarygodnosc-zrodla/kopista.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'swiadkowie', kind: 'haczyk', title: 'Trzech świadków', time: '6 min', icon: MessageCircle },
  { id: 'psie-pole', kind: 'sledztwo', title: 'Psie Pole', time: '9 min', icon: Swords },
  { id: 'dylemat', kind: 'dylemat', title: 'Było czy nie było?', time: '6 min', icon: Scale },
];

const L2_LESSON = getLesson('warsztat-historyka', 'zrodla-historyczne');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function WiarygodnoscZrodlaLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zakreśliłeś/łaś fakty i opinie trojga świadków, rozłożyłeś/łaś cztery kroniki na osi i odkryłeś/łaś, że trzy z nich to jeden głos — a potem sam(a) zważyłeś/łaś dowody. Tak pracuje historyk: pyta kto, kiedy i po co, i szuka drugiego, niezależnego źródła."
      entry={
        L2_LESSON ? (
          <Przypominajka from={L2_LESSON} distance={1} color={histModule.color}>
            <KronikaNaBramkach color={histModule.color} />
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
  const swiadkowie = useBlockDone('swiadkowie');
  const psiePole = useBlockDone('psie-pole');
  const dylemat = useBlockDone('dylemat');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="swiadkowie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.korytarz}
          alt="Akwarela: szkolny korytarz, na płytkach leży rozbita gliniana doniczka z paprotką i rozsypaną ziemią; troje dzieci w wieku szkolnym stoi w różnych miejscach — rudowłosa dziewczynka przy oknie, chłopiec w koszulce w paski przy wieszakach i dziewczynka w żółtym sweterku przy drzwiach w głębi"
          lead="Troje świadków, trzy różne opowieści."
        >
          Każdy, kto coś widział, opowiada to po swojemu: z miejsca, w którym stał, i z tym, co o tym myśli. Zanim
          uwierzysz świadkom, oddziel to, co da się sprawdzić, od tego, co jest tylko czyimś zdaniem.
        </LessonImageCard>
        <TrzechSwiadkow color={color} onComplete={swiadkowie.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="psie-pole">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pole}
          alt="Akwarela: pusta łąka o świcie, nisko nad trawą leży mgła, z lewej wierzby, przez środek płynie strumień, a daleko na wzgórzu majaczy zarys grodu; różowo-szare niebo, ani jednego człowieka"
          reverse
          lead="Pole pod Wrocławiem. Czy ponad 900 lat temu stoczono tu wielką bitwę?"
        >
          W 1109 roku król niemiecki Henryk V najechał Polskę Bolesława Krzywoustego. Dawne kroniki opowiadają
          o wielkim zwycięstwie Polaków na Psim Polu — dziś to dzielnica Wrocławia. Sprawdź te kroniki jak historyk.
        </LessonImageCard>
        <PsiePoleSledztwo color={color} kopistaImage={IMAGES.kopista} onComplete={psiePole.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="dylemat">
        <BitwaCzyNie color={color} lesson={LESSON_KEY} done={dylemat.done} onComplete={dylemat.markBlockDone} />
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
          W poprzedniej lekcji dowiedziałeś/łaś się, że źródłem może być wszystko, co zostawił człowiek. Ale czy
          każdemu źródłu można wierzyć? Kronikarz mógł się pomylić, coś przekręcić — albo pisać tak, żeby spodobać się
          księciu.
        </p>
        <p className="mt-3">
          Dziś rozplączesz sprawę stłuczonej doniczki, zbadasz cztery kroniki o pewnej bitwie i sam(a) zdecydujesz,
          czy się odbyła. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            źródłu wierzymy bardziej, gdy wiemy, kto je napisał, kiedy i po co — i gdy potwierdza je inne, niezależne
            źródło.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: mnich w brązowym habicie siedzi przy pochyłym drewnianym pulpicie w klasztornej celi i trzyma gęsie pióro nad zupełnie pustą kartą pergaminu; obok kałamarz i nożyk, za łukowym oknem widać kościół"
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
