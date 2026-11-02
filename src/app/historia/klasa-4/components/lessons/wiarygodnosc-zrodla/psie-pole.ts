/**
 * Blok 2 — „Psie Pole” (śledztwo) — dane i sędziowie, bez Reacta.
 *
 * Fakty (F-I.2-14…16 z bazy + sprawdzone 2026-10-02, Wikipedia „Bitwa na
 * Psim Polu” i „Kronika Galla Anonima”, „Kronika Wincentego Kadłubka”):
 * - wojna Henryka V z Bolesławem Krzywoustym — 1109 r.;
 * - Gall Anonim, kronikarz na dworze Krzywoustego, pisał ok. 1112–1116,
 *   „zaledwie kilka lat po wydarzeniach”; opisuje obronę Głogowa i to, że
 *   cesarz pod Wrocławiem nic nie zyskał oprócz zabitych — o walnej bitwie
 *   na Psim Polu nie pisze;
 * - Wincenty Kadłubek pisał ok. 1190–1208 na dworze Kazimierza
 *   Sprawiedliwego, **syna Krzywoustego** — pierwszy znany opis wielkiej bitwy
 *   (pozorowana ucieczka, zasadzka, psy na pobojowisku → nazwa);
 * - Jan Długosz, „Roczniki”, 1455–1480 — powtarza opowieść za Kadłubkiem;
 * - Marcin Bielski, „Kronika” 1564 — opis i drzeworyt (rycerze w zbrojach
 *   płytowych, upowszechnionych ok. 300 lat po 1109 r.; drzeworyt w domenie
 *   publicznej, Biblioteka Narodowa przez Wikimedia Commons).
 *
 * Dziecko rozkłada cztery kroniki na osi „kiedy napisano” (data stoi na
 * karcie — przyporządkowanie wynika z niej, nie z klucza autora), potem
 * nakłada kopie na oryginał (z tekstu karty: „opowieść zna z kroniki
 * Kadłubka”) i wypełnia paszport kroniki Kadłubka.
 */

import type { PassportCard, PassportFieldDef } from '../../source-desk/passport';

export const BATTLE_YEAR = 1109;
export const AXIS_FROM = 1100;
export const AXIS_TO = 1600;
/** Ile lat obok daty z karty wolno upuścić kartę (10% osi). */
export const DROP_TOLERANCE = 30;

export type ChronicleId = 'gall' | 'kadlubek' | 'dlugosz' | 'bielski';

export interface Chronicle {
  id: ChronicleId;
  author: string;
  /** Krótki podpis na osi. */
  short: string;
  /** Rok na osi (środek okresu pisania). */
  written: number;
  writtenLabel: string;
  /** Kim był — widać na karcie od początku. */
  who: string;
  /** Co pisze o bitwie — odsłania się po położeniu na osi. */
  says: string;
  /** Od kogo zna opowieść — tylko kopie; tu wolno nałożyć kartę. */
  copiedFrom?: ChronicleId[];
  copyHint?: string;
}

export const CHRONICLES: Chronicle[] = [
  {
    id: 'gall',
    author: 'Gall Anonim',
    short: 'Gall',
    written: 1114,
    writtenLabel: 'ok. 1112–1116',
    who: 'Kronikarz na dworze Bolesława Krzywoustego — pisał kilka lat po wojnie.',
    says: 'Opisuje wojnę z 1109 r.: obronę Głogowa i to, że cesarz pod Wrocławiem nic nie zyskał, tylko stracił ludzi. O wielkiej bitwie na Psim Polu — ani słowa.',
  },
  {
    id: 'kadlubek',
    author: 'Wincenty Kadłubek',
    short: 'Kadłubek',
    written: 1200,
    writtenLabel: 'ok. 1200',
    who: 'Biskup krakowski. Kronikę pisał na dworze księcia Kazimierza Sprawiedliwego — syna Bolesława Krzywoustego.',
    says: 'Opisuje wielką bitwę: Polacy udają ucieczkę, wciągają Niemców w zasadzkę i wygrywają. Na pobojowisko zbiegły się psy — stąd nazwa Psie Pole.',
  },
  {
    id: 'dlugosz',
    author: 'Jan Długosz',
    short: 'Długosz',
    written: 1467,
    writtenLabel: '1455–1480',
    who: 'Kanonik krakowski, autor wielkich „Roczników” — dziejów Polski od początków.',
    says: 'Opisuje bitwę na Psim Polu — opowieść zna z kroniki Kadłubka i powtarza ją po swojemu.',
    copiedFrom: ['kadlubek'],
    copyHint: 'opowieść zna z kroniki Kadłubka',
  },
  {
    id: 'bielski',
    author: 'Marcin Bielski',
    short: 'Bielski',
    written: 1564,
    writtenLabel: '1564',
    who: 'Szlachcic i pisarz. Pisał po polsku, a jego kronikę wydano drukiem.',
    says: 'Opisuje bitwę za starszymi kronikami — Kadłubkiem i Długoszem — i dokłada drzeworyt: rycerze w zbrojach płytowych, jakich w 1109 r. jeszcze nie noszono.',
    copiedFrom: ['kadlubek', 'dlugosz'],
    copyHint: 'opowieść zna ze starszych kronik — Kadłubka i Długosza',
  },
];

