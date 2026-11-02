'use client';

import { useState } from 'react';
import { Box, Compass, Hash, PenLine, PieChart } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { DomainSorter, type SorterDomain } from './domain-sorter';
import { toRoman } from '../../../lib/roman';
import { convertMass } from '../../../lib/mass';
import { formatWithClassSpaces } from '../../../lib/place-value';
import { toImproper } from '../../../lib/mixed-number';
import { decimalToFraction } from '../../../lib/decimal-fraction';
import { boxVolume, formatNumber, toLitres } from '../../../lib/box-volume';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Lekcja spina lekcje z ośmiu różnych modułów — helper bierze slug modułu jawnie. */
const L = (moduleSlug: string, slug: string): MathLesson => {
  const lesson = getLesson(moduleSlug, slug);
  if (!lesson) throw new Error(`Brak lekcji ${moduleSlug}/${slug}`);
  return lesson;
};

/** Źródło pytania = z którego działu roku pochodzi (odpowiednik `difficulty` w podsumowaniu modułu). */
const FROM = (code: string, name: string) => ({ code, name });

const STEPS: LessonStepMeta[] = [
  { id: 'rozpoznaj', kind: 'Rozgrzewka', title: 'Który to dział?', time: '4 min', icon: 'Puzzle' },
  { id: 'liczby', kind: 'Powtórka 1', title: 'Liczby i działania w pamięci', time: '6 min', icon: 'Hash' },
  { id: 'rachunki', kind: 'Powtórka 2', title: 'Rachunki pisemne i praktyczne', time: '6 min', icon: 'PenLine' },
  { id: 'ulamki', kind: 'Powtórka 3', title: 'Ułamki zwykłe i dziesiętne', time: '7 min', icon: 'PieChart' },
  { id: 'geometria', kind: 'Powtórka 4', title: 'Geometria', time: '6 min', icon: 'Compass' },
  { id: 'miara', kind: 'Powtórka 5', title: 'Pola i bryły', time: '6 min', icon: 'Box' },
  { id: 'wynik', kind: 'Wynik', title: 'Twój wynik i przepustka do klasy 5', time: '3 min', icon: 'Trophy' },
];

const SORTER_DOMAINS: SorterDomain[] = [
  { id: 'liczby', label: 'Liczby i działania w pamięci', icon: 'Hash' },
  { id: 'rachunki', label: 'Rachunki pisemne i praktyczne', icon: 'PenLine' },
  { id: 'ulamki', label: 'Ułamki zwykłe i dziesiętne', icon: 'PieChart' },
  { id: 'geometria', label: 'Geometria', icon: 'Compass' },
  { id: 'miara', label: 'Pola i bryły', icon: 'Box' },
];

/* ───────────────────── 1. Liczby i działania w pamięci ───────────────────── */

const RECAP_LICZBY: RecapItem[] = [
  {
    lesson: L('liczby-naturalne', 'kolejnosc-dzialan'),
    reminder:
      'Najpierw nawiasy, potem potęgi (kwadraty i sześciany), potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie. Przy równych działaniach — od lewej.',
  },
  {
    lesson: L('liczby-naturalne', 'cechy-podzielnosci'),
    reminder:
      'Przez 2 dzieli się liczba parzysta, przez 5 — zakończona 0 lub 5, przez 10 — zakończona 0. Przez 3 i przez 9 — gdy suma cyfr dzieli się przez 3 (przez 9).',
  },
  {
    lesson: L('liczby-naturalne', 'szacowanie-wynikow'),
    reminder:
      'Szacując, zaokrąglasz liczby (np. do setek) i liczysz na okrągłych — wynik jest przybliżony, ale od razu widać, czy dokładny rachunek ma sens.',
  },
];

const BIG_NUMBER = 48_250;

