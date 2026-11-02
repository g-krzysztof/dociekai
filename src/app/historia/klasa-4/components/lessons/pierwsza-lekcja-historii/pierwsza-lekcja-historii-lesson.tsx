'use client';

import Image from 'next/image';
import { FolderSearch, Hourglass, MapPin, School } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { TerazNaOsi } from './teraz-na-osi';
import { ArchiwumPostaci } from './archiwum-postaci';
import { SzkolaNadRzeka } from './szkola-nad-rzeka';
import { TwojaOs } from './twoja-os';
import { NauczycielkaZycia } from './nauczycielka-zycia';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L1 — pierwsza lekcja kursu historii. `[1.1]` `[1.2]` `[1.3]`, filary 1 i 5.
 *
 * **Zdanie lekcji: historia stara się opowiadać o tym, co naprawdę się zdarzyło —
 * dlatego zawsze pyta: skąd to wiemy?**
 *
 * Cztery bloki, cztery gesty, wszystkie nowe w kursie:
 *
 *  - `TerazNaOsi` — **ciągnie znacznik „teraz” po osi** (przeszłość to wszystko,
 *    co minęło, także śniadanie), potem przeciąga słowo „historia” z dymków do
 *    trzech słoików (opowieść / przeszłość / nauka);
 *  - `ArchiwumPostaci` — **otwiera teczki i wysuwa szuflady**, odkłada teczkę na
 *    półkę według znaleziska (historyczna / legendarna / baśniowa wychodzi
 *    z dowodów, nie z klucza autora);
 *  - `SzkolaNadRzeka` — **stawia szkołę na planie i ogląda stulecie
 *    w przyspieszeniu**; kronika w bibliotece mówiła, dokąd sięga wielka woda;
 *  - `TwojaOs` — **ciągnie pinezkę wstecz rok po roku** do roku swoich urodzin
 *    i przypina ją na Osi dziejów (pierwsza pinezka osobista, sam rok, tylko na
 *    urządzeniu); zapowiedź roku — pięć przygaszonych sylwetek.
 *
 * Pod ostatnim blokiem dopisek D (Cyceron), poza postępem. Przypominajki nie ma
 * — L1 nie ma do czego wracać.
 */

const LESSON_KEY = 'start/pierwsza-lekcja-historii';

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/pierwsza-lekcja-historii/strych-z-kufrem.jpg',
  polka: '/images/historia/lekcje/pierwsza-lekcja-historii/basn-i-kronika.jpg',
  miasteczko: '/images/historia/lekcje/pierwsza-lekcja-historii/miasteczko-nad-rzeka.jpg',
  zdjecia: '/images/historia/lekcje/pierwsza-lekcja-historii/zdjecia-z-babcia.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'teraz', kind: 'haczyk', title: 'To już historia?', time: '6 min', icon: Hourglass },
  { id: 'archiwum', kind: 'sledztwo', title: 'Archiwum postaci', time: '7 min', icon: FolderSearch },
  { id: 'szkola', kind: 'dylemat', title: 'Gdzie postawić szkołę?', time: '6 min', icon: School },
  { id: 'os', kind: 'refleksja', title: 'Twoja oś', time: '4 min', icon: MapPin },
];

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function PierwszaLekcjaHistoriiLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Twoja oś dziejów ma pierwszą pinezkę — twoją. A po drodze sprawdziłeś/sprawdziłaś to, co sprawdza każdy historyk: nie „czy to ciekawa opowieść?”, tylko „skąd to wiemy?”."
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const teraz = useBlockDone('teraz');
  const archiwum = useBlockDone('archiwum');
  const szkola = useBlockDone('szkola');
  const os = useBlockDone('os');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="teraz">
        <TerazNaOsi color={color} onComplete={teraz.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="archiwum">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.polka}
          alt="Drewniana półka: po lewej gruba księga z bajkową okładką — gwiazdy, księżyc i zamek na wzgórzu, obok niej oparta stara, popękana skórzana kronika z czerwoną woskową pieczęcią na wstążce, a z prawej zapalona świeca w mosiężnym lichtarzu"
          lead="Baśń i kronika mogą stać na jednej półce. Ale tylko jedna z nich mówi, skąd wie to, co wie."
        >
          O każdej postaci ktoś coś opowiada. Historyk pyta o coś innego: gdzie ta osoba żyła, kiedy, jaki dokument
          po niej został i co można dziś zobaczyć na własne oczy. Zajrzyj do archiwum i sprawdź to sam/sama.
        </LessonImageCard>
        <ArchiwumPostaci color={color} onComplete={archiwum.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="szkola">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.miasteczko}
          alt="Akwarela: małe miasteczko z czerwonymi dachami, rynkiem i wieżą kościoła na wzniesieniu nad szeroką rzeką; między miasteczkiem a rzeką rozciąga się płaska zielona łąka z wierzbami, przez rzekę prowadzi kamienny most, a na skraju łąki przy polnej drodze stoi drewniany krzyż"
          reverse
        >
          <p>
            Znajomość przeszłości to nie tylko ciekawostki. Ludzie, którzy żyli przed nami, widzieli rzeczy, których my
            jeszcze nie widzieliśmy — i czasem je zapisali. <strong>Kto zna przeszłość, może przewidzieć skutki swoich
            decyzji.</strong> Sprawdź to na miasteczku nad rzeką.
          </p>
        </LessonImageCard>
        <SzkolaNadRzeka color={color} onComplete={szkola.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="os">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zdjecia}
          alt="Akwarela: dziewczynka w żółtym swetrze i babcia z siwymi włosami upiętymi w kok siedzą przy kuchennym stole nad starymi czarno-białymi zdjęciami i otwartym albumem; babcia wskazuje palcem jedno zdjęcie, obok stoją dzbanek i dwie filiżanki"
          lead="Twoja historia też się już zaczęła."
        >
          Przez cały rok będziesz przypinać wydarzenia na swojej Osi dziejów — od pierwszych ludzi po upadek Rzymu.
          Pierwsza pinezka jest najbliżej: to rok, w którym się urodziłeś/urodziłaś.
        </LessonImageCard>
        <TwojaOs color={color} lesson={LESSON_KEY} done={os.done} onComplete={os.markBlockDone} />
      </LessonBlock>

      <NauczycielkaZycia color={color} />
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
          Na strychu stoi stary kufer. W środku listy, zdjęcia, czyjś zeszyt. Każda z tych rzeczy to kawałek czyjejś
          przeszłości — i każda coś mówi, jeśli umie się ją zapytać.
        </p>
        <p className="mt-3">
          W tej lekcji przeciągniesz „teraz” przez tysiące lat, przeszukasz archiwum postaci, postawisz szkołę w
          miasteczku nad rzeką i przypniesz pierwszą pinezkę na swojej osi. Wszystko stoi na jednym zdaniu:{' '}
          <strong>historia stara się opowiadać o tym, co naprawdę się zdarzyło — dlatego zawsze pyta: skąd to
          wiemy?</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: strych pod skośnym drewnianym dachem, przez okno dachowe wpada smuga słońca na otwarty stary kufer z żelaznymi okuciami; w kufrze leży plik listów przewiązanych wstążką i kilka starych fotografii, obok stoi krzesło i wiklinowy kosz"
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
