import { isGreen, type DocContent } from '../../../lib/doc-model';
import { count } from '../../../lib/plural';
import type { ProofCriterion, ProofVerdicts } from '../../task-shell';

/**
 * Werdykt dla zadania obowiązkowego **Z-10** — przepisu na koktajl truskawkowy
 * formatowanego w lekcji (`MiniWriter`).
 *
 * Cztery podpunkty zadania dają sześć rzeczy, które **da się sprawdzić w samym
 * dokumencie** (`lib/doc-model.ts`), i każda z nich jest dokładnie tym, czego uczy jeden
 * z czterech bloków lekcji:
 *
 * - **tytuły etapów zrobione stylami, a nie pogrubieniem** — to jest cała myśl
 *   `OutlineBuilder`. Akapit pogrubiony wygląda w dokumencie jak nagłówek i nie
 *   jest nim; tutaj wychodzi to na jaw, bo w pliku widać różnicę, której na
 *   ekranie nie widać;
 * - **tytuły, które coś mówią** — „Etap 2” przechodzi przez każdą listę
 *   kontrolną świata i jest odrzucany tutaj (`TitleTest`);
 * - **akapity, nie puste linie** — dwa Entery wyglądają jak akapit i akapitem
 *   nie są;
 * - **zielone wyłącznie przedmioty** — z pułapką, którą niesie `GreenOnly`:
 *   „szklanka soku” i „łyżeczka miodu” to miary, a nie narzędzia. Rozstrzyga o
 *   tym **następny wyraz**, więc ten sam napis raz przechodzi, a raz nie.
 *
 * Świadomie **nie** sprawdzamy wielkości ani kroju tytułów: podpunkt 3 mówi
 * „sformatuj według własnego pomysłu”, więc każdy pomysł jest dobry, o ile
 * tytuł główny odróżnia się od tytułów etapów.
 */

export type GreenKind = 'przedmiot' | 'skladnik' | 'miara' | 'inne';

/**
 * Zielone **frazy**, nie pojedyncze wyrazy. Dziecko zamalowuje myszą całe
 * kawałki zdania („deska do krojenia”, „dwie szklanki”), więc rozbicie tego na
 * wyrazy dawało w raporcie plewy w rodzaju „krojenia — nie wiem, co to”.
 * Wyszło dopiero na prawdziwym pliku z Dokumentów Google; sklecony fixture miał
 * na zielono grzecznie po jednym wyrazie.
 *
 * O ocenie frazy decyduje najgorszy wyraz w środku: jeden składnik albo jedna
 * miara psuje całą frazę, a same przedmioty ją zaliczają.
 */
export interface GreenPhrase {
  text: string;
  kind: GreenKind;
  /** Rozpoznane w tej frazie nazwy przedmiotów — z nich liczy się próg „co najmniej dwa”. */
  tools: string[];
  /** Zdanie tłumaczące, dlaczego ta fraza nie powinna być zielona. */
  why?: string;
}

export interface OutlineEntry {
  text: string;
  level: number;
}

/** Wszystko, co werdykt wyczytał z dokumentu — bez względu na to, skąd dokument przyszedł. */
export interface RecipeAnalysis {
  doc: DocContent;
  /** Nagłówki w kolejności — z nich buduje się panel nawigacji. */
  outline: OutlineEntry[];
  /** Akapity, które wyglądają jak tytuł, a są zwykłym tekstem z pogrubieniem. */
  fakeHeadings: string[];
  green: GreenPhrase[];
  tools: string[];
  foods: string[];
  bodyParagraphs: number;
  emptyInside: number;
  longest: number;
}

/* ── Słownik przepisu ─────────────────────────────────────────────────────── */

