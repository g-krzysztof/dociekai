'use client';

import Image from 'next/image';
import { Divide, Highlighter, PieChart, Users } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { GroupSplitBoard, type SplitRound } from './group-split-board';
import { FractionProblemPair } from './fraction-problem-pair';
import { StoryWorkedExamples } from './story-worked-examples';
import { buildStoryDrillTasks } from './zadania-ulamki-drill';
import type { WordProblem } from '../../problem-unpacker';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ułamek ze zbioru przedmiotów',
    time: '8 min',
    icon: 'Sparkles',
  },
  {
    id: 'czytanie',
    kind: 'Nowe pojęcie',
    title: 'Wyłap dane, pytanie i liczbę-podpuchę',
    time: '9 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy zadania, trzy różne działania',
    time: '7 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Ułamki w treści zadania',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'reszta',
    kind: 'Zadanie problemowe',
    title: 'Gdy pytanie dotyczy reszty',
    time: '8 min',
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

const WARMUP_ROUNDS: SplitRound[] = [
  {
    id: 'kredki',
    total: 12,
    mianownik: 4,
    selectGroups: 1,
    items: { one: 'kredka', few: 'kredki', many: 'kredek' },
    story: 'W pudełku leży 12 kredek. Ola zabrała do domu 1/4 z nich.',
    question: 'Ile kredek zabrała Ola?',
    note: 'Mianownik 4 powiedział, na ile równych grup podzielić pudełko (12 : 4 = 3 kredki w grupie), a licznik 1 — ile takich grup zabrała Ola.',
  },
  {
    id: 'cukierki',
    total: 20,
    mianownik: 5,
    selectGroups: 3,
    items: { one: 'cukierek', few: 'cukierki', many: 'cukierków' },
    story: 'Na stole leży 20 cukierków. Rozdano 3/5 z nich.',
    question: 'Ile cukierków rozdano?',
    note: 'Najpierw podział przez mianownik: 20 : 5 = 4 cukierki w grupie. Potem mnożenie przez licznik: 3 · 4 = 12. Taka jest cała recepta na „ułamek z liczby”.',
  },
  {
    id: 'balony',
    total: 18,
    mianownik: 6,
    selectGroups: 2,
    items: { one: 'balon', few: 'balony', many: 'balonów' },
    story: 'Na urodziny przygotowano 18 balonów. 2/6 z nich to balony czerwone.',
    question: 'Ile jest czerwonych balonów?',
    note: '18 : 6 = 3 balony w grupie, a 2 · 3 = 6. Zauważ, że 2/6 to po skróceniu 1/3 — gdybyś podzielił zbiór na 3 równe grupy i wziął jedną, wyszłoby dokładnie tyle samo.',
  },
];

const REST_ROUNDS: SplitRound[] = [
  {
    id: 'rowery',
    total: 24,
    mianownik: 8,
    selectGroups: 5,
    items: { one: 'uczeń', few: 'uczniów', many: 'uczniów' },
    story: 'W klasie jest 24 uczniów. 3/8 z nich przyjeżdża do szkoły rowerem, a cała reszta przychodzi pieszo.',
    question: 'Ilu uczniów przychodzi pieszo? Zaznacz te grupy, które opisują odpowiedź.',
    note:
      'Cała klasa to 8/8. Skoro rowerem jeździ 3/8, to pieszo chodzi 8/8 − 3/8 = 5/8. A 24 : 8 = 3, więc 5 · 3 = 15 uczniów. Pytanie dotyczyło reszty, więc trzeba było najpierw odjąć od całości.',
  },
  {
    id: 'balony-pekly',
    total: 15,
    mianownik: 5,
    selectGroups: 2,
    items: { one: 'balon', few: 'balony', many: 'balonów' },
    story: 'Z 15 balonów przygotowanych na przyjęcie 3/5 pękło jeszcze przed przyjściem gości.',
    question: 'Ile balonów zostało całych? Zaznacz odpowiednie grupy.',
    note: 'Zostało 5/5 − 3/5 = 2/5 balonów. 15 : 5 = 3, więc 2 · 3 = 6 balonów. Uwaga na pułapkę: 3/5 to liczba tych, których już NIE ma.',
  },
  {
    id: 'ciastka',
    total: 16,
    mianownik: 4,
    selectGroups: 3,
    items: { one: 'ciastko', few: 'ciastka', many: 'ciastek' },
    story: 'Na talerzu było 16 ciastek. Kuba zjadł 1/4 z nich.',
    question: 'Ile ciastek zostało na talerzu? Zaznacz odpowiednie grupy.',
    note:
      'Zjedzona część to 1/4, więc została 3/4: 16 : 4 = 4, a 3 · 4 = 12 ciastek. Zwróć uwagę, że w treści podano ułamek zjedzonych, a pytanie było o pozostałe — to najczęstsza pułapka w takich zadaniach.',
  },
];

const PROBLEMS: WordProblem[] = [
  {
    id: 'szachy',
    phrases: [
      { id: 'p1-t1', text: 'W klasie czwartej jest ' },
      { id: 'p1-g1', text: '24 uczniów', tappable: true, role: 'given', label: 'uczniowie w klasie' },
      { id: 'p1-t2', text: '. Dokładnie ' },
      { id: 'p1-g2', text: '1/3 z nich', tappable: true, role: 'given', label: 'część grająca w szachy' },
      { id: 'p1-t3', text: ' chodzi na kółko szachowe. Kółko odbywa się w ' },
      { id: 'p1-decoy', text: 'sali numer 6', tappable: true, role: 'decoy' },
      { id: 'p1-t4', text: '. ' },
      { id: 'p1-q', text: 'Ilu uczniów chodzi na kółko szachowe?', tappable: true, role: 'question' },
    ],
    model: {
      type: 'equal-groups',
      groupLabel: 'grupa',
      unitLabel: 'uczniów',
      groups: 3,
      perGroup: null,
      total: 24,
    },
    equation: '24 : 3 = ?',
    answer: 8,
    answerLabel: 'uczniów',
  },
  {
    id: 'ksiazka',
    phrases: [
      { id: 'p2-t1', text: 'Ola przeczytała wczoraj ' },
      { id: 'p2-g1', text: '7 stron', tappable: true, role: 'given', label: 'przeczytane strony' },
      { id: 'p2-t2', text: ' książki i to jest dokładnie ' },
      { id: 'p2-g2', text: '1/5 całej książki', tappable: true, role: 'given', label: 'jaka to część książki' },
      { id: 'p2-t3', text: '. Książka kosztowała ' },
      { id: 'p2-decoy', text: '29 zł', tappable: true, role: 'decoy' },
      { id: 'p2-t4', text: '. ' },
      { id: 'p2-q', text: 'Ile stron ma cała książka?', tappable: true, role: 'question' },
    ],
    model: {
      type: 'equal-groups',
      groupLabel: 'piąta część',
      unitLabel: 'stron w całej książce',
      groups: 5,
      perGroup: 7,
      total: null,
    },
    equation: '5 · 7 = ?',
    answer: 35,
    answerLabel: 'stron',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'jak-liczyc-ulamek-liczby',
    question: 'Jak obliczyć 2/3 z 18?',
    options: [
      { id: 'a', text: 'Podzielić 18 przez 2, potem pomnożyć przez 3' },
      { id: 'b', text: 'Podzielić 18 przez 3, potem pomnożyć przez 2' },
      { id: 'c', text: 'Dodać 18 + 2/3' },
      { id: 'd', text: 'Odjąć 18 − 3' },
    ],
    correctId: 'b',
    explanation: 'Mianownik mówi, na ile równych grup podzielić całość (18 : 3 = 6), a licznik — ile grup wziąć (2 · 6 = 12).',
  },
  {
    id: 'jedna-szosta-z-30',
    question: 'Ile to jest 1/6 z 30?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '180' },
      { id: 'c', text: '5' },
      { id: 'd', text: '24' },
    ],
    correctId: 'c',
    explanation: '30 : 6 = 5. Jedna szósta to jedna z sześciu równych grup.',
  },
  {
    id: 'ktora-liczba-zbedna',
    question: 'W zadaniu napisano: „W sadzie rośnie 45 drzew, 2/9 z nich to grusze, a sad ma 3 rzędy”. Która liczba NIE jest potrzebna do obliczenia liczby grusz?',
    options: [
      { id: 'a', text: '45' },
      { id: 'b', text: '9' },
      { id: 'c', text: '2' },
      { id: 'd', text: '3' },
    ],
    correctId: 'd',
    explanation: 'Do policzenia 2/9 z 45 potrzebne są tylko te trzy liczby. Liczba rzędów jest podpuchą — nie każda liczba w treści służy do liczenia.',
  },
  {
    id: 'ile-wody-zostalo',
    question: 'Z zapasu wody wynoszącego 5/6 butelki zużyto 2/6 butelki. Ile wody zostało?',
    options: [
      { id: 'a', text: '3/6 butelki' },
      { id: 'b', text: '7/6 butelki' },
      { id: 'c', text: '3/12 butelki' },
      { id: 'd', text: '2/6 butelki' },
    ],
    correctId: 'a',
    explanation: 'Mianowniki są jednakowe, więc odejmujemy same liczniki: 5 − 2 = 3, czyli 3/6 butelki (to dokładnie połowa).',
  },
  {
    id: 'wstazka-na-bukiety',
    question: 'Na jeden bukiet zużywa się 3/4 wstążki. Ile wstążki potrzeba na 2 bukiety?',
    options: [
      { id: 'a', text: '3/8 wstążki' },
      { id: 'b', text: '6/8 wstążki' },
      { id: 'c', text: '5/4 wstążki' },
      { id: 'd', text: '6/4 wstążki, czyli 1 2/4' },
    ],
    correctId: 'd',
    explanation: 'Ta sama porcja dwa razy, czyli 2 · 3/4 = 6/4. Cztery ćwiartki to jedna wstążka, więc zostają jeszcze 2/4.',
  },
  {
    id: 'ile-bylo-cukierkow',
    question: 'Ola zjadła 8 cukierków i była to dokładnie 1/3 wszystkich. Ile cukierków było na początku?',
    options: [
      { id: 'a', text: '11' },
      { id: 'b', text: '24' },
      { id: 'c', text: '5' },
      { id: 'd', text: '3' },
    ],
    correctId: 'b',
    explanation: 'Tu znamy część, a szukamy całości. Skoro 1/3 to 8 cukierków, to całość to 3 takie grupy: 3 · 8 = 24.',
  },
];

