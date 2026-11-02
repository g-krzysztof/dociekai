'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { GridFigure } from './grid-figure';
import type { GridCell, HalfCell } from '../../../lib/area';

function rect(x: number, y: number, w: number, h: number): GridCell[] {
  const cells: GridCell[] = [];
  for (let dy = 0; dy < h; dy += 1) {
    for (let dx = 0; dx < w; dx += 1) cells.push({ x: x + dx, y: y + dy });
  }
  return cells;
}

interface FigureSpec {
  width: number;
  height: number;
  cells: GridCell[];
  halves?: HalfCell[];
}

const FIGURES = {
  prostokat: { width: 6, height: 4, cells: rect(1, 1, 4, 2) },
  litera_t: { width: 7, height: 5, cells: [...rect(1, 1, 5, 1), ...rect(3, 2, 1, 2)] },
  kwadrat: { width: 5, height: 5, cells: rect(1, 1, 3, 3) },
  hak: { width: 6, height: 5, cells: [...rect(1, 1, 2, 3), ...rect(3, 3, 2, 1)] },
  trapez: {
    width: 6,
    height: 4,
    cells: [...rect(1, 2, 3, 1), ...rect(2, 1, 1, 1)],
    halves: [
      { x: 1, y: 1, cut: 'br' },
      { x: 3, y: 1, cut: 'bl' },
    ],
  },
  schodki: {
    width: 6,
    height: 6,
    cells: [...rect(1, 1, 4, 1), ...rect(1, 2, 3, 1), ...rect(1, 3, 2, 1), ...rect(1, 4, 1, 1)],
  },
  pasek: { width: 6, height: 4, cells: rect(1, 1, 4, 2) },
} satisfies Record<string, FigureSpec>;

function Figure({ spec, color, label }: { spec: FigureSpec; color: string; label: string }) {
  return (
    <GridFigure
      width={spec.width}
      height={spec.height}
      cells={spec.cells}
      halves={spec.halves}
      color={color}
      unit={32}
      className="mx-auto h-auto w-full max-w-[300px]"
      title={label}
    />
  );
}

/** Dwie figury obok siebie — do zadań „która ma większe pole”. */
function FigurePair({
  color,
  left,
  right,
}: {
  color: string;
  left: { spec: FigureSpec; name: string };
  right: { spec: FigureSpec; name: string };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[left, right].map((item) => (
        <div key={item.name} className="border p-2">
          <p
            className="mb-1 text-center text-xs font-semibold uppercase tracking-wide"
            style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            {item.name}
          </p>
          <Figure spec={item.spec} color={color} label={`Figura ${item.name} na kratownicy`} />
        </div>
      ))}
    </div>
  );
}

/**
 * Ćwiczenia: siedem zadań o rosnącej trudności (K/P/R/D). Odpowiedzi liczą się
 * wprost z tych samych opisów figur, które renderują ilustracje — nigdzie nie
 * ma liczby wpisanej niezależnie od rysunku.
 */
export function buildAreaDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'prostokat-4x2',
      prompt: 'Ile kwadratów jednostkowych mieści ta figura?',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: <Figure spec={FIGURES.prostokat} color={color} label="Prostokąt na kratownicy" />,
      options: [
        { id: 'a', text: '6' },
        { id: 'b', text: '12' },
        { id: 'c', text: '8' },
        { id: 'd', text: '4' },
      ],
      correctId: 'c',
      explanation:
        'Dwa rzędy po 4 kratki: 4 + 4 = 8. Pole tej figury to 8 kwadratów jednostkowych.',
    },
    {
      id: 'litera-t',
      prompt: 'Ile kratek mieści ta figura? Wpisz liczbę.',
      type: 'input',
      answer: '7',
      unit: 'kratek',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: <Figure spec={FIGURES.litera_t} color={color} label="Figura w kształcie T" />,
      explanation:
        'Górna belka ma 5 kratek, nóżka pod nią 2. Razem 5 + 2 = 7 kratek.',
    },
    {
      id: 'porownanie',
      prompt: 'Która figura ma większe pole?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: (
        <FigurePair
          color={color}
          left={{ spec: FIGURES.kwadrat, name: 'Kwadrat' }}
          right={{ spec: FIGURES.hak, name: 'Hak' }}
        />
      ),
      options: [
        { id: 'a', text: 'Kwadrat' },
        { id: 'b', text: 'Hak' },
        { id: 'c', text: 'Mają równe pola' },
        { id: 'd', text: 'Nie da się porównać, bo mają różne kształty' },
      ],
      correctId: 'a',
      explanation:
        'Kwadrat ma 9 kratek, hak 8. Różne kształty da się porównać bez problemu — właśnie po to mierzy się je tą samą kratką.',
    },
    {
      id: 'trapez-polowki',
      prompt: 'Ile kratek mieści ta figura? Pamiętaj o połówkach.',
      type: 'input',
      answer: '5',
      unit: 'kratek',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: <Figure spec={FIGURES.trapez} color={color} label="Figura z dwiema połówkami kratek" />,
      explanation:
        'Całe kratki: 3 na dole i 1 wyżej, razem 4. Do tego dwie połówki, które dają 1 całą kratkę. 4 + 1 = 5.',
    },
    {
      id: 'rozmiar-kratki',
      prompt:
        'Kasia i Piotrek mierzyli pole tej samej podłogi. Kasi wyszły 24 kafelki, a Piotrkowi 6. Żadne z nich się nie pomyliło. Jak to możliwe?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: 'Piotrek liczył szybciej, więc pominął część podłogi' },
        { id: 'b', text: 'Pole podłogi zmieniło się między jednym a drugim pomiarem' },
        { id: 'c', text: 'Pole zależy od tego, kto je mierzy' },
        { id: 'd', text: 'Piotrek układał kafelki większe od kafelków Kasi' },
      ],
      correctId: 'd',
      explanation:
        'Podłoga jest jedna, ale miarki dwie. Kafelek Piotrka był 4 razy większy od kafelka Kasi, bo 24 : 6 = 4. Dlatego sama liczba nic nie znaczy, dopóki nie wiadomo, jaką kratką mierzono.',
    },
    {
      id: 'schodki',
      prompt: 'Ile kratek mieści ta figura? Wpisz liczbę.',
      type: 'input',
      answer: '10',
      unit: 'kratek',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      visual: <Figure spec={FIGURES.schodki} color={color} label="Figura schodkowa na kratownicy" />,
      explanation:
        'Licz rzędami od dołu: 1 + 2 + 3 + 4 = 10 kratek. Nierówne rzędy to nie problem — po prostu dodajesz je po kolei.',
    },
    {
      id: 'pole-vs-obwod',
      prompt:
        'Ola obeszła tę figurę dookoła po samym brzegu i naliczyła 12 odcinków długości jednej kratki. Ile wynosi POLE tej figury?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      visual: <Figure spec={FIGURES.pasek} color={color} label="Prostokąt 4 na 2 kratki" />,
      options: [
        { id: 'a', text: '12 kratek' },
        { id: 'b', text: '8 kratek' },
        { id: 'c', text: '6 kratek' },
        { id: 'd', text: '24 kratki' },
      ],
      correctId: 'b',
      explanation:
        'Ola policzyła obwód, czyli drogę dookoła brzegu — to 12 odcinków. Pole liczy się w środku: dwa rzędy po 4 kratki, czyli 8. To dwie różne rzeczy i prawie zawsze wychodzą z nich różne liczby.',
    },
  ];
}
