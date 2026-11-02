import type { DocContent, DocParagraph } from '../../../lib/doc-model';
import { count } from '../../../lib/plural';
import type { ProofCriterion, ProofVerdicts } from '../../task-shell';

/**
 * Werdykt dla zadania praktycznego lekcji o akapitach i listach — ogłoszenia,
 * które ma się dać objąć wzrokiem, napisanego w lekcji (`MiniWriter`).
 *
 * Cała lekcja stoi na jednym zdaniu: **tekst układa się nie po to, żeby był
 * ładny, tylko żeby dało się w nim coś znaleźć**. Dlatego odbiór sprawdza dwie
 * rzeczy naraz — czy ogłoszenie ma kształt, którego uczyła lekcja (akapity,
 * wyrównanie, prawdziwa lista), i czy **ma w sobie co znajdować**: godzinę,
 * datę, kwotę, termin. To drugie nie jest czepianiem się treści, tylko
 * warunkiem nagrody: stoper z pierwszego bloku nie ma o co zapytać ogłoszenia,
 * w którym nie ma ani jednej konkretnej informacji.
 *
 * Dwie rzeczy, które ten plik rozstrzyga inaczej niż lista kontrolna:
 *
 * - **lista z przycisku kontra myślniki z klawiatury.** Na ekranie wyglądają
 *   tak samo; w dokumencie to dwie zupełnie różne rzeczy i sędzia widzi je
 *   od razu (`typedBullet` w `lib/doc-model.ts`). To jest sedno trzeciego bloku lekcji, a
 *   odhaczyć się dało jedno i drugie;
 * - **odstęp zrobiony stylem kontra podwójny Enter.** Puste akapity między
 *   tekstem to ten sam błąd, co w Z-10 — i tu też liczą się tylko te w środku,
 *   bo pusty akapit na końcu pliku zostawia każdy edytor.
 *
 * Czego **nie** sprawdzamy: czy ogłoszenie jest prawdziwe. „Wycieczka do
 * Muzeum Techniki” i „urodziny Zuzi” są warte tyle samo — zadanie prosi o coś,
 * co naprawdę się u dziecka dzieje, a tego żaden plik nie potwierdzi i nie ma
 * powodu udawać, że potwierdza.
 */

export type FactKind = 'godzina' | 'data' | 'kwota' | 'termin';

export interface NoticeFact {
  kind: FactKind;
  /** Dokładnie to, co znaleźliśmy — do pokazania w pytaniu stopera. */
  value: string;
  /** Numer akapitu, w którym to stoi. Po nim stoper rozstrzyga trafienie. */
  at: number;
}

export interface NoticeLine {
  text: string;
  align: DocParagraph['align'];
  heading: boolean;
  list: boolean;
  typedBullet: boolean;
  /** Numerowana czy wypunktowana — po to, żeby odtworzyć listę dziecka taką, jaka jest. */
  ordered: boolean | null;
}

export interface NoticeAnalysis {
  /** Wiersze z treścią, w kolejności — z nich składa się zarówno raport, jak i stoper. */
  lines: NoticeLine[];
  /** Akapity z tekstem, bez tytułu i bez pozycji list. */
  bodyParagraphs: number;
  longest: number;
  emptyInside: number;
  realList: number;
  typedList: number;
  /** Konkretne informacje, o które da się zapytać. */
  facts: NoticeFact[];
  titleCentered: boolean;
  bodyAligned: boolean;
}

/* ── Wyszukiwanie konkretów ───────────────────────────────────────────────── */

const MONTHS =
  'stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|wrzesnia|października|pazdziernika|listopada|grudnia';

const WEEKDAYS =
  'poniedziałku|wtorku|środy|srody|czwartku|piątku|piatku|soboty|niedzieli';

const FACT_PATTERNS: { kind: FactKind; pattern: RegExp; question: string }[] = [
  {
    kind: 'godzina',
    pattern: /\b(\d{1,2}[:.]\d{2})\b/u,
    question: 'O której godzinie?',
  },
  {
    kind: 'data',
    pattern: new RegExp(`\\b(\\d{1,2}\\s+(?:${MONTHS})|\\d{1,2}\\.\\d{1,2}(?:\\.\\d{2,4})?)\\b`, 'iu'),
    question: 'Którego dnia?',
  },
  {
    kind: 'kwota',
    pattern: /\b(\d+(?:[.,]\d{1,2})?\s*(?:zł|złotych|zlotych|PLN))/iu,
    question: 'Ile to kosztuje?',
  },
  {
    kind: 'termin',
    pattern: new RegExp(
      `\\b((?:do|od)\\s+(?:\\d{1,2}\\s+(?:${MONTHS})|${WEEKDAYS}|jutra|końca tygodnia))`,
      'iu'
    ),
    question: 'Do kiedy trzeba się zgłosić?',
  },
];

