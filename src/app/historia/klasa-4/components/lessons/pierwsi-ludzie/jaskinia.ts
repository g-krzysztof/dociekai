/**
 * Malowidła w jaskini (L15, blok 4) — czysta logika. Ściana to prawdziwa
 * fotografia z jaskini Lascaux (Francja, malowidła sprzed ok. 17 tys. lat;
 * Wikimedia Commons, „Lascaux painting.jpg”, domena publiczna). Dziecko
 * oświetla ją pochodnią; postać „znaleziona”, gdy środek światła chwilę na
 * niej stoi. Potem przykłada wnioski do ściany: wniosek przyjmujemy tylko,
 * gdy da się wskazać na ścianie, skąd go wiemy — albo odkłada go na półkę
 * „ściana milczy”.
 */

export type FigureId = 'tur' | 'kon' | 'jelen' | 'znaki';

export interface Figure {
  id: FigureId;
  /** Środek i promień w procentach szerokości kadru (y w procentach wysokości). */
  x: number;
  y: number;
  r: number;
  name: string;
  found: string;
  /** Podpowiedź, gdy zostaje tylko ta postać. */
  hint: string;
}

/** Położenia na fotografii 720 × 472 (sprawdzone na kadrze). */
export const FIGURES: Figure[] = [
  { id: 'tur', x: 22, y: 42, r: 12, name: 'tur', found: 'Wielki byk z rogami — to tur, dziki przodek krowy. Tury żyły też na ziemiach Polski.', hint: 'Został wielki, biały byk z rogami — po lewej stronie ściany.' },
  { id: 'kon', x: 46, y: 18, r: 10, name: 'koń', found: 'Koń z ciemną grzywą — dziki koń, niski i krępy.', hint: 'Został ciemny koń — u góry, pośrodku ściany.' },
  { id: 'jelen', x: 40, y: 64, r: 8, name: 'jeleń', found: 'Mały czerwony jeleń z rozłożystym porożem.', hint: 'Został mały czerwony jeleń — pod pyskiem białego byka.' },
  { id: 'znaki', x: 33, y: 43.5, r: 6.5, name: 'kreski', found: 'Rząd czerwonych kresek. Ktoś je namalował celowo — ale po co?', hint: 'Została rzecz mała: rząd krótkich CZERWONYCH kresek tuż obok rogów białego byka. Czarne kreski po prawej to część innego zwierzęcia.' },
];

/** Ile milisekund środek światła musi stać na postaci. */
export const DWELL_MS = 450;

/** Postać pod światłem (x, y w procentach kadru; `aspect` = wysokość / szerokość). */
export function figureAt(x: number, y: number, aspect: number, already: readonly FigureId[] = []): Figure | null {
  let best: Figure | null = null;
  let bestD = Infinity;
  for (const f of FIGURES) {
    if (already.includes(f.id)) continue;
    const dx = x - f.x;
    const dy = (y - f.y) * aspect;
    const d = Math.hypot(dx, dy);
    if (d <= f.r && d / f.r < bestD) {
      best = f;
      bestD = d / f.r;
    }
  }
  return best;
}

export type ProofTarget = FigureId | 'milczy';

export interface Claim {
  id: string;
  text: string;
  proof: ProofTarget;
  /** Odrzut, gdy dziecko położy wniosek nie tam. */
  why: string;
}

export const CLAIMS: Claim[] = [
  { id: 'konie', text: 'Malarze znali konie.', proof: 'kon', why: 'Wskaż zwierzę, które to pokazuje — konia z ciemną grzywą.' },
  { id: 'tury', text: 'W ich okolicy żyły tury — dziś już wymarłe.', proof: 'tur', why: 'Tury to wielkie byki z rogami.' },
  { id: 'jelenie', text: 'Znali jelenie.', proof: 'jelen', why: 'Jeleń jest mały i czerwony, ma rozłożyste poroże.' },
  { id: 'kreski', text: 'Wiemy, co znaczą czerwone kreski.', proof: 'milczy', why: 'Kreski widać — ale ściana nie mówi, co znaczą. Badacze się o to spierają.' },
  { id: 'imiona', text: 'Wiemy, jak malarze nazywali konia.', proof: 'milczy', why: 'Na ścianie nie ma żadnego pisma — słów sprzed 17 tysięcy lat nie znamy.' },
];

export function judgeClaim(claim: Claim, target: ProofTarget): { ok: boolean; text: string } {
  if (claim.proof === target) {
    return claim.proof === 'milczy'
      ? { ok: true, text: `Słusznie — ${claim.why.charAt(0).toLowerCase()}${claim.why.slice(1)}` }
      : { ok: true, text: 'Tak — to widać na ścianie.' };
  }
  if (target === 'milczy') return { ok: false, text: `Ściana coś o tym mówi. ${claim.why}` };
  if (claim.proof === 'milczy') return { ok: false, text: claim.why };
  return { ok: false, text: `To nie ta postać. ${claim.why}` };
}
