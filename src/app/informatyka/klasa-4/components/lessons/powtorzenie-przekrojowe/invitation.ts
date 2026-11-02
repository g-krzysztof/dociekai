/**
 * Zaproszenie — czysta logika zadania z bloku 3: model plakatu, kontrast
 * napisu liczony ze wzoru WCAG, czytelniczka Zosia i werdykt w pięciu punktach.
 * Bez Reacta, więc da się to uruchomić w Node i sprawdzić przed wpięciem w UI.
 *
 * Plakat zbiera w jednym miejscu pięć umiejętności z różnych działów roku:
 * kontrast napisu na obrazku (grafika), wyróżnianie tylko tego, co ważne
 * (dokumenty), prawdziwa lista zamiast myślników (dokumenty), licencja i
 * podpis autora zdjęcia (prawo autorskie) oraz sprawdzenie efektu okiem kogoś,
 * kto plakatu nie budował (projekt roczny).
 */

export type Photo = 'szkola' | 'boisko';
export type TitleColor = 'bialy' | 'granat' | 'zolty' | 'czarny';
export type LineId = 'haslo' | 'data' | 'miejsce' | 'atrakcje' | 'stopka';

export interface Poster {
  photo: Photo;
  color: TitleColor;
  /** Ciemny pas pod tytułem. */
  band: boolean;
  bold: Record<LineId, boolean>;
  /** `true` — atrakcje są prawdziwą listą; `false` — wpisane ręcznie myślniki. */
  realList: boolean;
  credit: boolean;
}

export const LINES: { id: LineId; label: string; text: string }[] = [
  { id: 'haslo', label: 'hasło', text: 'Przyjdź, zobacz, spróbuj!' },
  { id: 'data', label: 'data', text: 'sobota, 14 czerwca · godz. 10:00' },
  { id: 'miejsce', label: 'miejsce', text: 'sala 12, Szkoła Podstawowa nr 5' },
  { id: 'atrakcje', label: 'atrakcje', text: '' },
  { id: 'stopka', label: 'stopka', text: 'Wstęp wolny — zapraszamy całe rodziny' },
];

export const ATTRACTIONS = [
  'pokaz robotów i drukarki 3D',
  'quiz z nagrodami dla całej rodziny',
  'warsztaty w Scratchu: zrób własną grę',
];

export const PHOTOS: Record<Photo, { name: string; author: string; license: string; allowed: boolean }> = {
  szkola: { name: 'Szkoła od frontu', author: 'Anna Wrona', license: 'CC BY 4.0 — wolno używać, trzeba podpisać autora', allowed: true },
  boisko: { name: 'Dzieci na boisku', author: 'nieznany autor', license: 'wszelkie prawa zastrzeżone — bez zgody nie wolno', allowed: false },
};

export const TITLE_COLORS: Record<TitleColor, { label: string; hex: string }> = {
  bialy: { label: 'biały', hex: '#ffffff' },
  granat: { label: 'granatowy', hex: '#1e3a8a' },
  zolty: { label: 'żółty', hex: '#facc15' },
  czarny: { label: 'czarny', hex: '#111827' },
};

/** Niebo w miejscu, gdzie leży tytuł — to samo na obu zdjęciach. */
export const SKY = '#cfe8fb';
/** Ciemny pas pod tytułem: kolor i krycie. */
export const BAND = { hex: '#0f172a', alpha: 0.78 } as const;

export const INITIAL_POSTER: Poster = {
  photo: 'boisko',
  color: 'bialy',
  band: false,
  bold: { haslo: true, data: true, miejsce: true, atrakcje: true, stopka: true },
  realList: false,
  credit: false,
};

/* ------------------------------------------------------------------ */
/* Kontrast                                                            */
/* ------------------------------------------------------------------ */

type Rgb = [number, number, number];

const toRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

function luminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Kolor tła pod tytułem: niebo albo niebo przykryte ciemnym pasem. */
export function titleBackground(band: boolean): Rgb {
  const sky = toRgb(SKY);
  if (!band) return sky;
  const dark = toRgb(BAND.hex);
  return [0, 1, 2].map((i) => Math.round(dark[i] * BAND.alpha + sky[i] * (1 - BAND.alpha))) as Rgb;
}

/** Współczynnik kontrastu WCAG między kolorem napisu a tłem pod nim (1–21). */
export function titleContrast(poster: Pick<Poster, 'color' | 'band'>): number {
  const a = luminance(toRgb(TITLE_COLORS[poster.color].hex));
  const b = luminance(titleBackground(poster.band));
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 10) / 10;
}

export const MIN_CONTRAST = 4.5;

/* ------------------------------------------------------------------ */
/* Zosia czyta plakat przez cztery sekundy                              */
/* ------------------------------------------------------------------ */

export interface Report {
  co: boolean;
  kiedy: boolean;
  gdzie: boolean;
  /** Zdanie Zosi — mówi, co przeszkodziło. */
  words: string;
}

