/**
 * L18 blok 2 — „Ręka wchodzi na scenę” (T-L18-2, scena napisana dla kursu).
 * Tymek gubi szalik na lodowisku; Ola przy budce widzi więcej niż on.
 *
 * Każde zdanie ma dwie wersje: narrator z boku (`zBoku`) i narrator-bohater
 * (`ja`, Tymek mówi o sobie). Zdanie, które dzieje się **poza reflektorem**
 * (za plecami Tymka, przy budce), nie ma wersji „ja” — Tymek tego nie widzi.
 * Rozstrzyga miejsce na scenie (`gdzie`), nie nasza lista.
 */

/** Strefy sceny lodowiska: Tymek w reflektorze, budka i miejsce za jego plecami w ciemności. */
export type Gdzie = 'tymek' | 'za-plecami' | 'budka';

export const W_REFLEKTORZE: Record<Gdzie, boolean> = { tymek: true, 'za-plecami': false, budka: false };

export interface ZdanieSceny {
  id: string;
  zBoku: string;
  /** Tylko dla zdań w reflektorze. */
  ja?: string;
  gdzie: Gdzie;
}

/** Część A: sześć zdań sceny. */
export const SCENA: ZdanieSceny[] = [
  {
    id: 'z1',
    zBoku: 'Tymek jechał tyłem przez środek lodowiska i śmiał się na całe gardło.',
    ja: 'Jechałem tyłem przez środek lodowiska i śmiałem się na całe gardło.',
    gdzie: 'tymek',
  },
  { id: 'z2', zBoku: 'Nagle poczuł chłód na szyi.', ja: 'Nagle poczułem chłód na szyi.', gdzie: 'tymek' },
  { id: 'z3', zBoku: 'W tym czasie Ola stała przy budce z herbatą i zauważyła na lodzie coś czerwonego.', gdzie: 'budka' },
  {
    id: 'z4',
    zBoku: 'Tymek złapał się bandy i pomacał szyję — szalika nie było.',
    ja: 'Złapałem się bandy i pomacałem szyję — szalika nie było.',
    gdzie: 'tymek',
  },
  { id: 'z5', zBoku: 'Za jego plecami Ola podniosła szalik z lodu i schowała go za siebie.', gdzie: 'za-plecami' },
  {
    id: 'z6',
    zBoku: 'Tymek westchnął, bo mama robiła ten szalik na drutach przez całą zimę.',
    ja: 'Westchnąłem, bo mama robiła ten szalik na drutach przez całą zimę.',
    gdzie: 'tymek',
  },
];

/** Część B: ciąg dalszy na kartkach — do ust Tymka albo do ręki zza kulis. Kolejność opowieści = kolejność tablicy. */
export const KARTKI: ZdanieSceny[] = [
  { id: 'k1', zBoku: 'Ola zawiązała szalik na kiju od hokeja i po cichu podjechała za Tymka.', gdzie: 'za-plecami' },
  { id: 'k2', zBoku: 'Pani z budki pokręciła głową i uśmiechnęła się pod nosem.', gdzie: 'budka' },
  { id: 'k3', zBoku: 'Ktoś klepnął Tymka w ramię.', ja: 'Ktoś klepnął mnie w ramię.', gdzie: 'tymek' },
  {
    id: 'k4',
    zBoku: 'Tymek odwrócił się i zobaczył swój szalik na kiju od hokeja.',
    ja: 'Odwróciłem się i zobaczyłem swój szalik na kiju od hokeja.',
    gdzie: 'tymek',
  },
];

/** Kolejność, w jakiej kartki leżą na stole (rozrzucone, nie po kolei opowieści). */
export const KARTKI_NA_STOLE = ['k3', 'k1', 'k4', 'k2'];

export type Cel = 'usta' | 'reka';

export type WerdyktKartki = { ok: true } | { ok: false; powod: 'nie-widzi' | 'wie-sam' };

/**
 * Tymek opowiada dalej sam; ręka zza kulis dopowiada tylko to, czego on nie
 * może wiedzieć. Usta przyjmują zdanie z reflektora, ręka — spoza niego.
 */
export function wloz(k: ZdanieSceny, cel: Cel): WerdyktKartki {
  const widzi = W_REFLEKTORZE[k.gdzie];
  if (cel === 'usta') return widzi ? { ok: true } : { ok: false, powod: 'nie-widzi' };
  return widzi ? { ok: false, powod: 'wie-sam' } : { ok: true };
}

export const POWOD: Record<'nie-widzi' | 'wie-sam', string> = {
  'nie-widzi': 'Tymek stoi tyłem — tego nie widzi. Skąd miałby to wiedzieć? Niech opowie to ktoś z boku.',
  'wie-sam': 'To dzieje się w świetle, przy Tymku — on wie to sam. Niech powie to swoimi słowami.',
};

/** Opowieść po części B: zdania w kolejności, każde w wersji tego, kto je mówi. */
export function opowiesc(rozlozone: Partial<Record<string, Cel>>): { id: string; tekst: string; kto: Cel }[] {
  return KARTKI.filter((k) => rozlozone[k.id]).map((k) => {
    const kto = rozlozone[k.id]!;
    return { id: k.id, kto, tekst: kto === 'usta' ? (k.ja ?? k.zBoku) : k.zBoku };
  });
}

export const wszystkieRozlozone = (rozlozone: Partial<Record<string, Cel>>) => KARTKI.every((k) => rozlozone[k.id]);
