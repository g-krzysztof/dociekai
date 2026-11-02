import type { DocContent, DocTable } from '../../../lib/doc-model';
import { count } from '../../../lib/plural';
import type { ProofCriterion, ProofVerdicts } from '../../task-shell';

/**
 * Werdykt dla zadania praktycznego lekcji o ilustracji i tabeli — rozbudowy
 * przepisu z poprzedniej lekcji wprost na stronie.
 *
 * To nie jest oszczędność, tylko sedno modułu 4: dokument się **rozbudowuje**,
 * a nie pisze od nowa za każdym razem. Przepis stoi już w stylach (materiał
 * spod Z-10), więc werdykt najpierw sprawdza, czy wciąż stoi (tytuł
 * i śródtytuły zrobione stylami), a dopiero potem szuka tego, co doszło —
 * obrazu i tabeli.
 *
 * Dwie rzeczy, których żadna lista kontrolna sprawdzić nie mogła:
 *
 * - **pusta komórka**. „Każdy wiersz ma wypełnione wszystkie komórki”
 *   odhaczało się jednym kliknięciem, a w pliku widać to co do komórki — i to
 *   jest dokładnie werdykt, którego uczył `TableFill`: kolumna istnieje tylko
 *   wtedy, gdy każdy wiersz ma w niej co wpisać;
 * - **błędy, których sprawdzanie pisowni nie łapie**. Podwójny wyraz („na na”,
 *   „się się”) i podwójna spacja przechodzą przez każdy słownik, bo każdy z
 *   tych wyrazów z osobna jest poprawny. `SpellPass` uczył, że maszyna nie
 *   kończy roboty; tutaj to samo dzieje się na własnym pliku dziecka.
 *
 * Świadomie **nie sprawdzamy udostępnienia** pliku, o które prosi ostatni
 * punkt zadania: kopia u kolegi ani link w Dokumentach Google nie zostawiają w
 * dokumencie żadnego śladu. Zostaje to w „Warsztacie” jako robota do wykonania,
 * a nie jako checkbox udający dowód.
 */

export interface EmptyCell {
  row: number;
  column: number;
}

export interface RecipePlusAnalysis {
  /** Tytuł przepisu, jeśli stoi na miejscu. */
  title: string | null;
  /** Śródtytuły etapów zrobione stylami. */
  headings: string[];
  /** Największa tabela w dokumencie — ta, o którą chodzi w zadaniu. */
  table: DocTable | null;
  /** Puste komórki w tej tabeli. */
  empty: EmptyCell[];
  /** Czy pierwszy wiersz wygląda na nagłówek: same podpisy, żadnych liczb. */
  headerRow: boolean;
  /** Osadzone obrazy — po jednym wpisie na obraz. */
  images: string[];
  /** Jak obraz stoi w tekście. */
  imageWrap: 'inline' | 'float' | null;
  /** Powtórzone wyrazy — „na na”, „się się”. */
  doubles: string[];
  doubleSpaces: number;
}

const TITLE_PATTERN = /przepis\s+na\s+koktajl\s+truskawkow/i;
/** Wyrazy, które w polszczyźnie potrafią stać obok siebie bez błędu. */
const REPEATABLE = new Set(['bardzo', 'coraz']);
const DOUBLE_WORD = /\b(\p{L}{3,})\s+\1\b/giu;
const DOUBLE_SPACE = / {2,}/g;

export const RECIPE_PLUS_CRITERIA: ProofCriterion[] = [
  { id: 'przepis', label: 'To dalej twój przepis z poprzedniej lekcji: tytuł i tytuły etapów stylami.' },
  { id: 'obraz', label: 'W przepisie siedzi wstawiony obraz.' },
  { id: 'tabela', label: 'Jest tabela ze składnikami: co najmniej dwie kolumny i trzy wiersze.' },
  { id: 'komorki', label: 'Żadna komórka tabeli nie jest pusta.' },
  { id: 'pisownia', label: 'Nie ma podwójnych wyrazów ani podwójnych spacji — tych słownik nie łapie.' },
];

export function analyseRecipePlus(doc: DocContent): RecipePlusAnalysis {
  const filled = doc.paragraphs.filter((paragraph) => paragraph.text.trim() !== '');
  const titleLine = filled.slice(0, 3).find((paragraph) => TITLE_PATTERN.test(paragraph.text));
  const headings = filled
    .filter((paragraph) => paragraph.heading !== null && !TITLE_PATTERN.test(paragraph.text))
    .map((paragraph) => paragraph.text.trim());

  /* Tabela zadania to ta największa — w przepisie innej i tak nie ma. */
  const table =
    doc.tables.reduce<DocTable | null>(
      (best, item) => (best === null || item.rows * item.columns > best.rows * best.columns ? item : best),
      null
    ) ?? null;

  const empty: EmptyCell[] = [];
  if (table) {
    for (let row = 0; row < table.cells.length; row += 1) {
      for (let column = 0; column < table.columns; column += 1) {
        if ((table.cells[row][column] ?? '').trim() === '') empty.push({ row, column });
      }
    }
  }

  /* Wiersz nagłówkowy poznajemy po tym, że nie ma w nim ani jednej liczby. */
  const first = table?.cells[0] ?? [];
  const headerRow =
    first.length > 0 && first.every((cell) => cell.trim() !== '' && !/\d/.test(cell));

  const doubles = Array.from(doc.text.matchAll(DOUBLE_WORD))
    .map((match) => match[0].trim())
    .filter((phrase) => !REPEATABLE.has(phrase.split(/\s+/)[0].toLowerCase()));

  return {
    title: titleLine?.text.trim() ?? null,
    headings,
    table,
    empty,
    headerRow,
    images: doc.images,
    imageWrap: doc.paragraphs.find((paragraph) => paragraph.hasImage)?.imageWrap ?? null,
    doubles,
    doubleSpaces: doc.paragraphs.reduce(
      (sum, paragraph) => sum + (paragraph.text.match(DOUBLE_SPACE) ?? []).length,
      0
    ),
  };
}

