'use client';

import Image from 'next/image';
import { Columns3, FileCheck2, MessageSquare, Paperclip, Users } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { AttachmentChaos } from './attachment-chaos';
import { SameParagraph } from './same-paragraph';
import { TaskBoard } from './task-board';
import { CommentOrEdit } from './comment-or-edit';
import { ProjectRoom } from './project-room';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Druga lekcja modułu 8, trzydziesta piąta w kursie. Realizuje `[5.1]`
 * *korzysta z narzędzi cyfrowych do współpracy i tworzenia dokumentów*.
 *
 * **Cała lekcja stoi na jednym zdaniu: w chmurze wszyscy patrzą na TEN SAM
 * dokument naraz — więc trzeba się umówić, kto co robi, a poprawki zostawia
 * się jako komentarz, nie jako nadpisanie cudzej pracy.** Jeden plan wycieczki
 * klasowej wraca w trzech blokach: w haczyku psuje go mailowy bałagan wersji,
 * w zadaniu dziecko robi go porządnie jako jeden wspólny dokument.
 *
 * Pięć bloków, jeden nowy gest w repo:
 *
 *  - `AttachmentChaos` — otwiera trzy mailowe załączniki tego samego planu
 *    i odkrywa, że żaden nie ma kompletu aktualnych informacji;
 *  - `SameParagraph` — **pisze w polu, w które w tej samej chwili wpisuje się
 *    też Zosia** (nowe): własne zdanie miesza się z cudzym na oczach dziecka,
 *    zanim spróbuje wolnego akapitu bez kolizji;
 *  - `TaskBoard` — przeciąga imiona na części innego projektu (prezentacja
 *    o zwierzętach), ćwicząc mechanikę podziału bez presji;
 *  - `CommentOrEdit` — próbuje poprawić cudzy błąd wprost (nic się nie
 *    dzieje), potem zostawia komentarz, na który autor sam reaguje;
 *  - `ProjectRoom` — zadanie w lekcji: ten sam plan wycieczki z haczyka,
 *    tym razem jako jeden dokument z podziałem, własną treścią, przejrzeniem
 *    cudzych części i komentarzem zamiast poprawki wprost. Werdykt w czterech
 *    punktach, zero pliku do wgrania.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/wspolpraca-w-chmurze/trzy-olowki.jpg',
  kolizja: '/images/informatyka/lekcje/wspolpraca-w-chmurze/skrzyzowane-olowki.jpg',
  tablica: '/images/informatyka/lekcje/wspolpraca-w-chmurze/tablica-kartek.jpg',
  karteczka: '/images/informatyka/lekcje/wspolpraca-w-chmurze/karteczka-na-stronie.jpg',
  zeszyty: '/images/informatyka/lekcje/wspolpraca-w-chmurze/trzy-zeszyty.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'zalaczniki',
    kind: 'haczyk',
    title: 'Trzy maile, jeden plan',
    time: '5 min',
    icon: Paperclip,
  },
  {
    id: 'akapit',
    kind: 'symulator',
    title: 'Ten sam akapit naraz',
    time: '5 min',
    icon: Users,
  },
  {
    id: 'podzial',
    kind: 'cwiczenie',
    title: 'Kto robi co',
    time: '5 min',
    icon: Columns3,
  },
  {
    id: 'komentarz',
    kind: 'wyjasnienie',
    title: 'Popraw czy skomentuj',
    time: '5 min',
    icon: MessageSquare,
  },
  {
    id: 'dokument',
    kind: 'zadanie',
    title: 'Zadanie: wspólny plan wycieczki',
    time: '8 min',
    icon: FileCheck2,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function WspolpracaWChmurzeLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zabierz z tej lekcji jedno zdanie: w chmurze wszyscy patrzą na TEN SAM dokument naraz. Dlatego zanim ktokolwiek zacznie pisać, warto się umówić, kto robi którą część — a kiedy widzisz błąd w cudzej pracy, zostaw komentarz zamiast nadpisywać. Dokładnie tak zrobiliście z planem wycieczki, który na początku lekcji psuł się w trzech mailach."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const attachments = useBlockDone('zalaczniki');
  const paragraph = useBlockDone('akapit');
  const board = useBlockDone('podzial');
  const comment = useBlockDone('komentarz');
  const task = useBlockDone('dokument');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="zalaczniki">
        <AttachmentChaos color={color} onComplete={attachments.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="akapit">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kolizja}
          alt="Bliski kadr kartki w linie z notatnika: pomarańczowa i szara kredka leżą skrzyżowane, obie zatemperowane końcówki stykają się dokładnie w tym samym miejscu na pustej stronie"
          lead="Dwie kredki, jedno miejsce na kartce."
        >
          W wspólnym dokumencie nie ma osobnych kopii — jest jedna, którą widzą wszyscy naraz. Jeśli
          dwie osoby piszą w tym samym miejscu w tej samej chwili, ich zdania się mieszają. Sprawdź to
          na sobie.
        </LessonImageCard>
        <SameParagraph color={color} onComplete={paragraph.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="podzial">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.tablica}
          alt="Tablica korkowa nad drewnianym biurkiem z trzema pustymi kartkami przypiętymi w rzędzie, każda innym kolorem pinezki: czerwoną, niebieską i zieloną"
          reverse
        >
          <p>
            Kolizji z poprzedniego bloku da się uniknąć w jeden sposób: <strong>umówić się z góry</strong>,
            kto pisze którą część. Poćwicz na przykładowym projekcie klasy — dopiero potem zrobisz to
            naprawdę, w zadaniu.
          </p>
        </LessonImageCard>
        <TaskBoard color={color} onComplete={board.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="komentarz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.karteczka}
          alt="Otwarty notatnik z pustą stroną, do której spinaczem przypięta jest mała żółta karteczka, ustawiona pod kątem, jakby wskazywała miejsce na stronie poniżej"
          lead="Karteczka przy tekście, nie na tekście."
        >
          Część dokumentu, którą pisze ktoś inny, jest jego. Widzisz w niej błąd? W chmurze nie
          nadpisujesz cudzego zdania — zostawiasz komentarz przy nim, tak jak tę karteczkę.
        </LessonImageCard>
        <CommentOrEdit color={color} onComplete={comment.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="dokument">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.zeszyty}
          alt="Trzy notatniki w różnych kolorach okładek — czerwonym, niebieskim i zielonym — leżące otwarte obok siebie na drewnianym biurku, ich kartki lekko się stykają, a przez wszystkie trzy przebiega jedna kredka"
          reverse
        >
          <p>
            Wróć do planu wycieczki z pierwszego bloku. Tym razem zróbcie go porządnie — jako{' '}
            <strong>jeden wspólny dokument</strong>, z podziałem, własną treścią i komentarzem
            zamiast poprawki wprost. Cała praca dzieje się tutaj, na stronie.
          </p>
        </LessonImageCard>
        <ProjectRoom color={color} onComplete={task.markBlockDone} />
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
          Klasa szykuje wycieczkę, a plan krąży mailem — trzy osoby, trzy kopie, każda z innymi
          poprawkami. Dokładnie po to wymyślono <strong>wspólny dokument w chmurze</strong>: jedną
          kopię, którą wszyscy widzą naraz, zamiast kilku plików do sklejania ręcznie.
        </p>
        <p className="mt-3">
          Ale jedna wspólna kopia ma swoją cenę: kiedy dwie osoby piszą w tym samym miejscu naraz,
          ich zdania się mieszają. Dlatego cała lekcja stoi na jednym zdaniu:{' '}
          <strong>trzeba się umówić, kto robi co</strong>, a poprawki cudzej pracy zostawiać jako
          komentarz, nie nadpisanie.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Otwarty notatnik z pustą stroną, na której leżą trzy kredki — czerwona, niebieska i zielona — z zatemperowanymi końcówkami stykającymi się blisko środka kartki"
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
