'use client';

import { useState } from 'react';
import { Compass, PieChart, Puzzle, Ruler, Shapes } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Skrót — wszystkie lekcje tego podsumowania są zawsze z tego samego modułu. */
const L = (slug: string): MathLesson => {
  const lesson = getLesson('geometria', slug);
  if (!lesson) throw new Error(`Brak lekcji geometria/${slug}`);
  return lesson;
};

const STEPS: LessonStepMeta[] = [
  { id: 'proste-odcinki', kind: 'Powtórka 1', title: 'Proste, odcinki i pomiar', time: '5 min', icon: 'Ruler' },
  { id: 'katy', kind: 'Powtórka 2', title: 'Kąty', time: '4 min', icon: 'Compass' },
  { id: 'wielokaty', kind: 'Powtórka 3', title: 'Wielokąty i ich obwody', time: '5 min', icon: 'Shapes' },
  { id: 'kola-symetria', kind: 'Powtórka 4', title: 'Koła i symetria', time: '5 min', icon: 'PieChart' },
  { id: 'skala-strategie', kind: 'Powtórka 5', title: 'Skala i strategie rozwiązywania', time: '5 min', icon: 'Puzzle' },
  { id: 'wynik', kind: 'Wynik', title: 'Twój wynik i co warto powtórzyć', time: '3 min', icon: 'Trophy' },
];

const RECAP_PROSTE: RecapItem[] = [
  {
    lesson: L('punkt-prosta-polprosta-odcinek'),
    reminder: 'Prosta biegnie w nieskończoność w obie strony, półprosta tylko w jedną, odcinek ma dwa końce.',
  },
  {
    lesson: L('proste-prostopadle-rownolegle'),
    reminder: 'Proste prostopadłe przecinają się pod kątem prostym; równoległe nigdy się nie przetną.',
  },
  {
    lesson: L('mierzenie-odcinkow'),
    reminder: 'Linijkę przykładasz zerem dokładnie do początku odcinka — mierzysz od zera, nie od krawędzi linijki.',
  },
];

const QUIZ_PROSTE: DiagnosticTask[] = [
  {
    id: 'proste-1',
    prompt: 'Ile końców ma odcinek?',
    type: 'input',
    answer: '2',
    explanation: 'Odcinek to fragment prostej ograniczony z obu stron — ma dokładnie dwa końce.',
    difficulty: { code: '01', name: 'Punkt, prosta, półprosta, odcinek' },
  },
  {
    id: 'proste-2',
    prompt: 'Które dwie proste na pewno się nie przetną, niezależnie jak daleko je przedłużysz?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Równoległe' },
      { id: 'b', text: 'Prostopadłe' },
      { id: 'c', text: 'Przecinające się pod kątem 45°' },
      { id: 'd', text: 'Dowolne dwie proste' },
    ],
    correctId: 'a',
    explanation: 'Z definicji proste równoległe nigdy się nie spotykają, bez względu na to, jak długo je przedłużysz.',
    difficulty: { code: '02', name: 'Proste prostopadłe i równoległe' },
  },
  {
    id: 'proste-3',
    prompt: 'Odcinek ma długość 47 mm. Ile to centymetrów?',
    type: 'input',
    answer: '4.7',
    unit: 'cm',
    explanation: '10 mm to 1 cm, więc 47 mm = 4,7 cm.',
    difficulty: { code: '03', name: 'Mierzenie odcinków' },
  },
  {
    id: 'proste-4',
    prompt: 'Mierzysz odcinek linijką. Od czego zaczynasz przykładać linijkę?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Od krawędzi linijki' },
      { id: 'b', text: 'Od zera' },
      { id: 'c', text: 'Od liczby 1' },
      { id: 'd', text: 'Od środka linijki' },
    ],
    correctId: 'b',
    explanation: 'Zero na podziałce musi trafić dokładnie w początek odcinka — inaczej pomiar będzie błędny.',
    difficulty: { code: '03', name: 'Mierzenie odcinków' },
  },
];

const RECAP_KATY: RecapItem[] = [
  {
    lesson: L('katy-i-katomierz'),
    reminder: 'Kątomierz ma dwie podziałki liczone w przeciwne strony — sprawdzaj, od której strony zaczyna się ramię podstawy.',
  },
  {
    lesson: L('rodzaje-katow'),
    reminder: 'Kąty wierzchołkowe (naprzeciwległe) są zawsze równe, a kąty przyległe sumują się do 180°.',
  },
];

