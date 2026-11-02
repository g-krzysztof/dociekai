/**
 * Model dokumentu tekstowego, na którym stoją werdykty zadań z modułu 4 i 2
 * (`z9.ts`, `z10.ts`, `notice.ts`, `recipe-plus.ts`, `source.ts`).
 *
 * Model jest **jeden**, a dokument składa dziecko w kursie
 * (`components/mini-writer/`). Sędzia nie wie, skąd dokument przyszedł,
 * i nie ma prawa się tego domyślać — dokładnie tak, jak
 * sędzia Scratcha nie wie, czy program przyszedł z pliku, czy z warsztatu
 * (`blocks-to-project.ts`).
 *
 * Model niesie to, co się liczy w werdyktach, a nie to, co niósł plik:
 * akapit ze stylem i wyrównaniem, przebiegi z krojem, kolorem i pogrubieniem,
 * listy, tabele, obrazy, odnośniki. Nie ma tu nic o formacie zapisu.
 */

export interface DocRun {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  /** Kolor liter jako `#rrggbb`, gdy ustawiony jawnie. */
  color: string | null;
  /** Kolor zakreślacza — w `.docx` bywa nazwą („green”), w `.odt` liczbą. */
  highlight: string | null;
  font: string | null;
  /** Rozmiar w punktach. */
  size: number | null;
}

export interface DocParagraph {
  text: string;
  runs: DocRun[];
  /** Nazwa stylu dokładnie tak, jak zapisał ją program. */
  style: string | null;
  /** Poziom nagłówka 1–6; styl „Tytuł” liczymy jako 1. `null` dla zwykłego tekstu. */
  heading: number | null;
  /** Akapit jest pozycją listy numerowanej albo punktowanej. */
  list: boolean;
  /**
   * Punktor **wpisany z klawiatury** („- ”, „1. ”), a nie zrobiony przyciskiem
   * listy. Z samego `list` tego nie widać, a to jest cała różnica, której uczy
   * lekcja o listach: lista z przycisku sama się przenumeruje i sama wyrówna,
   * myślniki nie zrobią ani jednego, ani drugiego.
   */
  typedBullet: boolean;
  /**
   * Lista **numerowana** (`true`) czy wypunktowana (`false`); `null`, gdy to nie
   * jest lista albo gdy format nie mówi tego wprost. Rozróżnienie jest tu nie
   * dla ozdoby: lekcja o listach uczy dokładnie tej różnicy, więc odtwarzanie
   * cudzej listy zawsze kropkami byłoby drobnym kłamstwem akurat w tym miejscu.
   */
  ordered: boolean | null;
  align: 'left' | 'center' | 'right' | 'justify' | null;
  /** W akapicie siedzi obraz. */
  hasImage: boolean;
  /**
   * Jak obraz stoi w tekście: `inline` — jako wielka litera w wierszu,
   * `float` — z tekstem opływającym go dookoła. `null`, gdy obrazu nie ma.
   * Lekcja o ilustracji i tabeli jest wprost o tej różnicy, więc model musi ją
   * nieść — z samego „jest obraz” nie da się o niej powiedzieć nic.
   */
  imageWrap: 'inline' | 'float' | null;
  /** Ręczne złamania wiersza w środku akapitu (Shift+Enter). */
  breaks: number;
}

export interface DocTable {
  rows: number;
  columns: number;
  /** Treść komórek wiersz po wierszu — puste komórki zostają pustymi napisami. */
  cells: string[][];
}

/** To, co sędziowie czytają z dokumentu — bez śladu po tym, skąd dokument przyszedł. */
export interface DocContent {
  paragraphs: DocParagraph[];
  tables: DocTable[];
  /** Osadzone obrazy — po jednym wpisie na obraz (ścieżka w pliku albo nazwa z banku). */
  images: string[];
  /** Odnośniki zewnętrzne — z relacji dokumentu i z samego tekstu. */
  links: string[];
  /** Cały tekst, akapit po akapicie. */
  text: string;
  words: number;
}

/* ------------------------------------------------------------------ */
/* Style                                                               */
/* ------------------------------------------------------------------ */

const TITLE_STYLES = ['title', 'tytu', 'tytul', 'tytuł', 'titel', 'titre'];
const HEADING_STYLES = ['heading', 'nagwek', 'naglowek', 'nagłówek', 'berschrift', 'rubrik'];

/** Nazwa stylu sprowadzona do postaci, w której Word, LibreOffice i Google są zgodni. */
function normalizeStyle(name: string): string {
  return name
    .replace(/_20_/g, ' ')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Poziom nagłówka z nazwy stylu; styl „Tytuł” liczymy jako poziom 1. */
export function headingLevel(style: string | null): number | null {
  if (!style) return null;
  const name = normalizeStyle(style);
  if (TITLE_STYLES.includes(name)) return 1;
  const match = name.match(/^([a-zżźćńółęąś]+)\s*(\d)$/);
  if (!match) return null;
  return HEADING_STYLES.includes(match[1]) ? Number(match[2]) : null;
}

/** Czy ten styl to „Tytuł”, a nie „Nagłówek 1” — po tym poznajemy tytuł główny dokumentu. */
export function isTitleStyle(style: string | null): boolean {
  return style != null && TITLE_STYLES.includes(normalizeStyle(style));
}

/* ------------------------------------------------------------------ */
/* Kolory                                                              */
/* ------------------------------------------------------------------ */

/** Kolor `#rrggbb` / `RRGGBB` / `auto` na składowe. `auto` i nazwy własne oddają `null`. */
export function parseColor(value: string | null): { r: number; g: number; b: number } | null {
  if (!value) return null;
  const hex = value.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

/** Czy ten kolor czyta się jako zielony — z liter albo z zakreślacza. */
export function isGreen(color: string | null, highlight: string | null): boolean {
  /* `.docx` nazywa kolory zakreślacza słowem, `.odt` zapisuje je szesnastkowo. */
  if (highlight && /green/i.test(highlight)) return true;
  for (const value of [color, highlight]) {
    const rgb = parseColor(value);
    if (rgb && rgb.g > 70 && rgb.g > rgb.r * 1.25 && rgb.g > rgb.b * 1.25) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Tekst                                                               */
/* ------------------------------------------------------------------ */

/** Punktor wpisany z palca — w zwykłym tekście to jedyna lista, jaka istnieje. */
export const BULLET = /^\s*([-*•·–—]|\d+[.)])\s+/;

const URL_PATTERN = /https?:\/\/[^\s<>"')]+/g;

/**
 * Domyka dokument: składa cały tekst, liczy wyrazy i dopisuje do odnośników te,
 * które stoją w samym tekście. **Jedna droga dla parsera i dla edytora** — dzięki
 * niej `text`, `words` i `links` znaczą to samo, skądkolwiek dokument przyszedł.
 */
export function finishDoc(parts: {
  paragraphs: DocParagraph[];
  tables: DocTable[];
  images: string[];
  /** Odnośniki znane z samego dokumentu (relacje, `text:a`), jeszcze bez tych z tekstu. */
  links?: string[];
}): DocContent {
  const text = parts.paragraphs.map((paragraph) => paragraph.text).join('\n');
  const links = [...(parts.links ?? []), ...(text.match(URL_PATTERN) ?? [])];
  return {
    paragraphs: parts.paragraphs,
    tables: parts.tables,
    images: parts.images,
    links: Array.from(new Set(links)),
    text,
    words: text.split(/\s+/).filter(Boolean).length,
  };
}
