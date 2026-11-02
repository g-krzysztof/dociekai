'use client';

import { useState } from 'react';
import { ArrowLeftRight, Hash, Ruler, Scale } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { ColumnAddGrid } from '../dodawanie-ulamkow-dziesietnych/column-add-grid';
import { ColumnSubGrid } from '../odejmowanie-ulamkow-dziesietnych/column-sub-grid';
import { ScaleShiftMini } from '../mnozenie-dzielenie-przez-10-100-1000/scale-shift-mini';
import { buildDecimalAddition } from '../../../lib/decimal-addition';
import { buildDecimalSubtraction } from '../../../lib/decimal-subtraction';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Skrót — wszystkie lekcje tego podsumowania są zawsze z tego samego modułu. */
const L = (slug: string): MathLesson => {
  const lesson = getLesson('ulamki-dziesietne', slug);
  if (!lesson) throw new Error(`Brak lekcji ulamki-dziesietne/${slug}`);
  return lesson;
};

const STEPS: LessonStepMeta[] = [
  { id: 'zapis', kind: 'Powtórka 1', title: 'Zapis i odczyt liczby z przecinkiem', time: '5 min', icon: 'Hash' },
  { id: 'jednostki', kind: 'Powtórka 2', title: 'Jednostki i zamiana na ułamek zwykły', time: '5 min', icon: 'Ruler' },
  { id: 'porownywanie', kind: 'Powtórka 3', title: 'Porównywanie i porządkowanie', time: '5 min', icon: 'Scale' },
  { id: 'dzialania', kind: 'Powtórka 4', title: 'Dodawanie, odejmowanie, mnożenie i dzielenie', time: '6 min', icon: 'ArrowLeftRight' },
  { id: 'wynik', kind: 'Wynik', title: 'Twój wynik i co warto powtórzyć', time: '3 min', icon: 'Trophy' },
];

const RECAP_ZAPIS: RecapItem[] = [
  {
    lesson: L('zapis-ulamkow-dziesietnych'),
    reminder:
      'Ułamek o mianowniku 10, 100 lub 1000 to liczba z przecinkiem. Liczba miejsc po przecinku = liczba zer mianownika. Nazwa rzędu (dziesiąte, setne, tysięczne) zależy od liczby miejsc, nie od cyfr.',
  },
];

const QUIZ_ZAPIS: DiagnosticTask[] = [
  {
    id: 'zapisz-7-100',
    prompt: 'Zapisz ułamek 7/100 jako liczbę dziesiętną.',
    type: 'choice',
    options: [
      { id: 'a', text: '0,07' },
      { id: 'b', text: '0,7' },
      { id: 'c', text: '7,100' },
      { id: 'd', text: '0,007' },
    ],
    correctId: 'a',
    explanation: 'Mianownik 100 ma dwa zera, więc dwa miejsca po przecinku. Licznik 7 to jedna cyfra, więc z przodu dochodzi zero: 0,07.',
    difficulty: { code: '01', name: 'Zapis ułamków dziesiętnych' },
  },
  {
    id: 'odczytaj-325',
    prompt: 'Jak czytamy liczbę 3,25?',
    type: 'choice',
    options: [
      { id: 'a', text: 'trzy przecinek dwadzieścia pięć' },
      { id: 'b', text: 'trzy całe i dwadzieścia pięć setnych' },
      { id: 'c', text: 'trzy i dwadzieścia pięć dziesiątych' },
      { id: 'd', text: 'trzysta dwadzieścia pięć' },
    ],
    correctId: 'b',
    explanation: 'Część całkowita to „trzy całe”, a dwie cyfry po przecinku czytamy jako setne: „dwadzieścia pięć setnych”.',
    difficulty: { code: '01', name: 'Zapis ułamków dziesiętnych' },
  },
  {
    id: 'ktora-cyfra-setne',
    prompt: 'W liczbie 4,187 która cyfra stoi na miejscu setnych? Wpisz samą cyfrę.',
    type: 'input',
    answer: '8',
    difficulty: { code: '01', name: 'Zapis ułamków dziesiętnych' },
    explanation: 'Po przecinku: 1 to dziesiąte, 8 to setne, 7 to tysięczne. Na miejscu setnych stoi 8.',
  },
  {
    id: 'osiem-dziesiatych',
    prompt: 'Która liczba to osiem dziesiątych?',
    type: 'choice',
    options: [
      { id: 'a', text: '0,08' },
      { id: 'b', text: '8,0' },
      { id: 'c', text: '0,008' },
      { id: 'd', text: '0,8' },
    ],
    correctId: 'd',
    explanation: 'Osiem dziesiątych to 8/10, czyli jedna cyfra po przecinku: 0,8. 0,08 to osiem setnych.',
    difficulty: { code: '01', name: 'Zapis ułamków dziesiętnych' },
  },
];