const QUIZ_LICZBY: DiagnosticTask[] = [
  {
    id: 'rzad-tysiecy',
    prompt: `Jaka cyfra stoi w rzędzie tysięcy w liczbie ${formatWithClassSpaces(BIG_NUMBER)}?`,
    type: 'input',
    answer: '8',
    explanation:
      'Cyfry liczymy od prawej: jedności 0, dziesiątki 5, setki 2, tysiące 8, dziesiątki tysięcy 4. W rzędzie tysięcy jest 8.',
    difficulty: FROM('M1', 'Liczby naturalne'),
  },
  {
    id: 'kolejnosc',
    prompt: 'Ile wynosi 2 + 3 · 4²?',
    type: 'choice',
    options: [
      { id: 'a', text: '80' },
      { id: 'b', text: '26' },
      { id: 'c', text: '50' },
      { id: 'd', text: '44' },
    ],
    correctId: 'c',
    explanation:
      'Najpierw potęga: 4² = 16. Potem mnożenie: 3 · 16 = 48. Na końcu dodawanie: 2 + 48 = 50.',
    difficulty: FROM('M1', 'Liczby naturalne'),
  },
  {
    id: 'szescian',
    prompt: 'Ile wynosi 4³ (cztery do sześcianu)?',
    type: 'input',
    answer: '64',
    explanation: '4³ to 4 · 4 · 4. Najpierw 4 · 4 = 16, potem 16 · 4 = 64.',
    difficulty: FROM('M1', 'Liczby naturalne'),
  },
  {
    id: 'podzielnosc-9',
    prompt: 'Czy liczba 4 725 dzieli się przez 9? Wpisz „tak" albo „nie".',
    type: 'input',
    answer: 'tak',
    explanation:
      'Suma cyfr: 4 + 7 + 2 + 5 = 18, a 18 dzieli się przez 9, więc cała liczba 4 725 też się dzieli.',
    difficulty: FROM('M1', 'Liczby naturalne'),
  },
];

/* ─────────────────── 2. Rachunki pisemne i praktyczne ─────────────────── */

const RECAP_RACHUNKI: RecapItem[] = [
  {
    lesson: L('obliczenia-praktyczne', 'system-rzymski'),
    reminder:
      'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Mniejszy znak przed większym oznacza odejmowanie: IV = 4, IX = 9, XL = 40, CM = 900.',
  },
  {
    lesson: L('dzialania-pisemne', 'dzielenie-pisemne'),
    reminder:
      'W dzieleniu pisemnym bierzesz kolejne cyfry dzielnej od lewej. Gdy fragment jest za mały, do ilorazu wpisujesz 0 i dobierasz następną cyfrę.',
  },
  {
    lesson: L('obliczenia-praktyczne', 'jednostki-masy'),
    reminder:
      '1 kg = 100 dag = 1000 g, 1 t = 1000 kg. Zamieniając na mniejszą jednostkę — mnożysz, na większą — dzielisz.',
  },
];

const QUIZ_RACHUNKI: DiagnosticTask[] = [
  {
    id: 'rzymskie-1949',
    prompt: 'Zapisz rok 1949 cyframi rzymskimi.',
    type: 'input',
    answer: toRoman(1949),
    explanation: `1949 = 1000 + 900 + 40 + 9 = M + CM + XL + IX, czyli ${toRoman(1949)}.`,
    difficulty: FROM('M2', 'Obliczenia praktyczne'),
  },
  {
    id: 'dzielenie-pisemne',
    prompt: 'Oblicz sposobem pisemnym: 4 928 : 7.',
    type: 'input',
    answer: '704',
    explanation:
      '49 : 7 = 7, zostaje 0. Cyfra 2 jest mniejsza od 7 — do ilorazu wpisujemy 0. Potem 28 : 7 = 4. Wynik: 704.',
    difficulty: FROM('M3', 'Działania pisemne'),
  },
  {
    id: 'masa',
    prompt: 'Ile dekagramów (dag) waży 2,5 kg?',
    type: 'input',
    unit: 'dag',
    answer: String(convertMass(2.5, 'kg', 'dag')),
    explanation: `1 kg = 100 dag, więc 2,5 kg = 2,5 · 100 = ${convertMass(2.5, 'kg', 'dag')} dag.`,
    difficulty: FROM('M2', 'Obliczenia praktyczne'),
  },
  {
    id: 'zegar',
    prompt: 'Film zaczął się o 18:40 i trwał 95 minut. O której godzinie się skończył? Wpisz w formacie 20:15.',
    type: 'input',
    answer: '20:15',
    explanation:
      '95 minut to 1 godzina i 35 minut. 18:40 + 1 godzina = 19:40, a 19:40 + 35 minut = 20:15.',
    difficulty: FROM('M2', 'Obliczenia praktyczne'),
  },
];

