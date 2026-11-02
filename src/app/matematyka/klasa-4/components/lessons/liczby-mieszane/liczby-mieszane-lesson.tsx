'use client';

import Image from 'next/image';
import { Box, Layers, Repeat, SlidersHorizontal } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { OverflowCountWarmup } from './overflow-count-warmup';
import { WholePackBoard, type PackRound } from './whole-pack-board';
import { TwoWayTape, type TapeExample } from './two-way-tape';
import { buildDrillTasks } from './liczby-mieszane-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Więcej niż jedna cała',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'pakowanie',
    kind: 'Nowe pojęcie',
    title: 'Pudełko, które domyka się w całość',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Taśma do przewinięcia w obie strony',
    time: '8 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Zamieniaj samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'cukiernia',
    kind: 'Zadanie problemowe',
    title: 'Zamówienie w cukierni',
    time: '6 min',
    icon: 'Puzzle',
  },
  {
    id: 'quiz',
    kind: 'Quiz',
    title: 'Sprawdź, co zapamiętałeś',
    time: '5 min',
    icon: 'CheckCircle2',
  },
];

const PACK_ROUNDS: PackRound[] = [
  {
    id: 'pizza-7-4',
    direction: 'pack',
    label: 'Na tacy leży 7 kawałków pizzy, każdy to jedna ćwiartka. Poskładaj z nich całe pizze — klikaj kawałki jeden po drugim.',
    licznik: 7,
    mianownik: 4,
    noun: 'pizza',
    nounPlural: 'pizze',
    note: '7 ćwiartek to jedna cała pizza i jeszcze 3 ćwiartki. Zapisujemy to jako 7/4 = 1 3/4 — po lewej sam licznik, po prawej całość i reszta.',
  },
  {
    id: 'placek-8-3',
    direction: 'pack',
    label: 'Teraz 8 kawałków placka, każdy to jedna trzecia. Ile wyjdzie całych placków, a ile zostanie luzem?',
    licznik: 8,
    mianownik: 3,
    noun: 'placek',
    nounPlural: 'placki',
    note: '8/3 = 2 2/3. Zwróć uwagę: mianownik 3 się nie zmienił — pudełko wciąż mieści 3 kawałki, zmieniło się tylko to, ile pudełek udało się domknąć.',
  },
  {
    id: 'nalesnik-9-2',
    direction: 'pack',
    label: 'Ostatnia taca: 9 połówek naleśnika. Ta sama robota, tylko pudełko mieści teraz tylko 2 kawałki.',
    licznik: 9,
    mianownik: 2,
    noun: 'naleśnik',
    nounPlural: 'naleśniki',
    note: '9/2 = 4 1/2. Zauważ, że to zwykłe dzielenie z resztą: 9 : 2 = 4 reszty 1. Część całkowita to iloraz, a reszta ląduje w liczniku.',
  },
];

const TAPE_EXAMPLES: TapeExample[] = [
  {
    id: 'tort-17-5',
    licznik: 17,
    mianownik: 5,
    noun: 'tort',
    story:
      'Na stole leży 17 kawałków tortu, każdy to jedna piąta. Przewiń taśmę w prawo, żeby zobaczyć, ile z nich składa się w całe torty — a potem wróć nią do początku.',
  },
  {
    id: 'chleb-13-4',
    licznik: 13,
    mianownik: 4,
    noun: 'chleb',
    story:
      'Trzynaście ćwiartek chleba. Ta sama taśma, inne liczby: w prawo składasz, w lewo rozkładasz. Sprawdź, czy potrafisz przewidzieć każdą klatkę, zanim ją zobaczysz.',
  },
];