export function judgeRecipePlusContent(report: RecipePlusAnalysis): ProofVerdicts {
  const { table } = report;

  const wrapNote =
    report.imageWrap === 'float'
      ? 'Obraz stoi obok tekstu — wiersze opływają go dookoła.'
      : report.imageWrap === 'inline'
        ? 'Obraz stoi w tekście, czyli zachowuje się jak bardzo duża litera w wierszu.'
        : '';

  return {
    przepis: {
      ok: report.title !== null && report.headings.length >= 2,
      note:
        report.title === null
          ? 'Nie widzę tytułu „Przepis na koktajl truskawkowy”. Przepis zaczyna się od niego — jeśli zniknął przy rozbudowie, cofnij zmianę albo zacznij blok od nowa.'
          : report.headings.length >= 2
            ? `Przepis na miejscu: „${report.title}” i ${count(report.headings.length, 'tytuł etapu', 'tytuły etapów', 'tytułów etapów')} zrobione stylami.`
            : `Tytuł jest, ale tytułów etapów zrobionych stylem naliczyłam ${report.headings.length}. Sprawdź, czy style nie zniknęły przy rozbudowie.`,
    },
    obraz: {
      ok: report.images.length > 0,
      note:
        report.images.length > 0
          ? `${count(report.images.length, 'obraz', 'obrazy', 'obrazów')} w dokumencie. ${wrapNote}`
          : 'Nie ma w tym dokumencie obrazu. Kliknij akapit, w którym ma stanąć, i wybierz „Wstaw obraz” na pasku narzędzi.',
    },
    tabela: {
      ok: table !== null && table.columns >= 2 && table.rows >= 3 && report.headerRow,
      note:
        table === null
          ? 'Nie ma w tym dokumencie tabeli. Wybierz „Wstaw tabelę” na pasku narzędzi — dwie kolumny („Składnik” i „Ile”) i tyle wierszy, ile masz składników, plus jeden na nagłówek.'
          : table.columns < 2 || table.rows < 3
            ? `Twoja tabela ma ${count(table.columns, 'kolumnę', 'kolumny', 'kolumn')} i ${count(table.rows, 'wiersz', 'wiersze', 'wierszy')}. Zadanie prosi o co najmniej dwie kolumny i trzy wiersze.`
            : !report.headerRow
              ? `W pierwszym wierszu masz „${(table.cells[0] ?? []).join(' | ')}”. To wyglądają na dane, nie na nagłówek — pierwszy wiersz ma mówić, co jest w której kolumnie.`
              : `Tabela ${table.rows} × ${table.columns}, a w pierwszym wierszu nagłówki: ${table.cells[0].join(', ')}.`,
    },
    komorki: {
      ok: table !== null && report.empty.length === 0,
      note:
        table === null
          ? 'Najpierw musi być tabela.'
          : report.empty.length === 0
            ? `Wszystkie ${table.rows * table.columns} komórek wypełnione.`
            : `${count(report.empty.length, 'pusta komórka', 'puste komórki', 'pustych komórek')} — na czerwono w tabeli pod spodem. Pusta komórka to pytanie bez odpowiedzi: albo dopisz, ile tego składnika potrzeba, albo skasuj cały wiersz.`,
    },
    pisownia: {
      ok: report.doubles.length === 0 && report.doubleSpaces === 0,
      note:
        report.doubles.length === 0 && report.doubleSpaces === 0
          ? 'Ani jednego powtórzonego wyrazu, ani jednej podwójnej spacji.'
          : [
              report.doubles.length > 0
                ? `powtórzone wyrazy: ${report.doubles.map((phrase) => `„${phrase}”`).join(', ')}`
                : null,
              report.doubleSpaces > 0
                ? count(report.doubleSpaces, 'podwójna spacja', 'podwójne spacje', 'podwójnych spacji')
                : null,
            ]
              .filter(Boolean)
              .join(' · ') +
            '. Sprawdzanie pisowni tego nie podkreśli — każdy z tych wyrazów z osobna jest poprawny. Dokładnie o tym był blok o sprawdzaniu pisowni: trzy błędy znajduje maszyna, dwa musisz znaleźć ty.',
    },
  };
}