const QUIZ_KATY: DiagnosticTask[] = [
  {
    id: 'katy-1',
    prompt: 'Kąt prosty ma dokładnie ile stopni?',
    type: 'input',
    answer: '90',
    explanation: 'Kąt prosty to zawsze dokładnie 90°.',
    difficulty: { code: '04', name: 'Kąty i kątomierz' },
  },
  {
    id: 'katy-2',
    prompt: 'Kąt ma 130°. Jaki to rodzaj kąta?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Ostry' },
      { id: 'b', text: 'Prosty' },
      { id: 'c', text: 'Rozwarty' },
      { id: 'd', text: 'Pełny' },
    ],
    correctId: 'c',
    explanation: 'Kąt większy niż 90° i mniejszy niż 180° to kąt rozwarty.',
    difficulty: { code: '05', name: 'Rodzaje kątów' },
  },
  {
    id: 'katy-3',
    prompt: 'Dwa kąty przyległe leżą na prostej. Jeden z nich ma 65°. Ile ma drugi?',
    type: 'input',
    answer: '115',
    explanation: 'Kąty przyległe sumują się do 180°: 180 − 65 = 115.',
    difficulty: { code: '05', name: 'Rodzaje kątów' },
  },
  {
    id: 'katy-4',
    prompt: 'Dwie proste przecinają się. Jeden z czterech powstałych kątów ma 40°. Ile ma kąt naprzeciwległy (wierzchołkowy) do niego?',
    type: 'choice',
    options: [
      { id: 'a', text: '140°' },
      { id: 'b', text: '90°' },
      { id: 'c', text: '50°' },
      { id: 'd', text: '40°' },
    ],
    correctId: 'd',
    explanation: 'Kąty wierzchołkowe są zawsze równe — skoro jeden ma 40°, ten naprzeciwległy też ma 40°.',
    difficulty: { code: '05', name: 'Rodzaje kątów' },
  },
];

const RECAP_WIELOKATY: RecapItem[] = [
  {
    lesson: L('wielokaty'),
    reminder: 'Wielokąt to zamknięta figura o prostych bokach — nazwa zależy od ich liczby: trójkąt, czworokąt, pięciokąt...',
  },
  {
    lesson: L('prostokaty-i-kwadraty'),
    reminder: 'Prostokąt ma cztery kąty proste i równe boki naprzeciwległe; kwadrat to szczególny prostokąt z czterema równymi bokami.',
  },
  {
    lesson: L('obwody-wielokatow'),
    reminder: 'Obwód to suma długości wszystkich boków — w prostokącie krócej: 2 × (a + b), w kwadracie: 4 × bok.',
  },
];

const QUIZ_WIELOKATY: DiagnosticTask[] = [
  {
    id: 'wielokaty-1',
    prompt: 'Figura ma 5 boków i jest zamknięta. Jak się nazywa?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Pięciokąt' },
      { id: 'b', text: 'Czworokąt' },
      { id: 'c', text: 'Sześciokąt' },
      { id: 'd', text: 'Trójkąt' },
    ],
    correctId: 'a',
    explanation: 'Nazwa wielokąta pochodzi od liczby boków — pięć boków to pięciokąt.',
    difficulty: { code: '06', name: 'Wielokąty' },
  },
  {
    id: 'wielokaty-2',
    prompt: 'Prostokąt ma boki 9 cm i 4 cm. Jaki jest jego obwód?',
    type: 'input',
    answer: '26',
    unit: 'cm',
    explanation: '2 × (9 + 4) = 2 × 13 = 26 cm.',
    difficulty: { code: '08', name: 'Obwody wielokątów' },
  },
  {
    id: 'wielokaty-3',
    prompt: 'Kwadrat ma bok 7 cm. Jaki jest jego obwód?',
    type: 'input',
    answer: '28',
    unit: 'cm',
    explanation: '4 × 7 = 28 cm.',
    difficulty: { code: '08', name: 'Obwody wielokątów' },
  },
  {
    id: 'wielokaty-4',
    prompt: 'Które zdanie o kwadracie jest FAŁSZYWE?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Ma cztery kąty proste' },
      { id: 'b', text: 'Ma tylko dwa boki równe' },
      { id: 'c', text: 'To szczególny rodzaj prostokąta' },
      { id: 'd', text: 'Wszystkie jego boki są równe' },
    ],
    correctId: 'b',
    explanation: 'W kwadracie równe są wszystkie CZTERY boki, nie tylko dwa — to zdanie jest fałszywe.',
    difficulty: { code: '07', name: 'Prostokąty i kwadraty' },
  },
];

