'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { SolidSketch } from '../../solid-sketch';
import {
  countPolyhedron,
  prismPolyhedron,
  pyramidPolyhedron,
  solidName,
} from '../../../lib/solids';

const TROJKATNY = countPolyhedron(prismPolyhedron(3, 2, 3));
const OSMIOKATNY = countPolyhedron(prismPolyhedron(8, 2, 3));
const SZESCIOKATNY = countPolyhedron(prismPolyhedron(6, 2, 3));

/**
 * Ćwiczenia lekcji o rozpoznawaniu brył — siedem zadań K/P/R/D. Wszystkie
 * klucze liczy `countPolyhedron` z realnej bryły, więc nie da się wpisać
 * liczby niezgodnej z rysunkiem. Ostatnie zadanie porównuje obie rodziny przy
 * tej samej podstawie — tam dopiero widać, po co są dwa różne wzory.
 */
export function buildSolidDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'bez-plaskiej-sciany',
      prompt: 'Która bryła nie ma ani jednej płaskiej ściany?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Walec' },
        { id: 'b', text: 'Kula' },
        { id: 'c', text: 'Stożek' },
        { id: 'd', text: 'Ostrosłup' },
      ],
      correctId: 'b',
      explanation:
        'Tylko kula jest zaokrąglona w całości. Walec ma dwie płaskie podstawy, stożek jedną, a ostrosłup same płaskie ściany.',
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'sciany-graniastoslupa-3',
      prompt: 'Ile ścian ma graniastosłup trójkątny? Wpisz samą liczbę.',
      type: 'input',
      visual: (
        <SolidSketch
          polyhedron={prismPolyhedron(3, 2, 3.4)}
          color={color}
          ariaLabel="Graniastosłup o podstawie trójkąta"
        />
      ),
      answer: String(TROJKATNY.sciany),
      explanation: `Dwie podstawy i trzy ściany boczne, czyli n + 2 = 3 + 2 = ${TROJKATNY.sciany}.`,
      difficulty: { code: 'K', name: 'Konieczny' },
    },
    {
      id: 'nazwa-od-podstawy',
      prompt: 'Jak nazywa się graniastosłup, którego podstawą jest pięciokąt?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Graniastosłup pięciościenny' },
        { id: 'b', text: 'Ostrosłup pięciokątny' },
        { id: 'c', text: 'Graniastosłup pięciokątny' },
        { id: 'd', text: 'Pięciokąt przestrzenny' },
      ],
      correctId: 'c',
      explanation:
        'Bryła bierze nazwę od swojej podstawy, a nie od liczby ścian — stąd „pięciokątny”, mimo że ścian ma siedem.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'ostroslup-7-scian',
      prompt: 'Ostrosłup ma 7 ścian. Jaki wielokąt jest jego podstawą?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Sześciokąt' },
        { id: 'b', text: 'Siedmiokąt' },
        { id: 'c', text: 'Pięciokąt' },
        { id: 'd', text: 'Trójkąt' },
      ],
      correctId: 'a',
      explanation:
        'Ostrosłup ma n + 1 ścian: jedną podstawę i n ścian bocznych. Skoro n + 1 = 7, to n = 6 — podstawą jest sześciokąt.',
      difficulty: { code: 'P', name: 'Podstawowy' },
    },
    {
      id: 'krawedzie-osmiokatnego',
      prompt: 'Ile krawędzi ma graniastosłup ośmiokątny? Wpisz samą liczbę.',
      type: 'input',
      answer: String(OSMIOKATNY.krawedzie),
      explanation: `Krawędzi jest 3n: osiem na dolnej podstawie, osiem na górnej i osiem pionowych, czyli 3 · 8 = ${OSMIOKATNY.krawedzie}.`,
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'z-wierzcholkow',
      prompt:
        'Bryła ma dwie identyczne podstawy i 12 wierzchołków. Ile ma ścian? Wpisz samą liczbę.',
      type: 'input',
      answer: String(SZESCIOKATNY.sciany),
      explanation: `Dwie podstawy to graniastosłup, a w nim wierzchołków jest 2n. Z 2n = 12 wychodzi n = 6, więc ścian jest n + 2 = ${SZESCIOKATNY.sciany}. To ${solidName('graniastoslup', 6)}.`,
      difficulty: { code: 'R', name: 'Rozszerzający' },
    },
    {
      id: 'porownanie-rodzin',
      prompt:
        'Graniastosłup i ostrosłup mają taką samą podstawę o n bokach. Który ma więcej krawędzi i o ile?',
      type: 'choice',
      visual: (
        <div className="flex items-center justify-center gap-4">
          <SolidSketch
            polyhedron={prismPolyhedron(5, 1.9, 3.2)}
            color={color}
            ariaLabel="Graniastosłup o podstawie pięciokąta"
            className="h-auto w-full max-w-[150px]"
          />
          <SolidSketch
            polyhedron={pyramidPolyhedron(5, 2.1, 3.4)}
            color={color}
            ariaLabel="Ostrosłup o podstawie pięciokąta"
            className="h-auto w-full max-w-[150px]"
          />
        </div>
      ),
      options: [
        { id: 'a', text: 'Ostrosłup — o n krawędzi więcej' },
        { id: 'b', text: 'Graniastosłup — o n krawędzi więcej' },
        { id: 'c', text: 'Oba mają tyle samo krawędzi' },
        { id: 'd', text: 'Graniastosłup — dokładnie dwa razy więcej' },
      ],
      correctId: 'b',
      explanation:
        'Graniastosłup ma 3n krawędzi, ostrosłup 2n. Różnica to 3n − 2n = n, czyli tyle, ile boków ma podstawa. Przy pięciokącie: 15 kontra 10.',
      difficulty: { code: 'D', name: 'Dopełniający' },
    },
  ];
}
