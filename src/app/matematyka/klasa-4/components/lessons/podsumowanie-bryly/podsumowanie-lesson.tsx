'use client';

import { useState } from 'react';
import { Box, Scissors, Shapes, Square } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { SolidSketch } from '../../solid-sketch';
import {
  BOX_PARTS,
  boxSkeletonLength,
  countPolyhedron,
  prismPolyhedron,
  pyramidPolyhedron,
  solidName,
  type BoxSpec,
} from '../../../lib/solids';
import { netFaceGroups, netTotalArea, surfaceWithout } from '../../../lib/box-net';
import {
  baseArea,
  boxVolume,
  formatNumber,
  missingDimension,
  toLitres,
  waterVolume,
} from '../../../lib/box-volume';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Skrót — wszystkie lekcje tego podsumowania są zawsze z tego samego modułu. */
const L = (slug: string): MathLesson => {
  const lesson = getLesson('bryly', slug);
  if (!lesson) throw new Error(`Brak lekcji bryly/${slug}`);
  return lesson;
};

const UNIT = 'cm';

const sketch = (spec: BoxSpec, color: string, unit: string, alt: string) => (
  <div className="mx-auto max-w-[200px]">
    <SolidSketch
      spec={spec}
      color={color}
      labels={[`${spec.width} ${unit}`, `${spec.depth} ${unit}`, `${spec.height} ${unit}`]}
      ariaLabel={alt}
    />
  </div>
);

const STEPS: LessonStepMeta[] = [
  { id: 'bryly', kind: 'Powtórka 1', title: 'Opis i rozpoznawanie brył', time: '6 min', icon: 'Shapes' },
  { id: 'siatki', kind: 'Powtórka 2', title: 'Siatki prostopadłościanów', time: '5 min', icon: 'Scissors' },
  { id: 'objetosc', kind: 'Powtórka 3', title: 'Objętość i jej jednostki', time: '6 min', icon: 'Box' },
  { id: 'powierzchnia', kind: 'Powtórka 4', title: 'Pole powierzchni', time: '6 min', icon: 'Square' },
  { id: 'wynik', kind: 'Wynik', title: 'Twój wynik i co warto powtórzyć', time: '3 min', icon: 'Trophy' },
];

/* ────────────────────── 1. Opis i rozpoznawanie brył ────────────────────── */

const RECAP_BRYLY: RecapItem[] = [
  {
    lesson: L('opis-prostopadloscianu'),
    reminder: `Prostopadłościan ma ${BOX_PARTS.sciany} ściany, ${BOX_PARTS.krawedzie} krawędzi i ${BOX_PARTS.wierzcholki} wierzchołków. Ściany chodzą parami, krawędzie czwórkami, a te czwórki to trzy wymiary bryły.`,
  },
  {
    lesson: L('rozpoznawanie-bryl'),
    reminder:
      'Graniastosłup ma dwie identyczne podstawy, ostrosłup jedną i wierzchołek na górze. Bryła bierze nazwę od podstawy, a toczą się tylko te z powierzchnią zaokrągloną.',
  },
];

const SZKIELET: BoxSpec = { width: 5, depth: 3, height: 2 };
const PRYZMA = prismPolyhedron(6, 1, 2);
const PRYZMA_COUNTS = countPolyhedron(PRYZMA);
const OSTROSLUP_COUNTS = countPolyhedron(pyramidPolyhedron(5, 1, 2));