export const boldCount = (poster: Poster) => (Object.values(poster.bold) as boolean[]).filter(Boolean).length;

/**
 * Cztery sekundy to czas na rzut oka. Zosia czyta tytuł, jeśli da się go
 * odczytać, a **z reszty zapamiętuje tylko to, co wyróżnione** — i to pod
 * warunkiem, że wyróżnień jest mało. Gdy pogrubione jest prawie wszystko,
 * oko nie ma się czego uchwycić.
 */
export function readPoster(poster: Poster): Report {
  const co = titleContrast(poster) >= MIN_CONTRAST;
  const crowded = boldCount(poster) > 3;
  const kiedy = poster.bold.data && !crowded;
  const gdzie = poster.bold.miejsce && !crowded;

  const parts: string[] = [];
  if (!co) parts.push('Tytułu prawie nie widać na tle nieba.');
  if (crowded) parts.push('Wszystko jest pogrubione, więc nie wiem, na czym zawiesić wzrok.');
  else {
    if (!kiedy) parts.push('Nie zauważyłam, kiedy to jest.');
    if (!gdzie) parts.push('Nie zauważyłam, gdzie to jest.');
  }
  const words = parts.length
    ? parts.join(' ')
    : 'Dzień Otwarty klasy 4, w sobotę 14 czerwca o 10:00, w sali 12. Wszystko jasne!';
  return { co, kiedy, gdzie, words };
}

/* ------------------------------------------------------------------ */
/* Werdykt                                                             */
/* ------------------------------------------------------------------ */

export interface Verdict {
  id: 'kontrast' | 'wyroznienia' | 'lista' | 'zdjecie' | 'zosia';
  title: string;
  ok: boolean;
  reason: string;
}

const polishList = (ids: string[]) => ids.join(', ');

/** Polski zapis liczby: przecinek dziesiętny. */
const dec = (value: number) => String(value).replace('.', ',');

export function judge(poster: Poster, report: Report | null): Verdict[] {
  const contrast = titleContrast(poster);
  const boldNames = LINES.filter((line) => poster.bold[line.id]).map((line) => line.label);
  const onlyKey = poster.bold.data && poster.bold.miejsce && boldCount(poster) === 2;
  const photo = PHOTOS[poster.photo];

  let photoReason: string;
  let photoOk = false;
  if (!photo.allowed) {
    photoReason = `To zdjęcie ma „${photo.license}”. Wybierz takie, którego wolno użyć.`;
  } else if (!poster.credit) {
    photoReason = 'Licencja CC BY pozwala użyć zdjęcia, ale wymaga podpisu autora — dopisz go pod plakatem.';
  } else {
    photoOk = true;
    photoReason = `Zdjęcie ma licencję CC BY, a autor (${photo.author}) jest podpisany.`;
  }

  return [
    {
      id: 'kontrast',
      title: 'Tytuł da się przeczytać',
      ok: contrast >= MIN_CONTRAST,
      reason:
        contrast >= MIN_CONTRAST
          ? `Kontrast tytułu z tłem to ${dec(contrast)} : 1 — wystarczy.`
          : `Kontrast tytułu z tłem to tylko ${dec(contrast)} : 1 (trzeba co najmniej ${dec(MIN_CONTRAST)}). Zmień kolor napisu albo dodaj ciemny pas pod nim.`,
    },
    {
      id: 'wyroznienia',
      title: 'Wyróżnione są tylko data i miejsce',
      ok: onlyKey,
      reason: onlyKey
        ? 'Pogrubione są dokładnie data i miejsce — oko od razu wie, gdzie patrzeć.'
        : `Pogrubione jest: ${polishList(boldNames) || 'nic'}. Ma zostać data i miejsce — gdy wyróżnia się wszystko, nic nie jest ważne.`,
    },
    {
      id: 'lista',
      title: 'Atrakcje to prawdziwa lista',
      ok: poster.realList,
      reason: poster.realList
        ? 'Lista ma własny styl, więc zachowa wcięcia przy każdym rozmiarze druku.'
        : 'To ręcznie wpisane myślniki. Powiększ druk i zobacz, jak drugi wiersz wsuwa się pod myślnik — lista z prawdziwego stylu by tego nie zrobiła.',
    },
    { id: 'zdjecie', title: 'Zdjęcie wolno użyć i ma podpis autora', ok: photoOk, reason: photoReason },
    {
      id: 'zosia',
      title: 'Zosia po czterech sekundach wie: co, kiedy, gdzie',
      ok: Boolean(report && report.co && report.kiedy && report.gdzie),
      reason: !report
        ? 'Nikt jeszcze nie spojrzał na ten plakat. Pokaż go Zosi — autor swojego plakatu nie oceni.'
        : report.co && report.kiedy && report.gdzie
          ? 'Zosia odczytała wszystko z jednego rzutu oka.'
          : `Zosia powiedziała: „${report.words}”`,
    },
  ];
}