const RECAP_JEDNOSTKI: RecapItem[] = [
  {
    lesson: L('wyrazenia-dwumianowane'),
    reminder:
      'Mniejszą jednostkę wpisujesz w rzędy po przecinku od prawej strony, dopełniając brakujące miejsca zerami: 3 m 5 cm to 3,05 m, nie 3,5 m.',
  },
  {
    lesson: L('ulamek-zwykly-a-dziesietny'),
    reminder:
      'W obie strony przez mianownik 10, 100 lub 1000: rozszerzasz ułamek zwykły do takiego mianownika, a ułamek dziesiętny zapisujesz nad potęgą 10 i skracasz.',
  },
];

const QUIZ_JEDNOSTKI: DiagnosticTask[] = [
  {
    id: '3m5cm',
    prompt: 'Zapisz 3 m 5 cm w metrach.',
    type: 'choice',
    options: [
      { id: 'a', text: '3,5 m' },
      { id: 'b', text: '3,05 m' },
      { id: 'c', text: '8 m' },
      { id: 'd', text: '3,005 m' },
    ],
    correctId: 'b',
    explanation: '1 m = 100 cm, więc centymetry idą na dwa miejsca po przecinku. 5 cm to 05 setnych metra: 3,05 m.',
    difficulty: { code: '02', name: 'Wyrażenia dwumianowane' },
  },
  {
    id: '1kg7g',
    prompt: 'Ile to 1 kg 7 g zapisane w kilogramach?',
    type: 'choice',
    options: [
      { id: 'a', text: '1,7 kg' },
      { id: 'b', text: '1,07 kg' },
      { id: 'c', text: '1,007 kg' },
      { id: 'd', text: '1,70 kg' },
    ],
    correctId: 'c',
    explanation: '1 kg = 1000 g, więc gramy idą na trzy miejsca po przecinku. 7 g to 007 tysięcznych kilograma: 1,007 kg.',
    difficulty: { code: '02', name: 'Wyrażenia dwumianowane' },
  },
  {
    id: '34-na-dziesietny',
    prompt: 'Zamień 3/4 na ułamek dziesiętny.',
    type: 'choice',
    options: [
      { id: 'a', text: '0,75' },
      { id: 'b', text: '0,34' },
      { id: 'c', text: '0,43' },
      { id: 'd', text: '3,4' },
    ],
    correctId: 'a',
    explanation: 'Rozszerzamy do setnych: 3/4 = 75/100 = 0,75 (mnożymy licznik i mianownik przez 25).',
    difficulty: { code: '03', name: 'Ułamek zwykły a dziesiętny' },
  },
  {
    id: '06-na-zwykly',
    prompt: 'Ułamek dziesiętny 0,6 to jako ułamek zwykły po skróceniu:',
    type: 'choice',
    options: [
      { id: 'a', text: '6/10' },
      { id: 'b', text: '1/6' },
      { id: 'c', text: '6/1' },
      { id: 'd', text: '3/5' },
    ],
    correctId: 'd',
    explanation: '0,6 to 6/10. Licznik i mianownik dzielą się przez 2: 6 : 2 = 3, 10 : 2 = 5. Wychodzi 3/5.',
    difficulty: { code: '03', name: 'Ułamek zwykły a dziesiętny' },
  },
];

const RECAP_POROWNYWANIE: RecapItem[] = [
  {
    lesson: L('porownywanie-ulamkow-dziesietnych'),
    reminder:
      'Najpierw część całkowita, potem rząd po rzędzie od lewej. Wyrównaj przecinki i dopisz zera (0,5 = 0,50). Więcej cyfr po przecinku NIE znaczy większa liczba.',
  },
];

