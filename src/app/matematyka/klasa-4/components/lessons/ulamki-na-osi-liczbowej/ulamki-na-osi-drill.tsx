import type { DiagnosticTask } from '../../diagnostic-quiz';
import { NumberLine, type LineMarker } from '../../number-line';

function line(color: string, mianownik: number, licznik: number, ariaLabel: string, extraMarkers: LineMarker[] = []) {
  return (
    <div className="mx-auto max-w-sm">
      <NumberLine
        min={0}
        max={1}
        majorStep={1}
        minorStep={1 / mianownik}
        color={color}
        markers={[{ value: licznik / mianownik, color }, ...extraMarkers]}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

/** Ćwiczenia: odczytywanie punktu z osi, nazywanie licznika/mianownika osobno, punkty 0 i 1, porównanie dwóch punktów na tej samej osi — poziomy K/P/R/D. */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'trzy-czwarte',
      prompt: 'Odcinek podzielono na 4 równe części. Który zapis pasuje do zaznaczonego punktu?',
      type: 'choice',
      visual: line(color, 4, 3, 'Odcinek od 0 do 1 podzielony na 4 części, punkt na trzeciej podziałce'),
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '4/3' },
        { id: 'b', text: '3/4' },
        { id: 'c', text: '1/4' },
        { id: 'd', text: '3/3' },
      ],
      correctId: 'b',
      explanation: 'Punkt stoi po 3 podziałkach z 4 równych części — to 3/4.',
    },
    {
      id: 'licznik-input',
      prompt: 'Odcinek podzielono na 6 równych części, punkt stoi po 5 podziałkach. Ile wynosi LICZNIK tego ułamka?',
      type: 'input',
      answer: '5',
      visual: line(color, 6, 5, 'Odcinek od 0 do 1 podzielony na 6 części, punkt na piątej podziałce'),
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Licznik to liczba podziałek, które minęliśmy od zera — tu 5.',
    },
    {
      id: 'mianownik-input',
      prompt: 'Ten sam punkt — ile wynosi jego MIANOWNIK?',
      type: 'input',
      answer: '6',
      visual: line(color, 6, 5, 'Odcinek od 0 do 1 podzielony na 6 części, punkt na piątej podziałce'),
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Mianownik to liczba wszystkich równych części między 0 a 1 — tu 6.',
    },
    {
      id: 'punkt-zero',
      prompt: 'Punkt stoi dokładnie w miejscu 0 na osi podzielonej na 5 części. Jaki to ułamek?',
      type: 'choice',
      visual: line(color, 5, 0, 'Odcinek od 0 do 1 podzielony na 5 części, punkt dokładnie na początku'),
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '5/5' },
        { id: 'b', text: '0/5' },
        { id: 'c', text: '1/5' },
        { id: 'd', text: '5/0' },
      ],
      correctId: 'b',
      explanation: 'Zero podziałek od zera to 0/5 — punkt startowy.',
    },
    {
      id: 'punkt-jeden',
      prompt: 'Punkt stoi dokładnie w miejscu 1 na osi podzielonej na 7 części. Jaki to ułamek?',
      type: 'choice',
      visual: line(color, 7, 7, 'Odcinek od 0 do 1 podzielony na 7 części, punkt dokładnie na końcu'),
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '0/7' },
        { id: 'b', text: '1/7' },
        { id: 'c', text: '7/7' },
        { id: 'd', text: '7/1' },
      ],
      correctId: 'c',
      explanation: 'Wszystkie 7 podziałek od zera to 7/7 — cała jednostka, czyli 1.',
    },
    {
      id: 'porownanie-na-osi',
      prompt: 'Na tej samej osi zaznaczono dwa punkty: 2/6 i 5/6. Który z nich jest większy?',
      type: 'choice',
      visual: line(color, 6, 5, 'Odcinek od 0 do 1 podzielony na 6 części, dwa zaznaczone punkty: 2/6 i 5/6', [
        { value: 2 / 6, color: '#f59e0b' },
      ]),
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: '2/6, bo 2 to mniejsza liczba' },
        { id: 'b', text: '5/6, bo leży dalej w prawo na osi' },
        { id: 'c', text: 'Są równe' },
        { id: 'd', text: 'Nie da się porównać' },
      ],
      correctId: 'b',
      explanation: 'Na tej samej osi punkt dalej w prawo zawsze oznacza większy ułamek — 5/6 leży dalej niż 2/6.',
    },
    {
      id: 'do-mety',
      prompt: 'Ekipa dotarła do punktu 9/10 trasy liczącej 10 równych odcinków. Ile odcinków zostało do końca?',
      type: 'input',
      answer: '1',
      unit: 'odcinek',
      difficulty: { code: 'D', name: 'Dopełniające' },
      explanation: '10 odcinków w całości, 9 już pokonanych — został 1 do końca, czyli do punktu 1.',
    },
  ];
}