/** Rdzenie zamiast pełnych form — polska odmiana zjadłaby każdą listę słów. */
const TOOL_STEMS = [
  'blend', 'mikser', 'nóż', 'noż', 'noz', 'desk', 'misk', 'kubk', 'kubek', 'słomk', 'slomk',
  'sitk', 'widelc', 'widelec', 'talerz', 'garnk', 'garnek', 'dzbank', 'dzbanek', 'robot',
  'obieracz', 'szczotk', 'tark',
];
const FOOD_STEMS = [
  'truskawk', 'banan', 'jogurt', 'miód', 'miod', 'mleko', 'mlek', 'cukier', 'cukr', 'lód', 'lod',
  'malin', 'borówk', 'borowk', 'wod', 'sok', 'wanili', 'płatk', 'platk', 'owoc', 'kefir',
  'maślank', 'maslank', 'śmietan', 'smietan', 'cytryn',
];
/** Wyrazy, które są przedmiotem ALBO miarą — rozstrzyga dopiero następny wyraz. */
const AMBIGUOUS_STEMS = ['szklank', 'łyżk', 'lyzk', 'łyżeczk', 'lyzeczk', 'garść', 'garsc'];
const MEASURE_STEMS = ['gram', 'dag', 'kilogram', 'litr', 'mililitr', 'szczypt', 'szczypta'];

function stemmed(word: string, stems: string[]): boolean {
  const clean = word.toLowerCase();
  return stems.some((stem) => clean.startsWith(stem));
}

/**
 * Do jakiej grupy należy wyróżniony wyraz. Wyrazy dwuznaczne rozstrzyga
 * **następny wyraz w zdaniu**: „szklanki” obok „soku” to miara, a „szklanki” na
 * liście potrzebnych rzeczy to naczynia. Dokładnie ta pułapka, którą dziecko
 * rozbrajało w `GreenOnly` — tyle że teraz we własnym tekście.
 */
function classifyWord(word: string, next: string | undefined): { kind: GreenKind; why?: string } {
  if (stemmed(word, MEASURE_STEMS))
    return { kind: 'miara', why: `„${word}” to miara, a nie przedmiot potrzebny do pracy.` };
  if (stemmed(word, AMBIGUOUS_STEMS)) {
    if (next && stemmed(next, FOOD_STEMS))
      return {
        kind: 'miara',
        why: `„${word} ${next}” to miara — tyle składnika, ile się mieści. Nie jest to narzędzie, którym robisz koktajl.`,
      };
    return { kind: 'przedmiot' };
  }
  if (stemmed(word, TOOL_STEMS)) return { kind: 'przedmiot' };
  if (stemmed(word, FOOD_STEMS))
    return { kind: 'skladnik', why: `„${word}” to składnik, a zielone miały być przedmioty.` };
  return { kind: 'inne' };
}

/** Ocena całej frazy: rozstrzyga najgorszy wyraz w środku. */
function classifyPhrase(text: string, all: string[]): GreenPhrase {
  const tools: string[] = [];
  let wrong: { kind: GreenKind; why?: string } | null = null;
  for (const word of words(text)) {
    if (word.length < 3) continue;
    const at = all.indexOf(word);
    const verdict = classifyWord(word, at >= 0 ? all[at + 1] : undefined);
    if (verdict.kind === 'przedmiot') tools.push(word);
    else if (!wrong && (verdict.kind === 'skladnik' || verdict.kind === 'miara')) wrong = verdict;
  }
  if (wrong) return { text, kind: wrong.kind, tools, why: wrong.why };
  return { text, kind: tools.length > 0 ? 'przedmiot' : 'inne', tools };
}

const WORD_PATTERN = /[\p{L}]+/gu;

function words(text: string): string[] {
  return text.match(WORD_PATTERN) ?? [];
}

/* ── Kryteria ─────────────────────────────────────────────────────────────── */

export const Z10_CRITERIA: ProofCriterion[] = [
  { id: 'tytul', label: 'Na początku stoi tytuł „Przepis na koktajl truskawkowy”.' },
  { id: 'skladniki', label: 'Wymienione są i składniki, i przedmioty potrzebne do pracy.' },
  { id: 'naglowki', label: 'Etapy mają własne tytuły zrobione stylem, a nie pogrubieniem.' },
  { id: 'mowiace', label: 'Tytuły etapów mówią, co się w nich dzieje — nie są to „Etap 1, 2, 3”.' },
  { id: 'akapity', label: 'Tekst jest podzielony na akapity, a nie na puste linie.' },
  { id: 'zielone', label: 'Na zielono są nazwy przedmiotów — i tylko one.' },
];

