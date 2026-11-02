'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { GridFigure } from '../pole-figury/grid-figure';
import type { GridCell } from '../../../lib/area';
import { mergeCells, partCells } from '../../../lib/area-split';

const rect = (x: number, y: number, width: number, height: number): GridCell[] =>
  partCells({ x, y, width, height });

function Figure({
  board,
  cells,
  color,
}: {
  board: { width: number; height: number };
  cells: GridCell[];
  color: string;
}) {
  return (
    <GridFigure
      width={board.width}
      height={board.height}
      cells={cells}
      color={color}
      unit={30}
      className="mx-auto w-full max-w-[210px]"
      title="Figura na kratownicy"
    />
  );
}

/**
 * Ćwiczenia lekcji o podziale i uzupełnianiu — siedem zadań K/P/R/D. Pierwsze
 * cztery mają rysunek na kratownicy (wynik da się sprawdzić licząc kratki),
 * trzy ostatnie są już czysto liczbowe — bez kratek, z wymiarami w metrach,
 * bo tak wyglądają te zadania w zeszycie.
 */
export function buildDecompositionDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'dwa-prostokaty',
      prompt: 'Jakie pole ma ta figura?',
      type: 'choice',
      visual: (
        <Figure
          board={{ width: 6, height: 4 }}
          cells={mergeCells(rect(0, 0, 2, 3), rect(2, 1, 4, 2))}
          color={color}
        />
      ),
      options: [
        { id: 'a', text: '10 kratek' },
        { id: 'b', text: '12 kratek' },
        { id: 'c', text: '14 kratek' },
        { id: 'd', text: '24 kratki' },
      ],
      correctId: 'c',
      explanation:
        'Pionowe cięcie po linii x = 2 daje prostokąty 2 · 3 = 6 i 4 · 2 = 8. Razem 6 + 8 = 14 kratek.',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'litera-t',
      prompt: 'Ile kratek ma ta figura w kształcie litery T?',
      type: 'choice',
      visual: (
        <Figure
          board={{ width: 5, height: 4 }}
          cells={mergeCells(rect(0, 0, 5, 1), rect(2, 1, 1, 3))}
          color={color}
        />
      ),
      options: [
        { id: 'a', text: '8 kratek' },
        { id: 'b', text: '5 kratek' },
        { id: 'c', text: '9 kratek' },
        { id: 'd', text: '20 kratek' },
      ],
      correctId: 'a',
      explanation:
        'Poziome cięcie pod poprzeczką daje 5 · 1 = 5 oraz 1 · 3 = 3. Razem 5 + 3 = 8 kratek.',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'litera-l-input',
      prompt: 'Policz pole tej figury i wpisz liczbę kratek.',
      type: 'input',
      unit: 'kratek',
      answer: '14',
      visual: (
        <Figure
          board={{ width: 5, height: 4 }}
          cells={mergeCells(rect(0, 0, 2, 4), rect(2, 2, 3, 2))}
          color={color}
        />
      ),
      explanation:
        'Podziałem: 2 · 4 + 3 · 2 = 8 + 6 = 14. Uzupełnianiem: 5 · 4 − 3 · 2 = 20 − 6 = 14. Obie drogi dają to samo.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'z-dziura',
      prompt: 'Prostokąt z wyciętym kwadratem w środku. Ile kratek ma ta figura?',
      type: 'choice',
      visual: (
        <Figure
          board={{ width: 6, height: 4 }}
          cells={rect(0, 0, 6, 4).filter(
            (cell) => !(cell.x >= 2 && cell.x < 4 && cell.y >= 1 && cell.y < 3)
          )}
          color={color}
        />
      ),
      options: [
        { id: 'a', text: '24 kratki' },
        { id: 'b', text: '22 kratki' },
        { id: 'c', text: '18 kratek' },
        { id: 'd', text: '20 kratek' },
      ],
      correctId: 'd',
      explanation:
        'Tu podział byłby żmudny — łatwiej uzupełnić: cała ramka to 6 · 4 = 24, a dziura 2 · 2 = 4. Zostaje 24 − 4 = 20.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'trawnik-z-basenem',
      prompt:
        'Prostokątny trawnik ma wymiary 9 m na 5 m. W środku jest prostokątny basen 3 m na 2 m. Ile metrów kwadratowych zajmuje sama trawa? Wpisz samą liczbę.',
      type: 'input',
      unit: 'm²',
      answer: '39',
      explanation:
        'Cały trawnik: 9 · 5 = 45 m². Basen: 3 · 2 = 6 m². Trawa zostaje na 45 − 6 = 39 m².',
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'brakujacy-bok',
      prompt:
        'Figura w kształcie litery L: dolny bok ma 9 m, a górny, krótszy odcinek poziomy — 4 m. Ile metrów ma ten kawałek boku, którego nie podano?',
      type: 'choice',
      options: [
        { id: 'a', text: '13 m, bo boki się dodają' },
        { id: 'b', text: '5 m, bo to różnica 9 − 4' },
        { id: 'c', text: '4 m, bo przeciwległe boki są równe' },
        { id: 'd', text: 'Nie da się tego policzyć bez pola' },
      ],
      correctId: 'b',
      explanation:
        'Górne odcinki poziome razem mają tyle, co dolny bok. Skoro jeden ma 4 m, a razem 9 m, to drugi ma 9 − 4 = 5 m. Brakujący bok to prawie zawsze różnica dwóch podanych.',
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'sciezka-w-ogrodzie',
      prompt:
        'Prostokątny ogród 12 m na 8 m przecina prosta ścieżka o szerokości 1 m, biegnąca przez całą jego długość (12 m). Ile metrów kwadratowych zostaje na rośliny? Wpisz samą liczbę.',
      type: 'input',
      unit: 'm²',
      answer: '84',
      explanation:
        'Cały ogród: 12 · 8 = 96 m². Ścieżka: 12 · 1 = 12 m². Na rośliny zostaje 96 − 12 = 84 m². Ścieżka dzieli ogród na dwa kawałki, ale liczyć każdy osobno nie trzeba — wystarczy odjąć ją od całości.',
      difficulty: { code: 'D', name: 'Dopełniający' },
    },
  ];
}
