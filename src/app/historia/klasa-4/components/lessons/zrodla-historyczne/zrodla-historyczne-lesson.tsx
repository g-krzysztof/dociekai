'use client';

import Image from 'next/image';
import { Coins, Filter, Package, Shovel } from 'lucide-react';
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
import { KapsulaCzasu } from './kapsula-czasu';
import { Wykopalisko } from './wykopalisko-blok';
import { ArcheologHistoryk } from './archeolog-historyk';
import { DwieBramki } from './dwie-bramki';
import { LupaNadMoneta } from './lupa-nad-moneta';
import { TeczkaDobromira } from './teczka-dobromira';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L2 — źródła historyczne. `[1.4]` `[1.5 — kultura]` `[1.6]`, filary 1 i 4.
 *
 * **Zdanie lekcji: wszystko, co zostawił człowiek, może opowiedzieć
 * o przeszłości — także to, co dziś wyrzucasz do kosza.**
 *
 * Cztery bloki, cztery gesty nowe w kursie:
 *
 *  - `KapsulaCzasu` — **pakuje kapsułę czasu** (5 z 6 rzeczy z plecaka),
 *    przewiduje słowa archeologa z 3026 r., potem patrzy, jak jego żartobliwie
 *    błędne odczyty toczą się bez udziału dziecka (lista zakupów to „modlitwa”);
 *  - `Wykopalisko` — **odsłania warstwy ziemi pędzelkiem** (pierwszy konsument
 *    silnika `dig`), odczytuje głębokości i układa znaleziska od najpłytszego
 *    do najgłębszego — regułę głębiej = dawniej odkrywa samo;
 *  - `DwieBramki` — **przepuszcza przedmioty przez dwie bramki-pytań**
 *    („da się dotknąć?” → „jest pismo?”); kategoria wynika z reguły, nie
 *    z klucza; pomnik z napisem to jawna pułapka;
 *  - `LupaNadMoneta` — **przesuwa lupę po rysunku denara** (pierwszy konsument
 *    silnika `source-desk`), szuka słowa POLONIE, wypełnia paszport źródła
 *    i przypina pinezkę „moneta z nazwą Polski, ok. 1000 r.”.
 *
 * R (archeolog kontra historyk) stoi pod blokiem 2 jako dopisek poza
 * postępem. Przypominajka wraca do reguły półek z L1 (dystans 1).
 */

const LESSON_KEY = 'warsztat-historyka/zrodla-historyczne';

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/zrodla-historyczne/muzeum-z-gablota.jpg',
  plecak: '/images/historia/lekcje/zrodla-historyczne/plecak-na-stole.jpg',
  stanowisko: '/images/historia/lekcje/zrodla-historyczne/stanowisko-archeologiczne.jpg',
  babcia: '/images/historia/lekcje/zrodla-historyczne/babcia-opowiada.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'kapsula', kind: 'haczyk', title: 'Kapsuła czasu', time: '5 min', icon: Package },
  { id: 'wykopalisko', kind: 'symulator', title: 'Wykopalisko', time: '7 min', icon: Shovel },
  { id: 'bramki', kind: 'cwiczenie', title: 'Dwie bramki', time: '6 min', icon: Filter },
  { id: 'moneta', kind: 'zrodlo', title: 'Lupa nad monetą', time: '6 min', icon: Coins },
];

const L1_LESSON = getLesson('start', 'pierwsza-lekcja-historii');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function ZrodlaHistoryczneLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zapakowałeś/łaś kapsułę czasu, przekopałeś/łaś trzy warstwy ziemi i wyczytałeś/łaś z monety słowo POLONIE — jeden z najstarszych zapisów nazwy Polski. Odtąd wiesz: źródłem może być wszystko, co zostawił człowiek."
      entry={
        L1_LESSON ? (
          <Przypominajka from={L1_LESSON} distance={1} color={histModule.color}>
            <TeczkaDobromira color={histModule.color} />
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
  const kapsula = useBlockDone('kapsula');
  const wykopalisko = useBlockDone('wykopalisko');
  const bramki = useBlockDone('bramki');
  const moneta = useBlockDone('moneta');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="kapsula">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.plecak}
          alt="Akwarela: szkolny plecak wysypany na drewniany stół — zeszyt, piórnik, jabłko, bilet i klucz leżą porozrzucane, bez żadnych napisów na przedmiotach"
          lead="Twoje rzeczy za tysiąc lat."
        >
          Zanim powiemy, czym są źródła historyczne — mały eksperyment na twoim plecaku. To, co dziś pakujesz
          do szkoły, za tysiąc lat ktoś może wykopać z ziemi.
        </LessonImageCard>
        <KapsulaCzasu color={color} onComplete={kapsula.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wykopalisko">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.stanowisko}
          alt="Akwarela: stanowisko archeologiczne — prostokątny wykop z widocznymi warstwami ziemi w przekroju, naciągnięte sznurki w kratkę, obok leżą pędzelki, łopatka i wiaderko"
          reverse
          lead="Archeolog czyta ziemię jak książkę — od góry."
        >
          Archeolodzy szukają materialnych śladów tego, co robili ludzie — a ich najważniejszą metodą są
          wykopaliska, czyli prace, które pozwalają odnaleźć przedmioty ukryte pod ziemią. Spróbuj sam/sama.
        </LessonImageCard>
        <Wykopalisko color={color} onComplete={wykopalisko.markBlockDone} />
        <ArcheologHistoryk color={color} />
      </LessonBlock>

      <LessonBlock id="bramki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.babcia}
          alt="Akwarela: babcia w chuście na głowie opowiada coś dwojgu dzieciom przy kuchennym stole — chłopiec i dziewczynka w wieku szkolnym słuchają z otwartymi buziami, na stole dzbanek i filiżanki"
          lead="Są też źródła, których nie da się dotknąć."
        >
          Opowieść babci, wspólne śpiewanie hymnu, tradycja kolędowania — to też źródła, choć nie leżą w żadnej gablocie.
          Historycy dzielą wszystkie źródła na trzy skrzynie. Sprawdź, jak działa ten podział.
        </LessonImageCard>
        <DwieBramki color={color} onComplete={bramki.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="moneta">
        <LupaNadMoneta color={color} lesson={LESSON_KEY} done={moneta.done} onComplete={moneta.markBlockDone} />
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
          Skąd historycy wiedzą, co było tysiąc lat temu? Nikt im nie opowiedział — musieli to wyczytać ze śladów,
          które zostawili ludzie: monet, listów, garnków, a nawet opowieści.
        </p>
        <p className="mt-3">
          W tej lekcji zakopiesz kapsułę czasu, przekopiesz wykopalisko warstwa po warstwie, przepuścisz przedmioty
          przez dwie bramki i odczytasz z monety jeden z najstarszych zapisów nazwy Polski. Wszystko stoi na jednym zdaniu:{' '}
          <strong>wszystko, co zostawił człowiek, może opowiedzieć o przeszłości — także to, co dziś wyrzucasz
          do kosza.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: spokojna sala muzealna — duża szklana gablota pełna glinianych skorup i starych przedmiotów, bez żadnych tabliczek, miękkie światło z wysokich okien"
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