export const FACT_QUESTION: Record<FactKind, string> = Object.fromEntries(
  FACT_PATTERNS.map((item) => [item.kind, item.question])
) as Record<FactKind, string>;

/** Zdania jednego wiersza. Dzielone w jednym miejscu, bo stoper klika w zdanie, nie w akapit. */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((piece) => piece.trim())
    .filter(Boolean);
}

export const NOTICE_CRITERIA: ProofCriterion[] = [
  { id: 'dokument', label: 'To dokument z edytora tekstu — w zwykłym tekście nie ma ani wyrównania, ani list.' },
  { id: 'akapity', label: 'Ogłoszenie ma akapity — co najmniej trzy i żaden nie jest ścianą tekstu.' },
  { id: 'wyrownanie', label: 'Tytuł jest wyśrodkowany, a treść wyrównana do lewej albo wyjustowana.' },
  { id: 'lista', label: 'Jest w nim lista zrobiona przyciskiem listy, a nie myślnikami z klawiatury.' },
  { id: 'konkrety', label: 'Są w nim co najmniej dwie konkretne informacje — godzina, data, kwota, termin.' },
];

export function analyseNotice(doc: DocContent): NoticeAnalysis {
  const filled = doc.paragraphs.filter((paragraph) => paragraph.text.trim() !== '');
  const lines: NoticeLine[] = filled.map((paragraph) => ({
    text: paragraph.text.trim(),
    align: paragraph.align,
    heading: paragraph.heading !== null,
    list: paragraph.list,
    typedBullet: paragraph.typedBullet,
    ordered: paragraph.ordered,
  }));

  /* Liczą się tylko puste akapity MIĘDZY tekstem — pusty na końcu zostawia każdy edytor. */
  let emptyInside = 0;
  for (let i = 1; i < doc.paragraphs.length - 1; i += 1) {
    if (doc.paragraphs[i].text.trim() !== '') continue;
    const before = doc.paragraphs.slice(0, i).some((item) => item.text.trim() !== '');
    const after = doc.paragraphs.slice(i + 1).some((item) => item.text.trim() !== '');
    if (before && after) emptyInside += 1;
  }

  const body = lines.filter((line, index) => index > 0 && !line.heading && !line.list);
  /*
   * Do wyrównania liczy się sama proza. Krótka linijka — data, podpis
   * „Samorząd uczniowski” — ma prawo stać przy prawej krawędzi i tak właśnie
   * wygląda dobre ogłoszenie; reguła „treść do lewej” dotyczy tego, co się
   * czyta wierszami, a nie każdej linijki w pliku.
   */
  const prose = body.filter((line) => line.text.length >= 60);
  /*
   * Konkrety szukamy **zdaniami, nie akapitami**, i każde zdanie oddajemy tylko
   * raz. Bez tego stoper potrafiłby zadać obie rundy o to samo miejsce w
   * tekście — a „15.30” wpisane z kropką pasuje i do godziny, i do daty, więc
   * dwa pytania miałyby jedną odpowiedź.
   */
  const facts: NoticeFact[] = [];
  const used = new Set<string>();
  for (const { kind, pattern } of FACT_PATTERNS) {
    let found: NoticeFact | null = null;
    for (let index = 0; index < lines.length && !found; index += 1) {
      for (const sentence of splitSentences(lines[index].text)) {
        if (used.has(sentence)) continue;
        const match = sentence.match(pattern);
        if (!match) continue;
        found = { kind, value: match[1].trim(), at: index };
        used.add(sentence);
        break;
      }
    }
    if (found) facts.push(found);
  }

  /* Tytuł to pierwszy wiersz z treścią — nagłówek albo po prostu pierwsza linijka. */
  const title = lines[0];
  return {
    lines,
    bodyParagraphs: body.length,
    longest: body.reduce((max, line) => Math.max(max, line.text.length), 0),
    emptyInside,
    realList: lines.filter((line) => line.list && !line.typedBullet).length,
    typedList: lines.filter((line) => line.typedBullet).length,
    facts,
    titleCentered: title?.align === 'center',
    bodyAligned: prose.every(
      (line) => line.align === null || line.align === 'left' || line.align === 'justify'
    ),
  };
}

