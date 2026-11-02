/**
 * Blok 4 — po co ludziom mity. Trzy zjawiska i atrybuty bogów z bloku 1:
 * dziecko tłumaczy zjawisko „jak Grek”, przykładając atrybut boga, który
 * według mitu za nim stoi. Sędzią jest to, czym bóg się zajmuje (blok 1:
 * Zeus — niebo i burze, Posejdon — morze, Demeter — urodzaj), a odrzut
 * nazywa tę dziedzinę. Potem obok mitu staje wyjaśnienie dzisiejsze.
 */

import type { AttributeId } from './olimp';

export interface Phenomenon {
  id: 'burza' | 'sztorm' | 'zima';
  label: string;
  /** Jak to wygląda oczami Greka. */
  scene: string;
  answer: AttributeId;
  myth: string;
  today: string;
}

export const TOOLS: { id: AttributeId; label: string; owner: string }[] = [
  { id: 'trojzab', label: 'trójząb', owner: 'Posejdona, władcy morza' },
  { id: 'klos', label: 'kłos zboża', owner: 'Demeter, bogini urodzaju — tego, czy coś rośnie' },
  { id: 'piorun', label: 'piorun', owner: 'Zeusa, władcy nieba i burz' },
];

export const PHENOMENA: Phenomenon[] = [
  {
    id: 'burza',
    label: 'Burza',
    scene: 'Niebo ciemnieje, błyska i grzmi tak, że drżą ściany.',
    answer: 'piorun',
    myth: 'Zeus się gniewa i ciska z nieba piorunami.',
    today: 'Piorun to ogromna iskra elektryczna między chmurą a ziemią, a grzmot to huk nagle rozgrzanego powietrza.',
  },
  {
    id: 'sztorm',
    label: 'Sztorm',
    scene: 'Spokojne morze nagle burzy się falami wyższymi niż maszt.',
    answer: 'trojzab',
    myth: 'Rozgniewany Posejdon uderza trójzębem w morze i podnosi fale jak góry.',
    today: 'Fale podnosi wiatr: im mocniej i dłużej wieje nad morzem, tym wyższe fale.',
  },
  {
    id: 'zima',
    label: 'Zima',
    scene: 'Co roku pola pustoszeją, nic nie rośnie, a potem wiosną wszystko wraca.',
    answer: 'klos',
    myth: 'Hades zabrał Persefonę do podziemnego królestwa. Demeter tak tęskni za córką, że przestaje dbać o ziemię i nic nie rośnie. Gdy Persefona wiosną wraca do mamy, wszystko znów kwitnie.',
    today: 'Zimą promienie Słońca padają na naszą część Ziemi ukośnie, a dzień jest krótki — jest za zimno i za ciemno, żeby rośliny rosły.',
  },
];

export type NaturaVerdict = { ok: true } | { ok: false; message: string };

export function judgeExplanation(tool: AttributeId, phenomenon: Phenomenon['id']): NaturaVerdict {
  const t = TOOLS.find((x) => x.id === tool);
  const p = PHENOMENA.find((x) => x.id === phenomenon);
  if (!t || !p) return { ok: false, message: 'Nie ma takiego zjawiska albo atrybutu.' };
  if (p.answer === tool) return { ok: true };
  return {
    ok: false,
    message: `${t.label[0].toUpperCase() + t.label.slice(1)} to znak ${t.owner}. Kto z Olimpu odpowiadałby za to, co widzisz: ${p.scene.toLowerCase()}`,
  };
}

/** Własny mit o echu: dziecko składa go z dwóch części — każde połączenie jest przyjęte. */
export const ECHO_WHO = ['nimfa, która za dużo gadała', 'olbrzym zamknięty w skale', 'ptak, który zgubił swój głos'];
export const ECHO_WHAT = [
  'za karę może powtarzać tylko cudze ostatnie słowa',
  'nudzi się i przedrzeźnia każdego wędrowca',
  'chowa się w górach i odpowiada każdemu, kto zawoła',
];
