/**
 * Jedna tabela pojemności dla całej lekcji: karmi listę nośników i rzeczy do
 * zapisania w `MediaFit` oraz płyty, do których dziecko sypie dyskietki w
 * zadaniu Z-1 (`pour.ts`). Wszystkie liczby w megabajtach; skoki liczymy po
 * 1000 (patrz uwaga w `ByteLadder`).
 *
 * Nie wpisuj tych samych pojemności drugi raz w JSX — bierz je stąd.
 */

/** Dyskietka 3,5 cala — punkt odniesienia dla porównań z Z-1. */
export const FLOPPY_MB = 1.44;

export interface Medium {
  id: string;
  name: string;
  /** Pełny opis pojemności, np. „4,7 GB”. */
  capacityLabel: string;
  /** Pojemność w MB; `Infinity` dla chmury. */
  mb: number;
  /** Krótka uwaga pod nazwą. */
  note: string;
}

export const MEDIA: Medium[] = [
  {
    id: 'dyskietka',
    name: 'Dyskietka 3,5″',
    capacityLabel: '1,44 MB',
    mb: FLOPPY_MB,
    note: 'lata 90., dziś już nieużywana',
  },
  {
    id: 'cd',
    name: 'Płyta CD',
    capacityLabel: '700 MB',
    mb: 700,
    note: 'muzyka, programy',
  },
  {
    id: 'dvd',
    name: 'Płyta DVD',
    capacityLabel: '4,7 GB',
    mb: 4700,
    note: 'film pełnometrażowy',
  },
  {
    id: 'bd',
    name: 'Płyta Blu-ray (BD)',
    capacityLabel: '25 GB',
    mb: 25_000,
    note: 'film w wysokiej jakości',
  },
  {
    id: 'pendrive',
    name: 'Pendrive',
    capacityLabel: '64 GB',
    mb: 64_000,
    note: 'nosisz w kieszeni',
  },
  {
    id: 'dysk',
    name: 'Dysk zewnętrzny',
    capacityLabel: '2 TB',
    mb: 2_000_000,
    note: 'kopia całego komputera',
  },
  {
    id: 'chmura',
    name: 'Chmura',
    capacityLabel: 'praktycznie bez limitu',
    mb: Infinity,
    note: 'potrzebny internet i zaufanie do firmy',
  },
];

export interface Payload {
  id: string;
  name: string;
  sizeLabel: string;
  mb: number;
}

export const PAYLOADS: Payload[] = [
  { id: 'zdjecie', name: 'Jedno zdjęcie z telefonu', sizeLabel: 'ok. 4 MB', mb: 4 },
  { id: 'album', name: 'Album z wakacji — 300 zdjęć', sizeLabel: 'ok. 1,2 GB', mb: 1200 },
  { id: 'film', name: 'Film na wieczór', sizeLabel: 'ok. 4 GB', mb: 4000 },
  { id: 'backup', name: 'Kopia całego twojego laptopa', sizeLabel: 'ok. 250 GB', mb: 250_000 },
];

/** Czy `payload` mieści się na jednym egzemplarzu nośnika. */
export const fits = (payloadMb: number, mediumMb: number): boolean => payloadMb <= mediumMb;

/** Ile razy `payload` mieści się na jednym nośniku (0, gdy się nie mieści). */
export const howMany = (mediumMb: number, payloadMb: number): number =>
  Math.floor(mediumMb / payloadMb);

/** Ile egzemplarzy nośnika trzeba, żeby pomieścić `payload`. */
export const unitsNeeded = (payloadMb: number, mediumMb: number): number =>
  mediumMb === Infinity ? 1 : Math.ceil(payloadMb / mediumMb);

/** Płyty, które w lekcji porównujemy z dyskietką (CD, DVD, BD). */
export const DISC_IDS = ['cd', 'dvd', 'bd'] as const;
