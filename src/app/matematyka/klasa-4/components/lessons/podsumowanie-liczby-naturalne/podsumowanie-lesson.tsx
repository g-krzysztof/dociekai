'use client';

import { useState } from 'react';
import { Box, Grid3x3, Hash, PenLine, Puzzle } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Skrót — wszystkie lekcje tego podsumowania są zawsze z tego samego modułu. */
const L = (slug: string): MathLesson => {
  const lesson = getLesson('liczby-naturalne', slug);
  if (!lesson) throw new Error(`Brak lekcji liczby-naturalne/${slug}`);
  return lesson;
};

const STEPS: LessonStepMeta[] = [
  { id: 'liczby', kind: 'Powtórka 1', title: 'Liczby i ich zapis', time: '5 min', icon: 'Hash' },
  {
    id: 'dzialania-podstawowe',
    kind: 'Powtórka 2',
    title: 'Dodawanie, odejmowanie i własności działań',
    time: '5 min',
    icon: 'PenLine',
  },
  {
    id: 'mnozenie-dzielenie',
    kind: 'Powtórka 3',
    title: 'Mnożenie i dzielenie',
    time: '5 min',
    icon: 'Grid3x3',
  },
  {
    id: 'wlasnosci-liczb',
    kind: 'Powtórka 4',
    title: 'Własności liczb',
    time: '4 min',
    icon: 'Box',
  },
  {
    id: 'strategie',
    kind: 'Powtórka 5',
    title: 'Strategie rozwiązywania',
    time: '5 min',
    icon: 'Puzzle',
  },
  {
    id: 'wynik',
    kind: 'Wynik',
    title: 'Twój wynik i co warto powtórzyć',
    time: '3 min',
    icon: 'Trophy',
  },
];

const RECAP_LICZBY: RecapItem[] = [
  {
    lesson: L('zapis-duzych-liczb'),
    reminder: 'Duże liczby dzielisz na klasy (jedności, tysiące, miliony) po trzy cyfry od prawej.',
  },
  {
    lesson: L('os-liczbowa'),
    reminder: 'Odczytujesz liczbę na osi, licząc działki od najbliższej podpisanej kreski.',
  },
  {
    lesson: L('porownywanie-liczb'),
    reminder:
      'Porównujesz liczby cyfra po cyfrze, od lewej — najpierw długość zapisu, potem kolejne cyfry.',
  },
];

const QUIZ_LICZBY: DiagnosticTask[] = [
  {
    id: 'liczby-1',
    prompt: 'Ile milionów jest w liczbie 4 208 306?',
    type: 'input',
    answer: '4',
    explanation: 'Pierwsza klasa od lewej to miliony — tu jedna cyfra: 4.',
    difficulty: { code: '01', name: 'Zapis dużych liczb' },
  },
  {
    id: 'liczby-2',
    prompt:
      'Na osi liczbowej odległość między sąsiednimi dużymi kreskami to 100. Punkt stoi 3 kreski za 200. Jaka to liczba?',
    type: 'choice',
    options: [
      { id: 'a', text: '500' },
      { id: 'b', text: '300' },
      { id: 'c', text: '600' },
      { id: 'd', text: '400' },
    ],
    correctId: 'a',
    explanation: '200 + 3 × 100 = 500.',
    difficulty: { code: '02', name: 'Oś liczbowa' },
  },
  {
    id: 'liczby-3',
    prompt: 'Która liczba jest największa: 3999, 30298, 30412, 30500?',
    type: 'choice',
    options: [
      { id: 'a', text: '3999' },
      { id: 'b', text: '30500' },
      { id: 'c', text: '30298' },
      { id: 'd', text: '30412' },
    ],
    correctId: 'b',
    explanation:
      '3999 ma mniej cyfr, więc odpada od razu. Wśród liczb 5-cyfrowych porównujesz kolejne cyfry: 30500 ma większą cyfrę setek niż 30412 i 30298.',
    difficulty: { code: '03', name: 'Porównywanie liczb' },
  },
  {
    id: 'liczby-4',
    prompt: 'Zapisz cyframi: dwa miliony piętnaście tysięcy trzy.',
    type: 'input',
    answer: '2015003',
    explanation: '2 000 000 + 15 000 + 3 = 2 015 003.',
    difficulty: { code: '01', name: 'Zapis dużych liczb' },
  },
];

const RECAP_DZIALANIA: RecapItem[] = [
  {
    lesson: L('dodawanie-odejmowanie-w-pamieci'),
    reminder:
      'Rozkładasz liczby na dziesiątki i jedności, a potem doskakujesz do wyniku po pustej osi liczbowej.',
  },
  {
    lesson: L('wlasnosci-dzialan'),
    reminder:
      'Kolejność w dodawaniu i mnożeniu możesz zmieniać (przemienność), a grupowanie nie wpływa na wynik (łączność).',
  },
];