const UNPACK_ROUNDS: PackRound[] = [
  {
    id: 'cukiernia-torty',
    direction: 'unpack',
    label:
      'W cukierni zostały 2 całe torty i 3 ćwiartki. Zamówienia liczy się jednak w samych ćwiartkach. Rozkrój całe torty, klikając je, i sprawdź, ile ćwiartek jest do wydania.',
    licznik: 11,
    mianownik: 4,
    noun: 'tort',
    nounPlural: 'torty',
    note: '2 3/4 = 11/4. Każda cała to 4 ćwiartki: 2 · 4 = 8, plus 3, które już leżały luzem — razem 11 ćwiartek.',
  },
  {
    id: 'cukiernia-serniki',
    direction: 'unpack',
    label: 'Kolejne zamówienie: 3 całe serniki i pół. Klient chce dostać same połówki — ile ich będzie?',
    licznik: 7,
    mianownik: 2,
    noun: 'sernik',
    nounPlural: 'serniki',
    note: '3 1/2 = 7/2. Trzy całe serniki to 6 połówek, plus ta jedna, która już była — razem 7 połówek.',
  },
  {
    id: 'cukiernia-szarlotki',
    direction: 'unpack',
    label: 'Na koniec 2 całe szarlotki i 2 kawałki po jednej trzeciej. Ile trzecich części ma do wydania cukiernik?',
    licznik: 8,
    mianownik: 3,
    noun: 'szarlotka',
    nounPlural: 'szarlotki',
    note: '2 2/3 = 8/3. Reguła jest zawsze ta sama: część całkowitą mnożymy przez mianownik i dodajemy licznik — 2 · 3 + 2 = 8.',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'co-to-niewlasciwy',
    question: 'Który ułamek nazywamy niewłaściwym?',
    options: [
      { id: 'a', text: 'Taki, w którym licznik jest mniejszy od mianownika' },
      { id: 'b', text: 'Taki, w którym licznik jest większy od mianownika albo mu równy' },
      { id: 'c', text: 'Taki, którego nie da się skrócić' },
      { id: 'd', text: 'Taki, w którym mianownik jest liczbą nieparzystą' },
    ],
    correctId: 'b',
    explanation: 'Licznik większy od mianownika albo mu równy znaczy, że kawałków starczy na co najmniej jedną pełną całość.',
  },
  {
    id: 'zamien-13-4',
    question: 'Ile wynosi 13/4 zapisane jako liczba mieszana?',
    options: [
      { id: 'a', text: '4 1/3' },
      { id: 'b', text: '3 4/1' },
      { id: 'c', text: '3 1/4' },
      { id: 'd', text: '2 5/4' },
    ],
    correctId: 'c',
    explanation: '13 : 4 = 3 reszty 1, więc 13/4 = 3 1/4. Trzy całe i jedna ćwiartka.',
  },
  {
    id: 'zamien-2-5-6',
    question: 'Jaki ułamek niewłaściwy odpowiada liczbie mieszanej 2 5/6?',
    options: [
      { id: 'a', text: '17/6' },
      { id: 'b', text: '13/6' },
      { id: 'c', text: '25/6' },
      { id: 'd', text: '12/6' },
    ],
    correctId: 'a',
    explanation: '2 · 6 = 12 szóstych w dwóch całościach, plus 5 z licznika — razem 17/6.',
  },
  {
    id: 'co-sie-nie-zmienia',
    question: 'Co NIGDY się nie zmienia, gdy zamieniasz ułamek niewłaściwy na liczbę mieszaną?',
    options: [
      { id: 'a', text: 'Licznik' },
      { id: 'b', text: 'Liczba całości' },
      { id: 'c', text: 'Sposób zapisu' },
      { id: 'd', text: 'Mianownik — kawałki wciąż są tej samej wielkości' },
    ],
    correctId: 'd',
    explanation: 'Zamiana tylko przegrupowuje kawałki w całości. Wielkość kawałka, czyli mianownik, zostaje taka sama.',
  },
  {
    id: 'kiedy-calkowita',
    question: 'Ułamek 12/3 zamieniono na liczbę mieszaną. Co się okazało?',
    options: [
      { id: 'a', text: 'To 3 1/3' },
      { id: 'b', text: 'To dokładnie 4 całe, bez żadnej reszty' },
      { id: 'c', text: 'To 4 1/3' },
      { id: 'd', text: 'Nie da się tego zamienić' },
    ],
    correctId: 'b',
    explanation: '12 : 3 = 4 bez reszty, więc 12/3 to po prostu liczba 4. Gdy reszta wynosi zero, liczba mieszana zamienia się w naturalną.',
  },
  {
    id: 'ktore-wieksze',
    question: 'Która z tych liczb jest największa?',
    options: [
      { id: 'a', text: '2 1/5' },
      { id: 'b', text: '9/5' },
      { id: 'c', text: '1 4/5' },
      { id: 'd', text: '7/5' },
    ],
    correctId: 'a',
    explanation: 'Po zamianie na piąte części: 2 1/5 = 11/5, 9/5 = 1 4/5, a 7/5 = 1 2/5. Najwięcej piątych części ma 2 1/5.',
  },
];

