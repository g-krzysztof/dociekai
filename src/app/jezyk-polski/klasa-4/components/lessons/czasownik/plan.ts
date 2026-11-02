/**
 * L15 blok 3 — sędzia „Planu na jutro” (Pisarnia z werdyktem, jedyna
 * w modułach 3–4). Czyta tylko strukturę i formy czasowników z palety ośmiu
 * (paradygmaty z SGJP w `czasy.forms.ts`): czy zdanie jest zdaniem i czy
 * czasownik z palety stoi w czasie przyszłym. Treść planu należy do dziecka.
 *
 * Czas przyszły ma trzy postaci: forma dokonana bez „być” („naprawię”),
 * „będę + bezokolicznik” i „będę + forma na -ł” („będę łowić”, „będę
 * łowiła”); „będę” może stać dalej w zdaniu („będę jutro łowić”).
 */

import type { PisarniaAnalysis, PisWord } from '../../../lib/pisarnia';
import { BEDZIE, CZASY } from './czasy.forms';

export const PALETA_PLANU = ['płynąć', 'łowić', 'naprawić', 'zbudować', 'zapalić', 'karmić', 'szukać', 'spać'] as const;
export const MIN_ZDAN = 3;

export type Odczyt = 'przyszly' | 'terazniejszy' | 'przeszly' | 'bezokolicznik' | 'dokonany-z-bedzie';

export interface Trafienie {
  word: PisWord;
  lemat: string;
  odczyt: Odczyt;
}

export interface ZdaniePlanu {
  index: number;
  tekst: string;
  zdanieOk: boolean;
  trafienia: Trafienie[];
  przyszly: boolean;
}

const BEDZIE_SET = new Set(BEDZIE);

function odczytaj(low: string, maBedzie: boolean): { lemat: string; odczyt: Odczyt } | null {
  for (const lemat of PALETA_PLANU) {
    const f = CZASY[lemat];
    if (!f) continue;
    const perf = f.aspekt === 'perf';
    if (f.fin.includes(low)) return { lemat, odczyt: perf ? 'przyszly' : 'terazniejszy' };
    if (f.praet.includes(low)) {
      if (maBedzie) return { lemat, odczyt: perf ? 'dokonany-z-bedzie' : 'przyszly' };
      return { lemat, odczyt: 'przeszly' };
    }
    if (f.inf.includes(low)) {
      if (maBedzie) return { lemat, odczyt: perf ? 'dokonany-z-bedzie' : 'przyszly' };
      return { lemat, odczyt: 'bezokolicznik' };
    }
  }
  return null;
}

export function czytajPlan(a: PisarniaAnalysis): ZdaniePlanu[] {
  return a.sentences
    .filter((s) => s.words.length > 0)
    .map((s, i) => {
      const words = s.words.map((k) => a.words[k]);
      const maBedzie = words.some((w) => BEDZIE_SET.has(w.low));
      const trafienia: Trafienie[] = [];
      for (const w of words) {
        const o = odczytaj(w.low, maBedzie);
        if (o) trafienia.push({ word: w, ...o });
      }
      return {
        index: i,
        tekst: s.text,
        zdanieOk: s.capitalOk && s.endMark !== null,
        trafienia,
        przyszly: trafienia.some((t) => t.odczyt === 'przyszly'),
      };
    });
}

export interface WerdyktPlanu {
  zdania: { ok: boolean; note: string };
  czasownik: { ok: boolean; note: string };
  jutro: { ok: boolean; note: string };
  plan: ZdaniePlanu[];
}

const KIEDY: Record<Exclude<Odczyt, 'przyszly'>, (f: string) => string> = {
  przeszly: (f) => `„${f}” mówi o wczoraj`,
  terazniejszy: (f) => `„${f}” mówi o dziś`,
  bezokolicznik: (f) => `„${f}” samo nie mówi kiedy — przyda się „będę”, „będziesz”, „będziemy”…`,
  'dokonany-z-bedzie': (f) => `„będę ${f}” tak się nie mówi — tu wystarczy samo słowo w przyszłości (np. „naprawię”)`,
};

export function ocenPlan(a: PisarniaAnalysis): WerdyktPlanu {
  const plan = czytajPlan(a);
  const nr = (z: ZdaniePlanu) => z.index + 1;

  const zleZdania = plan.filter((z) => !z.zdanieOk);
  const zdania =
    plan.length < MIN_ZDAN
      ? { ok: false, note: `Na razie ${plan.length === 0 ? 'nie ma zdań' : plan.length === 1 ? 'jest 1 zdanie' : `są ${plan.length} zdania`} — potrzebne co najmniej ${MIN_ZDAN}.` }
      : zleZdania.length
        ? { ok: false, note: `W zdaniu ${zleZdania.map(nr).join(', ')} brakuje wielkiej litery na początku albo znaku na końcu.` }
        : { ok: true, note: `${plan.length} zdań, każde z wielką literą i znakiem na końcu.`.replace(/^3 zdań/, '3 zdania').replace(/^4 zdań/, '4 zdania') };

  const bez = plan.filter((z) => z.trafienia.length === 0);
  const czasownik =
    plan.length === 0
      ? { ok: false, note: 'Każde zdanie potrzebuje czasownika z palety.' }
      : bez.length
        ? { ok: false, note: `W zdaniu ${bez.map(nr).join(', ')} nie ma czasownika z palety.` }
        : { ok: true, note: 'W każdym zdaniu jest czasownik z palety.' };

  const nieJutro = plan.filter((z) => z.trafienia.length > 0 && !z.przyszly);
  const jutro =
    plan.length === 0 || bez.length === plan.length
      ? { ok: false, note: 'Czasownik ma mówić o jutrze.' }
      : nieJutro.length
        ? {
            ok: false,
            note: nieJutro
              .map((z) => {
                const t = z.trafienia[0];
                return `W zdaniu ${nr(z)} ${KIEDY[t.odczyt as Exclude<Odczyt, 'przyszly'>](t.word.form)}.`;
              })
              .join(' '),
          }
        : { ok: true, note: 'Każdy czasownik z palety mówi o jutrze.' };

  return { zdania, czasownik, jutro, plan };
}
