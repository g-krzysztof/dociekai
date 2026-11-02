/**
 * Blok 3 — „Dwie bramki” (ćwiczenie) — dane i sędzia, bez Reacta.
 *
 * Dziecko przepuszcza przedmioty przez dwie bramki-pytań: „Da się tego
 * dotknąć?” → „Jest na tym pismo?”. Bramki same rozkładają źródła na pisane,
 * niepisane i niematerialne (F-I.2-04…07). Kategoria wynika z reguły, którą
 * dziecko samo stosuje — nie z klucza autora.
 *
 * Pułapka: pomnik z napisem bramka przepuszcza do „pisanych”, bo ma napis,
 * i mówi wprost, że pomnik jest też źródłem niepisanym (kamień, kształt).
 */

export type GateCategory = 'pisane' | 'niepisane' | 'niematerialne';

export interface GateItem {
  id: string;
  name: string;
  /** Krótki opis — dziecko widzi go na karcie przed bramkami. */
  about: string;
  touch: boolean;
  /** Czy jest na tym pismo; null, gdy pytanie nie ma sensu (nie da się dotknąć). */
  writing: boolean | null;
  category: GateCategory;
  /** Wskazówka przy pomyłce — konkret z przedmiotu, nie „spróbuj jeszcze raz”. */
  hintTouch: string;
  hintWriting: string;
  /** Komentarz po poprawnym przepuszczeniu (pułapka pomnika: dłuższy). */
  note: string;
}

export const GATE_ITEMS: GateItem[] = [
  {
    id: 'miecz',
    name: 'Żelazny miecz',
    about: 'Ciężki, zardzewiały miecz znaleziony w ziemi.',
    touch: true,
    writing: false,
    category: 'niepisane',
    hintTouch: 'Miecz wykopano z ziemi — da się go dotknąć (archeolog robi to w rękawiczkach).',
    hintWriting: 'Na tym mieczu nie ma żadnych liter ani napisów.',
    note: 'Miecz — źródło niepisane: opowiada kształtem i materiałem, nie literami.',
  },
  {
    id: 'list',
    name: 'List z dawnych lat',
    about: 'Zażółcony list, pisany ręcznie, ze znaczkiem.',
    touch: true,
    writing: true,
    category: 'pisane',
    hintTouch: 'List trzymasz w dłoni — da się go dotknąć.',
    hintWriting: 'List jest cały zapisany — to samo pismo.',
    note: 'List — źródło pisane.',
  },
  {
    id: 'hymn',
    name: 'Wspólne śpiewanie hymnu',
    about: 'Zwyczaj: w święto ludzie wstają i śpiewają razem — słyszysz to, ale nie złapiesz.',
    touch: false,
    writing: null,
    category: 'niematerialne',
    hintTouch: 'Spróbuj złapać śpiew dłonią — wspólnego śpiewania nie da się dotknąć.',
    hintWriting: 'Tu nie dochodzimy — czego nie da się dotknąć, to niematerialne.',
    note: 'Wspólne śpiewanie hymnu — źródło niematerialne: zwyczaj przekazywany z pokolenia na pokolenie. (Tekst i nuty hymnu zapisane na papierze to już źródło pisane).',
  },
  {
    id: 'garnek',
    name: 'Gliniany garnek',
    about: 'Lepiony ręcznie garnek ze skorup znalezionych w ziemi.',
    touch: true,
    writing: false,
    category: 'niepisane',
    hintTouch: 'Garnek stoi na półce — da się go dotknąć.',
    hintWriting: 'Na garnku nie ma liter — tylko odciski palców tego, kto go lepił.',
    note: 'Garnek — źródło niepisane.',
  },
  {
    id: 'pomnik',
    name: 'Pomnik z napisem',
    about: 'Kamienny pomnik na rynku, a na nim wykute litery.',
    touch: true,
    writing: true,
    category: 'pisane',
    hintTouch: 'Pomnik stoi na rynku — da się go dotknąć.',
    hintWriting: 'Na pomniku wykuto litery — jest na nim pismo, więc bramka puszcza go do pisanych.',
    note: 'Podchwytliwe! Pomnik to też źródło niepisane (kamień, kształt) — ale skoro jest na nim napis, bramka przepuszcza go do pisanych. Historyk przeczyta napis i obejrzy kamień.',
  },
  {
    id: 'opowiesc',
    name: 'Opowieść babci',
    about: 'Historia, którą babcia opowiada przy stole — tylko słowa i pamięć.',
    touch: false,
    writing: null,
    category: 'niematerialne',
    hintTouch: 'Opowieści nie da się włożyć do gabloty — nie da się jej dotknąć.',
    hintWriting: 'Tu nie dochodzimy — czego nie da się dotknąć, to niematerialne.',
    note: 'Opowieść babci — źródło niematerialne: tradycja i przekazy ustne.',
  },
  {
    id: 'fotografia',
    name: 'Stara fotografia',
    about: 'Zdjęcie pradziadków w dniu ślubu — bez żadnego podpisu.',
    touch: true,
    writing: false,
    category: 'niepisane',
    hintTouch: 'Fotografię możesz wziąć do ręki — da się jej dotknąć.',
    hintWriting: 'Na tym zdjęciu nie ma ani jednej litery — tylko ludzie, stroje i tło.',
    note: 'Fotografia — źródło niepisane, a dokładniej obrazowe: opowiada tym, co na niej widać (stroje, fryzury, miejsce). Obrazy i mapy też są źródłami obrazowymi.',
  },
  {
    id: 'kronika',
    name: 'Kronika',
    about: 'Gruba księga, w której dawno temu zapisano dzieje kraju.',
    touch: true,
    writing: true,
    category: 'pisane',
    hintTouch: 'Kronika leży na pulpicie — da się ją dotknąć.',
    hintWriting: 'Kronika to księga pełna zapisków — jest na niej pismo.',
    note: 'Kronika — źródło pisane.',
  },
  {
    id: 'bursztyn',
    name: 'Bursztynowa ozdoba',
    about: 'Złocisty bursztyn oprawiony w srebro — naszyjnik sprzed wieków.',
    touch: true,
    writing: false,
    category: 'niepisane',
    hintTouch: 'Naszyjnik możesz wziąć do ręki — da się go dotknąć.',
    hintWriting: 'Na bursztynie nie ma liter — zdobi, nie pisze.',
    note: 'Bursztynowa ozdoba — źródło niepisane.',
  },
];

export const CATEGORY_LABEL: Record<GateCategory, string> = {
  pisane: 'Pisane',
  niepisane: 'Niepisane',
  niematerialne: 'Niematerialne',
};

export function itemById(id: string): GateItem {
  const item = GATE_ITEMS.find((i) => i.id === id);
  if (!item) throw new Error(`Nie ma przedmiotu „${id}” na bramkach`);
  return item;
}

/** Sędzia bramki 1 („Da się tego dotknąć?”) — czysta funkcja. */
export function judgeTouch(itemId: string, answer: boolean): boolean {
  return itemById(itemId).touch === answer;
}

/** Sędzia bramki 2 („Jest na tym pismo?”) — czysta funkcja. */
export function judgeWriting(itemId: string, answer: boolean): boolean {
  return itemById(itemId).writing === answer;
}
