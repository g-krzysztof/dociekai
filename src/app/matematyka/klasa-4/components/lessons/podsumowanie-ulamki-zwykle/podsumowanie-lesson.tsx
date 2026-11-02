'use client';

import { useState } from 'react';
import { Hash, PieChart, Puzzle, Shapes, Target } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { FractionPie } from '../../fraction-pie';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Skrót — wszystkie lekcje tego podsumowania są zawsze z tego samego modułu. */
const L = (slug: string): MathLesson => {
  const lesson = getLesson('ulamki-zwykle', slug);
  if (!lesson) throw new Error(`Brak lekcji ulamki-zwykle/${slug}`);
  return lesson;
};

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

const STEPS: LessonStepMeta[] = [
  { id: 'czym-jest-ulamek', kind: 'Powtórka 1', title: 'Czym jest ułamek i gdzie leży na osi', time: '5 min', icon: 'PieChart' },
  { id: 'porownywanie', kind: 'Powtórka 2', title: 'Porównywanie oraz równe ułamki', time: '5 min', icon: 'Target' },
  { id: 'dwa-zapisy', kind: 'Powtórka 3', title: 'Dwa zapisy tej samej liczby', time: '5 min', icon: 'Shapes' },
  { id: 'dzialania', kind: 'Powtórka 4', title: 'Dodawanie, odejmowanie i mnożenie', time: '5 min', icon: 'Hash' },
  { id: 'zadania', kind: 'Powtórka 5', title: 'Ułamki w zadaniach tekstowych', time: '5 min', icon: 'Puzzle' },
  { id: 'wynik', kind: 'Wynik', title: 'Twój wynik i co warto powtórzyć', time: '3 min', icon: 'Trophy' },
];

const RECAP_CZYM_JEST: RecapItem[] = [
  {
    lesson: L('ulamek-jako-czesc-calosci'),
    reminder: 'Mianownik mówi, na ile RÓWNYCH części podzielono całość, a licznik — ile z nich bierzemy.',
  },
  {
    lesson: L('ulamki-na-osi-liczbowej'),
    reminder: 'Ułamek to konkretne miejsce na osi liczbowej — im dalej w prawo, tym większa liczba.',
  },
];

/** Zadania z rysunkiem muszą znać kolor modułu, więc powstają funkcją, a nie stałą — jak `buildDrillTasks` w lekcjach. */
function buildQuizCzymJest(color: string): DiagnosticTask[] {
  return [
  {
    id: 'odczytaj-kolo',
    prompt: 'Jaka część koła jest zamalowana?',
    type: 'choice',
    visual: (
      <div className="mx-auto max-w-[200px]">
        <FractionPie color={color} mianownik={8} filled={fill(3)} ariaLabel="Koło podzielone na 8 równych części, zamalowane 3" />
      </div>
    ),
    options: [
      { id: 'a', text: '8/3' },
      { id: 'b', text: '3/8' },
      { id: 'c', text: '3/5' },
      { id: 'd', text: '5/8' },
    ],
    correctId: 'b',
    explanation: 'Koło podzielono na 8 równych części (mianownik), a zamalowane są 3 z nich (licznik): 3/8.',
    difficulty: { code: '01', name: 'Ułamek jako część całości' },
  },
  {
    id: 'co-to-mianownik',
    prompt: 'Co oznacza mianownik w ułamku 5/9?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Ile części wzięliśmy' },
      { id: 'b', text: 'O ile części więcej mamy' },
      { id: 'c', text: 'Na ile równych części podzielono całość' },
      { id: 'd', text: 'Ile całości mamy' },
    ],
    correctId: 'c',
    explanation: 'Mianownik zawsze opisuje podział całości — tutaj na 9 równych części. Licznik 5 mówi, ile z nich bierzemy.',
    difficulty: { code: '01', name: 'Ułamek jako część całości' },
  },
  {
    id: 'najdalej-od-zera',
    prompt: 'Który z tych ułamków leży na osi liczbowej najdalej od zera: 2/7, 5/7 czy 6/7?',
    type: 'choice',
    options: [
      { id: 'a', text: '6/7' },
      { id: 'b', text: '2/7' },
      { id: 'c', text: '5/7' },
      { id: 'd', text: 'Wszystkie leżą w tym samym miejscu' },
    ],
    correctId: 'a',
    explanation: 'Wszystkie mają ten sam mianownik, więc kawałki są jednakowe — najdalej leży ten z największym licznikiem.',
    difficulty: { code: '02', name: 'Ułamki na osi liczbowej' },
  },
  {
    id: 'ile-czesci-do-calosci',
    prompt: 'Odcinek od 0 do 1 podzielono na 10 równych części. Punkt stoi na 7/10. Ile dziesiątych części brakuje mu do 1? Wpisz samą liczbę.',
    type: 'input',
    answer: '3',
    difficulty: { code: '02', name: 'Ułamki na osi liczbowej' },
    explanation: 'Cały odcinek to 10/10, więc brakuje 10/10 − 7/10 = 3/10 — czyli 3 dziesiąte części.',
  },
  ];
}

