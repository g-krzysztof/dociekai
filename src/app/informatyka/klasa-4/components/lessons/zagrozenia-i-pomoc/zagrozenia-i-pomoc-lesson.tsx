'use client';

import Image from 'next/image';
import { AlarmClock, HeartHandshake, ListChecks, MessageSquare, Users } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { ChatSim } from './chat-sim';
import { PileOn } from './pile-on';
import { UrgencyClock } from './urgency-clock';
import { AskForHelp } from './ask-for-help';
import { HelpCardStudio } from './help-card-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o zagrożeniach w sieci i szukaniu pomocy — czwarta zbudowana w module 2
 * i jedenasty różny kształt lekcji w kursie. Realizuje `[5.4]` i niesie zadanie
 * obowiązkowe Z-3.
 *
 * **Zasada tej lekcji: niczego nie opowiadamy, wszystko dzieje się dziecku.**
 * O zagrożeniach da się przeczytać wszędzie; wiedza „nie rozmawiaj z obcymi”
 * niczego nie zmienia, bo rozmowa z obcym nigdy nie wygląda jak rozmowa z
 * obcym. Dlatego każdy blok jest sceną z upływającym czasem, w której dziecko
 * podejmuje decyzje i widzi ich skutki:
 *
 *  - `ChatSim` — prowadzi rozmowę z nieznajomym; kartoteka wycieków rośnie w
 *    boku sama z drobiazgów, których dziecko samo udzieliło;
 *  - `PileOn` — jest świadkiem nagonki, która toczy się dalej niezależnie od
 *    niego; tylko jedno działanie ją przerywa i dziecko odkrywa które;
 *  - `UrgencyClock` — dostaje prawdziwie tykający licznik i odkrywa, że po
 *    zerze nic nie przepada;
 *  - `AskForHelp` — ćwiczy pierwsze zdanie rozmowy z dorosłym i słyszy, że to,
 *    czego się bało, nie następuje.
 *
 * Lekcja jako jedyna w kursie **kończy się zadaniem obowiązkowym** — po czterech
 * scenach gotowa lista pomocy jest naturalnym domknięciem, nie doklejką.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/zagrozenia-i-pomoc/latarnia-o-zmierzchu.jpg',
  rozmowa: '/images/informatyka/lekcje/zagrozenia-i-pomoc/prezent-bez-nadawcy.jpg',
  okno: '/images/informatyka/lekcje/zagrozenia-i-pomoc/trzy-zamkniete-pudelka.jpg',
  pomoc: '/images/informatyka/lekcje/zagrozenia-i-pomoc/dzwonek-ze-sznurkiem.jpg',
  lista: '/images/informatyka/lekcje/zagrozenia-i-pomoc/kartka-na-korkowej-tablicy.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'rozmowa',
    kind: 'haczyk',
    title: 'Rozmowa, w której nikt nie pyta wprost',
    time: '7 min',
    icon: MessageSquare,
  },
  {
    id: 'nagonka',
    kind: 'dylemat',
    title: 'Jesteś w tej grupie — scena dzieje się na żywo',
    time: '8 min',
    icon: Users,
  },
  {
    id: 'zegar',
    kind: 'symulator',
    title: 'Masz 20 sekund. Naprawdę?',
    time: '6 min',
    icon: AlarmClock,
  },
  {
    id: 'pomoc',
    kind: 'cwiczenie',
    title: 'Przećwicz pierwsze zdanie',
    time: '8 min',
    icon: HeartHandshake,
  },
  {
    id: 'lista-z3',
    kind: 'zadanie',
    title: 'Zadanie Z-3: twoja lista pomocy',
    time: '15 min',
    icon: ListChecks,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function ZagrozeniaIPomocLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przeszedłeś/przeszłaś przez cztery sytuacje, które naprawdę się zdarzają — i za każdym razem wyjście było takie samo: nie odpisuj, zachowaj dowód, powiedz dorosłemu, zgłoś i zablokuj. Masz też listę przy biurku. Gdyby kiedykolwiek coś takiego cię spotkało: to nie będzie twoja wina i nie będziesz z tym sam/sama."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const chat = useBlockDone('rozmowa');
  const pile = useBlockDone('nagonka');
  const clock = useBlockDone('zegar');
  const help = useBlockDone('pomoc');
  const task = useBlockDone('lista-z3');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="rozmowa">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.rozmowa}
          alt="Kolorowo zapakowany prezent ze wstążką leży sam na wycieraczce przed drzwiami, wstążka do połowy rozwiązana, nigdzie nie ma bileciku"
          lead="Ładnie zapakowane, a nie wiadomo, od kogo."
        >
          Zaraz odbędziesz rozmowę z kimś, kogo znasz tylko z gry. Odpisuj tak, jak odpisałbyś/
          odpisałabyś naprawdę — nikt tu nie stawia ocen. Patrz w bok: tam rośnie to, czego ta osoba
          zdąży się o tobie dowiedzieć.
        </LessonImageCard>
        <ChatSim color={color} onComplete={chat.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="nagonka">
        <PileOn color={color} onComplete={pile.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zegar">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.okno}
          alt="Trzy zamknięte drewniane pudełka różnej wielkości stoją obok siebie na półce, przy jednym uchylone wieczko i ciemna szczelina w środku"
        >
          <p>
            Teraz coś, co wygląda na okazję życia i <strong>odlicza czas</strong>. Możesz kliknąć,
            zamknąć albo po prostu poczekać i zobaczyć, co się stanie po zerze. Każda z tych trzech
            dróg czegoś uczy — najlepiej sprawdź wszystkie.
          </p>
        </LessonImageCard>
        <UrgencyClock color={color} onComplete={clock.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pomoc">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pomoc}
          alt="Mosiężny dzwonek z wytartą drewnianą rączką i krótkim postrzępionym sznurkiem leży na kamiennym parapecie"
          lead="Zadzwonić jest łatwo. Trudno jest zacząć mówić."
          reverse
        >
          Wszyscy wiedzą, że „trzeba powiedzieć dorosłemu”. Nikt nie ćwiczy pierwszego zdania — a to
          właśnie ono jest najtrudniejsze. Przeprowadź tę rozmowę tutaj, na sucho, z trzema różnymi
          osobami.
        </LessonImageCard>
        <AskForHelp color={color} onComplete={help.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="lista-z3">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.lista}
          alt="Korkowa tablica na ścianie nad biurkiem, do której pinezką przypięta jest jedna pusta biała karteczka"
          reverse
        >
          <p>
            Zostaje ostatnia rzecz — <strong>zrobić tę listę, zanim będzie potrzebna</strong>. Kiedy
            coś się dzieje, nikt nie szuka numerów; patrzy na kartkę, która wisi obok. To jest
            zadanie obowiązkowe kursu.
          </p>
        </LessonImageCard>
        <HelpCardStudio color={color} onComplete={task.markBlockDone} />
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
          Ta lekcja nie będzie o tym, że „w internecie czyha zło”. Będzie o czterech konkretnych
          sytuacjach — i <strong>wszystkie cztery przeżyjesz sam/sama</strong>, zamiast o nich
          czytać. Rozmowa toczy się w czasie rzeczywistym, komentarze dochodzą, gdy patrzysz, a
          licznik naprawdę tyka.
        </p>
        <p className="mt-3">
          Bo problem nie polega na tym, że nie wiadomo, co jest niebezpieczne. Polega na tym, że{' '}
          <strong>nic z tego nie wygląda niebezpiecznie, kiedy się dzieje</strong>. Na koniec
          zrobisz zadanie obowiązkowe <strong>Z-3</strong> — listę osób i numerów, którą powiesisz
          przy biurku.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Zapalona latarnia sztormowa wisi na starym drewnianym słupku płotu o zmierzchu, ścieżka za nią ginie w niskiej mgle"
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
