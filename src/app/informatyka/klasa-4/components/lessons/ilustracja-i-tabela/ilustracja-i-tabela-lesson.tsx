'use client';

import Image from 'next/image';
import { Image as ImageIcon, Share2, SpellCheck, Table } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { FloatLab } from './float-lab';
import { TableFill } from './table-fill';
import { SpellPass } from './spell-pass';
import { ShareBox } from './share-box';
import { RecipePlusStudio } from './recipe-plus-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Czwarta lekcja modułu 4 i dwudziesty pierwszy kształt lekcji w kursie.
 * **Domyka moduł o dokumentach tekstowych**: ilustracja, tabela, sprawdzanie
 * pisowni oraz zapis i udostępnienie `[3.3]`. Zadania obowiązkowego nie ma —
 * Z-9 i Z-10 przypadły na lekcje 1 i 3.
 *
 * Wspólny mianownik czterech widżetów: **każdy pokazuje, czego program NIE robi
 * za ciebie**.
 *  - `FloatLab` — obraz „ucieka”, bo nie jest związany z akapitem; nachodzenie
 *    liter na zdjęcie jest **mierzone z prawdziwego układu strony**, nie
 *    deklarowane;
 *  - `TableFill` — kolumnę wybiera się z danych: pusta komórka jest werdyktem,
 *    że takiej informacji w tekście nie ma;
 *  - `SpellPass` — trzy błędy znajduje maszyna, dwa musi znaleźć człowiek, bo
 *    słownik sprawdza istnienie wyrazu, nie sens zdania;
 *  - `ShareBox` — załącznik robi kopie i wracają dwie różne wersje; link zostawia
 *    jeden plik, a pytaniem staje się, co wolno innym.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/ilustracja-i-tabela/album-i-kratka.jpg',
  lodka: '/images/informatyka/lekcje/ilustracja-i-tabela/lodka-przy-palu.jpg',
  sito: '/images/informatyka/lekcje/ilustracja-i-tabela/sito-z-kamykami.jpg',
  miska: '/images/informatyka/lekcje/ilustracja-i-tabela/wspolna-miska.jpg',
  polka: '/images/informatyka/lekcje/ilustracja-i-tabela/polka-kuchenna.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'obrazek-ucieka',
    kind: 'haczyk',
    title: 'Obrazek, który ucieka',
    time: '7 min',
    icon: ImageIcon,
  },
  {
    id: 'kolumny-z-danych',
    kind: 'cwiczenie',
    title: 'Skąd się biorą kolumny tabeli',
    time: '7 min',
    icon: Table,
  },
  {
    id: 'czego-nie-widzi-program',
    kind: 'debugowanie',
    title: 'Trzy błędy znajdzie program, dwa ty',
    time: '6 min',
    icon: SpellCheck,
  },
  {
    id: 'wyslij-czy-udostepnij',
    kind: 'symulator',
    title: 'Wysłać plik czy dać link?',
    time: '6 min',
    icon: Share2,
  },
  {
    id: 'rozbuduj-przepis',
    kind: 'zadanie',
    title: 'Rozbuduj swój przepis o ilustrację i tabelę',
    time: '12 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function IlustracjaITabelaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przywiązałeś/przywiązałaś obrazek do akapitu, zbudowałeś/zbudowałaś tabelę z kolumn, które naprawdę są w danych, znalazłeś/znalazłaś dwa błędy, których program nie widzi, i zobaczyłeś/zobaczyłaś, co się dzieje z plikiem wysłanym jako załącznik. Na tym kończy się moduł o dokumentach — a zdanie, które z niego zostaje, brzmi: program układa litery, ale o tym, czy tekst da się przeczytać, decydujesz ty."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const float = useBlockDone('obrazek-ucieka');
  const table = useBlockDone('kolumny-z-danych');
  const spell = useBlockDone('czego-nie-widzi-program');
  const share = useBlockDone('wyslij-czy-udostepnij');
  const task = useBlockDone('rozbuduj-przepis');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="obrazek-ucieka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lodka}
          alt="Drewniana łódka przycumowana liną do pala stoi równo przy niewielkim pomoście nad spokojnym jeziorem, a daleko za nią druga taka sama łódka dryfuje bokiem na otwartej wodzie"
          lead="Przywiązana zostaje przy pomoście. Nieprzywiązana odpływa tam, gdzie zniesie ją woda."
        >
          Z obrazkiem w dokumencie jest tak samo. Może być <strong>przywiązany do akapitu</strong> i
          jeździć razem z nim albo leżeć na stronie luzem — a wtedy tekst wejdzie na niego przy
          pierwszym dopisanym zdaniu. Sprawdź to na trzech ustawieniach.
        </LessonImageCard>
        <FloatLab color={color} onComplete={float.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="kolumny-z-danych">
        <TableFill color={color} onComplete={table.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="czego-nie-widzi-program">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.sito}
          alt="Okrągłe sito z drucianą siatką stoi na jasnym blacie, w jego wnętrzu zostało kilka większych kamyków, a spod sita rozsypuje się kupka drobnego piasku, który przeleciał przez oczka"
          reverse
        >
          <p>
            Sito zatrzymuje to, co większe od oczek — i tylko to. Reszta leci na dół i sito nic o tym
            nie wie. <strong>Sprawdzanie pisowni jest właśnie takim sitem</strong>: łapie wyrazy,
            których nie ma w słowniku, a przepuszcza wszystkie, które są. Nawet postawione w złym
            miejscu.
          </p>
        </LessonImageCard>
        <SpellPass color={color} onComplete={spell.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wyslij-czy-udostepnij">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.miska}
          alt="Na jasnym blacie stoi jedna duża gliniana misa z kilkoma drewnianymi łyżkami włożonymi razem do środka, a obok niej stoją osobne małe miseczki, każda ze swoją własną łyżeczką"
          lead="Jedna wspólna misa albo trzy osobne — i to nie to samo."
          reverse
        >
          Wysłanie pliku e-mailem rozdaje trzy osobne miseczki: od tej chwili przepisów jest tyle,
          ile osób. Link zostawia <strong>jedną misę i trzy łyżki</strong>. Zobacz, co z tego wynika.
        </LessonImageCard>
        <ShareBox color={color} onComplete={share.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="rozbuduj-przepis">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.polka}
          alt="Drewniana półka kuchenna przy jasnej ścianie, a na niej słoik truskawkowych przetworów bez etykiety, złożona lniana ściereczka i oparta o ścianę drewniana łyżka"
        >
          <p>
            Nie piszesz nowego dokumentu — <strong>rozbudowujesz ten, który już masz</strong>. Weź
            przepis na koktajl niżej i dołóż mu ilustrację, tabelę i ostatnie sprawdzenie. Tak
            właśnie powstaje każdy porządny dokument: warstwami.
          </p>
        </LessonImageCard>
        <RecipePlusStudio color={color} onComplete={task.markBlockDone} />
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
          Do tej pory w twoich dokumentach był sam tekst. Teraz dołożysz dwie rzeczy, które{' '}
          <strong>mówią to, czego zdaniem powiedzieć się nie da</strong>: obrazek pokazuje, jak coś
          wygląda, a tabela — jak się rzeczy mają do siebie.
        </p>
        <p className="mt-3">
          Obie potrafią też solidnie namieszać. Obrazek lubi uciekać, tabela bywa wstawiona tam,
          gdzie wystarczyłaby lista, a na końcu czeka pułapka najbardziej podstępna: program
          zgłasza, że sprawdził pisownię, i wcale nie znaczy to, że tekst jest poprawny.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Album w brązowej oprawie leży otwarty na jasnym blacie, na jego pustej stronie zasuszony liść przytrzymany czterema papierowymi narożnikami, a obok albumu luźny arkusz papieru w drobną kratkę"
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
