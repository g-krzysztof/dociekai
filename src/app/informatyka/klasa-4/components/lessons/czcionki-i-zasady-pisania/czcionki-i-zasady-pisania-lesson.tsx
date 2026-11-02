'use client';

import Image from 'next/image';
import { Highlighter, Pilcrow, Type } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { MarksOn } from './marks-on';
import { ReflowTest } from './reflow-test';
import { EmphasisAudit } from './emphasis-audit';
import { SamplerBench } from './sampler-bench';
import { SamplerStudio } from './sampler-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Pierwsza lekcja modułu 4 i osiemnasty kształt lekcji w kursie. **Otwiera
 * moduł o dokumentach tekstowych** i niesie zadanie obowiązkowe **Z-9** (próbnik
 * dziesięciu krojów czcionki z polskimi znakami).
 *
 * Kręgosłupem jest rzecz, której w tekście **nie widać**: spacje, Entery i to,
 * czy krój w ogóle ma polskie litery. Stąd kolejność bloków — najpierw
 * przełącznik, który pokazuje niewidzialne, potem czynność, która ujawnia
 * różnicę strukturalną, potem praca przez odejmowanie, na końcu próba generalna
 * zadania:
 *  - `MarksOn` — **widoczność jako narzędzie**: dopóki znaki niedrukowane są
 *    wyłączone, nie ma w co kliknąć;
 *  - `ReflowTest` — dwa identyczne akapity, jedno kliknięcie i jeden z nich się
 *    rozsypuje; naprawa jest natychmiastowa i widoczna;
 *  - `EmphasisAudit` — **jedyny widżet kursu, w którym pracuje się przez
 *    odejmowanie** (zdejmowanie wyróżnień, nie nakładanie);
 *  - `SamplerBench` — próbnik krojów z pułapką: krój z internetu bez polskich
 *    liter, których program po cichu nie zostawia pustych, tylko podstawia.
 *
 * Z-9 odbieramy **w lekcji** (`SamplerStudio` na `MiniWriter`), nie listą
 * kontrolną: „nazwa zapisana tym właśnie krojem” jest niewidoczna na ekranie
 * przy domyślnym kroju i widoczna po wybraniu go z listy, więc dziesięć wierszy
 * jednym krojem nie przechodzi werdyktu tak samo jak prawdziwy próbnik. Po
 * przyjęciu pracy strona przepytuje przeglądarkę o kroje z jego listy — pułapka
 * z `SamplerBench` wraca wtedy na jego własnej pracy.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/czcionki-i-zasady-pisania/czcionki-drukarskie.jpg',
  szklo: '/images/informatyka/lekcje/czcionki-i-zasady-pisania/znak-wodny-w-oknie.jpg',
  sznur: '/images/informatyka/lekcje/czcionki-i-zasady-pisania/sznur-i-gwozdzie.jpg',
  zakreslacz: '/images/informatyka/lekcje/czcionki-i-zasady-pisania/zakreslone-kartki.jpg',
  stemple: '/images/informatyka/lekcje/czcionki-i-zasady-pisania/stemple-w-pudelku.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'znaki-niewidzialne',
    kind: 'haczyk',
    title: 'Pięć usterek, których nie widać',
    time: '6 min',
    icon: Pilcrow,
  },
  {
    id: 'enter-konczy-akapit',
    kind: 'wyjasnienie',
    title: 'Dwa identyczne akapity i jedno kliknięcie',
    time: '6 min',
  },
  {
    id: 'mniej-wyroznien',
    kind: 'cwiczenie',
    title: 'Wyróżnij mniej, żeby było widać więcej',
    time: '6 min',
    icon: Highlighter,
  },
  {
    id: 'probnik-krojow',
    kind: 'symulator',
    title: 'Próbnik krojów i pułapka z polskimi literami',
    time: '7 min',
    icon: Type,
  },
  {
    id: 'probki-z9',
    kind: 'zadanie',
    title: 'Dziesięć krojów czcionki na tej stronie',
    time: '12 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function CzcionkiIZasadyPisaniaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zobaczyłeś/zobaczyłaś znaki, których nie widać, rozsypałeś/rozsypałaś akapit jednym kliknięciem i naprawiłeś/naprawiłaś go drugim, odchudziłeś/odchudziłaś przeładowane ogłoszenie i złapałeś/złapałaś krój bez polskich liter. Zdanie na cały moduł o dokumentach: tekst pisze się dla tego, kto będzie go czytał — a nie dla tego, kto go pisze."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const marks = useBlockDone('znaki-niewidzialne');
  const reflow = useBlockDone('enter-konczy-akapit');
  const emphasis = useBlockDone('mniej-wyroznien');
  const sampler = useBlockDone('probnik-krojow');
  const task = useBlockDone('probki-z9');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="znaki-niewidzialne">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.szklo}
          alt="Kartka jasnego papieru oparta o szybę w słonecznym oknie — pod światło widać w niej delikatny znak wodny w drobne kwiaty, a taka sama kartka leżąca płasko na parapecie obok wygląda na zupełnie pustą"
          lead="Pod światło widać wzór, którego na leżącej kartce nie ma wcale."
        >
          W tekście też są rzeczy niewidzialne — <strong>spacje i Entery</strong>. To one decydują,
          czy dokument się nie rozjedzie, a zobaczyć je można dopiero po włączeniu jednego
          przycisku. List niżej ma pięć usterek. Znajdź ten przycisk.
        </LessonImageCard>
        <MarksOn color={color} onComplete={marks.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="enter-konczy-akapit">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.sznur}
          alt="U góry sznur rozpięty między dwoma drewnianymi słupkami wisi swobodnym, miękkim łukiem, a pod nim taki sam sznur przybity do deski pięcioma gwoździami układa się w sztywny, nierówny zygzak"
          reverse
        >
          <p>
            Sznurek rozpięty swobodnie sam układa się w łuk — przesuń słupek, a zmieni kształt.
            Sznurek przybity gwoździami zostanie tam, gdzie go przybito, choćby całą deskę
            przestawić. <strong>Enter w środku akapitu to taki gwóźdź.</strong> Poniżej dwa akapity z
            tym samym tekstem: jeden rozpięty, drugi przybity.
          </p>
        </LessonImageCard>
        <ReflowTest color={color} onComplete={reflow.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="mniej-wyroznien">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zakreslacz}
          alt="Dwie kartki pokryte rzędami drobnych, nieczytelnych szarych zawijasów leżą obok siebie na kremowym tle — lewa jest zamalowana żółtym zakreślaczem niemal w całości, na prawej zakreślone są tylko dwa krótkie fragmenty"
          lead="Na której kartce widać, co jest ważne?"
          reverse
        >
          Zakreślacz działa tylko dopóty, dopóki zostaje coś niezakreślonego. Z pogrubieniem,
          kursywą i kolorem w dokumencie jest identycznie. Ogłoszenie niżej wyróżniono w całości —
          twoim zadaniem jest <strong>zdjąć</strong>, nie dodać.
        </LessonImageCard>
        <EmphasisAudit color={color} onComplete={emphasis.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="probnik-krojow">
        <SamplerBench color={color} onComplete={sampler.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="probki-z9">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.stemple}
          alt="Drewniane pudełko z przegródkami stoi otwarte na jasnym blacie, w środku leżą rzędem stempelki o toczonych drewnianych rączkach, a jeden wyjęty leży obok pudełka gumową stopką do góry"
        >
          <p>
            Teraz to samo na tej stronie — i z dziesięcioma krojami zamiast czterech. Pamiętaj o
            dwóch rzeczach, które przed chwilą ćwiczyłeś/ćwiczyłaś: nazwa kroju zapisana{' '}
            <strong>tym właśnie krojem</strong> i <strong>sprawdzone polskie litery</strong>.
          </p>
        </LessonImageCard>
        <SamplerStudio color={color} onComplete={task.markBlockDone} />
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
          Pisania na komputerze nikt nie uczy, bo wydaje się, że nie ma czego: naciskasz litery i
          litery się pojawiają. A jednak dokumenty potrafią{' '}
          <strong>rozsypać się same</strong> — wystarczy zmienić czcionkę i nagle wiersze stoją w
          schodkach, a odstępy są wszędzie inne. Winne są rzeczy, których w tekście nie widać.
        </p>
        <p className="mt-3">
          W tej lekcji je zobaczysz. Włączysz znaki niedrukowane i naprawisz pięć usterek w liście,
          sprawdzisz, czym Enter różni się od końca wiersza, odchudzisz ogłoszenie, na którym
          wyróżnione jest wszystko, i złożysz próbnik krojów — razem z pułapką, na którą nabiera się
          każdy, kto ściąga czcionki z internetu.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Drewniana kaszta zecerska z przegródkami stoi otwarta na jasnym blacie, w przegródkach leżą metalowe czcionki drukarskie z wypukłymi literami na końcach, a obok pudełka leżą dwa ołówki"
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