const RECAP_KOLA: RecapItem[] = [
  {
    lesson: L('kola-i-okregi'),
    reminder: 'Średnica to zawsze 2 × promień — dwa promienie ułożone w linii prostej przez środek.',
  },
  {
    lesson: L('symetria-osiowa'),
    reminder: 'Oś symetrii dzieli figurę na dwie lustrzane połówki — punkt i jego odbicie leżą w tej samej odległości od osi.',
  },
];

const QUIZ_KOLA: DiagnosticTask[] = [
  {
    id: 'kola-1',
    prompt: 'Promień koła to 9 cm. Ile wynosi jego średnica?',
    type: 'input',
    answer: '18',
    unit: 'cm',
    explanation: '2 × 9 = 18 cm.',
    difficulty: { code: '09', name: 'Koła i okręgi' },
  },
  {
    id: 'kola-2',
    prompt: 'Czym różni się koło od okręgu?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Niczym, to dwie nazwy tej samej figury' },
      { id: 'b', text: 'Okrąg jest zawsze większy niż koło' },
      { id: 'c', text: 'Okrąg to sama linia, koło to cała powierzchnia razem z wnętrzem' },
      { id: 'd', text: 'Koło to sama linia, okrąg to cała powierzchnia' },
    ],
    correctId: 'c',
    explanation: 'Okrąg to tylko brzeg (krzywa), koło to okrąg razem z tym, co jest w środku.',
    difficulty: { code: '09', name: 'Koła i okręgi' },
  },
  {
    id: 'kola-3',
    prompt: 'Ile osi symetrii ma kwadrat?',
    type: 'choice',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '2' },
      { id: 'c', text: '0' },
      { id: 'd', text: '4' },
    ],
    correctId: 'd',
    explanation: 'Kwadrat ma 4 osie symetrii: poziomą, pionową i obie przekątne.',
    difficulty: { code: '10', name: 'Symetria osiowa' },
  },
  {
    id: 'kola-4',
    prompt: 'Punkt leży 6 cm od osi symetrii. W jakiej odległości od osi leży jego lustrzane odbicie?',
    type: 'choice',
    options: [
      { id: 'a', text: '6 cm po drugiej stronie osi' },
      { id: 'b', text: '12 cm po drugiej stronie osi' },
      { id: 'c', text: '3 cm po drugiej stronie osi' },
      { id: 'd', text: 'Dokładnie na osi' },
    ],
    correctId: 'a',
    explanation: 'Odbicie zawsze zachowuje tę samą odległość od osi — zmienia się tylko strona.',
    difficulty: { code: '10', name: 'Symetria osiowa' },
  },
];

const RECAP_SKALA: RecapItem[] = [
  {
    lesson: L('skala'),
    reminder: 'Z rysunku na rzeczywistość mnożysz przez drugą liczbę skali; z rzeczywistości na rysunek — dzielisz.',
  },
  {
    lesson: L('rysunek-pomocniczy'),
    reminder: 'Rysunek pomocniczy porządkuje dane i pytanie — model belkowy, oś liczbowa albo szkic, zależnie od zadania.',
  },
  {
    lesson: L('ukladanie-zadan'),
    reminder: 'Ten sam wynik można zbudować z wielu różnych par liczb — a zagadka czasem ma więcej niż jedną poprawną odpowiedź.',
  },
];

const QUIZ_SKALA: DiagnosticTask[] = [
  {
    id: 'skala-1',
    prompt: 'Skala planu to 1:100. Na planie pokój ma 5 cm długości. Jaka jest jego prawdziwa długość, w metrach?',
    type: 'input',
    answer: '5',
    unit: 'm',
    explanation: '5 cm × 100 = 500 cm = 5 m.',
    difficulty: { code: '11', name: 'Skala' },
  },
  {
    id: 'skala-2',
    prompt: "Zadanie: „W klasie jest 24 uczniów, 10 wyjechało na wycieczkę. Ilu zostało?” Który rysunek pomocniczy najlepiej pasuje?",
    type: 'choice',
    options: [
      { id: 'a', text: 'Oś liczbowa' },
      { id: 'b', text: 'Model belkowy (część-całość)' },
      { id: 'c', text: 'Rysunek prostokąta z podpisanymi bokami' },
      { id: 'd', text: 'Żaden z powyższych' },
    ],
    correctId: 'b',
    explanation: 'To klasyczna struktura część-całość (24 = 10 + reszta) — model belkowy pokazuje ją najlepiej.',
    difficulty: { code: '12', name: 'Rysunek pomocniczy' },
  },
  {
    id: 'skala-3',
    prompt: 'Chcesz ułożyć zadanie z wynikiem 24, używając mnożenia. Która para liczb NIE zadziała?',
    type: 'choice',
    options: [
      { id: 'a', text: '4 i 6' },
      { id: 'b', text: '3 i 8' },
      { id: 'c', text: '5 i 5' },
      { id: 'd', text: '2 i 12' },
    ],
    correctId: 'c',
    explanation: '5 × 5 = 25, nie 24. Pozostałe trzy pary rzeczywiście dają 24.',
    difficulty: { code: '13', name: 'Układanie zadań' },
  },
  {
    id: 'skala-4',
    prompt: 'Skala mapy to 1:1000. Prawdziwa odległość to 250 m. Ile centymetrów zajmie to na mapie?',
    type: 'input',
    answer: '25',
    unit: 'cm',
    explanation: '250 m to 25 000 cm. 25 000 : 1000 = 25 cm.',
    difficulty: { code: '11', name: 'Skala' },
  },
];