const TITLE_PATTERN = /przepis\s+na\s+koktajl\s+truskawkow/i;
const GENERIC_TITLE = /^(etap|część|czesc|krok|punkt|rozdział|rozdzial)?\s*[0-9ivx]+\s*[.:)]?$/i;

export function analyseRecipe(doc: DocContent): RecipeAnalysis {
  const headings = doc.paragraphs.filter((paragraph) => paragraph.heading !== null);
  const outline = headings.map((paragraph) => ({
    text: paragraph.text.trim(),
    level: paragraph.heading ?? 1,
  }));

  /* Akapit krótki, w całości pogrubiony i bez kropki na końcu — czyli tytuł, o którym program nie wie. */
  const fakeHeadings = doc.paragraphs
    .filter(
      (paragraph) =>
        paragraph.heading === null &&
        paragraph.text.trim().length > 0 &&
        paragraph.text.trim().length < 60 &&
        !/[.!?]$/.test(paragraph.text.trim()) &&
        paragraph.runs.length > 0 &&
        paragraph.runs.every((run) => run.text.trim() === '' || run.bold)
    )
    .map((paragraph) => paragraph.text.trim());

  const green: GreenPhrase[] = [];
  for (const paragraph of doc.paragraphs) {
    const all = words(paragraph.text);
    /* Edytory tną jedną zamalowaną frazę na kilka przebiegów — sklejamy sąsiadujące. */
    let buffer = '';
    const flush = () => {
      const text = buffer.trim().replace(/^[\s,.;:]+|[\s,.;:]+$/g, '');
      buffer = '';
      if (text && words(text).some((word) => word.length >= 3)) green.push(classifyPhrase(text, all));
    };
    for (const run of paragraph.runs) {
      if (isGreen(run.color, run.highlight)) buffer += run.text;
      else flush();
    }
    flush();
  }

  const body = doc.paragraphs.filter((paragraph) => paragraph.heading === null);
  const filled = body.filter((paragraph) => paragraph.text.trim() !== '');
  /* Liczą się tylko puste akapity MIĘDZY tekstem — pusty na końcu pliku zostawia każdy edytor. */
  let emptyInside = 0;
  for (let i = 1; i < body.length - 1; i += 1) {
    if (body[i].text.trim() !== '') continue;
    const before = body.slice(0, i).some((paragraph) => paragraph.text.trim() !== '');
    const after = body.slice(i + 1).some((paragraph) => paragraph.text.trim() !== '');
    if (before && after) emptyInside += 1;
  }

  const text = doc.text.toLowerCase();
  const tools = TOOL_STEMS.filter((stem) => text.includes(stem));
  const foods = FOOD_STEMS.filter((stem) => text.includes(stem));

  return {
    doc,
    outline,
    fakeHeadings,
    green,
    tools,
    foods,
    bodyParagraphs: filled.length,
    emptyInside,
    longest: filled.reduce((max, paragraph) => Math.max(max, paragraph.text.length), 0),
  };
}