const CHEAT_SHEET = [
  'Zanim zaczniesz liczyć, wypisz dane i pytanie — nie każda liczba w treści jest potrzebna.',
  'Ułamek liczby przedmiotów liczysz dwoma ruchami: dzielisz przez mianownik, potem mnożysz przez licznik (3/5 z 20 to 20 : 5 = 4, a potem 3 · 4 = 12).',
  'Ułamek zawsze dzieli całość na RÓWNE części — jeśli grupy wyszły nierówne, podział jest zły.',
  'Gdy pytanie dotyczy reszty, najpierw odejmij podany ułamek od całości: reszta po 3/8 to 8/8 − 3/8 = 5/8.',
  'Ta sama porcja powtórzona kilka razy to mnożenie ułamka przez liczbę naturalną (2 bukiety po 3/4 wstążki to 2 · 3/4).',
  'Czasem znasz część, a szukasz całości — wtedy droga jest odwrotna: 1/5 książki to 7 stron, więc cała książka ma 5 · 7 = 35 stron.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/zadania-tekstowe-z-ulamkami/kredki-rozlozone-w-grupach.jpg',
  rozgrzewka: '/images/matematyka/lekcje/zadania-tekstowe-z-ulamkami/cukierki-rozsypane-na-stole.jpg',
  czytanie: '/images/matematyka/lekcje/zadania-tekstowe-z-ulamkami/chlopiec-podkresla-tekst-zakreslaczem.jpg',
  przyklady: '/images/matematyka/lekcje/zadania-tekstowe-z-ulamkami/stos-ksiazek-i-zakladka.jpg',
  cwiczenia: '/images/matematyka/lekcje/zadania-tekstowe-z-ulamkami/dziewczynka-liczy-jablka-w-skrzynce.jpg',
  reszta: '/images/matematyka/lekcje/zadania-tekstowe-z-ulamkami/kolorowe-balony-i-jeden-pekniety.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ZadaniaTekstoweZUlamkamiLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const reading = useStepDone('czytanie');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('cwiczenia');
  const rest = useStepDone('reszta');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Do tej pory ułamek był kawałkiem tortu albo punktem na osi. Teraz opisuje część{' '}
            <strong>zbioru przedmiotów</strong>: 1/4 z 20 kredek, 3/5 klasy, 2/6 balonów. Recepta
            jest zawsze ta sama — mianownik mówi, na ile równych grup podzielić całość, a licznik,
            ile takich grup wziąć. Do tego dochodzi najtrudniejsza część zadań tekstowych: przeczytać
            treść tak, żeby wiedzieć, o co naprawdę pyta.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Divide, text: 'Mianownik dzieli zbiór na równe grupy' },
              { icon: Users, text: 'Licznik mówi, ile grup bierzemy' },
              { icon: Highlighter, text: 'Nie każda liczba w treści jest potrzebna' },
              { icon: PieChart, text: 'Pytanie o resztę to odejmowanie od całości' },
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
            alt="Kolorowe kredki rozłożone na jasnym blacie w kilku osobnych grupkach"
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
          alt="Kolorowe cukierki w papierkach rozsypane na drewnianym stole"
          lead="Tym razem ułamek dzieli nie kształt, tylko zbiór przedmiotów."
        >
          Sam postawisz przegrody między przedmiotami. Podział wolno zrobić dowolnie — ale dopiero
          równe grupy w liczbie równej mianownikowi pozwolą odpowiedzieć na pytanie.
        </LessonImageCard>
        <GroupSplitBoard color={color} rounds={WARMUP_ROUNDS} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="czytanie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.czytanie}
          alt="Chłopiec o prostych ciemnoblond włosach w granatowej koszulce, trzymający zakreślacz nad otwartym zeszytem"
        >
          <p>
            Dwa zadania do rozebrania na części: stuknij w dane i w pytanie, żeby zjechały do
            zasobnika. Jedna liczba w każdym zadaniu jest podpuchą i wygląda dokładnie tak samo jak
            reszta — właśnie o to chodzi.
          </p>
        </LessonImageCard>
        <FractionProblemPair color={color} problems={PROBLEMS} onComplete={reading.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.przyklady}
          alt="Stos książek z wystającą papierową zakładką leżący na parapecie"
          reverse
        >
          <p>
            Trzy zadania rozpisane krok po kroku, każde na inne działanie: ułamek liczby
            przedmiotów, odejmowanie części od całości i powtórzenie tej samej porcji.
          </p>
        </LessonImageCard>
        <StoryWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="?"
          kicker="Siedem zadań"
          image={IMAGES.cwiczenia}
          alt="Dziewczynka o jasnych włosach splecionych w warkocz, w jasnoniebieskim swetrze rozpinanym, przeliczająca jabłka w drewnianej skrzynce"
        >
          Policz ułamek danej liczby, odczytaj resztę, przelicz porcje w przepisie i wróć drogą
          odwrotną — od znanej części do całości.
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildStoryDrillTasks()} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="reszta">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.reszta}
          alt="Kilka kolorowych balonów uniesionych w powietrzu, jeden z nich pęknięty i zwiotczały"
          reverse
          lead="Treść podaje jeden ułamek, a pytanie dotyczy drugiego."
        >
          W każdym z tych trzech zadań liczba z treści opisuje to, czego już nie ma — albo to, co
          właśnie odeszło. Zanim zaznaczysz grupy, policz w głowie, jaka część zostaje.
        </LessonImageCard>
        <GroupSplitBoard color={color} rounds={REST_ROUNDS} onComplete={rest.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: zadania tekstowe z ułamkami w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej przy powtórzeniu modułu — to ostatnia lekcja przed sprawdzianem.
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