const RECAP_POROWNYWANIE: RecapItem[] = [
  {
    lesson: L('porownywanie-ulamkow'),
    reminder: 'Ten sam mianownik — wygrywa większy licznik. Ten sam licznik — wygrywa MNIEJSZY mianownik, bo kawałki są większe.',
  },
  {
    lesson: L('rozszerzanie-i-skracanie-ulamkow'),
    reminder: 'Mnożąc lub dzieląc licznik i mianownik przez tę samą liczbę, zmieniasz nazwę ułamka, ale nie jego wartość.',
  },
];

const QUIZ_POROWNYWANIE: DiagnosticTask[] = [
  {
    id: 'ten-sam-mianownik',
    prompt: 'Który ułamek jest większy: 3/8 czy 5/8?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Są równe' },
      { id: 'b', text: '3/8' },
      { id: 'c', text: '5/8' },
      { id: 'd', text: 'Nie da się porównać' },
    ],
    correctId: 'c',
    explanation: 'Kawałki są jednakowej wielkości (ósme części), więc więcej ma ten, kto ma ich więcej: 5 > 3.',
    difficulty: { code: '03', name: 'Porównywanie ułamków' },
  },
  {
    id: 'ten-sam-licznik',
    prompt: 'Który ułamek jest większy: 1/4 czy 1/6?',
    type: 'choice',
    options: [
      { id: 'a', text: '1/4' },
      { id: 'b', text: '1/6' },
      { id: 'c', text: 'Są równe' },
      { id: 'd', text: '1/6, bo 6 jest większe od 4' },
    ],
    correctId: 'a',
    explanation: 'Im większy mianownik, tym drobniejsze kawałki. Dzieląc coś na 4 części, dostajesz większy kawałek niż dzieląc na 6.',
    difficulty: { code: '03', name: 'Porównywanie ułamków' },
  },
  {
    id: 'rozszerz-do-szostych',
    prompt: 'Rozszerz ułamek 2/3 do szóstych części. Wpisz sam licznik.',
    type: 'input',
    answer: '4',
    difficulty: { code: '04', name: 'Rozszerzanie i skracanie' },
    explanation: 'Mianownik pomnożono przez 2 (3 · 2 = 6), więc licznik też mnożymy przez 2: 2 · 2 = 4. Zatem 2/3 = 4/6.',
  },
  {
    id: 'skroc-6-9',
    prompt: 'Skróć ułamek 6/9 najbardziej, jak się da.',
    type: 'choice',
    options: [
      { id: 'a', text: '3/6' },
      { id: 'b', text: '1/3' },
      { id: 'c', text: '6/3' },
      { id: 'd', text: '2/3' },
    ],
    correctId: 'd',
    explanation: 'Licznik i mianownik dzielą się przez 3: 6 : 3 = 2, 9 : 3 = 3. Wychodzi 2/3 i dalej skrócić się nie da.',
    difficulty: { code: '04', name: 'Rozszerzanie i skracanie' },
  },
];

const RECAP_DWA_ZAPISY: RecapItem[] = [
  {
    lesson: L('liczby-mieszane'),
    reminder: 'Ułamek niewłaściwy i liczba mieszana to ta sama ilość — raz policzona w kawałkach, raz w całościach i reszcie.',
  },
  {
    lesson: L('ulamek-jako-wynik-dzielenia'),
    reminder: 'Kreska ułamkowa znaczy to samo, co znak dzielenia: a : b = a/b, licznik jest dzielną.',
  },
];