const CLUSTERS: ResultCluster[] = [
  { id: 'proste-odcinki', label: 'Proste, odcinki i pomiar', icon: 'Ruler', lessons: RECAP_PROSTE.map((r) => r.lesson) },
  { id: 'katy', label: 'Kąty', icon: 'Compass', lessons: RECAP_KATY.map((r) => r.lesson) },
  { id: 'wielokaty', label: 'Wielokąty i ich obwody', icon: 'Shapes', lessons: RECAP_WIELOKATY.map((r) => r.lesson) },
  { id: 'kola-symetria', label: 'Koła i symetria', icon: 'PieChart', lessons: RECAP_KOLA.map((r) => r.lesson) },
  { id: 'skala-strategie', label: 'Skala i strategie rozwiązywania', icon: 'Puzzle', lessons: RECAP_SKALA.map((r) => r.lesson) },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PodsumowanieGeometriaLesson({ lesson, mathModule, nextLesson, nextModule }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson} nextModule={nextModule}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

type Scores = Partial<Record<string, { score: number; total: number }>>;

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const proste = useStepDone('proste-odcinki');
  const katy = useStepDone('katy');
  const wielokaty = useStepDone('wielokaty');
  const kola = useStepDone('kola-symetria');
  const skala = useStepDone('skala-strategie');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Trzynaście lekcji geometrii za Tobą. Zanim ruszysz dalej, przejdź przez{' '}
          <strong>pięć bloków tematycznych</strong> — w każdym krótka powtórka, a potem kilka pytań
          sprawdzających, co zostało. Pod każdym pytaniem zobaczysz, z której lekcji ono pochodzi —
          jeśli coś nie wyjdzie, będziesz wiedzieć, gdzie wrócić.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          To nie klasówka — nikt nie stawia tu ocen. Na końcu zobaczysz swój wynik z każdego bloku i
          podpowiedź, co warto powtórzyć.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: Ruler, text: 'Proste, odcinki i pomiar' },
            { icon: Compass, text: 'Kąty' },
            { icon: Shapes, text: 'Wielokąty i ich obwody' },
            { icon: PieChart, text: 'Koła i symetria' },
            { icon: Puzzle, text: 'Skala i strategie rozwiązywania' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Proste, odcinki i pomiar */}
      <LessonSection id="proste-odcinki">
        <ClusterRecap items={RECAP_PROSTE} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_PROSTE}
          color={color}
          onFinish={(score, total) => {
            recordScore('proste-odcinki')(score, total);
            proste.markStepDone();
          }}
        />
      </LessonSection>

      {/* 2. Kąty */}
      <LessonSection id="katy">
        <ClusterRecap items={RECAP_KATY} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_KATY}
          color={color}
          onFinish={(score, total) => {
            recordScore('katy')(score, total);
            katy.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Wielokąty i ich obwody */}
      <LessonSection id="wielokaty">
        <ClusterRecap items={RECAP_WIELOKATY} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_WIELOKATY}
          color={color}
          onFinish={(score, total) => {
            recordScore('wielokaty')(score, total);
            wielokaty.markStepDone();
          }}
        />
      </LessonSection>

      {/* 4. Koła i symetria */}
      <LessonSection id="kola-symetria">
        <ClusterRecap items={RECAP_KOLA} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_KOLA}
          color={color}
          onFinish={(score, total) => {
            recordScore('kola-symetria')(score, total);
            kola.markStepDone();
          }}
        />
      </LessonSection>

      {/* 5. Skala i strategie rozwiązywania */}
      <LessonSection id="skala-strategie">
        <ClusterRecap items={RECAP_SKALA} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_SKALA}
          color={color}
          onFinish={(score, total) => {
            recordScore('skala-strategie')(score, total);
            skala.markStepDone();
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
