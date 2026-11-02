'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { SolidSketch } from '../../solid-sketch';
import {
  baseArea,
  boxVolume,
  formatNumber,
  missingDimension,
  toLitres,
  waterVolume,
} from '../../../lib/box-volume';
import type { BoxSpec } from '../../../lib/solids';

const UNIT = 'cm';
const K = { code: 'K', name: 'Konieczne' };
const P = { code: 'P', name: 'Podstawowe' };
const R = { code: 'R', name: 'Rozszerzające' };
const D = { code: 'D', name: 'Dopełniające' };

const KLOCEK: BoxSpec = { width: 3, depth: 2, height: 4 };
const PUDLO: BoxSpec = { width: 5, depth: 3, height: 2 };
const A: BoxSpec = { width: 4, depth: 3, height: 2 };
const B: BoxSpec = { width: 6, depth: 2, height: 2 };
const SZUFLADA: BoxSpec = { width: 4, depth: 3, height: 4 };
const AKWARIUM: BoxSpec = { width: 20, depth: 10, height: 20 };
const POZIOM = 15;
const KARTON: BoxSpec = { width: 40, depth: 30, height: 20 };

const sketch = (spec: BoxSpec, color: string, labels: [string, string, string], alt: string) => (
  <SolidSketch
    spec={spec}
    color={color}
    labels={labels}
    className="mx-auto h-auto w-full max-w-[190px]"
    ariaLabel={alt}
  />
);

/**
 * Osiem zadań o rosnącej trudności (K/P/R/D). Każdy klucz liczy funkcja
 * z `lib/box-volume.ts` z tej samej bryły, którą pokazuje rysunek — zmiana
 * wymiaru w stałej na górze pliku przenosi się i na treść, i na odpowiedź.
 *
 * Poprawne odpowiedzi w zadaniach wyboru celowo lądują na różnych pozycjach
 * (nigdy nie klastruj poprawnych odpowiedzi na jednej opcji).
 */
