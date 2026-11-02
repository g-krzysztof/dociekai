'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { RectSketch } from './rect-sketch';

/**
 * Ćwiczenia lekcji o wzorze — siedem zadań o rosnącej trudności (K/P/R/D).
 * Dwa ostatnie celowo wychodzą poza „podstaw i pomnóż”: jedno wraca z obwodu
 * do boku, drugie wymaga odjęcia jednego prostokąta od drugiego i jest mostem
 * do kolejnej lekcji o podziale i uzupełnianiu.
 */
export function buildRectangleAreaDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'prostokat-6-3',
      prompt: 'Jakie pole ma ten prostokąt?',
      type: 'choice',
      visual: <RectSketch spec={{ width: 6, height: 3 }} color={color} unitLabel="cm" tiles />,
      options: [
        { id: 'a', text: '18 cm²' },
        { id: 'b', text: '9 cm²' },
        { id: 'c', text: '18 cm' },
        { id: 'd', text: '36 cm²' },
      ],
      correctId: 'a',
      explanation:
        'P = a · b = 6 · 3 = 18. Boki podane w centymetrach, więc pole wychodzi w centymetrach kwadratowych: 18 cm². Sam zapis „18 cm” to długość, a nie pole.',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'kwadrat-7',
      prompt: 'Kwadrat ma bok 7 cm. Ile wynosi jego pole w cm²? Wpisz samą liczbę.',
      type: 'input',
      unit: 'cm²',
      answer: '49',
      explanation: 'Kwadrat ma oba boki równe, więc P = a · a = 7 · 7 = 49 cm².',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'prostokat-8-5',
      prompt: 'Prostokątna taca ma boki 8 dm i 5 dm. Jakie ma pole?',
      type: 'choice',
      visual: <RectSketch spec={{ width: 8, height: 5 }} color={color} unitLabel="dm" />,
      options: [
        { id: 'a', text: '13 dm²' },
        { id: 'b', text: '26 dm²' },
        { id: 'c', text: '40 dm²' },
        { id: 'd', text: '45 dm²' },
      ],
      correctId: 'c',
      explanation:
        'P = 8 · 5 = 40 dm². Liczba 26 to obwód (2 · 8 + 2 · 5), a 13 to suma boków — żadna z nich nie jest polem.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'brakujacy-bok',
      prompt:
        'Prostokąt ma pole 30 cm², a jeden z jego boków mierzy 5 cm. Ile centymetrów ma drugi bok?',
      type: 'input',
      unit: 'cm',
      answer: '6',
      visual: (
        <RectSketch
          spec={{ width: 6, height: 5 }}
          color={color}
          unitLabel="cm"
          widthLabel="? cm"
          heightLabel="5 cm"
          caption="pole = 30 cm²"
        />
      ),
      explanation: 'Odwracamy mnożenie: b = P : a = 30 : 5 = 6 cm. Sprawdzenie: 5 · 6 = 30.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'obwod-24',
      prompt: 'Kwadratowa działka ma obwód 24 m. Jakie ma pole?',
      type: 'choice',
      options: [
        { id: 'a', text: '24 m²' },
        { id: 'b', text: '36 m²' },
        { id: 'c', text: '48 m²' },
        { id: 'd', text: '96 m²' },
      ],
      correctId: 'b',
      explanation:
        'Kwadrat ma cztery równe boki, więc bok to 24 : 4 = 6 m. Dopiero teraz liczymy pole: 6 · 6 = 36 m².',
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'dwa-prostokaty',
      prompt: 'Jeden prostokąt ma boki 3 cm i 8 cm, drugi 4 cm i 6 cm. Który ma większe pole?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Pierwszy, bo ma dłuższy bok' },
        { id: 'b', text: 'Drugi, bo jest bliższy kwadratowi' },
        { id: 'c', text: 'Nie da się porównać bez rysunku' },
        { id: 'd', text: 'Mają równe pola' },
      ],
      correctId: 'd',
      explanation:
        '3 · 8 = 24 i 4 · 6 = 24 — pola są równe, choć kształty zupełnie różne. Różnią się natomiast obwody: 22 cm i 20 cm.',
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'podloga-bez-dywanu',
      prompt:
        'Pokój ma wymiary 5 m na 4 m. Na środku leży kwadratowy dywan o boku 2 m. Ile metrów kwadratowych podłogi zostaje nieprzykrytych? Wpisz samą liczbę.',
      type: 'input',
      unit: 'm²',
      answer: '16',
      explanation:
        'Najpierw pole całego pokoju: 5 · 4 = 20 m². Potem pole dywanu: 2 · 2 = 4 m². Odejmujemy: 20 − 4 = 16 m².',
      difficulty: { code: 'D', name: 'Dopełniający' },
    },
  ];
}