const QUIZ_DWA_ZAPISY: DiagnosticTask[] = [
  {
    id: 'na-liczbe-mieszana',
    prompt: 'Zamień 11/4 na liczbę mieszaną.',
    type: 'choice',
    options: [
      { id: 'a', text: '2 3/4' },
      { id: 'b', text: '4 3/11' },
      { id: 'c', text: '3 1/4' },
      { id: 'd', text: '2 1/4' },
    ],
    correctId: 'a',
    explanation: '11 : 4 = 2 reszty 3, więc 11/4 to 2 całości i jeszcze 3/4.',
    difficulty: { code: '05', name: 'Liczby mieszane' },
  },
  {
    id: 'na-niewlasciwy',
    prompt: 'Zamień 3 1/5 na ułamek niewłaściwy. Wpisz sam licznik (mianownik zostaje 5).',
    type: 'input',
    answer: '16',
    difficulty: { code: '05', name: 'Liczby mieszane' },
    explanation: 'Każda całość to 5 piątych części: 3 · 5 = 15, plus jeszcze 1 kawałek — razem 16/5.',
  },
  {
    id: 'jakie-dzielenie',
    prompt: 'Ułamek 7/9 jest wynikiem którego dzielenia?',
    type: 'choice',
    options: [
      { id: 'a', text: '9 : 7' },
      { id: 'b', text: '7 : 9' },
      { id: 'c', text: '9 : 9' },
      { id: 'd', text: '63 : 9' },
    ],
    correctId: 'b',
    explanation: 'Licznik jest dzielną, a mianownik dzielnikiem — 7/9 to wynik dzielenia 7 : 9.',
    difficulty: { code: '06', name: 'Ułamek jako wynik dzielenia' },
  },
  {
    id: 'podziel-czekolady',
    prompt: 'Pięć jednakowych czekolad podzielono równo między 8 osób. Ile czekolady dostała jedna osoba?',
    type: 'choice',
    options: [
      { id: 'a', text: '8/5 czekolady' },
      { id: 'b', text: '5/13 czekolady' },
      { id: 'c', text: '5/8 czekolady' },
      { id: 'd', text: '1/8 czekolady' },
    ],
    correctId: 'c',
    explanation: '5 : 8 = 5/8. Każdą czekoladę kroimy na 8 części i każdy bierze po jednym kawałku z każdej.',
    difficulty: { code: '06', name: 'Ułamek jako wynik dzielenia' },
  },
];

const RECAP_DZIALANIA: RecapItem[] = [
  {
    lesson: L('dodawanie-i-odejmowanie-ulamkow'),
    reminder: 'Przy jednakowych mianownikach dodajesz lub odejmujesz same liczniki, a mianownik przepisujesz bez zmian.',
  },
  {
    lesson: L('mnozenie-ulamka-przez-liczbe-naturalna'),
    reminder: 'Mnożąc ułamek przez liczbę naturalną, mnożysz sam licznik — mianownik zostaje.',
  },
];

