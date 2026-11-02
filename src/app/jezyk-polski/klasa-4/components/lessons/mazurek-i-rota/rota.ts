import type { KorpusSource } from '../../../lib/korpus/types';

/**
 * *Rota* — Maria Konopnicka (1908, zm. 1910), zwrotka 1 (L9; rejestr T-L9-3).
 * Domena publiczna; tekst co do znaku za Wolnymi Lekturami
 * (https://wolnelektury.pl/katalog/lektura/rota/, na podstawie: P. Maszyński,
 * *Śpiewnik narodowy na chór męski*, Łódź 1917) — łącznie z kropką po
 * pierwszym wersie. Nagranie **mówione**, nie śpiewane.
 *
 * Wersy-obietnice (blok 2, `pieczec.ts`) i każde „my” (blok 3, `my.ts`) mają
 * własne id wyrazów.
 */
export const ROTA: KorpusSource = {
  id: 'rota',
  layout: 'verse',
  body: `Nie rzucim{#my-r1} ziemi, skąd nasz{#my-r2} ród.
Nie damy{#my-r3} pogrześć{#sl-pogrzesc} mowy,
Polski my{#my-r4} naród, polski lud,
Królewski szczep{#sl-szczep} piastowy.
Nie damy{#my-r5}, by nas{#my-r6} gnębił wróg.
Tak nam{#my-r7} dopomóż Bóg!
Tak nam{#my-r8} dopomóż Bóg!`,
};
