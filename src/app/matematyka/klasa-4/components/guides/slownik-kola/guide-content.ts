import type { GuideActMeta } from '../guide-act';
import { buildCircleDiagram } from '../../../lib/circle';

/**
 * Wszystkie akty na `flow` (żaden akt tego przewodnika nie
 * scrubuje scrollem — diagram koła zmienia się kliknięciem, nie pozycją
 * scrolla, więc `stage` dałby tylko puste, przyklejone ekrany).
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Ile nazw kryje ten rysunek?', mode: 'flow' },
  { id: 'kolo-i-okrag', label: 'Koło czy okrąg?', mode: 'flow' },
  { id: 'srodek-i-promien', label: 'Środek i promień', mode: 'flow' },
  { id: 'srednica-i-cieciwa', label: 'Średnica i cięciwa', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

/** Jeden układ na cały przewodnik — ten sam okrąg wraca w każdym akcie, tylko z innymi „aktywnymi" częściami. */
export const CIRCLE_DIAGRAM = buildCircleDiagram({ x: 130, y: 130 }, 92);

export const REAL_LIFE_EXAMPLES: string[] = [
  'Koło rowerowe: piasta to środek, a szprychy to promienie.',
  'Kierownica samochodu: oś kierownicy to środek, a jej brzeg leży w tej samej odległości od środka co promień.',
  'Pizza pokrojona na kawałki: każde cięcie od brzegu do środka to promień.',
  'Zegar ze wskazówkami: oś, wokół której się obracają, to środek tarczy.',
  'Talerz albo moneta: „średnica 8 cm” na opakowaniu to odległość w poprzek, przez środek.',
];

export const CHEAT_SHEET: string[] = [
  'Okrąg to linia dookoła — sama krzywa, bez wnętrza.',
  'Koło to cała powierzchnia — okrąg razem z tym, co jest w środku.',
  'Środek to punkt w sercu koła, jednakowo oddalony od każdego punktu okręgu.',
  'Promień łączy środek z okręgiem — w każdym kierunku ma tę samą długość.',
  'Średnica łączy dwa punkty okręgu przez środek i jest równa 2 × promień.',
  'Cięciwa łączy dwa punkty okręgu, ale nie musi przechodzić przez środek — średnica to jej najdłuższy szczególny przypadek.',
];