function buildQuizDzialania(color: string): DiagnosticTask[] {
  return [
  {
    id: 'suma-dziesiatych',
    prompt: 'Oblicz 3/10 + 4/10. Wpisz sam licznik wyniku (mianownik zostaje 10).',
    type: 'input',
    answer: '7',
    difficulty: { code: '07', name: 'Dodawanie i odejmowanie ułamków' },
    explanation: 'Kawałki są jednakowe, więc dodajemy tylko liczniki: 3 + 4 = 7, czyli 7/10.',
  },
  {
    id: 'roznica-dwunastych',
    prompt: 'Ile wynosi 9/12 − 5/12?',
    type: 'choice',
    visual: (
      <div className="mx-auto max-w-xs space-y-3">
        <FractionBarGlyph color={color} mianownik={12} filled={fill(9)} ariaLabel="Pasek podzielony na 12 części, zamalowane 9" />
        <FractionBarGlyph color={color} mianownik={12} filled={fill(5)} ariaLabel="Pasek podzielony na 12 części, zamalowane 5" />
      </div>
    ),
    options: [
      { id: 'a', text: '4/12' },
      { id: 'b', text: '4/0' },
      { id: 'c', text: '14/12' },
      { id: 'd', text: '4/24' },
    ],
    correctId: 'a',
    explanation: 'Odejmujemy same liczniki: 9 − 5 = 4. Mianownik zostaje 12, czyli 4/12 (po skróceniu 1/3).',
    difficulty: { code: '07', name: 'Dodawanie i odejmowanie ułamków' },
  },
  {
    id: 'mnozenie-3-razy',
    prompt: 'Ile wynosi 3 · 2/5?',
    type: 'choice',
    options: [
      { id: 'a', text: '6/15' },
      { id: 'b', text: '5/5' },
      { id: 'c', text: '2/15' },
      { id: 'd', text: '6/5, czyli 1 1/5' },
    ],
    correctId: 'd',
    explanation: 'Mnożymy sam licznik: 3 · 2 = 6, mianownik zostaje 5. Wynik 6/5 to więcej niż całość — czytamy go jako 1 1/5.',
    difficulty: { code: '08', name: 'Mnożenie ułamka przez liczbę naturalną' },
  },
  {
    id: 'suma-mieszanych',
    prompt: 'Ile wynosi 2 1/6 + 1 3/6?',
    type: 'choice',
    options: [
      { id: 'a', text: '3 4/12' },
      { id: 'b', text: '3 4/6' },
      { id: 'c', text: '4 4/6' },
      { id: 'd', text: '2 4/6' },
    ],
    correctId: 'b',
    explanation: 'Całości do całości: 2 + 1 = 3. Kawałki do kawałków: 1/6 + 3/6 = 4/6. Razem 3 4/6.',
    difficulty: { code: '07', name: 'Dodawanie i odejmowanie ułamków' },
  },
  ];
}

const RECAP_ZADANIA: RecapItem[] = [
  {
    lesson: L('zadania-tekstowe-z-ulamkami'),
    reminder: 'Ułamek liczby przedmiotów: najpierw dzielisz przez mianownik, potem mnożysz przez licznik. Pytanie o resztę to odejmowanie od całości.',
  },
];

const QUIZ_ZADANIA: DiagnosticTask[] = [
  {
    id: 'dwie-piate-z-30',
    prompt: 'Ile to jest 2/5 z 30? Wpisz samą liczbę.',
    type: 'input',
    answer: '12',
    difficulty: { code: '09', name: 'Zadania tekstowe z ułamkami' },
    explanation: '30 : 5 = 6, a potem 2 · 6 = 12. Najpierw dzielenie przez mianownik, potem mnożenie przez licznik.',
  },
  {
    id: 'balony-zostaly',
    prompt: 'Z 20 balonów pękło 3/4. Ile balonów zostało całych?',
    type: 'choice',
    options: [
      { id: 'a', text: '15' },
      { id: 'b', text: '4' },
      { id: 'c', text: '5' },
      { id: 'd', text: '16' },
    ],
    correctId: 'c',
    explanation: 'Zostało 4/4 − 3/4 = 1/4 balonów, a 20 : 4 = 5. Uwaga: 3/4 opisuje te, których już nie ma.',
    difficulty: { code: '09', name: 'Zadania tekstowe z ułamkami' },
  },
  {
    id: 'mleko-na-porcje',
    prompt: 'Na jedną porcję naleśników idą 2/3 szklanki mleka. Ile mleka potrzeba na 3 porcje?',
    type: 'choice',
    options: [
      { id: 'a', text: '2 szklanki' },
      { id: 'b', text: '2/9 szklanki' },
      { id: 'c', text: '6/9 szklanki' },
      { id: 'd', text: '5/3 szklanki' },
    ],
    correctId: 'a',
    explanation: '3 · 2/3 = 6/3, a sześć trzecich części to dokładnie 2 szklanki.',
    difficulty: { code: '09', name: 'Zadania tekstowe z ułamkami' },
  },
  {
    id: 'ile-bylo-cukierkow-podsumowanie',
    prompt: 'Kuba zjadł 6 cukierków i była to dokładnie 1/4 wszystkich. Ile cukierków było na początku? Wpisz samą liczbę.',
    type: 'input',
    answer: '24',
    difficulty: { code: '09', name: 'Zadania tekstowe z ułamkami' },
    explanation: 'Znamy część, szukamy całości. Skoro 1/4 to 6 cukierków, całość to 4 takie grupy: 4 · 6 = 24.',
  },
];

