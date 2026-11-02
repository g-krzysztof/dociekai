/**
 * L3, blok 2 „Czym się różnią?” — nakładanie dwóch własnych wiadomości.
 *
 * Wiadomość do Tymka nakłada się na wiadomość do pani dyrektor: słowa wspólne
 * się zlewają, różne wystają. Dziecko stuka wystające słowa w wiadomości do
 * pani dyrektor i je odejmuje. Słowo grzeczności znika, a twarz dyrektorki
 * gaśnie; słowo, które niesie **sprawę** („piłkę”, „zwrot”), nie
 * daje się odjąć — bez niego nie wiadomo, o co chodzi. Tak zostają wyłuskane
 * słowa grzeczności, a dopiero potem pada termin. Sedno nie brzmi „grzeczność
 * zniknęła”, tylko „zmieniła odmianę”: do Tymka potoczna („Cześć”, „Dzięki”),
 * do pani dyrektor oficjalna.
 */

export interface Slowo {
  /** Pozycja w wiadomości (klucz). */
  i: number;
  /** Jak w tekście (z interpunkcją). */
  form: string;
  /** Małymi literami, bez interpunkcji — do porównań. */
  low: string;
}

export const slowa = (text: string): Slowo[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((form, i) => ({ i, form, low: form.toLowerCase().replace(/[!?.,…:;„”"]/g, '') }));

/**
 * Słowa, które robią grzeczność (a nie sprawę). Lista zamknięta — z kafelków
 * L3 — i jawna dla dziecka po odjęciu: trafiają na tackę „słowa grzeczności”.
 * „Czy” tu nie ma: to tylko znak pytania w słowie, nie zwrot grzecznościowy.
 */
export const GRZECZNOSC = new Set(['dzień', 'dobry', 'szanowna', 'pani', 'mogłaby', 'uprzejmie', 'proszę', 'dziękuję', 'bardzo', 'wyrazami', 'szacunku', 'z']);

/** Słowa ani grzecznościowe, ani niosące sprawę — przy stuknięciu mówią, czym są. */
const POMOCNICZE: Record<string, string> = {
  czy: '„Czy” robi z prośby pytanie — to jeszcze nie zwrot grzecznościowy. Szukaj słów, które niosą szacunek.',
  o: '„o” tylko łączy słowa w zdaniu. Szukaj słów, które niosą szacunek.',
};

/** Słowa wiadomości `b`, których nie ma w `a` (wystają po nałożeniu). */
export function wystajace(a: Slowo[], b: Slowo[]): Set<number> {
  const inA = new Set(a.map((s) => s.low));
  return new Set(b.filter((s) => !inA.has(s.low)).map((s) => s.i));
}

export type Odjecie = { ok: true } | { ok: false; mowi: string };

/** Czy słowo da się odjąć bez utraty sprawy. */
export function odejmij(s: Slowo): Odjecie {
  if (GRZECZNOSC.has(s.low)) return { ok: true };
  if (POMOCNICZE[s.low]) return { ok: false, mowi: POMOCNICZE[s.low] };
  return { ok: false, mowi: `Bez „${s.form.replace(/[!?.,]/g, '')}” nie wiem, o co prosisz. To słowo niesie sprawę, nie grzeczność.` };
}

/**
 * Słowa grzeczności, które wystają po nałożeniu — **wszystkie** trzeba odjąć,
 * żeby blok się domknął (inaczej zostają „Pani” i „Dziękuję”, czyli sedno).
 */
export const doOdjecia = (b: Slowo[], stick: Set<number>) => b.filter((s) => stick.has(s.i) && GRZECZNOSC.has(s.low)).map((s) => s.i);

/** Odjęte słowa w kolejności wiadomości, sąsiednie sklejone w zwroty („Dzień dobry”, „mogłaby Pani”). */
export function zwroty(b: Slowo[], removed: number[]): string[] {
  const ids = [...removed].sort((x, y) => x - y);
  const out: string[][] = [];
  ids.forEach((i, n) => {
    const w = b[i].form.replace(/[!?.,]/g, '');
    if (n > 0 && ids[n - 1] === i - 1 && !/[!?.]$/.test(b[i - 1].form)) out[out.length - 1].push(w);
    else out.push([w]);
  });
  return out.map((g) => g.join(' '));
}

/** Mina dyrektorki po odjęciu `removed` z `total` słów grzeczności. */
export function minaPoOdjeciu(removed: number, total: number): 'usmiech' | 'zdziwienie' | 'grymas' {
  if (removed === 0) return 'usmiech';
  if (removed < Math.max(1, total)) return 'zdziwienie';
  return 'grymas';
}
