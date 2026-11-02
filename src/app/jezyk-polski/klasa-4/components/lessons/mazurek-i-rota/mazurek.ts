import type { KorpusSource } from '../../../lib/korpus/types';

/**
 * *Mazurek Dąbrowskiego* — zwrotka 1, refren, zwrotka 2 (L9; rejestr T-L9-1).
 * **Tylko brzmienie urzędowe**: załącznik nr 3 do ustawy z 31 stycznia 1980 r.
 * o godle, barwach i hymnie Rzeczypospolitej Polskiej oraz o pieczęciach
 * państwowych — nie śpiewnik z Wolnych Lektur (inny tekst). Słowa: Józef
 * Wybicki (1797), domena publiczna. Nagranie **mówione**, nie śpiewane.
 *
 * Własne id wyrazów: `my-*` — każde „my” w tekście (słowo, jego przypadki i
 * końcówka czasownika; blok 3, lista w `my.ts`), `sl-*` — słowniczek (blok 1).
 */
export const MAZUREK: KorpusSource = {
  id: 'mazurek',
  layout: 'verse',
  body: `Jeszcze Polska nie zginęła,
Kiedy my{#my-m1} żyjemy{#my-m2}.
Co nam{#my-m3} obca przemoc{#sl-przemoc} wzięła,
Szablą{#sl-szabla} odbierzemy{#my-m4}.

Marsz, marsz, Dąbrowski{#sl-dabrowski},
Z ziemi włoskiej{#sl-wloskiej} do Polski.
Za twoim{#ty-m1} przewodem{#sl-przewodem}
Złączym{#my-m5} się z narodem.

Przejdziem{#my-m6} Wisłę, przejdziem{#my-m7} Wartę,
Będziem{#my-m8} Polakami.
Dał nam{#my-m9} przykład Bonaparte{#sl-bonaparte},
Jak zwyciężać mamy{#my-m10}.`,
};
