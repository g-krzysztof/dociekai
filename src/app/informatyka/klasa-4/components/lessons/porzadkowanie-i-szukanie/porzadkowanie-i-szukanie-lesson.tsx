'use client';

import Image from 'next/image';
import { Filter, Scale, Search } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { BalanceSort } from './balance-sort';
import { DrawerHunt } from './drawer-hunt';
import { RuleSieve } from './rule-sieve';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Pierwsza lekcja modułu 5 i dwudziesty drugi kształt lekcji w kursie.
 * **Otwiera moduł o myśleniu komputacyjnym** i realizuje temat „porządkowanie i
 * szukanie”: ustawianie obiektów w kolejności liniowej `[1.1]` oraz znajdowanie
 * elementów o podanych własnościach `[1.3]`. Zadania obowiązkowego tu nie ma.
 *
 * Trzy bloki układają się w jedno rozumowanie, a nie w trzy osobne ćwiczenia:
 *  - `BalanceSort` — porządkowanie **kosztuje**, bo informację zdobywa się
 *    wyłącznie porównaniami parami (licznik ważeń);
 *  - `DrawerHunt` — i właśnie dlatego się opłaca: w uporządkowanych szufladach
 *    to samo szukanie kosztuje kilka razy mniej (dwa liczniki obok siebie);
 *  - `RuleSieve` — drugi sposób znajdowania, **po własnościach**, z zadaniem,
 *    którego poprawnym rozwiązaniem jest stwierdzenie, że rozwiązania nie ma.
 *
 * Cały moduł jest bez kodu — i to jest jego sens. Pojęcia (porównanie,
 * kolejność, warunek, koszt) mają wejść, zanim dojdzie składnia Scratcha.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/porzadkowanie-i-szukanie/kamyki-i-kupka.jpg',
  hustawka: '/images/informatyka/lekcje/porzadkowanie-i-szukanie/hustawka-ze-skrzynkami.jpg',
  szuflady: '/images/informatyka/lekcje/porzadkowanie-i-szukanie/szafka-z-szufladami.jpg',
  guziki: '/images/informatyka/lekcje/porzadkowanie-i-szukanie/taca-z-guzikami.jpg',
  narzedzia: '/images/informatyka/lekcje/porzadkowanie-i-szukanie/narzedzia-wedlug-rozmiaru.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'piec-skrzynek',
    kind: 'haczyk',
    title: 'Pięć jednakowych skrzynek',
    time: '7 min',
    icon: Scale,
  },
  {
    id: 'po-co-porzadek',
    kind: 'cwiczenie',
    title: 'Po co komu porządek',
    time: '6 min',
    icon: Search,
  },
  {
    id: 'opisz-kogo-szukasz',
    kind: 'symulator',
    title: 'Opisz, kogo szukasz',
    time: '7 min',
    icon: Filter,
  },
  {
    id: 'porzadek-w-domu',
    kind: 'zadanie',
    title: 'Uporządkuj coś naprawdę',
    time: '10 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function PorzadkowanieISzukanieLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Ustawiłeś/ustawiłaś pięć skrzynek, nie podnosząc żadnej, policzyłeś/policzyłaś, ile kosztuje szukanie w bałaganie i w porządku, i opisałeś/opisałaś osobę cechami zamiast wskazywać ją palcem. Zdanie na cały ten moduł: komputer nie jest mądrzejszy od ciebie — po prostu robi to, co mu rozłożysz na kroki."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const sort = useBlockDone('piec-skrzynek');
  const hunt = useBlockDone('po-co-porzadek');
  const sieve = useBlockDone('opisz-kogo-szukasz');
  const task = useBlockDone('porzadek-w-domu');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="piec-skrzynek">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.hustawka}
          alt="Prosta deska oparta na drewnianej kłodzie jak huśtawka-równoważnia, na obu jej końcach stoi jednakowa skrzynka z listewek, a lewy koniec jest wyraźnie opuszczony w dół"
          lead="Nie musisz wiedzieć, ile co waży. Wystarczy wiedzieć, co jest cięższe."
        >
          Komputer nigdy nie widzi całego zbioru naraz — potrafi tylko{' '}
          <strong>porównać dwie rzeczy</strong> i zapamiętać wynik. Poniżej pięć skrzynek nie do
          odróżnienia wzrokiem. Ustaw je od najlżejszej, mając do dyspozycji wyłącznie wagę.
        </LessonImageCard>
        <BalanceSort color={color} onComplete={sort.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="po-co-porzadek">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.szuflady}
          alt="Stara apteczna szafka z wieloma rzędami jednakowych małych drewnianych szufladek z okrągłymi gałkami, wszystkie bez żadnych opisów, a kilka jest lekko wysuniętych"
          reverse
        >
          <p>
            Porządkowanie kosztuje — właśnie się przekonałeś/przekonałaś ile. Pytanie brzmi więc:{' '}
            <strong>po co się w ogóle męczyć?</strong> Odpowiedź jest w tej szafce. Szesnaście
            jednakowych szuflad, w jednej z nich to, czego szukasz, a każde otwarcie kosztuje.
          </p>
        </LessonImageCard>
        <DrawerHunt color={color} onComplete={hunt.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="opisz-kogo-szukasz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.guziki}
          alt="Płytka drewniana miseczka widziana z góry, pełna guzików rozmaitej wielkości i koloru — część ma dwie dziurki, część cztery — wszystkie wymieszane razem"
          lead="„Podaj mi ten guzik” nic nie znaczy. „Duży, biały, o czterech dziurkach” — już tak."
          reverse
        >
          Rzeczy szuka się nie tylko po kolejności, ale też <strong>po cechach</strong>. Cała sztuka
          polega na tym, żeby podać ich akurat tyle, by zostało dokładnie jedno. Niżej dwanaście osób
          i trzy zamówienia.
        </LessonImageCard>
        <RuleSieve color={color} onComplete={sieve.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="porzadek-w-domu">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.narzedzia}
          alt="Drewniany blat, a na nim rząd narzędzi ułożonych równo od najmniejszego do największego — od małych szczypiec przez kombinerki i klucz po duży młotek"
        >
          <p>
            Teraz to samo poza ekranem. Wybierz sobie jeden zbiór rzeczy, który masz pod ręką,{' '}
            <strong>ustaw go według jednej cechy</strong> — i sprawdź na własnej skórze, czy
            szukanie naprawdę robi się szybsze.
          </p>
        </LessonImageCard>
        <PracticeTask
          color={color}
          onComplete={task.markBlockDone}
          brief={
            <>
              <strong>Uporządkuj jeden zbiór rzeczy w swoim otoczeniu</strong> — książki na półce,
              pliki w jednym folderze, klocki, karty do gry, przyprawy w szafce. Najpierw wybierz
              cechę, według której je ustawisz, a potem sprawdź, czy szukanie zrobiło się szybsze.
            </>
          }
          sections={[
            {
              label: 'Zanim ruszysz',
              items: [
                'Wybrałem/wybrałam zbiór rzeczy i policzyłem/policzyłam, ile ich jest.',
                'Zmierzyłem/zmierzyłam czas: ile zajęło mi znalezienie jednej konkretnej rzeczy PRZED uporządkowaniem.',
                'Wybrałem/wybrałam JEDNĄ cechę, według której będę porządkować (rozmiar, nazwa od A do Z, data, kolor).',
              ],
            },
            {
              label: 'Porządkowanie',
              items: [
                'Ustawiłem/ustawiłam wszystko według tej jednej cechy, od najmniejszego do największego albo od A do Z.',
                'Sprawdziłem/sprawdziłam, że żadna rzecz nie stoi w złym miejscu — przeszedłem/przeszłam cały rząd i porównałem/porównałam każdą z sąsiadem.',
              ],
            },
            {
              label: 'Sprawdzenie',
              items: [
                'Zmierzyłem/zmierzyłam czas jeszcze raz: ile zajmuje znalezienie jednej rzeczy PO uporządkowaniu.',
                'Umiem powiedzieć, ile razy szybciej poszło — i dlaczego.',
              ],
            },
          ]}
          hint={
            <>
              Jeśli porządkujesz pliki, najprościej nadać im nazwy zaczynające się od daty (
              <strong>2026-04-24-wycieczka</strong>) — wtedy komputer sam ustawi je po kolei, a ty
              dostajesz porządek za darmo. To ta sama sztuczka, której używają wszyscy, którzy trzymają
              w jednym folderze setki zdjęć.
            </>
          }
        />
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
          W tym module nie napiszesz ani jednej linijki programu — i to jest zamierzone. Zanim
          zaczniesz mówić komputerowi, co ma robić, warto{' '}
          <strong>zobaczyć, jak on w ogóle myśli</strong>. A myśli zaskakująco prosto: porównuje dwie
          rzeczy, sprawdza warunek, robi krok.
        </p>
        <p className="mt-3">
          Zaczniemy od dwóch czynności, które wykonujesz codziennie i nigdy się nad nimi nie
          zastanawiasz: <strong>porządkowania</strong> i <strong>szukania</strong>. Okaże się, że obie
          coś kosztują, że jedna opłaca się dzięki drugiej i że czasem poprawną odpowiedzią jest
          „tego się nie da”.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Na jasnym blacie pięć gładkich szarych kamyków ułożono równo jeden pod drugim w kolumnę, a tuż obok leży kupka takich samych kamyków rzuconych bezładnie na stos"
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
