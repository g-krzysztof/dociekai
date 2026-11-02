'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { PolygonGlyph } from './polygon-glyph';
import { polygonPoints } from './polygon-geometry';

/** Ćwiczenia: rozpoznawanie i nazywanie wielokątów po liczbie boków, foremnych i nieregularnych na przemian. */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'trojkat',
      prompt: 'Ile boków ma ta figura? Jak się nazywa?',
      type: 'choice',
      visual: <PolygonGlyph points={polygonPoints({ x: 80, y: 70 }, 50, 3, -90)} color={color} />,
      options: [
        { id: 'a', text: 'Trójkąt' },
        { id: 'b', text: 'Czworokąt' },
        { id: 'c', text: 'Pięciokąt' },
        { id: 'd', text: 'Sześciokąt' },
      ],
      correctId: 'a',
      explanation: 'Policz boki: 1, 2, 3 — to trójkąt.',
    },
    {
      id: 'czworokat-nieregularny',
      prompt: 'Ile boków ma ta figura? Jak się nazywa?',
      type: 'choice',
      visual: (
        <PolygonGlyph
          points={[
            { x: 60, y: 20 },
            { x: 130, y: 40 },
            { x: 120, y: 120 },
            { x: 45, y: 100 },
          ]}
          color={color}
        />
      ),
      options: [
        { id: 'a', text: 'Trójkąt' },
        { id: 'b', text: 'Sześciokąt' },
        { id: 'c', text: 'Czworokąt' },
        { id: 'd', text: 'Pięciokąt' },
      ],
      correctId: 'c',
      explanation: 'Ta figura nie jest równa jak kwadrat, ale ma 4 proste boki i jest zamknięta — to czworokąt.',
    },
    {
      id: 'pieciokat',
      prompt: 'Ile boków ma ta figura? Jak się nazywa?',
      type: 'choice',
      visual: <PolygonGlyph points={polygonPoints({ x: 80, y: 70 }, 50, 5, -90)} color={color} />,
      options: [
        { id: 'a', text: 'Czworokąt' },
        { id: 'b', text: 'Sześciokąt' },
        { id: 'c', text: 'Trójkąt' },
        { id: 'd', text: 'Pięciokąt' },
      ],
      correctId: 'd',
      explanation: 'Policz boki: 1, 2, 3, 4, 5 — to pięciokąt.',
    },
    {
      id: 'szesciokat-nieregularny',
      prompt: 'Ile boków ma ta figura? Jak się nazywa?',
      type: 'choice',
      visual: (
        <PolygonGlyph
          points={[
            { x: 70, y: 15 },
            { x: 125, y: 40 },
            { x: 130, y: 95 },
            { x: 80, y: 130 },
            { x: 30, y: 100 },
            { x: 35, y: 45 },
          ]}
          color={color}
        />
      ),
      options: [
        { id: 'a', text: 'Sześciokąt' },
        { id: 'b', text: 'Pięciokąt' },
        { id: 'c', text: 'Czworokąt' },
        { id: 'd', text: 'Ośmiokąt' },
      ],
      correctId: 'a',
      explanation: 'Nawet nierówny — policz wierzchołki: 6. To sześciokąt.',
    },
    {
      id: 'czworokat-foremny',
      prompt: 'Ile boków ma ta figura? Jak się nazywa?',
      type: 'choice',
      visual: <PolygonGlyph points={polygonPoints({ x: 80, y: 70 }, 50, 4, -45)} color={color} />,
      options: [
        { id: 'a', text: 'Pięciokąt' },
        { id: 'b', text: 'Trójkąt' },
        { id: 'c', text: 'Sześciokąt' },
        { id: 'd', text: 'Czworokąt' },
      ],
      correctId: 'd',
      explanation:
        'Cztery proste boki, zamknięta figura — czworokąt (tu akurat kwadrat, ale liczy się tylko liczba boków).',
    },
    {
      id: 'pieciokat-nieregularny',
      prompt: 'Ile boków ma ta figura? Jak się nazywa?',
      type: 'choice',
      visual: (
        <PolygonGlyph
          points={[
            { x: 78, y: 12 },
            { x: 135, y: 55 },
            { x: 115, y: 128 },
            { x: 45, y: 128 },
            { x: 25, y: 55 },
          ]}
          color={color}
        />
      ),
      options: [
        { id: 'a', text: 'Sześciokąt' },
        { id: 'b', text: 'Czworokąt' },
        { id: 'c', text: 'Pięciokąt' },
        { id: 'd', text: 'Trójkąt' },
      ],
      correctId: 'c',
      explanation: 'Policz wierzchołki: 5 — to pięciokąt, mimo że boki nie są równe.',
    },
  ];
}