const QUIZ_DZIALANIA: DiagnosticTask[] = [
  {
    id: 'dzialania-1',
    prompt: '348 + 267 =',
    type: 'input',
    answer: '615',
    explanation: '348 + 267 = 615.',
    difficulty: { code: '04', name: 'Dodawanie i odejmowanie w pamięci' },
  },
  {
    id: 'dzialania-2',
    prompt: 'Które działanie na pewno da ten sam wynik co 24 × 5?',
    type: 'choice',
    options: [
      { id: 'a', text: '24 + 5' },
      { id: 'b', text: '24 − 5' },
      { id: 'c', text: '5 × 24' },
      { id: 'd', text: '5 : 24' },
    ],
    correctId: 'c',
    explanation:
      'Mnożenie jest przemienne — kolejność czynników nie zmienia wyniku: 5 × 24 = 24 × 5.',
    difficulty: { code: '05', name: 'Własności działań' },
  },
  {
    id: 'dzialania-3',
    prompt: '830 − 465 =',
    type: 'input',
    answer: '365',
    explanation: '830 − 465 = 365.',
    difficulty: { code: '04', name: 'Dodawanie i odejmowanie w pamięci' },
  },
  {
    id: 'dzialania-4',
    prompt: '3 × (4 + 2) to to samo co:',
    type: 'choice',
    options: [
      { id: 'a', text: '3 × 4 + 2' },
      { id: 'b', text: '3 + 4 × 2' },
      { id: 'c', text: '3 × 2 + 4' },
      { id: 'd', text: '3 × 4 + 3 × 2' },
    ],
    correctId: 'd',
    explanation: 'Rozdzielność mnożenia względem dodawania: 3 × (4 + 2) = 3×4 + 3×2.',
    difficulty: { code: '05', name: 'Własności działań' },
  },
];

const RECAP_MNOZENIE: RecapItem[] = [
  {
    lesson: L('tabliczka-mnozenia'),
    reminder:
      'Mnożenie i dzielenie to działania odwrotne — te same trzy liczby łączą fakt mnożenia i dzielenia.',
  },
  {
    lesson: L('mnozenie-dzielenie-10-100-1000'),
    reminder:
      'Mnożenie i dzielenie przez 10, 100, 1000 przesuwa cyfry o rzędy wielkości — bez liczenia w pamięci.',
  },
  {
    lesson: L('dzielenie-z-reszta'),
    reminder: 'Reszta zawsze jest mniejsza niż dzielnik — jeśli nie jest, coś policzyłeś źle.',
  },
];

const QUIZ_MNOZENIE: DiagnosticTask[] = [
  {
    id: 'mnozenie-1',
    prompt: '7 × 9 =',
    type: 'input',
    answer: '63',
    explanation: '7 × 9 = 63.',
    difficulty: { code: '06', name: 'Tabliczka mnożenia' },
  },
  {
    id: 'mnozenie-2',
    prompt: '4600 : 100 =',
    type: 'input',
    answer: '46',
    explanation: 'Dzielenie przez 100 przesuwa cyfry o dwa miejsca: 4600 → 46.',
    difficulty: { code: '07', name: 'Mnożenie i dzielenie przez 10, 100, 1000' },
  },
  {
    id: 'mnozenie-3',
    prompt: 'Które dzielenie z resztą jest poprawnie policzone dla 34 : 5?',
    type: 'choice',
    options: [
      { id: 'a', text: '6 reszty 4' },
      { id: 'b', text: '7 reszty 0' },
      { id: 'c', text: '5 reszty 9' },
      { id: 'd', text: '6 reszty 5' },
    ],
    correctId: 'a',
    explanation:
      '5 × 6 = 30, a 34 − 30 = 4. Warianty c i d mają resztę równą lub większą od dzielnika — to zawsze błąd.',
    difficulty: { code: '08', name: 'Dzielenie z resztą' },
  },
  {
    id: 'mnozenie-4',
    prompt: 'Które dzielenie z resztą jest poprawnie policzone dla 17 : 4?',
    type: 'choice',
    options: [
      { id: 'a', text: '3 reszty 5' },
      { id: 'b', text: '4 reszty 1' },
      { id: 'c', text: '4 reszty 2' },
      { id: 'd', text: '3 reszty 4' },
    ],
    correctId: 'b',
    explanation: '4 × 4 = 16, a 17 − 16 = 1.',
    difficulty: { code: '08', name: 'Dzielenie z resztą' },
  },
];