/* ────────────────────── 3. Ułamki zwykłe i dziesiętne ────────────────────── */

const RECAP_ULAMKI: RecapItem[] = [
  {
    lesson: L('ulamki-zwykle', 'liczby-mieszane'),
    reminder:
      'Liczba mieszana to całość i ułamek razem. Na ułamek niewłaściwy: całość · mianownik + licznik, mianownik bez zmian.',
  },
  {
    lesson: L('ulamki-zwykle', 'porownywanie-ulamkow'),
    reminder:
      'Ułamki o tym samym mianowniku: większy licznik = większy ułamek. O różnych mianownikach — najpierw sprowadź do wspólnego mianownika.',
  },
  {
    lesson: L('ulamki-dziesietne', 'ulamek-zwykly-a-dziesietny'),
    reminder:
      '0,1 = 1/10, 0,01 = 1/100. Aby zamienić ułamek dziesiętny na zwykły, bierzesz cyfry po przecinku nad 10, 100… i skracasz.',
  },
];

const MIXED = { whole: 2, licznik: 3, mianownik: 4 };
const DEC_FRACTION = decimalToFraction('0,6');

const QUIZ_ULAMKI: DiagnosticTask[] = [
  {
    id: 'mieszana-na-niewlasciwy',
    prompt: 'Zamień liczbę mieszaną 2 i 3/4 na ułamek niewłaściwy. Wpisz w formacie licznik/mianownik.',
    type: 'input',
    answer: `${toImproper(MIXED)}/${MIXED.mianownik}`,
    explanation: `2 · 4 + 3 = ${toImproper(MIXED)}, mianownik zostaje 4. Czyli 2 i 3/4 = ${toImproper(MIXED)}/4.`,
    difficulty: FROM('M5', 'Ułamki zwykłe'),
  },
  {
    id: 'porownaj-ulamki',
    prompt: 'Wstaw znak między 3/8 a 1/2.',
    type: 'choice',
    options: [
      { id: 'a', text: '3/8 < 1/2' },
      { id: 'b', text: '3/8 > 1/2' },
      { id: 'c', text: '3/8 = 1/2' },
    ],
    correctId: 'a',
    explanation: '1/2 to 4/8. Porównujemy 3/8 i 4/8 — 3 < 4, więc 3/8 < 1/2.',
    difficulty: FROM('M5', 'Ułamki zwykłe'),
  },
  {
    id: 'dodawanie-dziesietnych',
    prompt: 'Oblicz 3,7 + 0,45. Wpisz wynik z przecinkiem.',
    type: 'input',
    answer: '4,15',
    explanation:
      'Wyrównujemy przecinki: 3,70 + 0,45. 70 setnych + 45 setnych = 115 setnych = 1 całość i 15 setnych. Wynik: 4,15.',
    difficulty: FROM('M6', 'Ułamki dziesiętne'),
  },
  {
    id: 'dziesietny-na-zwykly',
    prompt: 'Zapisz 0,6 jako ułamek zwykły w postaci nieskracalnej. Wpisz w formacie licznik/mianownik.',
    type: 'input',
    answer: `${DEC_FRACTION.num}/${DEC_FRACTION.den}`,
    explanation: `0,6 to 6/10. Licznik i mianownik dzielimy przez 2: 6/10 = ${DEC_FRACTION.num}/${DEC_FRACTION.den}.`,
    difficulty: FROM('M6', 'Ułamki dziesiętne'),
  },
];

