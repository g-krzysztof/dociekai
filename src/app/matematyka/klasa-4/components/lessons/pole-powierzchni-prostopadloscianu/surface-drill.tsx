'use client';

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { SolidSketch } from '../../solid-sketch';
import {
  netFaceGroups,
  netTotalArea,
  packsNeeded,
  surfaceWithout,
} from '../../../lib/box-net';
import { boxVolume } from '../../../lib/box-volume';
import type { BoxSpec } from '../../../lib/solids';

const UNIT = 'cm';
const K = { code: 'K', name: 'Konieczne' };
const P = { code: 'P', name: 'Podstawowe' };
const R = { code: 'R', name: 'Rozszerzające' };
const D = { code: 'D', name: 'Dopełniające' };

const SZESCIAN: BoxSpec = { width: 3, depth: 3, height: 3 };
const KLOCEK: BoxSpec = { width: 4, depth: 3, height: 2 };
const PACZKA: BoxSpec = { width: 10, depth: 5, height: 4 };
/** Dwie bryły o TEJ SAMEJ objętości i różnym polu powierzchni — sedno zadania R. */
const KOSTKA: BoxSpec = { width: 6, depth: 6, height: 6 };
const PLASKIE: BoxSpec = { width: 12, depth: 6, height: 3 };
const BEZ_WIEKA: BoxSpec = { width: 5, depth: 4, height: 3 };
/** Skrzynia w metrach — zadanie D liczy jeszcze puszki farby. */
const SKRZYNIA: BoxSpec = { width: 3, depth: 2, height: 1 };
const NA_PUSZKE = 5;

const sketch = (spec: BoxSpec, color: string, unit: string, alt: string) => (
  <SolidSketch
    spec={spec}
    color={color}
    labels={[`${spec.width} ${unit}`, `${spec.depth} ${unit}`, `${spec.height} ${unit}`]}
    className="mx-auto h-auto w-full max-w-[190px]"
    ariaLabel={alt}
  />
);

/**
 * Osiem zadań o rosnącej trudności (K/P/R/D). Wszystkie klucze liczą
 * `netFaceGroups`/`netTotalArea`/`surfaceWithout` z `lib/box-net.ts` — tej samej
 * biblioteki, która w poprzedniej lekcji liczyła pole siatki, bo to jest ta sama
 * wielkość.
 *
 * Poprawne odpowiedzi w zadaniach wyboru celowo lądują na różnych pozycjach
 * (nigdy nie klastruj poprawnych odpowiedzi na jednej opcji).
 */
