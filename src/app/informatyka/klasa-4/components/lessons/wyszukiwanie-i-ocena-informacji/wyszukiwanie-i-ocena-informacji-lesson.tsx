'use client';

import Image from 'next/image';
import { ListChecks, ScanSearch, Search, ShieldAlert, Volume2 } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { LoudOrTrue } from './loud-or-true';
import { KeywordForge } from './keyword-forge';
import { SourceCheck } from './source-check';
import { RedFlags } from './red-flags';
import { BeforeYouTrust } from './before-you-trust';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o szukaniu i sprawdzaniu informacji — druga zbudowana w module 2 i
 * dziewiąty różny kształt lekcji w kursie. Temat `[4.3 — moduł medialny]`:
 * dobre słowa kluczowe, porównywanie źródeł, rozpoznawanie podejrzanych treści
 * i podstawowe działania obronne.
 *
 * Kształt: haczyk (po tonie nie poznasz, co prawda) → symulator (ułóż zapytanie
 * — autorski akcent tej lekcji) → wyjaśnienie (pięć pytań do dwóch stron o tej
 * samej sprawie) → dylemat (cztery podejrzane treści, co robisz) → refleksja
 * (złóż własną listę „zanim uwierzę”). Pierwsza lekcja kursu z DWOMA blokami
 * typu „zbuduj coś z klocków” (zapytanie + lista) i pierwsza, której haczyk to
 * wielorundowe zgadywanie prawda/fałsz. Bez zadania offline — cel jest o
 * umiejętności oceny, ćwiczonej w samych widżetach.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/wyszukiwanie-i-ocena-informacji/lampa-nad-ksiazkami.jpg',
  hook: '/images/informatyka/lekcje/wyszukiwanie-i-ocena-informacji/dwa-jablka.jpg',
  keyword: '/images/informatyka/lekcje/wyszukiwanie-i-ocena-informacji/pek-kluczy.jpg',
  source: '/images/informatyka/lekcje/wyszukiwanie-i-ocena-informacji/waga-szalkowa.jpg',
  flags: '/images/informatyka/lekcje/wyszukiwanie-i-ocena-informacji/pulapka-z-serem.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'ton',
    kind: 'haczyk',
    title: 'Czy po tonie poznasz, co jest prawdą?',
    time: '5 min',
    icon: Volume2,
  },
  {
    id: 'slowa',
    kind: 'symulator',
    title: 'Ułóż dobre zapytanie do wyszukiwarki',
    time: '7 min',
    icon: Search,
  },
  {
    id: 'zrodla',
    kind: 'wyjasnienie',
    title: 'Dwie strony, jedna sprawa — pięć pytań',
    time: '7 min',
    icon: ScanSearch,
  },
  {
    id: 'pulapki',
    kind: 'dylemat',
    title: 'Podejrzana treść — co robisz?',
    time: '7 min',
    icon: ShieldAlert,
  },
  {
    id: 'lista',
    kind: 'refleksja',
    title: 'Twoja lista „zanim uwierzę”',
    time: '4 min',
    icon: ListChecks,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function WyszukiwanieIOcenaInformacjiLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Umiesz już ułożyć dobre słowa do wyszukiwarki i sprawdzić stronę pięcioma pytaniami: kto, kiedy, skąd wie, czy coś sprzedaje, czy potwierdza to ktoś jeszcze. W następnej lekcji zajmiesz się tym, co w sieci zostawiasz o sobie — i jak chronić swoje hasła."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const tone = useBlockDone('ton');
  const words = useBlockDone('slowa');
  const sources = useBlockDone('zrodla');
  const traps = useBlockDone('pulapki');
  const list = useBlockDone('lista');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="ton">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.hook}
          alt="Dwa jabłka na lnianej ściereczce: jedno duże, lśniące i idealnie czerwone, drugie małe i matowe"
          lead="Po skórce nie poznasz, które jabłko jest słodkie. Po tonie zdania nie poznasz, czy jest prawdziwe."
        >
          Najpierw sprawdź to na trzech parach zdań — jedno w każdej parze jest zmyślone. Zobacz,
          czy da się je rozdzielić samym „na oko”.
        </LessonImageCard>
        <LoudOrTrue color={color} onComplete={tone.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="slowa">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.keyword}
          alt="Pęk różnych kluczy na kółku leży na drewnianym stole, jeden stary żeliwny klucz odsunięty nieco na bok"
        >
          <p>
            Wyszukiwarka otwiera się właściwym <strong>słowem</strong> jak zamek właściwym kluczem.
            Za dużo słów albo nie te — i nic nie pasuje. Poćwicz układanie zapytań na trzech
            sytuacjach.
          </p>
        </LessonImageCard>
        <KeywordForge color={color} onComplete={words.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zrodla">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.source}
          alt="Mała mosiężna waga szalkowa na łańcuszkach: na lewej szalce leży gładki szary kamień, prawa szalka jest pusta"
          lead="Jedno źródło to za mało. Prawdę widać dopiero, gdy zestawisz je z drugim."
          reverse
        >
          Weź dwie strony, które twierdzą to samo, i przepuść obie przez pięć tych samych pytań.
          Różnica zwykle nie jest tam, gdzie jej szukasz.
        </LessonImageCard>
        <SourceCheck color={color} onComplete={sources.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pulapki">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.flags}
          alt="Drewniana łapka na myszy z kawałkiem żółtego sera jako przynętą, ustawiona na deskach podłogi"
          reverse
        >
          <p>
            Część treści w sieci to <strong>przynęta</strong> — ma sprawić, żebyś kliknął/kliknęła,
            przesłał/przesłała dalej albo się zalogował/zalogowała bez zastanowienia. Rozegraj
            cztery takie sytuacje.
          </p>
        </LessonImageCard>
        <RedFlags color={color} onComplete={traps.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="lista">
        <BeforeYouTrust color={color} onComplete={list.markBlockDone} />
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
          W sieci znajdziesz odpowiedź na prawie każde pytanie — i od razu drugą, która mówi coś
          zupełnie innego. Sama umiejętność <strong>szukania</strong> nie wystarcza; trzeba jeszcze
          umieć <strong>sprawdzić</strong>, czemu można wierzyć.
        </p>
        <p className="mt-3">
          W tej lekcji ułożysz dobre zapytanie do wyszukiwarki, nauczysz się porównywać dwa źródła
          pięcioma pytaniami i rozpoznawać treści, które są tylko przynętą. Na koniec złożysz własną
          krótką listę, którą przejdziesz, zanim w coś uwierzysz.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Zapalona lampka naftowa stoi na wysokim stosie otwartych książek w ciemnawym pokoju, krąg ciepłego światła pada na jedną kartkę"
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