const RECAP_WLASNOSCI: RecapItem[] = [
  {
    lesson: L('kwadraty-i-szesciany'),
    reminder:
      'Kwadrat to liczba razy ona sama (n²), sześcian to razy ona sama trzy razy (n³) — nie razy dwa czy trzy.',
  },
  {
    lesson: L('cechy-podzielnosci'),
    reminder:
      'Podzielność przez 2, 5, 10 sprawdzasz po ostatniej cyfrze; przez 3 i 9 — po sumie cyfr.',
  },
];

const QUIZ_WLASNOSCI: DiagnosticTask[] = [
  {
    id: 'wlasnosci-1',
    prompt: '6² =',
    type: 'input',
    answer: '36',
    explanation: '6² = 6 × 6 = 36.',
    difficulty: { code: '09', name: 'Kwadraty i sześciany' },
  },
  {
    id: 'wlasnosci-2',
    prompt: '3³ =',
    type: 'input',
    answer: '27',
    explanation: '3³ = 3 × 3 × 3 = 27.',
    difficulty: { code: '09', name: 'Kwadraty i sześciany' },
  },
  {
    id: 'wlasnosci-3',
    prompt: 'Która liczba dzieli się przez 9?',
    type: 'choice',
    options: [
      { id: 'a', text: '124' },
      { id: 'b', text: '301' },
      { id: 'c', text: '243' },
      { id: 'd', text: '512' },
    ],
    correctId: 'c',
    explanation: 'Suma cyfr 243 to 2+4+3=9, a 9 dzieli się przez 9.',
    difficulty: { code: '10', name: 'Cechy podzielności' },
  },
  {
    id: 'wlasnosci-4',
    prompt: 'Liczba kończy się na 0. Przez co na pewno się dzieli?',
    type: 'choice',
    options: [
      { id: 'a', text: 'przez 2, 5 i 10' },
      { id: 'b', text: 'tylko przez 2' },
      { id: 'c', text: 'tylko przez 5' },
      { id: 'd', text: 'przez 9' },
    ],
    correctId: 'a',
    explanation:
      'Ostatnia cyfra 0 spełnia jednocześnie regułę podzielności przez 2, przez 5 i przez 10.',
    difficulty: { code: '10', name: 'Cechy podzielności' },
  },
];

const RECAP_STRATEGIE: RecapItem[] = [
  {
    lesson: L('kolejnosc-dzialan'),
    reminder:
      'Najpierw nawiasy, potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie — z lewa do prawa.',
  },
  {
    lesson: L('szacowanie-wynikow'),
    reminder: 'Zaokrąglasz liczby, żeby szybko sprawdzić, czy dokładny wynik ma sens.',
  },
  {
    lesson: L('zadania-tekstowe'),
    reminder: 'Zanim policzysz, znajdź dane i pytanie — nie każda liczba w treści jest potrzebna.',
  },
];

const QUIZ_STRATEGIE: DiagnosticTask[] = [
  {
    id: 'strategie-1',
    prompt: '2 + 3 × 4 =',
    type: 'input',
    answer: '14',
    explanation: 'Mnożenie przed dodawaniem: 3 × 4 = 12, a 2 + 12 = 14.',
    difficulty: { code: '11', name: 'Kolejność wykonywania działań' },
  },
  {
    id: 'strategie-2',
    prompt: 'Oszacuj 612 + 385 (zaokrąglij obie liczby do pełnych setek).',
    type: 'choice',
    options: [
      { id: 'a', text: '800' },
      { id: 'b', text: '1000' },
      { id: 'c', text: '1100' },
      { id: 'd', text: '900' },
    ],
    correctId: 'b',
    explanation: '612 → 600, 385 → 400, więc 600 + 400 = 1000.',
    difficulty: { code: '12', name: 'Szacowanie wyników' },
  },
  {
    id: 'strategie-3',
    prompt:
      'W zadaniu: „Ala ma 12 zł, jej brat ma 9 lat. Ile złotych ma Ala?” — wiek brata jest tu:',
    type: 'choice',
    options: [
      { id: 'a', text: 'potrzebne do obliczeń' },
      { id: 'b', text: 'błędem w zadaniu' },
      { id: 'c', text: 'niepotrzebne do tego pytania' },
      { id: 'd', text: 'odpowiedzią' },
    ],
    correctId: 'c',
    explanation: 'Pytanie dotyczy tylko pieniędzy Ali — wiek brata nie jest tu w ogóle potrzebny.',
    difficulty: { code: '13', name: 'Zadania tekstowe' },
  },
  {
    id: 'strategie-4',
    prompt: '(5 + 3) × 2 =',
    type: 'input',
    answer: '16',
    explanation: 'Nawias najpierw: 5 + 3 = 8, a 8 × 2 = 16.',
    difficulty: { code: '11', name: 'Kolejność wykonywania działań' },
  },
];