const CLUSTERS: ResultCluster[] = [
  { id: 'czym-jest-ulamek', label: 'Czym jest ułamek i gdzie leży na osi', icon: 'PieChart', lessons: RECAP_CZYM_JEST.map((r) => r.lesson) },
  { id: 'porownywanie', label: 'Porównywanie oraz równe ułamki', icon: 'Target', lessons: RECAP_POROWNYWANIE.map((r) => r.lesson) },
  { id: 'dwa-zapisy', label: 'Dwa zapisy tej samej liczby', icon: 'Shapes', lessons: RECAP_DWA_ZAPISY.map((r) => r.lesson) },
  { id: 'dzialania', label: 'Dodawanie, odejmowanie i mnożenie', icon: 'Hash', lessons: RECAP_DZIALANIA.map((r) => r.lesson) },
  { id: 'zadania', label: 'Ułamki w zadaniach tekstowych', icon: 'Puzzle', lessons: RECAP_ZADANIA.map((r) => r.lesson) },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PodsumowanieUlamkiZwykleLesson({ lesson, mathModule, nextLesson, nextModule }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson} nextModule={nextModule}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

type Scores = Partial<Record<string, { score: number; total: number }>>;

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const czymJest = useStepDone('czym-jest-ulamek');
  const porownywanie = useStepDone('porownywanie');
  const dwaZapisy = useStepDone('dwa-zapisy');
  const dzialania = useStepDone('dzialania');
  const zadania = useStepDone('zadania');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Dziewięć lekcji o ułamkach za Tobą — od pierwszego pokrojonego tortu po zadania tekstowe.
          Zanim ruszysz dalej, przejdź przez <strong>pięć bloków tematycznych</strong>: w każdym
          krótka powtórka, a potem kilka pytań sprawdzających, co zostało. Pod każdym pytaniem
          zobaczysz, z której lekcji ono pochodzi.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          To nie klasówka — nikt nie stawia tu ocen. Na końcu zobaczysz swój wynik z każdego bloku i
          podpowiedź, co warto powtórzyć.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: PieChart, text: 'Czym jest ułamek i gdzie leży na osi' },
            { icon: Target, text: 'Porównywanie oraz równe ułamki' },
            { icon: Shapes, text: 'Dwa zapisy tej samej liczby' },
            { icon: Hash, text: 'Dodawanie, odejmowanie i mnożenie' },
            { icon: Puzzle, text: 'Ułamki w zadaniach tekstowych' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Czym jest ułamek */}
      <LessonSection id="czym-jest-ulamek">
        <ClusterRecap items={RECAP_CZYM_JEST} color={color} />
        <DiagnosticQuiz
          tasks={buildQuizCzymJest(color)}
          color={color}
          onFinish={(score, total) => {
            recordScore('czym-jest-ulamek')(score, total);
            czymJest.markStepDone();
          }}
        />
      </LessonSection>

      {/* 2. Porównywanie i równe ułamki */}
      <LessonSection id="porownywanie">
        <ClusterRecap items={RECAP_POROWNYWANIE} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_POROWNYWANIE}
          color={color}
          onFinish={(score, total) => {
            recordScore('porownywanie')(score, total);
            porownywanie.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Dwa zapisy tej samej liczby */}
      <LessonSection id="dwa-zapisy">
        <ClusterRecap items={RECAP_DWA_ZAPISY} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_DWA_ZAPISY}
          color={color}
          onFinish={(score, total) => {
            recordScore('dwa-zapisy')(score, total);
            dwaZapisy.markStepDone();
          }}
        />
      </LessonSection>

      {/* 4. Działania */}
      <LessonSection id="dzialania">
        <ClusterRecap items={RECAP_DZIALANIA} color={color} />
        <DiagnosticQuiz
          tasks={buildQuizDzialania(color)}
          color={color}
          onFinish={(score, total) => {
            recordScore('dzialania')(score, total);
            dzialania.markStepDone();
          }}
        />
      </LessonSection>

      {/* 5. Zadania tekstowe */}
      <LessonSection id="zadania">
        <ClusterRecap items={RECAP_ZADANIA} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_ZADANIA}
          color={color}
          onFinish={(score, total) => {
            recordScore('zadania')(score, total);
            zadania.markStepDone();
          }}
        />
      </LessonSection>

      {/* 6. Wynik */}
      <LessonSection id="wynik">
        <ModuleResultSummary clusters={CLUSTERS} scores={scores} color={color} onComplete={wynik.markStepDone} />
      </LessonSection>
    </>
  );
}
