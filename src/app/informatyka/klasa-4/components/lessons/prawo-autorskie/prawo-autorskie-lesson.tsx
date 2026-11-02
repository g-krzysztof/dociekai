'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Brush, LibraryBig, PenLine, Stamp } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { MyMark, type Drawing } from './my-mark';
import { MyLicense } from './my-license';
import { PictureBank } from './picture-bank';
import { OwnWords } from './own-words';
import { NatureNoteStudio } from './nature-note-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o cudzych materiałach i prawie autorskim — szósta w module 2, która go
 * domyka, i trzynasty różny kształt lekcji w kursie. Realizuje `[5.6]`:
 * respektowanie praw autorskich i podawanie źródeł.
 *
 * **Kręgosłupem lekcji jest rysunek, który dziecko rysuje w pierwszym bloku.**
 * O prawie autorskim nie da się przekonać cudzym przykładem, więc lekcja zaczyna
 * od zabrania dziecku czegoś jego własnego — a potem ten sam rysunek wraca
 * w bloku drugim, tym razem z dzieckiem po stronie autora, który stawia warunki.
 * To jest jedyna rzecz w tej lekcji przechodząca między blokami, dlatego stan
 * rysunku siedzi w `LessonBody`, nad `LessonBlock` (reset pojedynczego bloku go
 * nie kasuje).
 *
 * Pięć bloków, pięć różnych interakcji — żadna nie jest „wybierz opcję,
 * przeczytaj wyjaśnienie”:
 *  - `MyMark` — dziecko **rysuje** (pierwszy raz w całym repo), a potem cztery
 *    sceny dzieją się bez jego udziału;
 *  - `MyLicense` — przełączniki nazywają się prawdziwą licencją CC, a trzy
 *    prośby o zgodę **odpowiadają same** według tego, co dziecko ustawiło;
 *  - `PictureBank` — filtrowanie biblioteki i trzy puste miejsca w prezentacji,
 *    gdzie plik bez licencji zostaje odrzucony przy wstawianiu;
 *  - `OwnWords` — **tekst dziecka czytany przez detektor przepisanych ciągów**,
 *    z podświetleniem na żywo;
 *  - `PracticeTask` — notatka z sekcją „Źródła” do zrobienia w edytorze.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/prawo-autorskie/paleta-i-pedzle-v2.jpg',
  rysunek: '/images/informatyka/lekcje/prawo-autorskie/klebek-nici-v2.jpg',
  zasady: '/images/informatyka/lekcje/prawo-autorskie/furtka-w-plocie-v2.jpg',
  slowa: '/images/informatyka/lekcje/prawo-autorskie/lisc-i-odcisk-v2.jpg',
  notatka: '/images/informatyka/lekcje/prawo-autorskie/bukiet-polny-v2.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'moj-rysunek',
    kind: 'haczyk',
    title: 'Narysuj coś swojego',
    time: '7 min',
    icon: Brush,
  },
  {
    id: 'twoje-zasady',
    kind: 'wyjasnienie',
    title: 'Ty ustalasz, co komu wolno',
    time: '7 min',
    icon: Stamp,
  },
  {
    id: 'bank-plikow',
    kind: 'zrodla',
    title: 'Skąd wziąć zdjęcie, którego wolno użyć',
    time: '8 min',
    icon: LibraryBig,
  },
  {
    id: 'wlasnymi-slowami',
    kind: 'cwiczenie',
    title: 'Przepisz to własnymi słowami',
    time: '8 min',
    icon: PenLine,
  },
  {
    id: 'notatka',
    kind: 'zadanie',
    title: 'Notatka, pod którą stoi „Źródła”',
    time: '8 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function PrawoAutorskieLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Narysowałeś/narysowałaś coś swojego i zobaczyłeś/zobaczyłaś, jak łatwo to komuś odjechało — a potem sam/sama ustawiłeś/ustawiłaś licencję, wybrałeś/wybrałaś legalne pliki do prezentacji i napisałeś/napisałaś notatkę własnymi słowami. Zostało jedno, i to na całe życie: przy każdym cudzym pliku sprawdź, kto go zrobił i co pozwolił z nim zrobić."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  /** Rysunek z bloku 1 — jedyna rzecz przechodząca między blokami tej lekcji. */
  const [drawing, setDrawing] = useState<Drawing | null>(null);

  const mark = useBlockDone('moj-rysunek');
  const license = useBlockDone('twoje-zasady');
  const bank = useBlockDone('bank-plikow');
  const ownWords = useBlockDone('wlasnymi-slowami');
  const task = useBlockDone('notatka');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="moj-rysunek">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.rysunek}
          alt="Kłębek czerwonej włóczki leży na drewnianym stole, a odwinięta nitka biegnie długim łukiem poza krawędź stołu"
          lead="Raz puszczone — idzie dalej samo."
        >
          Zacznij od czegoś swojego. Narysuj cokolwiek, podpisz się i wrzuć do sieci — a potem już
          tylko patrz, bo przez cztery kolejne sceny nic nie będzie od ciebie zależeć.
        </LessonImageCard>
        <MyMark color={color} onSign={setDrawing} onComplete={mark.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="twoje-zasady">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.zasady}
          alt="Drewniana furtka w niskim sztachetowym płocie, na słupku zawieszona pętla sznurka, dookoła trawa i drobne polne kwiaty"
        >
          <p>
            Teraz odwrotnie: <strong>ty jesteś autorem, który stawia warunki</strong>. Ustawisz trzy
            przełączniki dla swojego rysunku — a to, co ustawisz, ma prawdziwą nazwę i widnieje
            pod milionami zdjęć w internecie. Potem otworzysz skrzynkę z prośbami.
          </p>
        </LessonImageCard>
        <MyLicense color={color} drawing={drawing} onComplete={license.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="bank-plikow">
        <PictureBank color={color} onComplete={bank.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wlasnymi-slowami">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.slowa}
          alt="Świeży zielony liść leży obok swojego dokładnego odcisku odbitego w płytce szarej gliny"
          lead="Odcisk wygląda jak liść, ale nie jest liściem."
          reverse
        >
          Kopiowanie cudzego akapitu wygląda jak twoja praca — i nie jest twoją pracą. Napiszesz to
          samo własnymi słowami, a strona przeczyta twój tekst i pokaże ci na bieżąco, co
          przepisałeś/przepisałaś dosłownie.
        </LessonImageCard>
        <OwnWords color={color} onComplete={ownWords.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="notatka">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.notatka}
          alt="Bukiet polnych kwiatów różnych gatunków przewiązany szarym sznurkiem, obok kilka luźnych łodyg na drewnianym blacie"
          reverse
        >
          <p>
            Na koniec zrób to naprawdę — na tej stronie. Jedna strona notatki:{' '}
            <strong> twoje zdania, jedno cudze zdjęcie wzięte legalnie i sekcja „Źródła”</strong> na
            dole. Ta sekcja jest tym, co odróżnia pracę od ściągnięcia.
          </p>
        </LessonImageCard>
        <NatureNoteStudio color={color} onComplete={task.markBlockDone} />
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
          „Nie kradnij cudzych zdjęć” brzmi jak jedna z tych zasad, które dotyczą kogoś innego.
          Więc <strong>zaczniemy od twojego rysunku</strong> — narysujesz go za chwilę, podpiszesz
          i wrzucisz do internetu. Reszta stanie się bez ciebie.
        </p>
        <p className="mt-3">
          Potem ustawisz dla niego własne zasady i zobaczysz, że to, co wymyśliłeś/wymyśliłaś, ma
          prawdziwą nazwę. Na końcu wybierzesz legalne zdjęcia i dźwięk do prezentacji i napiszesz
          notatkę własnymi słowami — a strona sprawdzi, czy naprawdę własnymi.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Drewniana paleta malarska z kilkoma plamkami farby leży na blacie obok dwóch pędzli o gołych drewnianych trzonkach, pod nią czyste arkusze papieru z ledwie zaczętym szkicem"
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
