/**
 * L3, blok 3 „Przekaż Zuzi” — ogłoszenie pani dyrektor (tekst napisany dla
 * kursu, rejestr T-L3-2) i jego przekład dla pięciolatki.
 *
 * Ogłoszenie jest pocięte na kawałki. Trudne dla Zuzi są **tylko słowa naprawdę
 * urzędowe** (uprzejmie informuję, zajęcia, rozpoczną się, proszeni są o
 * przyniesienie, strój gimnastyczny) — „poniedziałek” i „dziewiąta” Zuzia zna.
 * Na tacce leżą prostsze słowa; każde pasuje tylko do jednego kawałka. Część
 * z nich jest prosta, ale **gubi informację** („rano”, „coś ładnego”, „można”)
 * — werdykt ma dwie strony: Zuzia musi zrozumieć i wiedzieć to samo.
 */

export type Info = 'dzien' | 'godzina' | 'obowiazek' | 'stroj';

export interface Kawalek {
  id: string;
  text: string;
  /** Zuzia tego nie rozumie — marszczy brwi i pyta. */
  trudny?: string;
  /** Jaką informację niesie (musi przetrwać przekład). */
  info?: Info;
  /** Odstęp po kawałku. */
  after?: string;
}

export const OGLOSZENIE: Kawalek[] = [
  { id: 'k1', text: 'Uprzejmie informuję, że', trudny: 'Co to jest „uprzejmie informuję”?' },
  { id: 'k2', text: 'w poniedziałek', info: 'dzien' },
  { id: 'k3', text: 'zajęcia', trudny: 'Zajęcia? Kto jest zajęty?' },
  { id: 'k4', text: 'rozpoczną się', trudny: '„Rozpoczną się” — czyli co?' },
  { id: 'k5', text: 'o godzinie dziewiątej', info: 'godzina', after: '' },
  { id: 'k6', text: '.' },
  { id: 'k7', text: 'Dzieci proszone są o przyniesienie', trudny: '„Proszone są o przyniesienie”? Nie rozumiem.', info: 'obowiazek' },
  { id: 'k8', text: 'stroju gimnastycznego', trudny: 'Strój gimnastyczny? Mam tylko sukienkę.', info: 'stroj', after: '' },
  { id: 'k9', text: '.' },
];

export interface Zamiennik {
  id: string;
  text: string;
  /** Kawałek, który zastępuje. */
  na: string;
  /** Informacja, którą ten zamiennik gubi — skutek u Zuzi. */
  gubi?: Info;
}

export const TACKA: Zamiennik[] = [
  { id: 'z1', text: 'Słuchaj:', na: 'k1' },
  { id: 'z2', text: 'lekcje', na: 'k3' },
  { id: 'z3', text: 'zaczną się', na: 'k4' },
  { id: 'z4', text: 'rano', na: 'k5', gubi: 'godzina' },
  { id: 'z5', text: 'o dziewiątej', na: 'k5' },
  { id: 'z6', text: 'Trzeba przynieść', na: 'k7' },
  { id: 'z7', text: 'Można przynieść', na: 'k7', gubi: 'obowiazek' },
  { id: 'z8', text: 'ubranie na WF', na: 'k8' },
  { id: 'z9', text: 'coś ładnego', na: 'k8', gubi: 'stroj' },
  { id: 'z10', text: 'kiedyś', na: 'k2', gubi: 'dzien' },
];

export type Przeklad = Record<string, string>; // kawałek → zamiennik

export type Upuszczenie = { ok: true; next: Przeklad } | { ok: false; mowi: string };

/** Upuszczenie zamiennika na kawałek. Do złego kawałka nie pasuje — z powodem. */
export function upusc(p: Przeklad, zamiennik: string, kawalek: string): Upuszczenie {
  const z = TACKA.find((t) => t.id === zamiennik);
  const k = OGLOSZENIE.find((t) => t.id === kawalek);
  if (!z || !k) return { ok: false, mowi: '' };
  if (z.na !== kawalek) return { ok: false, mowi: `„${z.text}” nie znaczy tego samego co „${k.text}”. Szukaj trudnego słowa, które znaczy to samo.` };
  return { ok: true, next: { ...p, [kawalek]: zamiennik } };
}

export const cofnij = (p: Przeklad, kawalek: string): Przeklad => {
  const next = { ...p };
  delete next[kawalek];
  return next;
};

/** Tekst po przekładzie, kawałek po kawałku. */
export function kawalki(p: Przeklad): { id: string; text: string; zmieniony: boolean; after: string }[] {
  return OGLOSZENIE.map((k) => {
    const z = p[k.id] ? TACKA.find((t) => t.id === p[k.id]) : undefined;
    return { id: k.id, text: z ? z.text : k.text, zmieniony: !!z, after: k.after ?? ' ' };
  });
}

/** Wielka litera na początku zdania po przekładzie („lekcje” po kropce — nie, „Słuchaj:” już ma). */
export function tekstPrzekladu(p: Przeklad): string {
  return kawalki(p)
    .map((k) => k.text + k.after)
    .join('')
    .replace(/\s+([.,:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const SKUTEK: Record<Info, string> = {
  dzien: 'Zuzia nie wie, kiedy — w poniedziałek siedzi w domu.',
  godzina: '„Rano” — Zuzia przychodzi o siódmej i czeka dwie godziny pod zamkniętymi drzwiami.',
  obowiazek: '„Można” — więc Zuzia nie bierze ubrania i ćwiczy w kapciach.',
  stroj: '„Coś ładnego” — Zuzia przychodzi w odświętnej sukience i nie może robić przewrotów.',
};

export interface Werdykt {
  /** Kawałki, których Zuzia wciąż nie rozumie. */
  niejasne: { id: string; pyta: string }[];
  /** Informacje zgubione w przekładzie i ich skutek. */
  zgubione: { info: Info; skutek: string }[];
  ok: boolean;
}

export function werdykt(p: Przeklad): Werdykt {
  const niejasne = OGLOSZENIE.filter((k) => k.trudny && !p[k.id]).map((k) => ({ id: k.id, pyta: k.trudny! }));
  const zgubione = Object.values(p)
    .map((id) => TACKA.find((t) => t.id === id)?.gubi)
    .filter((g): g is Info => !!g)
    .map((info) => ({ info, skutek: SKUTEK[info] }));
  return { niejasne, zgubione, ok: niejasne.length === 0 && zgubione.length === 0 };
}