export function chronicleById(id: ChronicleId): Chronicle {
  const c = CHRONICLES.find((x) => x.id === id);
  if (!c) throw new Error(`Nie ma kroniki „${id}”`);
  return c;
}

/** Rok → położenie na osi 0–1 (liniowo, bez szczeliny — cała oś jest n.e.). */
export function yearToU(year: number): number {
  return (year - AXIS_FROM) / (AXIS_TO - AXIS_FROM);
}

export function uToYear(u: number): number {
  return Math.round(AXIS_FROM + Math.min(1, Math.max(0, u)) * (AXIS_TO - AXIS_FROM));
}

export type AxisVerdict = { ok: true } | { ok: false; why: string };

/** Sędzia osi: karta blisko roku z karty. Odrzut nazywa datę z karty i miejsce upuszczenia. */
export function judgeAxisDrop(id: ChronicleId, year: number): AxisVerdict {
  const c = chronicleById(id);
  // Najpierw kolejność: Gall pisał tuż po wojnie, więc sama tolerancja wpuściłaby go przed 1109 r.
  if (year < BATTLE_YEAR) {
    return { ok: false, why: `Karta leży przed rokiem ${BATTLE_YEAR} — a nikt nie opisze bitwy, zanim się wydarzy. ${c.short} pisał ${c.writtenLabel}.` };
  }
  if (Math.abs(year - c.written) <= DROP_TOLERANCE) return { ok: true };
  const at = Math.round(year / 10) * 10;
  return {
    ok: false,
    why: `${c.short} pisał ${c.writtenLabel}, a karta leży przy roku ok. ${at} — ${year < c.written ? 'za wcześnie' : 'za późno'}. Spójrz na datę na karcie.`,
  };
}

/** Ile lat po bitwie napisano kronikę — zaokrąglone do dziesiątek poza Gallem (jego data jest bliska). */
export function yearsAfter(id: ChronicleId): { years: number; approx: boolean } {
  const raw = chronicleById(id).written - BATTLE_YEAR;
  if (raw < 20) return { years: raw, approx: true };
  return { years: Math.round(raw / 10) * 10, approx: id !== 'bielski' };
}

/** Sędzia stosu: kopia leży na oryginale, gdy jej autor zna opowieść od autora spodu. */
export function judgeStack(copy: ChronicleId, target: ChronicleId): AxisVerdict {
  const c = chronicleById(copy);
  const t = chronicleById(target);
  if (copy === target) return { ok: false, why: 'Upuść kartę na inną kronikę.' };
  if (c.copiedFrom?.includes(target)) return { ok: true };
  if (!c.copiedFrom) return { ok: false, why: `${c.short} niczego nie przepisywał — jego karta zostaje na osi.` };
  if (target === 'gall') {
    return { ok: false, why: `Gall o bitwie na Psim Polu nie pisze — ${c.short} nie mógł jej od niego wziąć. Przeczytaj, od kogo zna opowieść.` };
  }
  if (t.written > c.written) {
    return { ok: false, why: `${t.short} pisał później niż ${c.short} — nie da się przepisać z książki, której jeszcze nie ma.` };
  }
  return { ok: false, why: `Przeczytaj kartę: ${c.short} ${c.copyHint ?? 'zna opowieść skądinąd'}.` };
}

/** Kopie, które trzeba nałożyć, zanim stos jest gotowy. */
export const COPIES: ChronicleId[] = CHRONICLES.filter((c) => c.copiedFrom).map((c) => c.id);

// ─── Paszport kroniki Kadłubka (silnik `source-desk`) ───

export type KadlubekField = 'kto' | 'kiedy' | 'po co';

export const KADLUBEK_FIELDS: PassportFieldDef<KadlubekField>[] = [
  { id: 'kto', question: 'Kto napisał?' },
  { id: 'kiedy', question: 'Kiedy — w porównaniu z bitwą?' },
  { id: 'po co', question: 'Dla kogo i po co?' },
];

export const KADLUBEK_BANK: PassportCard<KadlubekField>[] = [
  { id: 'ksiaze', text: 'Na dworze syna Krzywoustego — ku chwale jego ojca i rodu', field: 'po co' },
  { id: 'swiadek', text: 'Rycerz, który walczył w tej bitwie', field: null, whyNot: 'Kadłubek pisał prawie sto lat po bitwie — w 1109 r. jeszcze nie żył. Nie mógł walczyć ani patrzeć.' },
  { id: 'biskup', text: 'Wincenty Kadłubek, biskup krakowski', field: 'kto' },
  { id: 'zaraz', text: 'Kilka lat po bitwie', field: null, whyNot: 'Kilka lat po bitwie pisał Gall. Sprawdź na osi, gdzie leży karta Kadłubka.' },
  { id: 'sto-lat', text: 'Prawie 100 lat po bitwie', field: 'kiedy' },
  { id: 'cesarz', text: 'Dla cesarza niemieckiego, żeby go pocieszyć', field: null, whyNot: 'Kadłubek pisał na dworze polskiego księcia Kazimierza — przeczytaj jego kartę.' },
];
