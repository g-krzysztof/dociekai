/**
 * Dane i czysta logika zadania **Z-2** w wersji „w lekcji”: trzy źródła, w
 * których dziecko tropi nazwy programów, zastosowania do wyboru i licencje.
 * Widżet (`program-hunt.tsx`) tylko to rysuje.
 *
 * Każde źródło ma inny kształt (pulpit z ikonami, wiadomość, gazetka) i każde
 * niesie programy do WSZYSTKICH czterech zastosowań — dzięki temu spis złożony z
 * trzech zastosowań sam z siebie korzysta z kilku źródeł, tak jak każe treść
 * zadania. Pułapki (plik, folder, system, firma, pakiet, nośnik) są po to, żeby
 * „program” przestał być każdym słowem, które kojarzy się z komputerem.
 */

export type PurposeId = 'tekst' | 'rysunek' | 'liczby' | 'pokaz';

export const PURPOSES: { id: PurposeId; label: string; forWhat: string }[] = [
  { id: 'tekst', label: 'Pisanie tekstu', forWhat: 'do pisania tekstu' },
  { id: 'rysunek', label: 'Rysowanie i zdjęcia', forWhat: 'do rysowania i zdjęć' },
  { id: 'liczby', label: 'Obliczenia i tabele', forWhat: 'do obliczeń i tabel' },
  { id: 'pokaz', label: 'Prezentacje', forWhat: 'do prezentacji' },
];

export type License = 'platny' | 'darmowy' | 'open';

export const LICENSE_LABEL: Record<License, string> = {
  platny: 'płatny',
  darmowy: 'darmowy',
  open: 'open source',
};

export type SourceId = 'pulpit' | 'wiadomosc' | 'gazetka';

export interface Program {
  id: string;
  name: string;
  purpose: PurposeId;
  license: License;
  source: SourceId;
}

export const PROGRAMS: Program[] = [
  /* Pulpit w pracowni */
  { id: 'notatnik', name: 'Notatnik', purpose: 'tekst', license: 'darmowy', source: 'pulpit' },
  { id: 'paint', name: 'Paint', purpose: 'rysunek', license: 'darmowy', source: 'pulpit' },
  { id: 'writer', name: 'LibreOffice Writer', purpose: 'tekst', license: 'open', source: 'pulpit' },
  { id: 'calc', name: 'LibreOffice Calc', purpose: 'liczby', license: 'open', source: 'pulpit' },
  {
    id: 'impress',
    name: 'LibreOffice Impress',
    purpose: 'pokaz',
    license: 'open',
    source: 'pulpit',
  },
  /* Wiadomość od kuzynki */
  { id: 'krita', name: 'Krita', purpose: 'rysunek', license: 'open', source: 'wiadomosc' },
  { id: 'gimp', name: 'GIMP', purpose: 'rysunek', license: 'open', source: 'wiadomosc' },
  {
    id: 'docs',
    name: 'Dokumenty Google',
    purpose: 'tekst',
    license: 'darmowy',
    source: 'wiadomosc',
  },
  {
    id: 'sheets',
    name: 'Arkusze Google',
    purpose: 'liczby',
    license: 'darmowy',
    source: 'wiadomosc',
  },
  {
    id: 'slides',
    name: 'Prezentacje Google',
    purpose: 'pokaz',
    license: 'darmowy',
    source: 'wiadomosc',
  },
  /* Gazetka sklepu */
  { id: 'word', name: 'Microsoft Word', purpose: 'tekst', license: 'platny', source: 'gazetka' },
  { id: 'excel', name: 'Microsoft Excel', purpose: 'liczby', license: 'platny', source: 'gazetka' },
  {
    id: 'powerpoint',
    name: 'Microsoft PowerPoint',
    purpose: 'pokaz',
    license: 'platny',
    source: 'gazetka',
  },
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    purpose: 'rysunek',
    license: 'platny',
    source: 'gazetka',
  },
];

export const programById = (id: string) => PROGRAMS.find((program) => program.id === id)!;

/* ── Źródła ───────────────────────────────────────────────────────────────── */

/** Coś, co wygląda na program, a nim nie jest. `note` mówi dziecku, czym jest naprawdę. */
export interface Trap {
  trap: string;
  text: string;
  note: string;
}

export type IconKind = 'tekst' | 'rysunek' | 'liczby' | 'pokaz' | 'folder' | 'plik' | 'kosz';

export type DesktopItem =
  | { kind: 'program'; id: string; icon: IconKind }
  | { kind: 'trap'; trap: string; label: string; icon: IconKind; note: string };

export const DESKTOP: DesktopItem[] = [
  { kind: 'program', id: 'notatnik', icon: 'tekst' },
  {
    kind: 'trap',
    trap: 'kosz',
    label: 'Kosz',
    icon: 'kosz',
    note: 'Kosz to miejsce na usunięte pliki, a nie program do pracy.',
  },
  { kind: 'program', id: 'writer', icon: 'tekst' },
  { kind: 'program', id: 'paint', icon: 'rysunek' },
  {
    kind: 'trap',
    trap: 'folder',
    label: 'Zdjęcia z wycieczki',
    icon: 'folder',
    note: 'To folder, czyli pudełko na pliki. Nic się w nim nie tworzy.',
  },
  { kind: 'program', id: 'calc', icon: 'liczby' },
  {
    kind: 'trap',
    trap: 'plik',
    label: 'referat.docx',
    icon: 'plik',
    note: 'To plik, nie program. Powstał w edytorze tekstu, ale sam niczego nie edytuje.',
  },
  { kind: 'program', id: 'impress', icon: 'pokaz' },
];

