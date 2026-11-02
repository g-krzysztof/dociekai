import type { DocContent } from '../../../lib/doc-model';
import { count, plural } from '../../../lib/plural';
import type { ProofCriterion, ProofVerdicts } from '../../task-shell';

/**
 * Werdykt dla zadania obowiązkowego **Z-9** — dokumentu z próbkami dziesięciu
 * krojów czcionki, złożonego w lekcji (`MiniWriter`).
 *
 * To pierwsze zadanie grupy A, w którym **sprawdzamy nie treść, tylko
 * formatowanie**. Z-9 prosi o rzecz, której nie da się odhaczyć uczciwie ani
 * przepisać z lekcji: nazwa kroju ma być zapisana *tym właśnie krojem*. Na
 * ekranie dziecko widzi wtedy dziesięć różnych napisów i tyle; dopiero w pliku
 * widać, czy każdy z nich naprawdę **nosi swój krój**, czy tylko dziesięć razy
 * ten sam domyślny. Lista kontrolna nie umiała odróżnić tych dwóch rzeczy.
 *
 * Stąd kolejność kryteriów — dokładnie taka, jak trzy zdania polecenia:
 *
 * - **dziesięć różnych krojów** w dokumencie (nie dziesięć wierszy jednym);
 * - **nazwa zapisana swoim krojem** — tu rozstrzyga `namesOwnFont`, czyli
 *   porównanie treści przebiegu z krojem, którym ten przebieg jest zapisany;
 * - **polskie znaki obok nazwy** — albo, dla kroju, który ich nie ma, zdanie o
 *   tym wprost; jedno i drugie jest poprawnym wykonaniem zadania.
 *
 * Czwarte kryterium nie pochodzi z Z-9, tylko z pierwszych trzech bloków tej
 * lekcji: **podwójne spacje i ręczne złamania wiersza**. Cała lekcja jest o
 * znakach, których nie widać, więc odbiór też ich szuka — i to jest jedyne
 * miejsce w kursie, w którym dziecko dostaje ich listę ze swojego pliku.
 *
 * Czego tu **nie** rozstrzygamy: czy krój jest szeryfowy, bezszeryfowy czy
 * ozdobny. Z nazwy tego nie widać, a zgadywanie z listy znanych krojów byłoby
 * udawaniem wiedzy — o grupach kroju dziecko decyduje w `SamplerBench`, na
 * krojach, o których strona naprawdę coś wie.
 */

export const POLISH_LETTERS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

export interface FontSample {
  /** Nazwa kroju dokładnie tak, jak zapisał ją edytor. */
  font: string;
  /** Wiersz próbki — to on idzie do raportu. */
  line: string;
  /** Polskie litery znalezione w tym wierszu. */
  polish: string[];
  /** Czy te litery stoją zapisane **tym** krojem, czy obok, innym. */
  polishInFont: boolean;
  /** Dziecko napisało wprost, że ten krój polskich liter nie ma. */
  saidMissing: boolean;
}

export interface FlawLine {
  line: string;
  /** Ile podwójnych spacji w tym wierszu. */
  spaces: number;
  /** Ile ręcznych złamań wiersza. */
  breaks: number;
}

export interface Z9Analysis {
  /** Próbki, czyli kroje, których nazwa jest zapisana tym krojem. */
  samples: FontSample[];
  /** Wszystkie kroje użyte w dokumencie — także te bez własnej próbki. */
  fonts: string[];
  flaws: FlawLine[];
}

/* ── Rozpoznawanie próbki ─────────────────────────────────────────────────── */