/* ─────────────────────────────── 4. Geometria ─────────────────────────────── */

const RECAP_GEOMETRIA: RecapItem[] = [
  {
    lesson: L('geometria', 'rodzaje-katow'),
    reminder:
      'Kąt ostry jest mniejszy od 90°, prosty ma dokładnie 90°, rozwarty jest między 90° a 180°, a półpełny ma 180°.',
  },
  {
    lesson: L('geometria', 'obwody-wielokatow'),
    reminder:
      'Obwód to suma długości wszystkich boków. Prostokąt: 2 · (a + b). Kwadrat: 4 · a.',
  },
  {
    lesson: L('geometria', 'skala'),
    reminder:
      'Skala 1 : 100 znaczy, że 1 cm na rysunku to 100 cm w rzeczywistości. Z rysunku na rzeczywistość — mnożysz, w drugą stronę — dzielisz.',
  },
];

const QUIZ_GEOMETRIA: DiagnosticTask[] = [
  {
    id: 'rodzaj-kata',
    prompt: 'Jakim kątem jest kąt o mierze 145°?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Ostrym' },
      { id: 'b', text: 'Rozwartym' },
      { id: 'c', text: 'Prostym' },
      { id: 'd', text: 'Półpełnym' },
    ],
    correctId: 'b',
    explanation: '145° jest większe od 90° i mniejsze od 180°, więc to kąt rozwarty.',
    difficulty: FROM('M4', 'Geometria'),
  },
  {
    id: 'obwod-prostokata',
    prompt: 'Ile wynosi obwód prostokąta o bokach 8 cm i 5 cm?',
    type: 'input',
    unit: 'cm',
    answer: '26',
    explanation: 'Obwód = 2 · (8 + 5) = 2 · 13 = 26 cm.',
    difficulty: FROM('M4', 'Geometria'),
  },
  {
    id: 'skala',
    prompt: 'Na planie w skali 1 : 100 pokój ma 4 cm długości. Ile metrów ma naprawdę?',
    type: 'input',
    unit: 'm',
    answer: '4',
    explanation: '4 cm · 100 = 400 cm w rzeczywistości, a 400 cm to 4 m.',
    difficulty: FROM('M4', 'Geometria'),
  },
  {
    id: 'osie-symetrii',
    prompt: 'Ile osi symetrii ma prostokąt, który nie jest kwadratem?',
    type: 'input',
    answer: '2',
    explanation:
      'Prostokąt ma 2 osie symetrii — obie przechodzą przez środki przeciwległych boków. Przekątne osiami symetrii nie są. (Kwadrat ma ich 4.)',
    difficulty: FROM('M4', 'Geometria'),
  },
];

/* ────────────────────────────── 5. Pola i bryły ────────────────────────────── */

const RECAP_MIARA: RecapItem[] = [
  {
    lesson: L('pola-figur', 'pole-prostokata-i-kwadratu'),
    reminder:
      'Pole prostokąta = a · b, pole kwadratu = a · a. Wynik jest w jednostkach kwadratowych (cm², m²…).',
  },
  {
    lesson: L('pola-figur', 'jednostki-pola'),
    reminder:
      'Sąsiednie jednostki pola dzieli 100, nie 10: 1 dm² = 100 cm², 1 m² = 100 dm².',
  },
  {
    lesson: L('bryly', 'objetosc-prostopadloscianu'),
    reminder:
      'Objętość prostopadłościanu = a · b · c. 1 dm³ = 1 litr = 1000 cm³.',
  },
];

