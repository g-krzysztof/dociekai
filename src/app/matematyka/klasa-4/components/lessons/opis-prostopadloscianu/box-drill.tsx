'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { SolidSketch } from '../../solid-sketch';
import { boxSkeletonLength } from '../../../lib/solids';

const SZKIELET = boxSkeletonLength({ width: 8, height: 3, depth: 5 });

/**
 * Ćwiczenia lekcji o opisie prostopadłościanu — siedem zadań K/P/R/D.
 * Ostatnie dwa wychodzą poza odczytanie liczb z rysunku: jedno liczy długość
 * całego szkieletu, drugie odwraca to działanie i jest mostem do zadania
 * problemowego. Klucz do zadania o szkielecie liczy `boxSkeletonLength`,
 * a nie ręcznie wpisana liczba.
 */
export function buildBoxDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'ile-scian',
      prompt: 'Ile ścian ma prostopadłościan?',
      type: 'choice',
      visual: (
        <SolidSketch
          spec={{ width: 4.6, height: 3, depth: 3.4 }}
          color={color}
          ariaLabel="Prostopadłościan bez podpisanych wymiarów"
        />
      ),
      options: [
        { id: 'a', text: '4' },
        { id: 'b', text: '8' },
        { id: 'c', text: '6' },
        { id: 'd', text: '12' },
      ],
      correctId: 'c',
      explanation:
        'Ścian jest 6 — trzy widać, trzy są z drugiej strony. Liczba 8 to wierzchołki, a 12 to krawędzie.',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'ile-wierzcholkow',
      prompt: 'Ile wierzchołków ma prostopadłościan? Wpisz samą liczbę.',
      type: 'input',
      answer: '8',
      explanation:
        'Wierzchołków jest 8 — po cztery na dolnej i cztery na górnej ścianie. Siedem widać naraz, ósmy siedzi dokładnie za bryłą.',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'ile-krawedzi-4cm',
      prompt:
        'Pudełko ma wymiary 7 cm × 4 cm × 2 cm. Ile jego krawędzi ma długość 4 cm? Wpisz samą liczbę.',
      type: 'input',
      answer: '4',
      explanation:
        'Krawędzie chodzą czwórkami: cztery po 7 cm, cztery po 4 cm i cztery po 2 cm. Każdy wymiar powtarza się dokładnie cztery razy.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'sciany-przeciwlegle',
      prompt: 'Co można powiedzieć o dwóch przeciwległych ścianach prostopadłościanu?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Są identycznymi prostokątami' },
        { id: 'b', text: 'Zawsze są kwadratami' },
        { id: 'c', text: 'Jedna jest zawsze większa od drugiej' },
        { id: 'd', text: 'Stykają się wzdłuż wspólnej krawędzi' },
      ],
      correctId: 'a',
      explanation:
        'Ściany przeciwległe są takie same — dlatego sześć ścian to tak naprawdę trzy pary. Kwadratami są tylko w sześcianie, a wspólną krawędź mają ściany sąsiednie, nie przeciwległe.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'gorna-sciana',
      prompt: 'Pudełko ma długość 6 cm, szerokość 5 cm i wysokość 3 cm. Jakie wymiary ma jego górna ściana?',
      type: 'choice',
      visual: (
        <SolidSketch
          spec={{ width: 5, height: 2.5, depth: 4.2 }}
          color={color}
          labels={['6 cm', '5 cm', '3 cm']}
          ariaLabel="Prostopadłościan o wymiarach 6 cm, 5 cm i 3 cm"
        />
      ),
      options: [
        { id: 'a', text: '6 cm × 3 cm' },
        { id: 'b', text: '5 cm × 3 cm' },
        { id: 'c', text: '6 cm × 5 cm' },
        { id: 'd', text: '6 cm × 5 cm × 3 cm' },
      ],
      correctId: 'c',
      explanation:
        'Na górną ścianę patrzysz z góry, więc widzisz długość i szerokość: 6 cm × 5 cm. Wysokość „ucieka” w dół i w tej ścianie się nie pojawia. Trzy liczby naraz opisują całą bryłę, a nie jedną ścianę.',
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'szkielet',
      prompt:
        'Ile centymetrów drutu potrzeba na sam szkielet pudełka 8 cm × 5 cm × 3 cm? Wpisz samą liczbę.',
      type: 'input',
      unit: 'cm',
      answer: String(SZKIELET),
      explanation: `Każdy wymiar powtarza się cztery razy, więc drutu potrzeba 4 · (8 + 5 + 3) = 4 · 16 = ${SZKIELET} cm.`,
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'szescian-z-drutu',
      prompt:
        'Szkielet sześcianu zbudowano z 60 cm drutu, bez żadnej resztki. Ile centymetrów ma jedna jego krawędź? Wpisz samą liczbę.',
      type: 'input',
      unit: 'cm',
      answer: '5',
      explanation:
        'Sześcian ma 12 krawędzi tej samej długości, więc 60 : 12 = 5 cm. Sprawdzenie: 12 · 5 = 60.',
      difficulty: { code: 'D', name: 'Dopełniający' },
    },
  ];
}