/** Sześć kryteriów o samej pracy — te, które mają sens dla dokumentu z pliku i z edytora. */
export function judgeRecipeContent(report: RecipeAnalysis): ProofVerdicts {
  const { doc, outline, fakeHeadings, green } = report;

  const opening = doc.paragraphs
    .filter((paragraph) => paragraph.text.trim() !== '')
    .slice(0, 3)
    .map((paragraph) => paragraph.text);
  const hasTitle = opening.some((text) => TITLE_PATTERN.test(text));

  /* Pierwszy nagłówek bywa tytułem dokumentu — tytuły etapów liczymy po nim. */
  const titleIsHeading = outline.length > 0 && TITLE_PATTERN.test(outline[0].text);
  const stages = titleIsHeading ? outline.slice(1) : outline;
  const generic = stages.filter((entry) => GENERIC_TITLE.test(entry.text.trim()));

  const greenOk = green.filter((item) => item.kind === 'przedmiot');
  const greenWrong = green.filter((item) => item.kind === 'skladnik' || item.kind === 'miara');
  /* Próg liczy nazwy przedmiotów, nie frazy — jedna zamalowana linijka może ich nieść kilka. */
  const toolCount = new Set(green.flatMap((item) => item.tools)).size;

  return {
    tytul: {
      ok: hasTitle,
      note: hasTitle
        ? `Tytuł na miejscu: „${opening.find((text) => TITLE_PATTERN.test(text))?.trim()}”.`
        : opening.length === 0
          ? 'Dokument jest pusty.'
          : `Na początku dokumentu stoi „${opening[0].trim().slice(0, 60)}”. Zadanie prosi o tytuł „Przepis na koktajl truskawkowy”.`,
    },
    skladniki: {
      ok: report.foods.length >= 3 && report.tools.length >= 2,
      note:
        report.foods.length >= 3 && report.tools.length >= 2
          ? `Znalazłam ${count(report.foods.length, 'składnik', 'składniki', 'składników')} i ${count(report.tools.length, 'przedmiot', 'przedmioty', 'przedmiotów')}.`
          : report.foods.length < 3
            ? `Składniki: znalazłam ${report.foods.length}. Wymień ich więcej — z czego właściwie ma być ten koktajl?`
            : `Przedmioty: znalazłam ${report.tools.length}. Czym go zmiksujesz, na czym pokroisz, do czego przelejesz?`,
    },
    naglowki: {
      ok: stages.length >= 2,
      note:
        stages.length >= 2
          ? `Etapy w panelu nawigacji: ${stages.length}.`
          : fakeHeadings.length > 0
            ? `Znalazłam tytuły zrobione pogrubieniem: ${fakeHeadings.slice(0, 3).map((item) => `„${item}”`).join(', ')}. Wyglądają jak nagłówki, ale program o tym nie wie i panel nawigacji ich nie widzi. Zaznacz je i nadaj im styl „Nagłówek 2”.`
            : 'Nie znalazłam ani jednego tytułu etapu zrobionego stylem. Zaznacz tytuł etapu i wybierz „Nagłówek 2” z listy stylów.',
    },
    mowiace: {
      ok: stages.length >= 2 && generic.length === 0,
      note:
        stages.length < 2
          ? 'Najpierw muszą być tytuły etapów.'
          : generic.length === 0
            ? `Tytuły mówią, co się dzieje: ${stages.map((entry) => `„${entry.text}”`).join(', ')}.`
            : `${generic.map((entry) => `„${entry.text}”`).join(', ')} — z takiego tytułu nikt się nie dowie, co jest w środku. Napisz, co się w tym etapie dzieje.`,
    },
    akapity: {
      ok: report.bodyParagraphs >= 4 && report.longest <= 500 && report.emptyInside < 2,
      note:
        report.bodyParagraphs < 4
          ? `Akapitów z tekstem: ${report.bodyParagraphs}. Przepis rozpisany na cztery albo więcej da się objąć wzrokiem.`
          : report.longest > 500
            ? `Najdłuższy akapit ma ${report.longest} znaków — to ściana tekstu. Podziel go tam, gdzie zmienia się temat.`
            : report.emptyInside >= 2
              ? `Między akapitami zostawiłeś/zostawiłaś ${count(report.emptyInside, 'pustą linię', 'puste linie', 'pustych linii')}. Odstęp robi się jednym Enterem i stylem, nie dwoma Enterami — puste akapity rozjeżdżają dokument przy każdej zmianie.`
              : `Akapitów z tekstem: ${report.bodyParagraphs}, najdłuższy na ${report.longest} znaków.`,
    },
    zielone: {
      ok: toolCount >= 2 && greenWrong.length === 0,
      note:
        green.length === 0
          ? 'Nie znalazłam w dokumencie ani jednego zielonego wyrazu. Kolor liter zmienia przycisk z literą A i paskiem koloru pod spodem.'
          : greenWrong.length > 0
            ? `Na zielono jest za dużo: ${greenWrong.map((item) => `„${item.text}”`).join(', ')}. ${greenWrong[0].why ?? ''}`
            : toolCount < 2
              ? `Na zielono jest tylko ${toolCount === 1 ? 'jedna nazwa przedmiotu' : 'to, co nie jest przedmiotem'}. Przedmiotów potrzebnych do pracy jest więcej.`
              : `Na zielono: ${greenOk.map((item) => `„${item.text}”`).join(', ')} — same przedmioty.`,
    },
  };
}