export function judgeNoticeContent(report: NoticeAnalysis): ProofVerdicts {
  const { lines, facts } = report;
  const wrongAligned = lines
    .filter((line, index) => index > 0 && !line.heading && !line.list && line.text.length >= 60)
    .filter((line) => line.align === 'center' || line.align === 'right');

  return {
    akapity: {
        ok: report.bodyParagraphs >= 3 && report.longest <= 450 && report.emptyInside < 2,
        note:
          report.bodyParagraphs < 3
            ? `Akapitów z treścią: ${report.bodyParagraphs}. Ogłoszenie rozpisane na trzy albo więcej da się objąć wzrokiem — każdy akapit o czymś innym.`
            : report.longest > 450
              ? `Najdłuższy akapit ma ${report.longest} znaków — to ta ściana tekstu, na której zmierzyłeś/zmierzyłaś sobie stoper na początku lekcji. Podziel go tam, gdzie zmienia się temat.`
              : report.emptyInside >= 2
                ? `Między akapitami stoi ${count(report.emptyInside, 'pusty akapit', 'puste akapity', 'pustych akapitów')} — czyli podwójne Entery. Jeden Enter kończy akapit; drugi stawia pusty, który rozjeżdża się przy każdej zmianie. Ustaw kursor na początku pustego wiersza i wciśnij Backspace.`
                : `Akapitów z treścią: ${report.bodyParagraphs}, najdłuższy na ${report.longest} znaków.`,
      },
    wyrownanie: {
      ok: report.titleCentered && report.bodyAligned,
        note: !report.titleCentered
          ? `Tytuł ogłoszenia nie jest wyśrodkowany${lines[0] ? ` — „${lines[0].text.slice(0, 50)}” stoi ${lines[0].align === 'right' ? 'przy prawej krawędzi' : 'przy lewej krawędzi'}` : ''}. Zaznacz go i kliknij wyśrodkowanie.`
          : !report.bodyAligned
            ? `Treść ogłoszenia jest wyśrodkowana albo dosunięta do prawej (${wrongAligned.length === 1 ? '1 akapit' : `${wrongAligned.length} akapity`}). Oko szuka wtedy początku każdego wiersza w innym miejscu — to była ta pokręcona droga ze strzałek w bloku o wyrównaniu. Treść ma iść do lewej albo być wyjustowana.`
            : 'Tytuł wyśrodkowany, treść do lewej — dokładnie tak, jak chodzi oko. Krótkie linijki, jak data albo podpis, mogą stać przy prawej krawędzi i nic to oku nie robi.',
      },
      lista: {
        ok: report.realList >= 2,
        note:
          report.realList >= 2
            ? `Lista na miejscu: ${count(report.realList, 'pozycja', 'pozycje', 'pozycji')} zrobione przyciskiem listy.`
            : report.typedList >= 2
              ? `Znalazłam ${count(report.typedList, 'wiersz', 'wiersze', 'wierszy')} zaczynające się od myślnika albo od numeru wpisanego z klawiatury. Wyglądają jak lista i listą nie są: nie przenumerują się po dopisaniu pozycji i nie wyrównają same. Zaznacz je i kliknij przycisk listy na pasku narzędzi.`
              : 'Nie znalazłam w ogłoszeniu listy. Wypunktuj to, co da się wypunktować — co zabrać, co przynieść, co po kolei zrobić — i zrób to przyciskiem listy, nie myślnikami.',
      },
      konkrety: {
        ok: facts.length >= 2,
        note:
          facts.length >= 2
            ? `Mam o co zapytać: ${facts.map((fact) => `${fact.kind} (${fact.value})`).join(', ')}.`
            : `Konkretów w tym ogłoszeniu jest ${facts.length}. Ogłoszenie, z którego nie da się wyczytać godziny, daty ani kwoty, nie jest jeszcze ogłoszeniem — dopisz je, a potem zmierzę ci stoperem, jak szybko da się je w twoim układzie znaleźć.`,
      },
  };
}
