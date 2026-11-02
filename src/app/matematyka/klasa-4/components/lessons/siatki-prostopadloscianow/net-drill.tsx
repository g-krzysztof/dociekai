'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { SolidSketch } from '../../solid-sketch';
import { NetView } from './net-view';
import {
  buildBoxNet,
  cellKey,
  foldCubeNet,
  netFaceGroups,
  netTotalArea,
  FACE_LABEL,
  FACE_PAIR,
  type NetCell,
} from '../../../lib/box-net';
import type { BoxSpec } from '../../../lib/solids';

const shape = (cells: [number, number][]): NetCell[] =>
  cells.map(([col, row]) => ({ col, row }));

const PROSTOKAT = shape([
  [0, 0],
  [1, 0],
  [2, 0],
  [0, 1],
  [1, 1],
  [2, 1],
]);

const WIATRAK = shape([
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [0, 2],
  [2, 2],
]);

const SCHODY = shape([
  [0, 0],
  [1, 0],
  [1, 1],
  [2, 1],
  [2, 2],
  [3, 2],
]);

/** Krzyż z zaznaczonymi dwoma kwadratami — klucz do zadania o ścianach przeciwległych. */
const KRZYZ = shape([
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [1, 2],
  [1, 3],
]);

const KRZYZ_RESULT = foldCubeNet(KRZYZ);
const faceAt = (col: number, row: number) =>
  KRZYZ_RESULT.cells.find((cell) => cell.key === cellKey({ col, row }))?.face ?? null;

const FACE_A = faceAt(1, 0);
const FACE_B = faceAt(1, 3);
/** Czy zaznaczone kwadraty trafiają na ściany przeciwległe — liczone z modelu, nie wpisane ręcznie. */
const A_NAPRZECIW_B =
  FACE_A !== null && FACE_B !== null && FACE_A !== FACE_B && FACE_PAIR[FACE_A] === FACE_PAIR[FACE_B];

const CHOICES = [
  { id: 'a', cells: PROSTOKAT },
  { id: 'b', cells: WIATRAK },
  { id: 'c', cells: SCHODY },
];
const NET_CHOICE_ID = (CHOICES.find((choice) => foldCubeNet(choice.cells).ok) ?? CHOICES[2]).id;

const KARTON: BoxSpec = { width: 5, depth: 4, height: 2 };
const PUDELKO: BoxSpec = { width: 7, depth: 4, height: 3 };
const [, , BOK] = netFaceGroups(PUDELKO);

