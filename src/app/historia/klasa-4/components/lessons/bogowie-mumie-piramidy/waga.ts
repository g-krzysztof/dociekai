/**
 * Blok 2 L20 — sąd Ozyrysa. Czyste dane i sędziowie.
 *
 * Papirus: Księga Umarłych pisarza Hunefera (ok. 1300 r. p.n.e., British
 * Museum EA 9901), fotografia z Wikimedia Commons, domena publiczna. Pozycje
 * postaci to ułamek szerokości fotografii 1280 × 582.
 *
 * Zasady w wadze serca: parafraza kilku „zapewnień” zmarłego z rozdziału 125
 * Księgi Umarłych („nie kradłem”, „nie kłamałem”, „nie oszukiwałem na mierze
 * zboża”, „nie zatrzymałem wody w porze wylewu”) — omówione własnymi słowami.
 * Neferu i jego życie są wymyślone (rekonstrukcja, podpisana w lekcji).
 */

export interface PapyrusStop {
  id: string;
  /** Środek postaci, ułamek szerokości fotografii. */
  x: number;
  name: string;
  sign: string;
  text: string;
}

export const PAPYRUS_STOPS: PapyrusStop[] = [
  {
    id: 'hunefer',
    x: 0.05,
    name: 'Hunefer',
    sign: 'człowiek w białej szacie',
    text: 'To zmarły — pisarz Hunefer. Ten papirus włożono mu do grobu. Wchodzi na sąd.',
  },
  {
    id: 'anubis',
    x: 0.12,
    name: 'Anubis',
    sign: 'głowa szakala',
    text: 'Anubis prowadzi zmarłego za rękę. To bóg zmarłych i opiekun balsamowania ciał.',
  },
  {
    id: 'waga',
    x: 0.27,
    name: 'Anubis przy wadze',
    sign: 'waga z dwiema szalami',
    text: 'Na jednej szali serce zmarłego (w małym naczyniu), na drugiej pióro bogini Maat — prawdy i porządku. Anubis pilnuje, by waga ważyła uczciwie.',
  },
  {
    id: 'ammit',
    x: 0.34,
    name: 'Ammit',
    sign: 'głowa krokodyla, grzywa lwa',
    text: 'Pożeraczka Ammit czeka obok. Gdyby serce okazało się cięższe od pióra, zjadłaby je — i zmarły zniknąłby na zawsze.',
  },
  {
    id: 'thot',
    x: 0.47,
    name: 'Thot',
    sign: 'głowa ibisa (ptaka z długim dziobem)',
    text: 'Thot zapisuje wynik ważenia na tabliczce. To bóg pisma i mądrości — patron pisarzy, takich jak Hunefer.',
  },
  {
    id: 'horus',
    x: 0.62,
    name: 'Horus',
    sign: 'głowa sokoła',
    text: 'Serce i pióro ważyły tyle samo! Horus prowadzi Hunefera do Ozyrysa. Horus był opiekunem faraona.',
  },
  {
    id: 'ozyrys',
    x: 0.84,
    name: 'Ozyrys',
    sign: 'biała korona, zielona skóra, tron',
    text: 'Ozyrys — władca zaświatów i sędzia zmarłych. Zielona skóra to kolor roślin, które co roku odradzają się po wylewie. On wpuszcza Hunefera do krainy wiecznego życia.',
  },
  {
    id: 'izyda',
    x: 0.92,
    name: 'Izyda i Neftyda',
    sign: 'dwie kobiety za tronem',
    text: 'Za tronem stoją dwie boginie. Izyda — żona Ozyrysa, opiekunka rodzin i chorych, czarodziejka. Obok jej siostra Neftyda.',
  },
];

export interface Rule {
  id: string;
  text: string;
}

export const RULES: Rule[] = [
  { id: 'krasc', text: 'Nie kradłem.' },
  { id: 'klamac', text: 'Nie kłamałem.' },
  { id: 'miara', text: 'Nie oszukiwałem na mierze zboża.' },
  { id: 'woda', text: 'Nie zatrzymałem wody w porze wylewu.' },
];

export interface Deed {
  id: string;
  text: string;
  /** Zasada, którą ten czyn łamie — albo `null`, gdy żadnej. */
  breaks: string | null;
  /** Dlaczego nie łamie (odrzut, gdy dziecko położy go na sercu). */
  whyOk?: string;
  /** Jak Neferu może to naprawić, póki żyje. */
  mended?: string;
}

export const DEEDS: Deed[] = [
  {
    id: 'odwaznik',
    text: 'Sprzedając mąkę, dokleił pod odważnik grudkę gliny, żeby wydawać mniej.',
    breaks: 'miara',
    mended: 'Oderwał glinę od odważnika i oddał klientom mąkę, której im nie dosypał.',
  },
  {
    id: 'worek',
    text: 'Znalazł na targu worek mąki zgubiony przez sąsiada i odniósł mu go.',
    breaks: null,
    whyOk: 'Odniósł cudzy worek — to przeciwieństwo kradzieży.',
  },
  {
    id: 'pisarz',
    text: 'Powiedział pisarzowi prawdę, ile worków zebrał, choć mógł zataić dwa.',
    breaks: null,
    whyOk: 'Powiedział prawdę — nie skłamał.',
  },
  {
    id: 'row',
    text: 'W porze wylewu otworzył swój rów, żeby woda dopłynęła też do pola wdowy.',
    breaks: null,
    whyOk: 'Przepuścił wodę dalej — nie zatrzymał jej.',
  },
  {
    id: 'placek',
    text: 'W świątyni zjadł placek złożony w ofierze bogom, gdy nikt nie patrzył.',
    breaks: 'krasc',
    mended: 'Upiekł dwa placki i sam zaniósł je do świątyni.',
  },
  {
    id: 'piosenka',
    text: 'Fałszował, śpiewając przy pieczeniu chleba.',
    breaks: null,
    whyOk: 'Fałszowanie piosenki to nie kłamstwo — żadna zasada tego nie zabrania.',
  },
];

export type Pan = 'serce' | 'obok';

export type DeedVerdict =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Dziecko kładzie czyn na szali serca (łamie którąś zasadę) albo odkłada
 * obok (nie łamie żadnej). Sędzią są zasady wypisane nad wagą.
 */
export function judgeDeed(deed: Deed, pan: Pan): DeedVerdict {
  if (pan === 'serce' && deed.breaks === null) return { ok: false, reason: deed.whyOk ?? 'Ten czyn nie łamie żadnej zasady.' };
  if (pan === 'obok' && deed.breaks !== null) {
    const rule = RULES.find((r) => r.id === deed.breaks);
    return { ok: false, reason: `Przeczytaj zasady jeszcze raz — ten czyn łamie zasadę „${rule?.text ?? ''}”` };
  }
  return { ok: true };
}

/** Przechył wagi: 0 = równo, dodatnie = serce cięższe. Każdy nienaprawiony zły czyn to jeden stopień. */
export function heartTilt(onHeart: string[], mended: string[]): number {
  return onHeart.filter((id) => !mended.includes(id)).length;
}