const CHEAT_SHEET = [
  'Ułamek niewłaściwy ma licznik większy od mianownika albo mu równy — to co najmniej jedna cała.',
  'Liczba mieszana to część całkowita zapisana obok ułamka, np. 3 2/5.',
  'Z ułamka na liczbę mieszaną: podziel licznik przez mianownik. Iloraz to część całkowita, reszta zostaje licznikiem.',
  'Z liczby mieszanej na ułamek: pomnóż część całkowitą przez mianownik i dodaj licznik.',
  'Mianownik nie zmienia się przy żadnej z tych zamian — kawałki cały czas są tej samej wielkości.',
  'Gdy reszta wynosi zero, ułamek niewłaściwy jest zwykłą liczbą naturalną (12/3 = 4).',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/liczby-mieszane/tort-i-luzne-kawalki.jpg',
  rozgrzewka: '/images/matematyka/lekcje/liczby-mieszane/dziewczynka-liczy-kawalki-pizzy.jpg',
  pakowanie: '/images/matematyka/lekcje/liczby-mieszane/pudelka-cukiernicze-na-blacie.jpg',
  przyklady: '/images/matematyka/lekcje/liczby-mieszane/chlopiec-uklada-kolo-z-kawalkow.jpg',
  cwiczenia: '/images/matematyka/lekcje/liczby-mieszane/butelki-soku-w-rzedzie.jpg',
  cukiernia: '/images/matematyka/lekcje/liczby-mieszane/dziewczynka-za-lada-cukierni.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function LiczbyMieszaneLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const packing = useStepDone('pakowanie');
  const tape = useStepDone('przyklady');
  const drill = useStepDone('cwiczenia');
  const bakery = useStepDone('cukiernia');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Do tej pory każdy ułamek był mniejszy od całości. Ale kawałków może być więcej, niż
            potrzeba na jedną całą — siedem ćwiartek pizzy to przecież{' '}
            <strong>jedna cała pizza i jeszcze trzy ćwiartki</strong>. Tę samą ilość można więc
            nazwać na dwa sposoby: 7/4 albo 1 3/4. W tej lekcji nauczysz się swobodnie przechodzić
            między tymi zapisami — w jedną i w drugą stronę.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Ułamek niewłaściwy: licznik ≥ mianownik' },
              { icon: Box, text: 'Liczba mieszana: całości obok reszty' },
              { icon: SlidersHorizontal, text: 'Zamiana to dzielenie z resztą' },
              { icon: Repeat, text: 'Ta sama droga działa w obie strony' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Drewniana deska z okrągłym ciastem pokrojonym na równe kawałki, obok leżą dwa pojedyncze kawałki tego samego ciasta"
            width={240}
            height={240}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="rozgrzewka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.rozgrzewka}
          alt="Dziewczynka o rudych włosach splecionych w warkocz, w musztardowym swetrze, licząca palcem kawałki pizzy leżące na tacy"
          lead="Ta sama scena, dwa poprawne odczyty."
        >
          Najpierw policz same kawałki, potem całości i resztę. Jedno i drugie opisuje dokładnie tyle
          samo jedzenia — i właśnie o tym jest cała ta lekcja.
        </LessonImageCard>
        <OverflowCountWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="pakowanie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.pakowanie}
          alt="Kilka pustych, otwartych kartonowych pudełek cukierniczych ustawionych obok siebie na drewnianym blacie"
        >
          <p>
            Wyobraź sobie pudełko, do którego mieści się dokładnie <strong>tyle kawałków, ile wynosi
            mianownik</strong>. Wkładasz kawałek po kawałku, a gdy pudełko się zapełni — zatrzaskuje
            się i staje się jedną całością. To, co zostanie na tacy, to reszta. Klikaj kawałki i
            obserwuj oba zapisy na dole: lewy liczy same kawałki, prawy liczy całości i resztę.
          </p>
        </LessonImageCard>
        <WholePackBoard color={color} rounds={PACK_ROUNDS} onComplete={packing.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="↔"
          kicker="Tam i z powrotem"
          image={IMAGES.przyklady}
          alt="Chłopiec o krótkich ciemnoblond włosach w zielonej koszulce, układający na stole kawałki papierowego koła z powrotem w pełne kółko"
        >
          Gotowe rozwiązanie rozpisane na klatki — tylko że tę taśmę możesz przewijać także wstecz.
          Przykład zaliczysz dopiero wtedy, gdy przejdziesz ją w obie strony.
        </LessonImageCard>
        <TwoWayTape color={color} examples={TAPE_EXAMPLES} onComplete={tape.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Rząd małych szklanych butelek z jasnym sokiem, ustawionych równo na jasnym kamiennym blacie"
          reverse
        >
          <p>
            Siedem zadań: odczytaj liczbę mieszaną z rysunku, policz wszystkie kawałki, zamień
            w jedną i w drugą stronę, rozpoznaj ułamek niewłaściwy i policz butelki na przyjęcie.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="cukiernia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.cukiernia}
          alt="Dziewczynka o jasnych włosach spiętych w dwa kucyki, w białym fartuchu, stojąca za ladą cukierni z ciastami"
          reverse
          lead="W cukierni zamówienia liczy się w kawałkach, nie w całościach."
        >
          Ten sam mechanizm co wcześniej, tylko puszczony od tyłu: teraz to Ty rozkrawasz całe ciasta
          na kawałki, żeby policzyć, ile ich wyjdzie.
        </LessonImageCard>
        <WholePackBoard color={color} rounds={UNPACK_ROUNDS} onComplete={bakery.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: liczby mieszane w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnej lekcji zobaczysz, że ułamek to po prostu wynik dzielenia.
        </p>
        <ol className="divide-y border">
          {CHEAT_SHEET.map((rule, index) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums" style={{ color }}>
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
