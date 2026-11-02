import type { KorpusSource } from '../../../lib/korpus/types';

/**
 * Dwie wiadomości głosowe pani Haliny (L5; rejestr T-L5-1, T-L5-2) — teksty
 * napisane dla kursu, nagrane **głosem pani Haliny** (`Jane`, D11) i stałe:
 * słuchanie jest tu zadaniem, więc nagrania sprawdza się uchem przed
 * akceptacją. Liczby słownie (tak też je czyta lektor).
 *
 * Zakupy: pięć rzeczy ze szczegółami (ile, jaki), poprawka w środku (masło),
 * dygresje (kolano, Mruczek, deszcz) i jedna rzecz, której z nagrania nie da
 * się wiedzieć: „ser, ten co zawsze”. Kotwice `[[…]]` znaczą szczegóły — z
 * nich biorą się cytaty przy błędach w kuchni i podświetlenia w bloku 3.
 */
export const ZAKUPY: KorpusSource = {
  id: 'zakupy',
  layout: 'prose',
  body: `Halo, kochanie? Tu pani Halina z parteru. Mam do ciebie wielką prośbę, bo dziś strasznie boli mnie kolano i nie dojdę do sklepu.

Kup mi, proszę, [[mleko dwa litry mleka]]. I [[chleb chleb razowy, ale niekrojony]], bo krojony szybko mi wysycha. Jeszcze [[jablka cztery jabłka, tylko nie czerwone]], bo czerwone są dla mnie za słodkie.

Mruczek siedzi teraz na parapecie i patrzy na deszcz, jakby na kogoś czekał. Gdzie ja byłam? Aha. [[maslo Weź też masło, jedną kostkę. A nie, masła nie bierz, jeszcze mam całą kostkę w lodówce.]]

I [[ser ser, ten co zawsze]]. I [[drozdze drożdże, jedną kostkę]], bo w niedzielę piekę placek.

Pieniądze dam ci, jak przyjdziesz. Dziękuję ci, dziecko.`,
  spans: {
    mleko: { kind: 'szczegol', data: { co: 'mleko', typ: 'liczba' } },
    chleb: { kind: 'szczegol', data: { co: 'chleb', typ: 'cecha' } },
    jablka: { kind: 'szczegol', data: { co: 'jablka', typ: 'cecha' } },
    maslo: { kind: 'szczegol', data: { co: 'maslo', typ: 'zmiana' } },
    ser: { kind: 'szczegol', data: { co: 'ser', typ: 'niewiadoma' } },
    drozdze: { kind: 'szczegol', data: { co: 'drozdze', typ: 'liczba' } },
  },
};

/**
 * Karmienie Mruczka — druga wiadomość, **jedno odsłuchanie**, notowana w ramie
 * „co? ile? jaki? uwaga!”. Dwie miski, dwie pory, różna karma i jedno „nie”.
 */
export const MRUCZEK: KorpusSource = {
  id: 'mruczek',
  layout: 'prose',
  body: `Kochanie, to znowu ja. Jutro rano jadę na weekend do siostry, a Mruczek zostaje sam. Czy mógłbyś albo mogłabyś go karmić?

[[rano Rano daj mu dwie łyżki mokrej karmy z puszki do niebieskiej miski.]] [[wieczor Wieczorem trzy łyżki suchej karmy do żółtej miski.]] [[woda Wodę zmieniaj raz dziennie.]] [[mleko I pamiętaj: mleka mu nie dawaj, bo potem boli go brzuch.]]

Klucz zostawię pod wycieraczką. Dziękuję ci bardzo!`,
  spans: {
    rano: { kind: 'szczegol', data: { co: 'rano', typ: 'liczba' } },
    wieczor: { kind: 'szczegol', data: { co: 'wieczor', typ: 'liczba' } },
    woda: { kind: 'szczegol', data: { co: 'woda', typ: 'liczba' } },
    mleko: { kind: 'szczegol', data: { co: 'mleko', typ: 'zakaz' } },
  },
};