function buildQuizBryly(color: string): DiagnosticTask[] {
  return [
    {
      id: 'ile-czego',
      prompt: 'Ile ścian, krawędzi i wierzchołków ma prostopadłościan?',
      type: 'choice',
      options: [
        { id: 'a', text: '8 ścian, 12 krawędzi, 6 wierzchołków' },
        { id: 'b', text: '6 ścian, 8 krawędzi, 12 wierzchołków' },
        {
          id: 'c',
          text: `${BOX_PARTS.sciany} ściany, ${BOX_PARTS.krawedzie} krawędzi, ${BOX_PARTS.wierzcholki} wierzchołków`,
        },
        { id: 'd', text: '6 ścian, 12 krawędzi, 12 wierzchołków' },
      ],
      correctId: 'c',
      explanation:
        'Sześć ścian w trzech parach, dwanaście krawędzi w trzech czwórkach i osiem wierzchołków — po jednym w każdym rogu.',
      difficulty: { code: '01', name: 'Opis prostopadłościanu' },
    },
    {
      id: 'krawedz-zaslonieta',
      prompt: 'Na rysunku bryły część kresek jest przerywana. Co one oznaczają?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Krawędzie, których stąd nie widać — są po drugiej stronie bryły' },
        { id: 'b', text: 'Krawędzie krótsze od pozostałych' },
        { id: 'c', text: 'Miejsca, w których bryłę trzeba rozciąć' },
        { id: 'd', text: 'Krawędzie, które nie należą do bryły' },
      ],
      correctId: 'a',
      explanation:
        'To umowa rysunku technicznego: kreska ciągła to krawędź widoczna, przerywana — zasłonięta przez bryłę. Bryła nie jest przezroczysta, ale rysunek pokazuje też jej tył.',
      difficulty: { code: '01', name: 'Opis prostopadłościanu' },
    },
    {
      id: 'szkielet',
      prompt: `Ile drutu trzeba na szkielet pudełka ${SZKIELET.width} ${UNIT} × ${SZKIELET.depth} ${UNIT} × ${SZKIELET.height} ${UNIT}?`,
      type: 'input',
      unit: UNIT,
      answer: String(boxSkeletonLength(SZKIELET)),
      visual: sketch(
        SZKIELET,
        color,
        UNIT,
        `Prostopadłościan ${SZKIELET.width} na ${SZKIELET.depth} na ${SZKIELET.height} centymetrów`,
      ),
      explanation: `Krawędzie chodzą czwórkami: cztery po ${SZKIELET.width}, cztery po ${SZKIELET.depth} i cztery po ${SZKIELET.height}. Razem 4 · (${SZKIELET.width} + ${SZKIELET.depth} + ${SZKIELET.height}) = ${boxSkeletonLength(SZKIELET)} ${UNIT}.`,
      difficulty: { code: '01', name: 'Opis prostopadłościanu' },
    },
    {
      id: 'graniastoslup',
      prompt: `Ile ścian ma ${solidName('graniastoslup', 6)}?`,
      type: 'input',
      unit: 'ścian',
      answer: String(PRYZMA_COUNTS.sciany),
      explanation: `Dwie podstawy i po jednej ścianie bocznej na każdy bok podstawy: 6 + 2 = ${PRYZMA_COUNTS.sciany}. Krawędzi ma ${PRYZMA_COUNTS.krawedzie}, a wierzchołków ${PRYZMA_COUNTS.wierzcholki}.`,
      difficulty: { code: '02', name: 'Rozpoznawanie brył' },
    },
    {
      id: 'co-sie-toczy',
      prompt: 'Która z tych brył NIE potoczy się po pochyłej desce?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Kula' },
        { id: 'b', text: 'Walec położony na boku' },
        { id: 'c', text: 'Ostrosłup' },
        { id: 'd', text: 'Stożek położony na boku' },
      ],
      correctId: 'c',
      explanation:
        'Toczą się tylko bryły z powierzchnią zaokrągloną: kula, walec i stożek. Ostrosłup ma same płaskie ściany, więc się przewróci, ale nie potoczy.',
      difficulty: { code: '02', name: 'Rozpoznawanie brył' },
    },
    {
      id: 'ostroslup-pieciokatny',
      prompt: `Ile wierzchołków ma ${solidName('ostroslup', 5)}?`,
      type: 'input',
      unit: 'wierzchołków',
      answer: String(OSTROSLUP_COUNTS.wierzcholki),
      explanation: `Pięć wierzchołków podstawy plus jeden na górze, w którym schodzą się wszystkie ściany boczne: 5 + 1 = ${OSTROSLUP_COUNTS.wierzcholki}.`,
      difficulty: { code: '02', name: 'Rozpoznawanie brył' },
    },
  ];
}

/* ─────────────────────────── 2. Siatki ─────────────────────────── */

const RECAP_SIATKI: RecapItem[] = [
  {
    lesson: L('siatki-prostopadloscianow'),
    reminder:
      'Siatka to powierzchnia bryły rozcięta wzdłuż krawędzi i rozłożona na płasko: sześć prostokątów w trzech parach identycznych. Jedno pudełko ma wiele siatek, ale nie każdy układ sześciu kwadratów się zamyka.',
  },
];

