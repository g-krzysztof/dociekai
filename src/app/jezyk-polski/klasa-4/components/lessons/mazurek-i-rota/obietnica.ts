import type { PisarniaAnalysis, PisWord } from '../../../lib/pisarnia/types';

/**
 * L9, blok 4 „Nasza obietnica” — sędzia **tylko struktury** (§ 6 programu):
 * jedno zdanie, wielka litera, kropka albo wykrzyknik (obietnica nie pyta) i
 * forma „my”. Treść należy do dziecka i nie jest oceniana.
 *
 * Forma „my” bez morfologii w przeglądarce: słowo `my` albo wyraz zakończony
 * na `-my` (czas teraźniejszy/przyszły i tryb rozkazujący: `pomożemy`,
 * `będziemy`, `nie damy`, `pomóżmy`) — z wyjątkiem rzeczowników z listy
 * (`domy`, `zimy`…). Końcówka `-śmy` to „my”, ale nie obietnica: `zrobiliśmy`
 * mówi o tym, co już było, `chcielibyśmy` — czego byśmy chcieli, a
 * `jesteśmy` — kim jesteśmy (jak wers „Polski my naród” w „Rocie”). Sędzia
 * zawsze pokazuje, **które słowo** przeczytał jako „my”.
 */

/** Rzeczowniki (i inne nie-czasowniki) na `-my`, które nie są formą „my”. */
export const NOT_MY = new Set([
  'domy', 'dymy', 'ramy', 'tamy', 'plamy', 'rymy', 'zimy', 'dżemy', 'problemy', 'systemy', 'filmy',
  'firmy', 'formy', 'szumy', 'tłumy', 'sumy', 'gumy', 'dumy', 'programy', 'bramy', 'lamy', 'piżamy',
  'reklamy', 'chromy', 'klamry', 'dramy', 'aromy', 'gnomy', 'atomy', 'albumy', 'tematy', 'kremy',
  'hełmy', 'szelmy', 'palmy', 'karmy', 'normy', 'termy', 'farmy', 'burmy', 'perfumy', 'kostiumy',
]);

/** Dawne formy z hymnu i „Roty” — gdyby dziecko pisało ich językiem. */
export const ARCHAIC_MY = new Set(['przejdziem', 'będziem', 'złączym', 'rzucim', 'pójdziem', 'podnosim', 'żyjem']);

export type MyReading = 'my' | 'obietnica' | 'przeszlosc' | 'warunek' | 'opis';

export interface MyWord {
  word: PisWord;
  reading: MyReading;
}

/** Jak sędzia czyta jeden wyraz (bez kontekstu). `null` — to nie jest forma „my”. */
export function readMy(low: string): MyReading | null {
  if (low === 'my') return 'my';
  if (ARCHAIC_MY.has(low)) return 'obietnica';
  if (low === 'jesteśmy') return 'opis';
  if (low.endsWith('byśmy')) return 'warunek';
  if (low.endsWith('śmy')) return 'przeszlosc';
  if (low.length >= 4 && low.endsWith('my') && !NOT_MY.has(low)) return 'obietnica';
  return null;
}

export function findMyWords(a: PisarniaAnalysis): MyWord[] {
  return a.words.flatMap((word) => {
    const reading = readMy(word.low);
    return reading ? [{ word, reading }] : [];
  });
}

export interface ObietnicaCheck {
  ok: boolean;
  note: string;
}

export interface ObietnicaVerdict {
  zdanie: ObietnicaCheck;
  my: ObietnicaCheck;
  /** Słowa przeczytane jako „my” — do podświetlenia w polu i w raporcie. */
  myWords: MyWord[];
}

const WHY_NOT: Record<Exclude<MyReading, 'my' | 'obietnica'>, (w: string) => string> = {
  przeszlosc: (w) => `„${w}” mówi o tym, co już było. Obietnica patrzy w przód: „zrobimy”, „będziemy”, „nie damy”.`,
  warunek: (w) => `„${w}” mówi, czego byście chcieli. Obietnica mówi, co zrobicie: „pomożemy”, „będziemy”.`,
  opis: (w) => `„${w}” mówi, kim jesteście — jak wers „Polski my naród” w „Rocie”. Obietnica mówi, co zrobicie.`,
};

export function judgeObietnica(a: PisarniaAnalysis): ObietnicaVerdict {
  const myWords = findMyWords(a);
  const sentences = a.sentences.filter((s) => s.words.length > 0);

  let zdanie: ObietnicaCheck;
  if (sentences.length === 0) zdanie = { ok: false, note: 'Pole jest jeszcze puste.' };
  else if (sentences.length > 1)
    zdanie = {
      ok: false,
      note: `Widzę ${sentences.length} ${sentences.length >= 5 ? 'zdań' : 'zdania'}. Obietnica ma być jedna — zostaw to zdanie, które jest najważniejsze.`,
    };
  else {
    const s = sentences[0];
    if (s.words.length < 3) zdanie = { ok: false, note: 'To za mało na obietnicę — powiedz, co zrobicie i dla kogo albo z czym.' };
    else if (!s.capitalOk) zdanie = { ok: false, note: 'Zdanie zaczyna się małą literą.' };
    else if (s.endMark === '?' || s.endMark === '?!')
      zdanie = { ok: false, note: 'Obietnica nie pyta — zakończ ją kropką albo wykrzyknikiem.' };
    else if (s.endMark !== '.' && s.endMark !== '!')
      zdanie = { ok: false, note: 'Na końcu brakuje kropki albo wykrzyknika.' };
    else zdanie = { ok: true, note: `Jedno zdanie, wielka litera, na końcu „${s.endMark}”.` };
  }

  const good = myWords.find((m) => m.reading === 'obietnica');
  const pronoun = myWords.find((m) => m.reading === 'my');
  const other = myWords.find((m) => m.reading !== 'obietnica' && m.reading !== 'my');
  let my: ObietnicaCheck;
  if (good) my = { ok: true, note: `„${good.word.form}” — w końcówce słychać „my”.` };
  else if (other) my = { ok: false, note: WHY_NOT[other.reading as keyof typeof WHY_NOT](other.word.form) };
  else if (pronoun)
    my = {
      ok: true,
      note: `Jest słowo „${pronoun.word.form}”.`,
    };
  else {
    const nasz = a.words.find((w) => /^nasz/.test(w.low));
    my = {
      ok: false,
      note: nasz
        ? `„${nasz.form}” mówi, czyje coś jest, ale nie, co zrobicie. Dopisz czasownik z „my”: „będziemy”, „pomożemy”, „nie damy”.`
        : 'Nie widzę „my”. Napisz, co zrobicie razem: „pomożemy”, „będziemy”, „nie damy” — albo użyj słowa „my”.',
    };
  }

  return { zdanie, my, myWords };
}