const AQUARIUM = { width: 20, depth: 20, height: 25 };
const CUBE_EDGE = 4;

const QUIZ_MIARA: DiagnosticTask[] = [
  {
    id: 'pole-prostokata',
    prompt: 'Ile wynosi pole prostokąta o bokach 6 cm i 9 cm?',
    type: 'input',
    unit: 'cm²',
    answer: '54',
    explanation: 'Pole = 6 · 9 = 54 cm².',
    difficulty: FROM('M7', 'Pola figur'),
  },
  {
    id: 'jednostki-pola',
    prompt: 'Ile centymetrów kwadratowych (cm²) to 3 dm²?',
    type: 'input',
    unit: 'cm²',
    answer: '300',
    explanation: '1 dm² = 100 cm², więc 3 dm² = 3 · 100 = 300 cm².',
    difficulty: FROM('M7', 'Pola figur'),
  },
  {
    id: 'objetosc',
    prompt: 'Ile wynosi objętość prostopadłościanu o wymiarach 2 cm × 3 cm × 5 cm?',
    type: 'input',
    unit: 'cm³',
    answer: String(boxVolume({ width: 2, depth: 3, height: 5 })),
    explanation: `Objętość = 2 · 3 · 5 = ${boxVolume({ width: 2, depth: 3, height: 5 })} cm³.`,
    difficulty: FROM('M8', 'Bryły'),
  },
  {
    id: 'litry',
    prompt: `Ile litrów wody mieści akwarium o wymiarach ${AQUARIUM.width} cm × ${AQUARIUM.depth} cm × ${AQUARIUM.height} cm?`,
    type: 'input',
    unit: 'l',
    answer: String(toLitres(boxVolume(AQUARIUM))),
    explanation: `Objętość = ${AQUARIUM.width} · ${AQUARIUM.depth} · ${AQUARIUM.height} = ${formatNumber(
      boxVolume(AQUARIUM)
    )} cm³. A 1000 cm³ to 1 litr, więc mieści ${toLitres(boxVolume(AQUARIUM))} l.`,
    difficulty: FROM('M8', 'Bryły'),
  },
  {
    id: 'pole-powierzchni',
    prompt: `Ile wynosi pole powierzchni sześcianu o krawędzi ${CUBE_EDGE} cm?`,
    type: 'input',
    unit: 'cm²',
    answer: String(6 * CUBE_EDGE * CUBE_EDGE),
    explanation: `Sześcian ma 6 jednakowych ścian. Jedna ściana to ${CUBE_EDGE} · ${CUBE_EDGE} = ${
      CUBE_EDGE * CUBE_EDGE
    } cm², więc razem 6 · ${CUBE_EDGE * CUBE_EDGE} = ${6 * CUBE_EDGE * CUBE_EDGE} cm².`,
    difficulty: FROM('M8', 'Bryły'),
  },
];

/* ─────────────────────────────────── Wynik ─────────────────────────────────── */

const CLUSTERS: ResultCluster[] = [
  { id: 'liczby', label: 'Liczby i działania w pamięci', icon: 'Hash', lessons: RECAP_LICZBY.map((r) => r.lesson) },
  { id: 'rachunki', label: 'Rachunki pisemne i praktyczne', icon: 'PenLine', lessons: RECAP_RACHUNKI.map((r) => r.lesson) },
  { id: 'ulamki', label: 'Ułamki zwykłe i dziesiętne', icon: 'PieChart', lessons: RECAP_ULAMKI.map((r) => r.lesson) },
  { id: 'geometria', label: 'Geometria', icon: 'Compass', lessons: RECAP_GEOMETRIA.map((r) => r.lesson) },
  { id: 'miara', label: 'Pola i bryły', icon: 'Box', lessons: RECAP_MIARA.map((r) => r.lesson) },
];