/** Nazwa kroju sprowadzona do samych liter i cyfr — „Times New Roman” i „TimesNewRoman” to jedno. */
function normalizeFont(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Czy ten przebieg **nazywa krój, którym jest zapisany**. Porównanie idzie w
 * obie strony, bo edytory nie zapisują nazw jednakowo: dziecko pisze „Comic
 * Sans”, a w pliku stoi „Comic Sans MS”.
 */
export function namesOwnFont(text: string, font: string | null): boolean {
  if (!font) return false;
  const wanted = normalizeFont(font);
  const written = normalizeFont(text);
  if (wanted.length < 3 || written.length < 3) return false;
  return written.includes(wanted) || wanted.includes(written);
}

const MISSING_SAID = /(brak|nie ma|nie posiada|bez polskich|nie zawiera|brakuje)/iu;
const DOUBLE_SPACE = / {2,}/g;

export const Z9_CRITERIA: ProofCriterion[] = [
  { id: 'dziesiec', label: 'Jest w nim dziesięć różnych krojów, a nie dziesięć wierszy jednym.' },
  { id: 'nazwy', label: 'Nazwa każdego kroju jest zapisana TYM krojem.' },
  { id: 'polskie', label: 'Przy każdym kroju stoją polskie litery — albo zdanie, że ich w nim nie ma.' },
  { id: 'zasady', label: 'Bez podwójnych spacji i bez ręcznych złamań wiersza.' },
];

export function analyseSampler(doc: DocContent): Z9Analysis {
  const fonts: string[] = [];
  const samples: FontSample[] = [];
  const flaws: FlawLine[] = [];
  const claimed = new Set<string>();

  for (const paragraph of doc.paragraphs) {
    for (const run of paragraph.runs) {
      if (run.font && !fonts.some((font) => normalizeFont(font) === normalizeFont(run.font!)))
        fonts.push(run.font);
    }

    const line = paragraph.text.trim();
    if (line === '') continue;

    /* Próbka to przebieg, który nazywa własny krój. Jeden wiersz — jedna próbka. */
    const naming = paragraph.runs.find((run) => namesOwnFont(run.text, run.font));
    if (naming?.font && !claimed.has(normalizeFont(naming.font))) {
      claimed.add(normalizeFont(naming.font));
      const inFont = paragraph.runs
        .filter((run) => run.font && normalizeFont(run.font) === normalizeFont(naming.font!))
        .map((run) => run.text)
        .join('');
      const polish = POLISH_LETTERS.filter((letter) => line.toLowerCase().includes(letter));
      samples.push({
        font: naming.font,
        line,
        polish,
        polishInFont: POLISH_LETTERS.some((letter) => inFont.toLowerCase().includes(letter)),
        saidMissing: MISSING_SAID.test(line),
      });
    }

    const spaces = (paragraph.text.match(DOUBLE_SPACE) ?? []).length;
    if (spaces > 0 || paragraph.breaks > 0)
      flaws.push({ line, spaces, breaks: paragraph.breaks });
  }

  return { samples, fonts, flaws };
}

/** Cztery kryteria o samej pracy — te, które mają sens dla dokumentu z pliku i z edytora. */
export function judgeSamplerContent(report: Z9Analysis): ProofVerdicts {
  const { samples, fonts, flaws } = report;

  const withoutPolish = samples.filter(
    (sample) => sample.polish.length < 5 && !sample.saidMissing
  );
  const spaces = flaws.reduce((sum, flaw) => sum + flaw.spaces, 0);
  const breaks = flaws.reduce((sum, flaw) => sum + flaw.breaks, 0);

  return {
    dziesiec: {
      ok: fonts.length >= 10,
      note:
        fonts.length >= 10
          ? `Naliczyłam ${count(fonts.length, 'krój', 'kroje', 'krojów')}: ${fonts.join(', ')}.`
          : fonts.length === 0
            ? 'Nie znalazłam w tym dokumencie ani jednego ustawionego kroju — cały tekst jest domyślny. Kliknij wiersz i wybierz krój z listy „Krój czcionki” nad dokumentem.'
            : `Na razie ${count(fonts.length, 'krój', 'kroje', 'krojów')}: ${fonts.join(', ')}. Zadanie prosi o dziesięć różnych — każdy wiersz ma dostać inny krój z listy.`,
    },
      nazwy: {
        ok: samples.length >= 10,
        note:
          samples.length >= 10
            ? `Wszystkie dziesięć nazw nosi swój krój.`
            : fonts.length >= 10
              ? `Krojów masz ${fonts.length}, a nazwę zapisaną własnym krojem ${samples.length === 0 ? 'nie ma ani jeden z nich' : `ma ${samples.length} z nich`}. Zaznacz nazwę kroju — samą nazwę — i nadaj jej ten krój, którego jest nazwą. Na tym polega cała próbka.`
              : `Próbek z nazwą zapisaną własnym krojem: ${samples.length}. Zadanie prosi o dziesięć.`,
      },
      polskie: {
        ok: samples.length >= 10 && withoutPolish.length === 0,
        note:
          samples.length < 10
            ? 'Najpierw musi być dziesięć próbek.'
            : withoutPolish.length === 0
              ? `Przy każdym kroju są polskie litery albo zdanie, że ich w nim nie ma.`
              : `Bez polskich liter ${plural(withoutPolish.length, 'został', 'zostały', 'zostało')}: ${withoutPolish.map((sample) => sample.font).join(', ')}. Dopisz obok nazwy ą ć ę ł ń ó ś ź ż — a jeśli krój ich nie ma, napisz to wprost, bo to też jest odpowiedź.`,
      },
      zasady: {
        ok: spaces === 0 && breaks === 0,
        note:
          spaces === 0 && breaks === 0
            ? 'Ani jednej podwójnej spacji, ani jednego ręcznego złamania wiersza.'
            : [
                spaces > 0
                  ? `${count(spaces, 'podwójna spacja', 'podwójne spacje', 'podwójnych spacji')}`
                  : null,
                breaks > 0
                  ? `${count(breaks, 'ręczne złamanie wiersza', 'ręczne złamania wiersza', 'ręcznych złamań wiersza')}`
                  : null,
              ]
                .filter(Boolean)
                .join(' i ') +
              '. Włącz znaki niedrukowane — tak jak w pierwszym bloku tej lekcji — i zobaczysz je wszystkie naraz. Wiersze z usterkami masz wypisane niżej.',
    },
  };
}