const SIATKA_BOX: BoxSpec = { width: 7, depth: 4, height: 3 };
const [SIATKA_DNO, SIATKA_PRZOD, SIATKA_BOK] = netFaceGroups(SIATKA_BOX);

const QUIZ_SIATKI: DiagnosticTask[] = [
  {
    id: 'ile-prostokatow',
    prompt: 'Z ilu prostokątów składa się siatka prostopadłościanu i jak się one grupują?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Z sześciu, wszystkie różne' },
      { id: 'b', text: 'Z sześciu, w trzech parach identycznych' },
      { id: 'c', text: 'Z ośmiu, w czterech parach' },
      { id: 'd', text: 'Z czterech — dno i wieko się nie liczą' },
    ],
    correctId: 'b',
    explanation:
      'Bryła ma sześć ścian, a ściany przeciwległe są identyczne: dno z wiekiem, przód z tyłem, lewa z prawą.',
    difficulty: { code: '03', name: 'Siatki prostopadłościanów' },
  },
  {
    id: 'prostokat-3-2',
    prompt: 'Czy sześć kwadratów ułożonych w prostokąt 3 na 2 złoży się w sześcian?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Tak — sześć kwadratów to sześć ścian, więc musi się złożyć' },
      { id: 'b', text: 'Tak, ale trzeba zacząć zaginać od środka' },
      { id: 'c', text: 'Nie — dwa kwadraty trafiają na tę samą ścianę, a inna zostaje odkryta' },
      { id: 'd', text: 'Nie, bo prostokąt 3 na 2 ma tylko pięć kwadratów' },
    ],
    correctId: 'c',
    explanation:
      'Sama liczba kwadratów nie wystarczy — rozstrzyga dopiero próba złożenia. Przy prostokącie 3 na 2 dwie ścianki nachodzą na siebie.',
    difficulty: { code: '03', name: 'Siatki prostopadłościanów' },
  },
  {
    id: 'ile-siatek',
    prompt: 'Ile różnych siatek ma sześcian?',
    type: 'choice',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '8' },
      { id: 'c', text: 'Nieskończenie wiele' },
      { id: 'd', text: '11' },
    ],
    correctId: 'd',
    explanation:
      'Sześć kwadratów da się ułożyć na 35 sposobów, ale tylko 11 z tych układów zamyka się w sześcian.',
    difficulty: { code: '03', name: 'Siatki prostopadłościanów' },
  },
  {
    id: 'wymiary-prostokatow',
    prompt: `Pudełko ma ${SIATKA_BOX.width} ${UNIT} długości, ${SIATKA_BOX.depth} ${UNIT} szerokości i ${SIATKA_BOX.height} ${UNIT} wysokości. Jakie wymiary mają w jego siatce prostokąty ścian bocznych (lewa i prawa)?`,
    type: 'choice',
    options: [
      { id: 'a', text: `${SIATKA_DNO.sides[0]} × ${SIATKA_DNO.sides[1]} ${UNIT}` },
      { id: 'b', text: `${SIATKA_BOK.sides[0]} × ${SIATKA_BOK.sides[1]} ${UNIT}` },
      { id: 'c', text: `${SIATKA_PRZOD.sides[0]} × ${SIATKA_PRZOD.sides[1]} ${UNIT}` },
      { id: 'd', text: `${SIATKA_BOX.width} × ${SIATKA_BOX.depth} × ${SIATKA_BOX.height} ${UNIT}` },
    ],
    correctId: 'b',
    explanation: `Ściany boczne stoją wzdłuż szerokości i sięgają na wysokość, więc mają ${SIATKA_BOK.sides[0]} × ${SIATKA_BOK.sides[1]} ${UNIT}. Dno i wieko to ${SIATKA_DNO.sides[0]} × ${SIATKA_DNO.sides[1]}, a przód i tył ${SIATKA_PRZOD.sides[0]} × ${SIATKA_PRZOD.sides[1]}.`,
    difficulty: { code: '03', name: 'Siatki prostopadłościanów' },
  },
];

/* ─────────────────────────── 3. Objętość ─────────────────────────── */

const RECAP_OBJETOSC: RecapItem[] = [
  {
    lesson: L('objetosc-prostopadloscianu'),
    reminder:
      'Objętość mówi, ile się w bryle mieści. Warstwa to pole podstawy, a warstw jest tyle, co wysokości — stąd V = a · b · c. 1000 cm³ to 1 litr, czyli 1 dm³.',
  },
];