const CLUSTERS: ResultCluster[] = [
  {
    id: 'liczby',
    label: 'Liczby i ich zapis',
    icon: 'Hash',
    lessons: RECAP_LICZBY.map((r) => r.lesson),
  },
  {
    id: 'dzialania-podstawowe',
    label: 'Dodawanie, odejmowanie i własności działań',
    icon: 'PenLine',
    lessons: RECAP_DZIALANIA.map((r) => r.lesson),
  },
  {
    id: 'mnozenie-dzielenie',
    label: 'Mnożenie i dzielenie',
    icon: 'Grid3x3',
    lessons: RECAP_MNOZENIE.map((r) => r.lesson),
  },
  {
    id: 'wlasnosci-liczb',
    label: 'Własności liczb',
    icon: 'Box',
    lessons: RECAP_WLASNOSCI.map((r) => r.lesson),
  },
  {
    id: 'strategie',
    label: 'Strategie rozwiązywania',
    icon: 'Puzzle',
    lessons: RECAP_STRATEGIE.map((r) => r.lesson),
  },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PodsumowanieLiczbyNaturalneLesson({
  lesson,
  mathModule,
  nextLesson,
  nextModule,
}: LessonProps) {
  return (
    <LessonShell
      lesson={lesson}
      mathModule={mathModule}
      steps={STEPS}
      nextLesson={nextLesson}
      nextModule={nextModule}
    >
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

type Scores = Partial<Record<string, { score: number; total: number }>>;

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const liczby = useStepDone('liczby');
  const dzialania = useStepDone('dzialania-podstawowe');
  const mnozenie = useStepDone('mnozenie-dzielenie');
  const wlasnosci = useStepDone('wlasnosci-liczb');
  const strategie = useStepDone('strategie');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Trzynaście lekcji za Tobą. Zanim ruszysz do kolejnego modułu, przejdź przez{' '}
          <strong>pięć bloków tematycznych</strong> — w każdym krótka powtórka, a potem kilka pytań
          sprawdzających, co zostało. Pod każdym pytaniem zobaczysz, z której lekcji ono pochodzi —
          jeśli coś nie wyjdzie, będziesz wiedzieć, gdzie wrócić.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          To nie klasówka — nikt nie stawia tu ocen. Na końcu zobaczysz swój wynik z każdego bloku i
          podpowiedź, co warto powtórzyć przed startem modułu 2.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: Hash, text: 'Liczby i ich zapis' },
            { icon: PenLine, text: 'Dodawanie, odejmowanie, własności działań' },
            { icon: Grid3x3, text: 'Mnożenie i dzielenie' },
            { icon: Box, text: 'Własności liczb: potęgi i podzielność' },
            { icon: Puzzle, text: 'Strategie rozwiązywania' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Liczby i ich zapis */}
      <LessonSection id="liczby">
        <ClusterRecap items={RECAP_LICZBY} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_LICZBY}
          color={color}
          onFinish={(score, total) => {
            recordScore('liczby')(score, total);
            liczby.markStepDone();
          }}
        />
      </LessonSection>

      {/* 2. Dodawanie, odejmowanie i własności działań */}
      <LessonSection id="dzialania-podstawowe">
        <ClusterRecap items={RECAP_DZIALANIA} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_DZIALANIA}
          color={color}
          onFinish={(score, total) => {
            recordScore('dzialania-podstawowe')(score, total);
            dzialania.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Mnożenie i dzielenie */}
      <LessonSection id="mnozenie-dzielenie">
        <ClusterRecap items={RECAP_MNOZENIE} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_MNOZENIE}
          color={color}
          onFinish={(score, total) => {
            recordScore('mnozenie-dzielenie')(score, total);
            mnozenie.markStepDone();
          }}
        />
      </LessonSection>

      {/* 4. Własności liczb */}
      <LessonSection id="wlasnosci-liczb">
        <ClusterRecap items={RECAP_WLASNOSCI} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_WLASNOSCI}
          color={color}
          onFinish={(score, total) => {
            recordScore('wlasnosci-liczb')(score, total);
            wlasnosci.markStepDone();
          }}
        />
      </LessonSection>

      {/* 5. Strategie rozwiązywania */}
      <LessonSection id="strategie">
        <ClusterRecap items={RECAP_STRATEGIE} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_STRATEGIE}
          color={color}
          onFinish={(score, total) => {
            recordScore('strategie')(score, total);
            strategie.markStepDone();
          }}
        />
      </LessonSection>

      {/* 6. Wynik */}
      <LessonSection id="wynik">
        <ModuleResultSummary
          clusters={CLUSTERS}
          scores={scores}
          color={color}
          onComplete={wynik.markStepDone}
        />
      </LessonSection>
    </>
  );
}