/** Fragment tekstu źródła: zwykły tekst, nazwa programu (w formie z tekstu) albo pułapka. */
export type TextPart = string | { program: string; text: string } | Trap;

export interface Message {
  parts: TextPart[];
}

export const CHAT: Message[] = [
  { parts: ['Hej! Do rysowania mam ', { program: 'krita', text: 'Kritę' }, ', jest za darmo.'] },
  {
    parts: [
      { program: 'gimp', text: 'GIMP' },
      ' też jest spoko, tylko ma strasznie dużo przycisków.',
    ],
  },
  {
    parts: [
      'Referat pisałam w ',
      { program: 'docs', text: 'Dokumentach Google' },
      ', a kieszonkowe liczę w ',
      { program: 'sheets', text: 'Arkuszach Google' },
      '.',
    ],
  },
  {
    parts: [
      'Prezentację o kosmosie zrobiłam w ',
      { program: 'slides', text: 'Prezentacjach Google' },
      '. Wszystko mam na koncie ',
      {
        trap: 'google',
        text: 'Google',
        note: 'Google to firma, a nie program. Jej programy mają własne nazwy, np. Dokumenty Google.',
      },
      ', więc widzę to też na ',
      {
        trap: 'telefon',
        text: 'telefonie',
        note: 'Telefon to urządzenie. Programy dopiero na nim działają.',
      },
      '.',
    ],
  },
];

export interface Offer {
  title: TextPart[];
  body: TextPart[];
  badge: string;
}

export const LEAFLET: Offer[] = [
  {
    title: [
      'Pakiet ',
      {
        trap: 'pakiet',
        text: 'Microsoft 365',
        note: 'To pakiet, czyli kilka programów sprzedawanych razem. Ich nazwy stoją w zdaniu obok.',
      },
    ],
    body: [
      { program: 'word', text: 'Word' },
      ', ',
      { program: 'excel', text: 'Excel' },
      ' i ',
      { program: 'powerpoint', text: 'PowerPoint' },
      ' w jednym abonamencie na rok.',
    ],
    badge: 'abonament',
  },
  {
    title: [{ program: 'photoshop', text: 'Adobe Photoshop' }],
    body: ['Dla fotografów i grafików. Płacisz co miesiąc.'],
    badge: 'co miesiąc',
  },
  {
    title: ['Laptop szkolny'],
    body: [
      'Z systemem ',
      {
        trap: 'system',
        text: 'Windows 11',
        note: 'Windows to system operacyjny. Uruchamia programy, ale sam nie służy do pisania ani rysowania.',
      },
      ', a do tego ',
      {
        trap: 'pendrive',
        text: 'pendrive',
        note: 'Pendrive to nośnik danych, nie program. Pamiętasz z lekcji o nośnikach?',
      },
      ' w prezencie!',
    ],
    badge: 'promocja',
  },
];

export const SOURCES: { id: SourceId; label: string; kind: string }[] = [
  { id: 'pulpit', label: 'Pulpit w pracowni', kind: 'komputer' },
  { id: 'wiadomosc', label: 'Wiadomość od Oli', kind: 'kuzynka' },
  { id: 'gazetka', label: 'Gazetka sklepu', kind: 'ulotka' },
];

/** Ile programów trzeba wytropić w każdym źródle, żeby przejść do spisu. */
export const MIN_PER_SOURCE = 3;

export const programsIn = (source: SourceId) =>
  PROGRAMS.filter((program) => program.source === source);

/* ── Spis ─────────────────────────────────────────────────────────────────── */

export const MIN_PER_PURPOSE = 2;
export const MAX_PER_PURPOSE = 3;

export type Placement = Partial<Record<PurposeId, string[]>>;

/** Zdanie, gdy program trafia pod złe zastosowanie. Mówi, do czego służy, nie gdzie go położyć. */
export function wrongPlaceHint(program: Program, purpose: PurposeId): string {
  const right = PURPOSES.find((item) => item.id === program.purpose)!;
  const wrong = PURPOSES.find((item) => item.id === purpose)!;
  return `${program.name} to program ${right.forWhat}, a nie ${wrong.forWhat}.`;
}

export function listDone(purposes: PurposeId[], placed: Placement): boolean {
  return (
    purposes.length === 3 &&
    purposes.every((purpose) => (placed[purpose]?.length ?? 0) >= MIN_PER_PURPOSE)
  );
}

/** Spis jako zwykły tekst — do zapisania w pliku `.txt`. */
export function listAsText(purposes: PurposeId[], placed: Placement): string {
  const lines = ['Programy i ich zastosowania', ''];
  for (const purpose of purposes) {
    lines.push(PURPOSES.find((item) => item.id === purpose)!.label);
    for (const id of placed[purpose] ?? []) {
      const program = programById(id);
      lines.push(`- ${program.name} (${LICENSE_LABEL[program.license]})`);
    }
    lines.push('');
  }
  return lines.join('\r\n');
}