const OBJ_BOX: BoxSpec = { width: 6, depth: 4, height: 5 };
const OBJ_SZUFLADA: BoxSpec = { width: 5, depth: 4, height: 6 };
const OBJ_TANK: BoxSpec = { width: 40, depth: 25, height: 30 };
const OBJ_LEVEL = 20;

function buildQuizObjetosc(color: string): DiagnosticTask[] {
  return [
    {
      id: 'objetosc-pudelka',
      prompt: 'Ile wynosi objętość tego pudełka?',
      type: 'input',
      unit: `${UNIT}³`,
      answer: String(boxVolume(OBJ_BOX)),
      visual: sketch(
        OBJ_BOX,
        color,
        UNIT,
        `Prostopadłościan ${OBJ_BOX.width} na ${OBJ_BOX.depth} na ${OBJ_BOX.height} centymetrów`,
      ),
      explanation: `Dno mieści ${OBJ_BOX.width} · ${OBJ_BOX.depth} = ${baseArea(OBJ_BOX)} kostek, warstw jest ${OBJ_BOX.height}: ${baseArea(OBJ_BOX)} · ${OBJ_BOX.height} = ${boxVolume(OBJ_BOX)} ${UNIT}³.`,
      difficulty: { code: '04', name: 'Objętość prostopadłościanu' },
    },
    {
      id: 'litr-a-dm3',
      prompt: 'Ile decymetrów sześciennych ma jeden litr?',
      type: 'choice',
      options: [
        { id: 'a', text: '1000 dm³' },
        { id: 'b', text: '10 dm³' },
        { id: 'c', text: '1 dm³' },
        { id: 'd', text: '0,1 dm³' },
      ],
      correctId: 'c',
      explanation:
        'Litr to drugie imię decymetra sześciennego: 1 l = 1 dm³ = 1000 cm³. Dlatego karton mleka jest mniej więcej sześcianem o krawędzi 10 cm.',
      difficulty: { code: '04', name: 'Objętość prostopadłościanu' },
    },
    {
      id: 'brakujaca-wysokosc',
      prompt: `Szuflada ma objętość ${boxVolume(OBJ_SZUFLADA)} ${UNIT}³, a jej dno to ${OBJ_SZUFLADA.width} ${UNIT} na ${OBJ_SZUFLADA.depth} ${UNIT}. Ile ma wysokości?`,
      type: 'input',
      unit: UNIT,
      answer: String(
        missingDimension(boxVolume(OBJ_SZUFLADA), OBJ_SZUFLADA.width, OBJ_SZUFLADA.depth),
      ),
      explanation: `Jedna warstwa to ${baseArea(OBJ_SZUFLADA)} ${UNIT}³. ${boxVolume(OBJ_SZUFLADA)} : ${baseArea(OBJ_SZUFLADA)} = ${missingDimension(boxVolume(OBJ_SZUFLADA), OBJ_SZUFLADA.width, OBJ_SZUFLADA.depth)}. Gdy szukany jest wymiar, mnożenie zamienia się w dzielenie.`,
      difficulty: { code: '04', name: 'Objętość prostopadłościanu' },
    },
    {
      id: 'woda-w-akwarium',
      prompt: `Akwarium ma dno ${OBJ_TANK.width} ${UNIT} na ${OBJ_TANK.depth} ${UNIT} i ${OBJ_TANK.height} ${UNIT} wysokości. Woda sięga ${OBJ_LEVEL} ${UNIT}. Ile jest w nim litrów wody?`,
      type: 'input',
      unit: 'l',
      answer: String(toLitres(waterVolume(OBJ_TANK, OBJ_LEVEL))),
      explanation: `Woda ma dno akwarium i wysokość ${OBJ_LEVEL} ${UNIT}: ${baseArea(OBJ_TANK)} · ${OBJ_LEVEL} = ${formatNumber(waterVolume(OBJ_TANK, OBJ_LEVEL))} ${UNIT}³, czyli ${formatNumber(toLitres(waterVolume(OBJ_TANK, OBJ_LEVEL)))} l. Wysokość ścianek (${OBJ_TANK.height} ${UNIT}) mówi tylko, ile zmieściłoby się po brzegi.`,
      difficulty: { code: '04', name: 'Objętość prostopadłościanu' },
    },
  ];
}

