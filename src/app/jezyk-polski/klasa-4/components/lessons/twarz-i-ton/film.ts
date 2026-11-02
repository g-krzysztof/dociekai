import type { ClipSpec } from '../../../lib/lektor/types';

/**
 * L4, blok 2 „Niemy film” — scena na podwórku (rejestr T-L4-2, własna).
 * Tymek wraca z przegranego meczu. Ciało zmienia się dwa razy: ramiona
 * opadają i głowa się zwiesza (ok. 4,5 s), potem ręce krzyżują się na
 * piersi (ok. 7,5 s). Na końcu, z dźwiękiem, mówi „Nic mi nie jest.”
 *
 * Poza to funkcja czasu (`poseAt`) — ta sama dla animacji, miniatur i sędziego,
 * więc „klatka kluczowa” nie jest kluczem autora, tylko miejscem, w którym
 * liczby w danych naprawdę się zmieniają.
 */

export const DLUGOSC = 10; // sekundy

export interface Poza {
  /** Pozycja na podwórku, 0–100. */
  x: number;
  /** 0 = głowa prosto … 1 = zwieszona. */
  glowa: number;
  /** 0 = ramiona proste … 1 = opadnięte, plecy zgarbione. */
  ramiona: number;
  /** 0 = ręce luźno / w marszu … 1 = skrzyżowane na piersi. */
  rece: number;
  /** Faza kroku (−1…1), 0 gdy stoi. */
  krok: number;
}

interface Klucz {
  t: number;
  x: number;
  glowa: number;
  ramiona: number;
  rece: number;
}

/** Klatki kluczowe; między nimi interpolacja liniowa. */
export const KLUCZE: Klucz[] = [
  { t: 0, x: 8, glowa: 0, ramiona: 0, rece: 0 },
  { t: 3.8, x: 52, glowa: 0, ramiona: 0, rece: 0 },
  { t: 4.2, x: 54, glowa: 0, ramiona: 0, rece: 0 },
  { t: 5.0, x: 55, glowa: 0.9, ramiona: 1, rece: 0 },
  { t: 7.1, x: 55, glowa: 0.9, ramiona: 1, rece: 0 },
  { t: 7.9, x: 55, glowa: 0.6, ramiona: 0.8, rece: 1 },
  { t: 10, x: 55, glowa: 0.6, ramiona: 0.8, rece: 1 },
];

/** Chwile, w których ciało zaczyna mówić coś innego (środek przejścia). */
export const ZMIANY = [
  { id: 'ramiona', t: 4.6, label: 'ramiona opadają, głowa się zwiesza' },
  { id: 'rece', t: 7.5, label: 'ręce krzyżują się na piersi' },
] as const;

export const TOLERANCJA = 0.9;

const r2 = (v: number) => Math.round(v * 100) / 100;

export function poseAt(t: number): Poza {
  const tt = Math.max(0, Math.min(DLUGOSC, t));
  let i = 0;
  while (i < KLUCZE.length - 2 && KLUCZE[i + 1].t <= tt) i += 1;
  const a = KLUCZE[i];
  const b = KLUCZE[i + 1];
  const f = b.t === a.t ? 0 : (tt - a.t) / (b.t - a.t);
  const lerp = (u: number, v: number) => u + (v - u) * f;
  const walking = tt < 3.8;
  return {
    x: r2(lerp(a.x, b.x)),
    glowa: r2(lerp(a.glowa, b.glowa)),
    ramiona: r2(lerp(a.ramiona, b.ramiona)),
    rece: r2(lerp(a.rece, b.rece)),
    krok: walking ? r2(Math.sin(tt * Math.PI * 1.6)) : 0,
  };
}

export type Stop = { ok: true; zmiana: (typeof ZMIANY)[number]['id']; label: string } | { ok: false; mowi: string };

/** Sędzia zatrzymania: czy w tej chwili ciało właśnie się zmienia (± tolerancja). */
export function judgeStop(t: number): Stop {
  const hit = ZMIANY.find((z) => Math.abs(z.t - t) <= TOLERANCJA);
  if (hit) return { ok: true, zmiana: hit.id, label: hit.label };
  const next = ZMIANY.find((z) => z.t > t);
  if (t < 3.8) return { ok: false, mowi: 'Tu Tymek jeszcze idzie zwyczajnie, wyprostowany. Puść dalej.' };
  if (next) return { ok: false, mowi: 'Tu nic się nie zmienia — Tymek stoi tak samo. Puść dalej i patrz na ręce.' };
  return { ok: false, mowi: 'Za późno — zmiana już była. Cofnij film i złap ją.' };
}

/** Miniatury do pytania „komu wierzysz?” — co która pokazuje (dowód, nie klucz). */
export const KLATKI = [
  { id: 'k2', t: 2, pokazuje: 'dobrze' as const, opis: 'szedł wyprostowany, zwykłym krokiem' },
  { id: 'k6', t: 6, pokazuje: 'zle' as const, opis: 'stał zgarbiony, ze zwieszoną głową' },
  { id: 'k9', t: 9, pokazuje: 'zle' as const, opis: 'stał z rękami skrzyżowanymi na piersi' },
];

export type Wiara = 'slowom' | 'cialu';

export function judgeWiara(w: Wiara, klatka: string): { ok: boolean; mowi: string } {
  const k = KLATKI.find((x) => x.id === klatka);
  if (!k) return { ok: false, mowi: '' };
  // „Słowom” nie ma dowodu: jedyna spokojna klatka jest sprzed zmiany, więc nic
  // nie mówi o tym, jak Tymek czuje się teraz, kiedy mówi „Nic mi nie jest”.
  if (w === 'slowom')
    return {
      ok: false,
      mowi:
        k.pokazuje === 'dobrze'
          ? `Na tej klatce Tymek ${k.opis} — ale to było przed zmianą. Kiedy mówi „Nic mi nie jest”, stoi już inaczej. Spójrz na klatkę z tej chwili: czy ciało mówi to samo co słowa?`
          : `Na tej klatce Tymek ${k.opis} — to raczej przeczy słowom. Czy na pewno wierzysz słowom?`,
    };
  if (k.pokazuje === 'zle') return { ok: true, mowi: `Masz dowód: Tymek ${k.opis}. Ciało mówi co innego niż słowa.` };
  return {
    ok: false,
    mowi: `Na tej klatce Tymek ${k.opis} — to było przed zmianą i nie wygląda na smutek. Poszukaj innej klatki.`,
  };
}

/** Kwestia Tymka (z dźwiękiem) — nagranie, sprawdzić uchem. */
export const NIC_MI: Record<'nic', ClipSpec> = {
  nic: { text: 'Nic mi nie jest.', style: 0.5, stability: 0.4 },
};