const QUIZ_POROWNYWANIE: DiagnosticTask[] = [
  {
    id: '05-vs-045',
    prompt: 'Która liczba jest większa: 0,5 czy 0,45?',
    type: 'choice',
    options: [
      { id: 'a', text: '0,5' },
      { id: 'b', text: '0,45, bo ma więcej cyfr' },
      { id: 'c', text: 'są równe' },
      { id: 'd', text: 'nie da się porównać' },
    ],
    correctId: 'a',
    explanation: 'Dopisujemy zero: 0,50 i 0,45. Dziesiąte: 5 > 4, więc 0,5 jest większe. Liczba cyfr nie decyduje.',
    difficulty: { code: '04', name: 'Porównywanie ułamków dziesiętnych' },
  },
  {
    id: 'porzadek-najmniejsza',
    prompt: 'Które z tych liczb są najmniejsze: 1,2 · 1,08 · 1,15?',
    type: 'choice',
    options: [
      { id: 'a', text: '1,2' },
      { id: 'b', text: '1,15' },
      { id: 'c', text: '1,08' },
      { id: 'd', text: 'wszystkie równe' },
    ],
    correctId: 'c',
    explanation: 'Część całkowita ta sama (1). Dziesiąte: 1,08 ma 0, a pozostałe 1 lub 2. Najmniejsza jest 1,08.',
    difficulty: { code: '04', name: 'Porównywanie ułamków dziesiętnych' },
  },
  {
    id: '07-vs-070',
    prompt: 'Liczby 0,7 i 0,70 to:',
    type: 'choice',
    options: [
      { id: 'a', text: 'dwie różne liczby' },
      { id: 'b', text: '0,70 jest większe' },
      { id: 'c', text: '0,7 jest większe' },
      { id: 'd', text: 'ta sama liczba' },
    ],
    correctId: 'd',
    explanation: 'Zero dopisane na końcu części po przecinku nic nie zmienia. 7 dziesiątych to 70 setnych.',
    difficulty: { code: '04', name: 'Porównywanie ułamków dziesiętnych' },
  },
  {
    id: 'znak-2309-231',
    prompt: 'Jaki znak wstawić między 2,309 a 2,31?',
    type: 'choice',
    options: [
      { id: 'a', text: '>' },
      { id: 'b', text: '<' },
      { id: 'c', text: '=' },
      { id: 'd', text: 'nie wiadomo' },
    ],
    correctId: 'b',
    explanation:
      'Wyrównujemy liczbę miejsc: 2,309 i 2,310. Jedności równe, dziesiąte równe (3 = 3), a na setnych 0 < 1 — więc 2,309 < 2,31.',
    difficulty: { code: '04', name: 'Porównywanie ułamków dziesiętnych' },
  },
];

const RECAP_DZIALANIA: RecapItem[] = [
  {
    lesson: L('dodawanie-ulamkow-dziesietnych'),
    reminder: 'Przecinek pod przecinkiem, dopisane zera do równej liczby miejsc, dodawanie kolumnami od prawej. Przeniesienie potrafi przeskoczyć przez przecinek.',
  },
  {
    lesson: L('odejmowanie-ulamkow-dziesietnych'),
    reminder: 'Tak samo jak dodawanie, tylko z pożyczaniem: za mało w rzędzie → pożycz 1 od kolumny z lewej. Pożyczka też potrafi przeskoczyć przez przecinek.',
  },
  {
    lesson: L('mnozenie-dzielenie-przez-10-100-1000'),
    reminder: 'Bez słupka: ile zer ma mnożnik lub dzielnik, o tyle miejsc przeskakuje przecinek. Mnożenie → w prawo, dzielenie → w lewo, brakujące miejsca dopełnij zerami.',
  },
];