/* ────────────────────────── 4. Pole powierzchni ────────────────────────── */

const RECAP_POWIERZCHNIA: RecapItem[] = [
  {
    lesson: L('pole-powierzchni-prostopadloscianu'),
    reminder:
      'Pole powierzchni to pole siatki: trzy różne prostokąty, każdy wzięty dwa razy, czyli P = 2 · (a · b + a · c + b · c). Podaje się je w cm², a gdy jakiejś ściany nie pokrywasz — odejmujesz jej pole.',
  },
];

const POW_BOX: BoxSpec = { width: 5, depth: 4, height: 3 };
const POW_CRATE: BoxSpec = { width: 8, depth: 5, height: 4 };
const POW_CUBE: BoxSpec = { width: 4, depth: 4, height: 4 };
const POW_FLAT: BoxSpec = { width: 8, depth: 4, height: 2 };

function buildQuizPowierzchnia(color: string): DiagnosticTask[] {
  return [
    {
      id: 'objetosc-czy-powierzchnia',
      prompt: 'Chcesz wiedzieć, ile farby kupić na pomalowanie skrzyni z zewnątrz. Co musisz policzyć?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Objętość skrzyni' },
        { id: 'b', text: 'Długość wszystkich jej krawędzi' },
        { id: 'c', text: 'Pole powierzchni skrzyni' },
        { id: 'd', text: 'Pole jej największej ściany' },
      ],
      correctId: 'c',
      explanation:
        'Farba kładzie się na ścianach, więc liczy się pole powierzchni. Objętość odpowiedziałaby na pytanie, ile do skrzyni wejdzie.',
      difficulty: { code: '05', name: 'Pole powierzchni' },
    },
    {
      id: 'pole-pudelka',
      prompt: 'Ile wynosi pole powierzchni tego pudełka?',
      type: 'input',
      unit: `${UNIT}²`,
      answer: String(netTotalArea(POW_BOX)),
      visual: sketch(
        POW_BOX,
        color,
        UNIT,
        `Prostopadłościan ${POW_BOX.width} na ${POW_BOX.depth} na ${POW_BOX.height} centymetrów`,
      ),
      explanation: `Trzy pary: ${netFaceGroups(POW_BOX)
        .map((g) => `${g.sides[0]} · ${g.sides[1]} = ${g.area}`)
        .join(', ')}. Razem 2 · (${netFaceGroups(POW_BOX)
        .map((g) => g.area)
        .join(' + ')}) = ${netTotalArea(POW_BOX)} ${UNIT}².`,
      difficulty: { code: '05', name: 'Pole powierzchni' },
    },
    {
      id: 'skrzynia-bez-wieka',
      prompt: `Skrzynia ${POW_CRATE.width} ${UNIT} × ${POW_CRATE.depth} ${UNIT} × ${POW_CRATE.height} ${UNIT} nie ma wieka. Ile kartonu poszło na jej dno i ścianki?`,
      type: 'input',
      unit: `${UNIT}²`,
      answer: String(surfaceWithout(POW_CRATE, ['gora'])),
      explanation: `Pełne pole powierzchni to ${netTotalArea(POW_CRATE)} ${UNIT}². Wieko ma ${POW_CRATE.width} · ${POW_CRATE.depth} = ${POW_CRATE.width * POW_CRATE.depth} ${UNIT}², więc zostaje ${netTotalArea(POW_CRATE)} − ${POW_CRATE.width * POW_CRATE.depth} = ${surfaceWithout(POW_CRATE, ['gora'])} ${UNIT}².`,
      difficulty: { code: '05', name: 'Pole powierzchni' },
    },
    {
      id: 'objetosc-a-pole',
      prompt: `Sześcian ${POW_CUBE.width} × ${POW_CUBE.depth} × ${POW_CUBE.height} ${UNIT} i pudełko ${POW_FLAT.width} × ${POW_FLAT.depth} × ${POW_FLAT.height} ${UNIT} mieszczą dokładnie tyle samo. Co z ich polami powierzchni?`,
      type: 'choice',
      options: [
        { id: 'a', text: 'Też są równe — objętość wyznacza pole powierzchni' },
        {
          id: 'b',
          text: `Różnią się: sześcian ${netTotalArea(POW_CUBE)} ${UNIT}², płaskie pudełko ${netTotalArea(POW_FLAT)} ${UNIT}²`,
        },
        { id: 'c', text: 'Pole powierzchni jest zawsze większe od objętości' },
        { id: 'd', text: 'Nie da się ich porównać bez rysunku' },
      ],
      correctId: 'b',
      explanation: `Obie bryły mieszczą po ${boxVolume(POW_CUBE)} ${UNIT}³, ale na obłożenie płaskiego pudełka trzeba więcej materiału. Objętość i pole powierzchni to niezależne wielkości.`,
      difficulty: { code: '05', name: 'Pole powierzchni' },
    },
  ];
}

