import type { KorpusSource } from '../../../lib/korpus/types';

/**
 * „Poranek przy Lipowej” — tekst napisany dla kursu (L1, blok 2 „Co zrobiły
 * słowa”; rejestr: T-L1-2). Pięć wypowiedzi, każda coś robi z odbiorcą, a
 * skutek **stoi w osobnym zdaniu** (reakcja), nie w domyśle — dlatego para
 * stuknięć „słowo → skutek” ma odpowiedź zapisaną w kotwicach, nie w głowie
 * autora. Zranienie ma dwa dowody (reakcja Zuzi i to, co zauważył Tymek). Każda kwestia
 * dialogu to osobny akapit, jak w polskiej prozie.
 *
 * Nagrania: manifest `poranek.poranek.audio.ts` (narzędzie lektora TTS).
 * Po każdej zmianie zdania nagraj je ponownie — `staleClips` to wyłapie.
 */
export const PORANEK: KorpusSource = {
  id: 'poranek',
  layout: 'prose',
  body: `Była sobota i w kamienicy przy Lipowej wszyscy wstali wcześnie. Pani Ewa przyniosła listy, a na klatce schodowej zrobiło się gwarno.

[[u1 — Przepraszam, pani Halino, to moja piłka stłukła pani doniczkę]] — powiedział Tymek.

[[r1 Pani Halina westchnęła, ale zaraz się uśmiechnęła i pogłaskała go po głowie.]]

Zuzia zbiegła po schodach w żółtym płaszczyku i czerwonych kaloszach, z balonikiem w ręku.

[[u2 — Wyglądasz jak kurczak w butach]] — rzucił Tymek do siostry.

[[r2 Zuzia odwróciła się do okna i nic nie powiedziała.]]

Pan Bogdan schodził właśnie z drugiego piętra z gazetą pod pachą.

[[u3 — Mruczek znowu czyta moją gazetę, ale zawsze od końca]] — powiedział do pani Haliny.

[[r3 Pani Halina parsknęła śmiechem tak głośno, że kot uciekł pod schody.]]

[[r2b Tymek zobaczył, że siostra ma smutną minę, i usiadł obok niej na schodach.]]

[[u4 — Jutro naprawię twój rower, słowo]] — powiedział cicho.

[[r4 Zuzia przytuliła się do niego i powtórzyła: „Jutro, słowo”.]]

Ola z pierwszego piętra przyniosła pani Halinie wolną doniczkę ze swojego balkonu.

[[u5 — Dziękuję ci, dziecko, uratowałaś moje pelargonie]] — powiedziała pani Halina.

[[r5 Ola zaczerwieniła się z radości i schowała ręce za plecy.]]

Pani Ewa pomachała wszystkim i poszła dalej z torbą pełną listów.`,
  spans: {
    u1: { kind: 'wypowiedz', speaker: 'tymek', to: 'halina' },
    u2: { kind: 'wypowiedz', speaker: 'tymek', to: 'zuzia' },
    u3: { kind: 'wypowiedz', speaker: 'bogdan', to: 'halina' },
    u4: { kind: 'wypowiedz', speaker: 'tymek', to: 'zuzia' },
    u5: { kind: 'wypowiedz', speaker: 'halina', to: 'ola' },
    r1: { kind: 'reakcja' },
    r2: { kind: 'reakcja' },
    r2b: { kind: 'reakcja' },
    r3: { kind: 'reakcja' },
    r4: { kind: 'reakcja' },
    r5: { kind: 'reakcja' },
  },
  anchors: [
    { kind: 'przeprosiny', from: 'u1', to: 'r1' },
    { kind: 'zranienie', from: 'u2', to: 'r2' },
    { kind: 'zranienie', from: 'u2', to: 'r2b' },
    { kind: 'rozsmieszenie', from: 'u3', to: 'r3' },
    { kind: 'obietnica', from: 'u4', to: 'r4' },
    { kind: 'podziekowanie', from: 'u5', to: 'r5' },
  ],
};