const RESULT_COPY = {
  headline: {
    strong: 'Cały rok masz w małym palcu!',
    mid: 'Solidne zamknięcie roku!',
    weak: 'Dobrze, że to sprawdziliśmy',
  },
  summary: {
    strong:
      'Wszystkie pięć działów opanowane. Do klasy 5 wchodzisz z mocnym fundamentem — gratulacje!',
    mid: 'Większość materiału z całego roku masz opanowaną. Kilka rzeczy warto sobie przypomnieć — patrz niżej.',
    weak: 'Kilka działów wypadło słabiej — dokładnie po to jest ta powtórka. Wróć do wskazanych lekcji spokojnie, wakacje poczekają.',
  },
  allGood: 'Żaden dział nie wypadł słabo — cały rok matematyki masz solidnie opanowany.',
};

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PowtorzeniePrzekrojoweLesson({
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

/** Treść wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozpoznaj = useStepDone('rozpoznaj');
  const liczby = useStepDone('liczby');
  const rachunki = useStepDone('rachunki');
  const ulamki = useStepDone('ulamki');
  const geometria = useStepDone('geometria');
  const miara = useStepDone('miara');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          To ostatni przystanek klasy 4 — <strong>jedna wielka powtórka całego roku</strong>. Nie
          uczymy tu niczego nowego: przechodzimy przez <strong>pięć działów</strong>, w każdym
          krótkie przypomnienie i zestaw pytań z różnych lekcji. Pod każdym pytaniem zobaczysz, z
          którego modułu pochodzi.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          To nie klasówka — nikt tu nie stawia ocen. Na końcu zobaczysz swój wynik z każdego działu
          i „przepustkę do klasy 5” z podpowiedzią, co warto jeszcze powtórzyć.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: Hash, text: 'Liczby i działania w pamięci' },
            { icon: PenLine, text: 'Rachunki pisemne i praktyczne' },
            { icon: PieChart, text: 'Ułamki zwykłe i dziesiętne' },
            { icon: Compass, text: 'Geometria' },
            { icon: Box, text: 'Pola i bryły' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rozgrzewka: który to dział? */}
      <LessonSection id="rozpoznaj">
        <DomainSorter
          domains={SORTER_DOMAINS}
          color={color}
          onComplete={rozpoznaj.markStepDone}
        />
      </LessonSection>

      {/* 1. Liczby i działania w pamięci */}
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

      {/* 2. Rachunki pisemne i praktyczne */}
      <LessonSection id="rachunki">
        <ClusterRecap items={RECAP_RACHUNKI} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_RACHUNKI}
          color={color}
          onFinish={(score, total) => {
            recordScore('rachunki')(score, total);
            rachunki.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Ułamki zwykłe i dziesiętne */}
      <LessonSection id="ulamki">
        <ClusterRecap items={RECAP_ULAMKI} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_ULAMKI}
          color={color}
          onFinish={(score, total) => {
            recordScore('ulamki')(score, total);
            ulamki.markStepDone();
          }}
        />
      </LessonSection>

      {/* 4. Geometria */}
      <LessonSection id="geometria">
        <ClusterRecap items={RECAP_GEOMETRIA} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_GEOMETRIA}
          color={color}
          onFinish={(score, total) => {
            recordScore('geometria')(score, total);
            geometria.markStepDone();
          }}
        />
      </LessonSection>

      {/* 5. Pola i bryły */}
      <LessonSection id="miara">
        <ClusterRecap items={RECAP_MIARA} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_MIARA}
          color={color}
          onFinish={(score, total) => {
            recordScore('miara')(score, total);
            miara.markStepDone();
          }}
        />
      </LessonSection>

      {/* Wynik */}
      <LessonSection id="wynik">
        <ModuleResultSummary
          clusters={CLUSTERS}
          scores={scores}
          color={color}
          copy={RESULT_COPY}
          onComplete={wynik.markStepDone}
        />
      </LessonSection>
    </>
  );
}