/* ─────────────────────────────── Wynik ─────────────────────────────── */

const CLUSTERS: ResultCluster[] = [
  { id: 'bryly', label: 'Opis i rozpoznawanie brył', icon: 'Shapes', lessons: RECAP_BRYLY.map((r) => r.lesson) },
  { id: 'siatki', label: 'Siatki prostopadłościanów', icon: 'Scissors', lessons: RECAP_SIATKI.map((r) => r.lesson) },
  { id: 'objetosc', label: 'Objętość i jej jednostki', icon: 'Box', lessons: RECAP_OBJETOSC.map((r) => r.lesson) },
  { id: 'powierzchnia', label: 'Pole powierzchni', icon: 'Square', lessons: RECAP_POWIERZCHNIA.map((r) => r.lesson) },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PodsumowanieBrylLesson({ lesson, mathModule, nextLesson, nextModule }: LessonProps) {
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
  const bryly = useStepDone('bryly');
  const siatki = useStepDone('siatki');
  const objetosc = useStepDone('objetosc');
  const powierzchnia = useStepDone('powierzchnia');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Cały moduł o bryłach za Tobą — od policzenia ścian, krawędzi i wierzchołków na obracanym
          pudełku, przez siatki, które trzeba było złożyć, żeby sprawdzić, czy się zamykają, aż po
          dwa pytania, które łatwo pomylić: <strong>ile się mieści w środku</strong> i{' '}
          <strong>ile trzeba na obłożenie z zewnątrz</strong>. Przejdź przez{' '}
          <strong>cztery bloki tematyczne</strong>: w każdym krótka powtórka, a potem pytania
          sprawdzające, co zostało. Pod każdym pytaniem zobaczysz, z której lekcji pochodzi.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          To nie klasówka — nikt nie stawia tu ocen. Na końcu zobaczysz swój wynik z każdego bloku i
          podpowiedź, co warto powtórzyć.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: Shapes, text: 'Opis i rozpoznawanie brył' },
            { icon: Scissors, text: 'Siatki prostopadłościanów' },
            { icon: Box, text: 'Objętość i jej jednostki' },
            { icon: Square, text: 'Pole powierzchni' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Opis i rozpoznawanie brył */}
      <LessonSection id="bryly">
        <ClusterRecap items={RECAP_BRYLY} color={color} />
        <DiagnosticQuiz
          tasks={buildQuizBryly(color)}
          color={color}
          onFinish={(score, total) => {
            recordScore('bryly')(score, total);
            bryly.markStepDone();
          }}
        />
      </LessonSection>

      {/* 2. Siatki */}
      <LessonSection id="siatki">
        <ClusterRecap items={RECAP_SIATKI} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_SIATKI}
          color={color}
          onFinish={(score, total) => {
            recordScore('siatki')(score, total);
            siatki.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Objętość */}
      <LessonSection id="objetosc">
        <ClusterRecap items={RECAP_OBJETOSC} color={color} />
        <DiagnosticQuiz
          tasks={buildQuizObjetosc(color)}
          color={color}
          onFinish={(score, total) => {
            recordScore('objetosc')(score, total);
            objetosc.markStepDone();
          }}
        />
      </LessonSection>

      {/* 4. Pole powierzchni */}
      <LessonSection id="powierzchnia">
        <ClusterRecap items={RECAP_POWIERZCHNIA} color={color} />
        <DiagnosticQuiz
          tasks={buildQuizPowierzchnia(color)}
          color={color}
          onFinish={(score, total) => {
            recordScore('powierzchnia')(score, total);
            powierzchnia.markStepDone();
          }}
        />
      </LessonSection>

      {/* 5. Wynik */}
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