/** Mały rysunek układu kwadratów — do opcji A/B/C i do zaznaczania pojedynczych ścian. */
function MiniNet({
  cells,
  color,
  letter,
  marks,
}: {
  cells: NetCell[];
  color: string;
  letter?: string;
  marks?: Record<string, string>;
}) {
  const cols = Math.max(...cells.map((cell) => cell.col)) + 1;
  const rows = Math.max(...cells.map((cell) => cell.row)) + 1;
  const size = 26;

  return (
    <figure className="flex flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${cols * size + 4} ${rows * size + 4}`}
        className="h-auto w-full max-w-[130px]"
        aria-hidden
      >
        {cells.map((cell) => {
          const key = cellKey(cell);
          const mark = marks?.[key];
          return (
            <g key={key}>
              <rect
                x={cell.col * size + 2}
                y={cell.row * size + 2}
                width={size}
                height={size}
                fill={mark ? `${color}66` : `${color}26`}
                stroke={color}
                strokeWidth={1.4}
              />
              {mark && (
                <text
                  x={cell.col * size + 2 + size / 2}
                  y={cell.row * size + 2 + size / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[13px] font-bold"
                  fill={`color-mix(in oklch, ${color} 88%, black)`}
                >
                  {mark}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {letter && (
        <figcaption className="font-mono text-sm font-bold" style={{ color }}>
          {letter}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Ćwiczenia lekcji o siatkach — siedem zadań K/P/R/D. Odpowiedzi na pytania
 * „który układ jest siatką" i „czy te ściany są naprzeciw siebie" liczy
 * `foldCubeNet` z tych samych układów, które widać na rysunku, a pola i wymiary
 * — `netFaceGroups`/`netTotalArea`. Żadna liczba nie jest wpisana dwa razy.
 */
export function buildNetDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'ile-prostokatow',
      prompt: 'Z ilu prostokątów składa się siatka prostopadłościanu? Wpisz samą liczbę.',
      type: 'input',
      answer: '6',
      explanation: 'Tyle, ile bryła ma ścian — a prostopadłościan ma ich 6.',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'czym-jest-siatka',
      prompt: 'Czym jest siatka bryły?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Rysunkiem bryły widzianej z góry' },
        { id: 'b', text: 'Powierzchnią bryły rozciętą wzdłuż krawędzi i rozłożoną na płasko' },
        { id: 'c', text: 'Kratownicą, na której rysuje się bryłę' },
        { id: 'd', text: 'Szkieletem bryły zbudowanym z samych krawędzi' },
      ],
      correctId: 'b',
      explanation:
        'Siatka to cała powierzchnia bryły przeniesiona na płasko — nic nie ubywa i nic nie dochodzi. Szkielet z samych krawędzi to co innego: tam nie ma ścian.',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'ile-par',
      prompt: 'Ile par identycznych prostokątów jest w siatce prostopadłościanu? Wpisz liczbę.',
      type: 'input',
      answer: '3',
      explanation:
        'Ściany przeciwległe są identyczne, a par ścian przeciwległych jest trzy: dno z wiekiem, przód z tyłem i lewa z prawą.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'ktory-uklad',
      prompt: 'Który układ sześciu kwadratów złoży się w sześcian?',
      type: 'choice',
      visual: (
        <div className="flex flex-wrap items-end justify-center gap-6">
          {CHOICES.map((choice) => (
            <MiniNet key={choice.id} cells={choice.cells} color={color} letter={choice.id.toUpperCase()} />
          ))}
        </div>
      ),
      options: [
        { id: 'a', text: 'Układ A' },
        { id: 'b', text: 'Układ B' },
        { id: 'c', text: 'Układ C' },
      ],
      correctId: NET_CHOICE_ID,
      explanation:
        'Tylko schodkowy układ C zakrywa sześć różnych ścian. W prostokącie 3 × 2 i w wiatraczku dwa kwadraty trafiają na to samo miejsce, a inna ściana zostaje odkryta.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'wymiar-boku',
      prompt: `Pudełko ma ${PUDELKO.width} cm długości, ${PUDELKO.depth} cm szerokości i ${PUDELKO.height} cm wysokości. Jakie wymiary ma prostokąt jego lewej ściany?`,
      type: 'choice',
      visual: (
        <SolidSketch
          spec={PUDELKO}
          color={color}
          labels={[`${PUDELKO.width} cm`, `${PUDELKO.depth} cm`, `${PUDELKO.height} cm`]}
          ariaLabel={`Prostopadłościan ${PUDELKO.width} na ${PUDELKO.depth} na ${PUDELKO.height} centymetrów`}
          className="mx-auto h-auto w-full max-w-[240px]"
        />
      ),
      options: [
        { id: 'a', text: `${BOK.sides[0]} cm × ${BOK.sides[1]} cm` },
        { id: 'b', text: `${PUDELKO.width} cm × ${PUDELKO.depth} cm` },
        { id: 'c', text: `${PUDELKO.width} cm × ${PUDELKO.height} cm` },
        { id: 'd', text: `${PUDELKO.depth} cm × ${PUDELKO.depth} cm` },
      ],
      correctId: 'a',
      explanation: `Lewa ściana stoi w poprzek pudełka i sięga na całą wysokość, więc jej boki to szerokość i wysokość: ${BOK.sides[0]} cm × ${BOK.sides[1]} cm. Wymiary ${PUDELKO.width} cm × ${PUDELKO.depth} cm ma dno, a ${PUDELKO.width} cm × ${PUDELKO.height} cm — ściana przednia.`,
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'stykajace-krawedzie',
      prompt:
        'Dwa prostokąty siatki stykają się na rysunku wspólną krawędzią. Co musi być prawdą, żeby po złożeniu pasowały do siebie?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Muszą mieć takie samo pole' },
        { id: 'b', text: 'Muszą być identyczne' },
        { id: 'c', text: 'Jeden musi być kwadratem' },
        { id: 'd', text: 'Ich wspólne krawędzie muszą mieć tę samą długość' },
      ],
      correctId: 'd',
      explanation:
        'Zaginamy wzdłuż wspólnej krawędzi, więc obie ściany muszą mieć ją dokładnie tej samej długości. Same prostokąty mogą być zupełnie różne — dno pudełka i jego ścianka boczna zwykle są.',
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'ile-kartonu',
      prompt: `Ile centymetrów kwadratowych kartonu zajmuje siatka pudełka ${KARTON.width} cm × ${KARTON.depth} cm × ${KARTON.height} cm? Wpisz samą liczbę.`,
      type: 'input',
      unit: 'cm²',
      visual: (
        <figure className="mx-auto max-w-[420px]">
          <div className="border" style={{ borderColor: `${color}33` }}>
            <NetView
              pieces={buildBoxNet(KARTON, 'krzyz')}
              t={0}
              color={color}
              labels="wymiary"
              spec={KARTON}
              ariaLabel="Siatka pudełka z wpisanymi wymiarami prostokątów"
            />
          </div>
          <figcaption className="mt-1 text-center text-xs text-muted-foreground">
            wymiary w cm
          </figcaption>
        </figure>
      ),
      answer: String(netTotalArea(KARTON)),
      explanation: `Trzy pary prostokątów: ${netFaceGroups(KARTON)
        .map((group) => `2 · (${group.sides[0]} · ${group.sides[1]}) = ${2 * group.area}`)
        .join(', ')}. Razem ${netTotalArea(KARTON)} cm².`,
      difficulty: { code: 'D', name: 'Dopełniający' },
    },
    {
      id: 'sciany-naprzeciw',
      prompt:
        'Na tej siatce zaznaczono dwa kwadraty. Czy po złożeniu sześcianu będą one ścianami leżącymi naprzeciw siebie?',
      type: 'choice',
      visual: (
        <div className="flex justify-center">
          <MiniNet cells={KRZYZ} color={color} marks={{ '1:0': 'A', '1:3': 'B' }} />
        </div>
      ),
      options: [
        { id: 'a', text: 'Tak, będą naprzeciw siebie' },
        { id: 'b', text: 'Nie, będą się stykać krawędzią' },
      ],
      correctId: A_NAPRZECIW_B ? 'a' : 'b',
      explanation: `Po złożeniu A jest ${FACE_A ? FACE_LABEL[FACE_A].replace('ściana ', '') : '?'}, a B — ${
        FACE_B ? FACE_LABEL[FACE_B].replace('ściana ', '') : '?'
      }, więc te ściany się stykają. W prostym pasku kwadratów naprzeciw siebie trafiają te oddalone o dwa pola, a nie o trzy.`,
      difficulty: { code: 'D', name: 'Dopełniający' },
    },
  ];
}