export function buildSurfaceDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'co-to-pole-powierzchni',
      type: 'choice',
      difficulty: K,
      prompt: 'Czym jest pole powierzchni prostopadłościanu?',
      options: [
        { id: 'a', text: 'Liczbą kostek jednostkowych, które go wypełnią' },
        { id: 'b', text: 'Sumą pól wszystkich sześciu jego ścian' },
        { id: 'c', text: 'Sumą długości wszystkich dwunastu krawędzi' },
        { id: 'd', text: 'Polem jego największej ściany' },
      ],
      correctId: 'b',
      explanation:
        'Pole powierzchni to pole całej siatki, czyli sześciu prostokątów razem. Liczba kostek to objętość, a suma krawędzi to długość szkieletu.',
    },
    {
      id: 'szescian',
      type: 'input',
      difficulty: K,
      prompt: `Ile wynosi pole powierzchni sześcianu o krawędzi ${SZESCIAN.width} ${UNIT}?`,
      unit: `${UNIT}²`,
      answer: String(netTotalArea(SZESCIAN)),
      explanation: `Sześcian ma 6 identycznych ścian po ${SZESCIAN.width} · ${SZESCIAN.width} = ${SZESCIAN.width * SZESCIAN.width} ${UNIT}². Razem 6 · ${SZESCIAN.width * SZESCIAN.width} = ${netTotalArea(SZESCIAN)} ${UNIT}².`,
    },
    {
      id: 'klocek',
      type: 'input',
      difficulty: P,
      prompt: 'Ile wynosi pole powierzchni tego klocka?',
      unit: `${UNIT}²`,
      answer: String(netTotalArea(KLOCEK)),
      visual: sketch(
        KLOCEK,
        color,
        UNIT,
        `Klocek ${KLOCEK.width} na ${KLOCEK.depth} na ${KLOCEK.height} centymetrów`,
      ),
      explanation: `Trzy pary: ${netFaceGroups(KLOCEK)
        .map((g) => `${g.sides[0]} · ${g.sides[1]} = ${g.area}`)
        .join(', ')}. Suma razy dwa: 2 · (${netFaceGroups(KLOCEK)
        .map((g) => g.area)
        .join(' + ')}) = ${netTotalArea(KLOCEK)} ${UNIT}².`,
    },
    {
      id: 'jednostki',
      type: 'choice',
      difficulty: P,
      prompt: 'W jakich jednostkach podaje się pole powierzchni bryły?',
      options: [
        { id: 'a', text: 'W centymetrach sześciennych (cm³)' },
        { id: 'b', text: 'W litrach' },
        { id: 'c', text: 'W centymetrach (cm)' },
        { id: 'd', text: 'W centymetrach kwadratowych (cm²)' },
      ],
      correctId: 'd',
      explanation:
        'Pole powierzchni to suma pól prostokątów, a pola liczy się w jednostkach kwadratowych. Sześcienne (cm³) i litry są od objętości.',
    },
    {
      id: 'paczka',
      type: 'input',
      difficulty: R,
      prompt: `Paczka ma wymiary ${PACZKA.width} ${UNIT} × ${PACZKA.depth} ${UNIT} × ${PACZKA.height} ${UNIT}. Ile papieru trzeba, żeby ją owinąć w całości?`,
      unit: `${UNIT}²`,
      answer: String(netTotalArea(PACZKA)),
      explanation: `2 · (${netFaceGroups(PACZKA)
        .map((g) => `${g.sides[0]} · ${g.sides[1]}`)
        .join(' + ')}) = 2 · (${netFaceGroups(PACZKA)
        .map((g) => g.area)
        .join(' + ')}) = ${netTotalArea(PACZKA)} ${UNIT}².`,
    },
    {
      id: 'ta-sama-objetosc',
      type: 'choice',
      difficulty: R,
      prompt: `Dwa pudełka mieszczą tyle samo: sześcian ${KOSTKA.width} × ${KOSTKA.depth} × ${KOSTKA.height} ${UNIT} i płaskie ${PLASKIE.width} × ${PLASKIE.depth} × ${PLASKIE.height} ${UNIT}. Na które zużyjesz mniej papieru?`,
      options: [
        { id: 'a', text: 'Na sześcian' },
        { id: 'b', text: 'Na płaskie pudełko' },
        { id: 'c', text: 'Na oba tyle samo — mają tę samą objętość' },
        { id: 'd', text: 'Nie da się tego porównać' },
      ],
      correctId: 'a',
      explanation: `Objętość obu to ${boxVolume(KOSTKA)} ${UNIT}³, ale pola powierzchni są różne: sześcian ${netTotalArea(KOSTKA)} ${UNIT}², płaskie pudełko ${netTotalArea(PLASKIE)} ${UNIT}². Ta sama zawartość, a materiału trzeba więcej — im bardziej płaska bryła, tym więcej opakowania.`,
    },
    {
      id: 'bez-wieka',
      type: 'input',
      difficulty: R,
      prompt: `Pudełko ${BEZ_WIEKA.width} ${UNIT} × ${BEZ_WIEKA.depth} ${UNIT} × ${BEZ_WIEKA.height} ${UNIT} nie ma wieka. Ile kartonu poszło na jego ścianki i dno?`,
      unit: `${UNIT}²`,
      answer: String(surfaceWithout(BEZ_WIEKA, ['gora'])),
      explanation: `Całe pole powierzchni to ${netTotalArea(BEZ_WIEKA)} ${UNIT}². Wieko to ${BEZ_WIEKA.width} · ${BEZ_WIEKA.depth} = ${BEZ_WIEKA.width * BEZ_WIEKA.depth} ${UNIT}², więc zostaje ${netTotalArea(BEZ_WIEKA)} − ${BEZ_WIEKA.width * BEZ_WIEKA.depth} = ${surfaceWithout(BEZ_WIEKA, ['gora'])} ${UNIT}².`,
    },
    {
      id: 'puszki-farby',
      type: 'input',
      difficulty: D,
      prompt: `Skrzynia ${SKRZYNIA.width} m × ${SKRZYNIA.depth} m × ${SKRZYNIA.height} m stoi na ziemi i malujesz ją z zewnątrz — bez dna. Jedna puszka wystarcza na ${NA_PUSZKE} m². Ile puszek trzeba kupić?`,
      unit: 'puszki',
      answer: String(packsNeeded(surfaceWithout(SKRZYNIA, ['dol']), NA_PUSZKE)),
      explanation: `Całe pole powierzchni to ${netTotalArea(SKRZYNIA)} m², dno ma ${SKRZYNIA.width * SKRZYNIA.depth} m², więc malujesz ${surfaceWithout(SKRZYNIA, ['dol'])} m². Trzy puszki pokryją ${3 * NA_PUSZKE} m² — o ${surfaceWithout(SKRZYNIA, ['dol']) - 3 * NA_PUSZKE} m² za mało. Puszek nie kupuje się na kawałki, więc trzeba ${packsNeeded(surfaceWithout(SKRZYNIA, ['dol']), NA_PUSZKE)}.`,
    },
  ];
}