function buildQuizDzialania(color: string): DiagnosticTask[] {
  return [
    {
      id: 'dod-0807',
      prompt: 'Ile to 0,8 + 0,7?',
      type: 'choice',
      visual: (
        <div className="mx-auto max-w-[240px]">
          <ColumnAddGrid addition={buildDecimalAddition('0,8', '0,7')} color={color} revealed={0} showAllZeros />
        </div>
      ),
      options: [
        { id: 'a', text: '0,15' },
        { id: 'b', text: '1,5' },
        { id: 'c', text: '1,15' },
        { id: 'd', text: '0,85' },
      ],
      correctId: 'b',
      explanation: '8 dziesiątych + 7 dziesiątych = 15 dziesiątych → 5, a 1 całą przenosimy przez przecinek: 1,5.',
      difficulty: { code: '05', name: 'Dodawanie ułamków dziesiętnych' },
    },
    {
      id: 'odej-1205',
      prompt: 'Ile to 1,2 − 0,5?',
      type: 'input',
      answer: '0,7',
      visual: (
        <div className="mx-auto max-w-[240px]">
          <ColumnSubGrid subtraction={buildDecimalSubtraction('1,2', '0,5')} color={color} revealed={0} showAllZeros />
        </div>
      ),
      difficulty: { code: '06', name: 'Odejmowanie ułamków dziesiętnych' },
      explanation: '2 dziesiąte to za mało na 5. Pożyczamy 1 całą przez przecinek: 12 dziesiątych − 5 = 7. Wynik: 0,7.',
    },
    {
      id: 'mn-35-100',
      prompt: 'Ile to 3,5 · 100?',
      type: 'choice',
      visual: (
        <div className="mx-auto max-w-[240px]">
          <ScaleShiftMini input="3,5" op="x100" color={color} />
        </div>
      ),
      options: [
        { id: 'a', text: '3,500' },
        { id: 'b', text: '35' },
        { id: 'c', text: '350' },
        { id: 'd', text: '3500' },
      ],
      correctId: 'c',
      explanation: '100 ma dwa zera → przecinek o 2 w prawo: 3,5 → 35, brakuje jednego miejsca → 350.',
      difficulty: { code: '07', name: 'Mnożenie i dzielenie przez 10, 100, 1000' },
    },
    {
      id: 'dziel-42-10',
      prompt: 'Ile to 4,2 : 10? Wpisz wynik.',
      type: 'input',
      answer: '0,42',
      difficulty: { code: '07', name: 'Mnożenie i dzielenie przez 10, 100, 1000' },
      explanation: '10 ma jedno zero → przecinek o 1 w lewo: 4,2 → 0,42.',
    },
  ];
}

const CLUSTERS: ResultCluster[] = [
  { id: 'zapis', label: 'Zapis i odczyt liczby z przecinkiem', icon: 'Hash', lessons: RECAP_ZAPIS.map((r) => r.lesson) },
  { id: 'jednostki', label: 'Jednostki i zamiana na ułamek zwykły', icon: 'Ruler', lessons: RECAP_JEDNOSTKI.map((r) => r.lesson) },
  { id: 'porownywanie', label: 'Porównywanie i porządkowanie', icon: 'Scale', lessons: RECAP_POROWNYWANIE.map((r) => r.lesson) },
  { id: 'dzialania', label: 'Dodawanie, odejmowanie, mnożenie i dzielenie', icon: 'ArrowLeftRight', lessons: RECAP_DZIALANIA.map((r) => r.lesson) },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PodsumowanieUlamkiDziesietneLesson({ lesson, mathModule, nextLesson, nextModule }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson} nextModule={nextModule}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

type Scores = Partial<Record<string, { score: number; total: number }>>;

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const zapis = useStepDone('zapis');
  const jednostki = useStepDone('jednostki');
  const porownywanie = useStepDone('porownywanie');
  const dzialania = useStepDone('dzialania');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Cały moduł o liczbach z przecinkiem za Tobą — od pierwszego przecinka po dodawanie w
          słupku i przesuwanie przecinka przy mnożeniu przez 1000. Zanim ruszysz dalej, przejdź przez{' '}
          <strong>cztery bloki tematyczne</strong>: w każdym krótka powtórka, a potem kilka pytań
          sprawdzających, co zostało. Pod każdym pytaniem zobaczysz, z której lekcji ono pochodzi.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          To nie klasówka — nikt nie stawia tu ocen. Na końcu zobaczysz swój wynik z każdego bloku i
          podpowiedź, co warto powtórzyć.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: Hash, text: 'Zapis i odczyt liczby z przecinkiem' },
            { icon: Ruler, text: 'Jednostki i zamiana na ułamek zwykły' },
            { icon: Scale, text: 'Porównywanie i porządkowanie' },
            { icon: ArrowLeftRight, text: 'Dodawanie, odejmowanie, mnożenie i dzielenie' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Zapis i odczyt */}
      <LessonSection id="zapis">
        <ClusterRecap items={RECAP_ZAPIS} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_ZAPIS}
          color={color}
          onFinish={(score, total) => {
            recordScore('zapis')(score, total);
            zapis.markStepDone();
          }}
        />
      </LessonSection>

      {/* 2. Jednostki i zamiana */}
      <LessonSection id="jednostki">
        <ClusterRecap items={RECAP_JEDNOSTKI} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_JEDNOSTKI}
          color={color}
          onFinish={(score, total) => {
            recordScore('jednostki')(score, total);
            jednostki.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Porównywanie */}
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

      {/* 5. Wynik */}
      <LessonSection id="wynik">
        <ModuleResultSummary clusters={CLUSTERS} scores={scores} color={color} onComplete={wynik.markStepDone} />
      </LessonSection>
    </>
  );
}