export function buildVolumeDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'co-to-objetosc',
      type: 'choice',
      difficulty: K,
      prompt: 'Co mówi objętość bryły?',
      options: [
        { id: 'a', text: 'Jak długa jest jej najdłuższa krawędź' },
        { id: 'b', text: 'Ile papieru trzeba na oklejenie jej ścian' },
        { id: 'c', text: 'Ile się w niej mieści — ile kostek jednostkowych ją wypełni' },
        { id: 'd', text: 'Ile ma ścian, krawędzi i wierzchołków' },
      ],
      correctId: 'c',
      explanation:
        'Objętość odpowiada na pytanie „ile się mieści w środku". Powierzchnia ścian to zupełnie inna wielkość — ta od oklejania.',
    },
    {
      id: 'objetosc-klocka',
      type: 'input',
      difficulty: K,
      prompt: 'Ile wynosi objętość tego klocka?',
      unit: `${UNIT}³`,
      answer: String(boxVolume(KLOCEK)),
      visual: sketch(
        KLOCEK,
        color,
        [`${KLOCEK.width} ${UNIT}`, `${KLOCEK.depth} ${UNIT}`, `${KLOCEK.height} ${UNIT}`],
        `Klocek ${KLOCEK.width} na ${KLOCEK.depth} na ${KLOCEK.height} centymetrów`,
      ),
      explanation: `Dno: ${KLOCEK.width} · ${KLOCEK.depth} = ${baseArea(KLOCEK)}. Warstw jest ${KLOCEK.height}, więc ${baseArea(KLOCEK)} · ${KLOCEK.height} = ${boxVolume(KLOCEK)} ${UNIT}³.`,
    },
    {
      id: 'z-podstawy-i-wysokosci',
      type: 'input',
      difficulty: P,
      prompt: `Pudło ma dno ${PUDLO.width} ${UNIT} na ${PUDLO.depth} ${UNIT} i ${PUDLO.height} ${UNIT} wysokości. Jaka jest jego objętość?`,
      unit: `${UNIT}³`,
      answer: String(boxVolume(PUDLO)),
      explanation: `Pole podstawy to ${baseArea(PUDLO)} ${UNIT}², a warstw ${PUDLO.height}: ${baseArea(PUDLO)} · ${PUDLO.height} = ${boxVolume(PUDLO)} ${UNIT}³.`,
    },
    {
      id: 'ktore-wieksze',
      type: 'choice',
      difficulty: P,
      prompt: `Pudełko A ma wymiary ${A.width} × ${A.depth} × ${A.height} ${UNIT}, a pudełko B — ${B.width} × ${B.depth} × ${B.height} ${UNIT}. Które mieści więcej?`,
      options: [
        { id: 'a', text: 'Pudełko A' },
        { id: 'b', text: 'Pudełko B, bo jest dłuższe' },
        { id: 'c', text: 'Nie da się porównać bez rysunku' },
        { id: 'd', text: 'Oba mieszczą tyle samo' },
      ],
      correctId: 'd',
      explanation: `A: ${A.width} · ${A.depth} · ${A.height} = ${boxVolume(A)}. B: ${B.width} · ${B.depth} · ${B.height} = ${boxVolume(B)}. Ta sama objętość, inny kształt — dłuższe pudełko wcale nie mieści więcej.`,
    },
    {
      id: 'brakujaca-wysokosc',
      type: 'input',
      difficulty: R,
      prompt: `Szuflada ma objętość ${boxVolume(SZUFLADA)} ${UNIT}³, a jej dno to ${SZUFLADA.width} ${UNIT} na ${SZUFLADA.depth} ${UNIT}. Ile ma wysokości?`,
      unit: UNIT,
      answer: String(missingDimension(boxVolume(SZUFLADA), SZUFLADA.width, SZUFLADA.depth)),
      explanation: `Jedna warstwa to ${baseArea(SZUFLADA)} ${UNIT}³. Pytamy, ile takich warstw mieści ${boxVolume(SZUFLADA)}: ${boxVolume(SZUFLADA)} : ${baseArea(SZUFLADA)} = ${missingDimension(boxVolume(SZUFLADA), SZUFLADA.width, SZUFLADA.depth)} ${UNIT}.`,
    },
    {
      id: 'woda-w-litrach',
      type: 'input',
      difficulty: R,
      prompt: `Akwarium ma dno ${AKWARIUM.width} ${UNIT} na ${AKWARIUM.depth} ${UNIT} i ${AKWARIUM.height} ${UNIT} wysokości. Wodę nalano do ${POZIOM} ${UNIT}. Ile jest w nim litrów wody?`,
      unit: 'l',
      answer: String(toLitres(waterVolume(AKWARIUM, POZIOM))),
      explanation: `Woda ma dno akwarium i wysokość ${POZIOM} ${UNIT}: ${baseArea(AKWARIUM)} · ${POZIOM} = ${formatNumber(waterVolume(AKWARIUM, POZIOM))} ${UNIT}³. Dzielimy przez 1000 i wychodzi ${formatNumber(toLitres(waterVolume(AKWARIUM, POZIOM)))} l. Wysokość ścianek (${AKWARIUM.height} ${UNIT}) nie ma tu nic do rzeczy.`,
    },
    {
      id: 'rozne-jednostki',
      type: 'choice',
      difficulty: R,
      prompt:
        'Pudełko ma wymiary 1 m długości, 40 cm szerokości i 50 cm wysokości. Co trzeba zrobić najpierw?',
      options: [
        { id: 'a', text: 'Pomnożyć 1 · 40 · 50 i dopisać jednostkę cm³' },
        { id: 'b', text: 'Zamienić wszystkie trzy wymiary na tę samą jednostkę' },
        { id: 'c', text: 'Podzielić wynik przez 100, bo jeden wymiar jest w metrach' },
        { id: 'd', text: 'Nic — jednostki mogą być różne, byle wpisać je do wyniku' },
      ],
      correctId: 'b',
      explanation:
        'Bez wspólnej jednostki mnożenie nie ma sensu. Zamieniamy 1 m na 100 cm i liczymy 100 · 40 · 50 = 200 000 cm³, czyli 200 litrów.',
    },
    {
      id: 'karton-w-litrach',
      type: 'input',
      difficulty: D,
      prompt: `Karton do przeprowadzki ma ${KARTON.width} ${UNIT} × ${KARTON.depth} ${UNIT} × ${KARTON.height} ${UNIT}. Ile litrów się w nim mieści?`,
      unit: 'l',
      answer: String(toLitres(boxVolume(KARTON))),
      visual: sketch(
        KARTON,
        color,
        [`${KARTON.width} ${UNIT}`, `${KARTON.depth} ${UNIT}`, `${KARTON.height} ${UNIT}`],
        `Karton ${KARTON.width} na ${KARTON.depth} na ${KARTON.height} centymetrów`,
      ),
      explanation: `${KARTON.width} · ${KARTON.depth} · ${KARTON.height} = ${formatNumber(boxVolume(KARTON))} ${UNIT}³. Litr to 1000 ${UNIT}³, więc dzielimy przez 1000: ${formatNumber(toLitres(boxVolume(KARTON)))} litrów. Tyle mniej więcej mieści duża torba podróżna.`,
    },
  ];
}
