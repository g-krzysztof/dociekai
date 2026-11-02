'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { AREA_UNITS, convertArea, formatArea } from '../../../lib/area-units';

/** Fragment drabinki jako ilustracja zadania — te same szczeble co w przykładach. */
function LadderStrip({ color, highlight }: { color: string; highlight: string[] }) {
  return (
    <ol className="grid grid-cols-7 gap-1">
      {AREA_UNITS.map((unit) => {
        const active = highlight.includes(unit.code);
        return (
          <li
            key={unit.code}
            className="border py-1.5 text-center font-mono text-xs font-bold tabular-nums"
            style={{
              borderColor: active ? color : `${color}33`,
              backgroundColor: active ? `${color}1f` : undefined,
              color: `color-mix(in oklch, ${color} 88%, black)`,
              opacity: active ? 1 : 0.4,
            }}
          >
            {unit.code}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Ćwiczenia: siedem zadań o rosnącej trudności (K/P/R/D). Każda liczba w kluczu
 * odpowiedzi jest policzona przez `convertArea`, a nie wpisana obok treści —
 * zadanie i jego odpowiedź nie mają jak się rozjechać.
 */
export function buildAreaUnitDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'ile-dm-w-m',
      prompt: 'Ile decymetrów kwadratowych mieści się w jednym metrze kwadratowym?',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: <LadderStrip color={color} highlight={['dm²', 'm²']} />,
      options: [
        { id: 'a', text: '10' },
        { id: 'b', text: '1000' },
        { id: 'c', text: formatArea(convertArea(1, 'm²', 'dm²')) },
        { id: 'd', text: '10 000' },
      ],
      correctId: 'c',
      explanation:
        'Metr ma 10 decymetrów, więc wzdłuż boku mieści się 10 kwadracików, a w całym kwadracie 10 · 10 = 100. Sąsiednie jednostki pola dzieli zawsze 100.',
    },
    {
      id: 'm-na-dm',
      prompt: 'Zamień: 5 m² = ___ dm². Wpisz liczbę.',
      type: 'input',
      answer: String(convertArea(5, 'm²', 'dm²')),
      unit: 'dm²',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation:
        'Jeden szczebel w dół drabinki to ×100. Do piątki dopisują się dwa zera: 5 m² = 500 dm².',
    },
    {
      id: 'cm-na-dm',
      prompt: 'Zamień: 800 cm² = ___ dm². Wpisz liczbę.',
      type: 'input',
      answer: String(convertArea(800, 'cm²', 'dm²')),
      unit: 'dm²',
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation:
        'Tym razem idziemy w górę drabinki, więc dzielimy przez 100 — zdejmujemy dwa zera: 800 cm² = 8 dm².',
    },
    {
      id: 'ogrod-na-ary',
      prompt: 'Ogród ma 300 m². Ile to arów?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: <LadderStrip color={color} highlight={['m²', 'a']} />,
      options: [
        { id: 'a', text: '30 arów' },
        { id: 'b', text: `${formatArea(convertArea(300, 'm²', 'a'))} ary` },
        { id: 'c', text: '3000 arów' },
        { id: 'd', text: '0,3 ara' },
      ],
      correctId: 'b',
      explanation:
        'Ar to kwadrat o boku 10 m, czyli 100 m². W 300 m² mieszczą się trzy takie kwadraty: 300 : 100 = 3 ary.',
    },
    {
      id: 'dzialka-na-ary',
      prompt: 'Działka ma 2500 m². Ile to arów? Wpisz liczbę.',
      type: 'input',
      answer: String(convertArea(2500, 'm²', 'a')),
      unit: 'a',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        'Z metrów na ary to jeden szczebel w górę, czyli :100. Z 2500 zdejmujemy dwa zera i zostaje 25 arów.',
    },
    {
      id: 'blad-oli',
      prompt:
        'Ola zamieniała 3 m² na centymetry kwadratowe i napisała: 3 m² = 300 cm². Na czym polega jej błąd?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      visual: <LadderStrip color={color} highlight={['cm²', 'dm²', 'm²']} />,
      options: [
        { id: 'a', text: 'Powinna była podzielić przez 100, a nie pomnożyć' },
        { id: 'b', text: 'Wynik jest dobry, tylko jednostka powinna być inna' },
        { id: 'c', text: 'Powinno wyjść 30 cm² — pomnożyła o jeden raz za dużo' },
        {
          id: 'd',
          text: `Między m² a cm² są dwa szczeble, więc ×100 trzeba zrobić dwa razy: 3 m² = ${formatArea(
            convertArea(3, 'm²', 'cm²')
          )} cm²`,
        },
      ],
      correctId: 'd',
      explanation:
        'Ola przeskoczyła tylko jeden szczebel (na dm²) i tam się zatrzymała. Z metrów na centymetry droga wiedzie przez decymetry: 3 m² = 300 dm² = 30 000 cm².',
    },
    {
      id: 'kafelki-na-podlodze',
      prompt:
        'Podłoga pokoju ma 24 m². Ile kafelków o polu 1 dm² trzeba, żeby ją całą wyłożyć? Wpisz liczbę.',
      type: 'input',
      answer: String(convertArea(24, 'm²', 'dm²')),
      unit: 'kafelków',
      difficulty: { code: 'D', name: 'Dopełniające' },
      explanation:
        'Kafelek ma dokładnie 1 dm², więc wystarczy podać pole podłogi w decymetrach kwadratowych: 24 m² = 2400 dm², czyli 2400 kafelków.',
    },
  ];
}
