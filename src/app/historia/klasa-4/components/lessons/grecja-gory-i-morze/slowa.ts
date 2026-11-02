/**
 * Czysta logika bloku 4 — **Greckie słowa po polsku**. Pochodzenie słów to fakt
 * ze słowników etymologicznych (W. Boryś, „Słownik etymologiczny języka polskiego”,
 * 2005; Słownik wyrazów obcych PWN), nie klucz autora. Wszystkie pozostałe słowa
 * tekstu są rodzime (słowiańskie) albo mają własną notkę — tekst jest tak ułożony.
 */

export interface Greek {
  lemma: string;
  parts: { gr: string; pl: string }[];
  note?: string;
}

export const GREEK: Record<string, Greek> = {
  szkola: { lemma: 'szkoła', parts: [{ gr: 'scholē', pl: 'wolny czas' }], note: 'Uczyć się mógł ten, kto miał wolne od pracy. Do nas słowo przyszło przez łacinę.' },
  matematyka: { lemma: 'matematyka', parts: [{ gr: 'máthēma', pl: 'to, czego się uczysz' }] },
  historia: { lemma: 'historia', parts: [{ gr: 'historía', pl: 'dociekanie, badanie' }], note: 'Pierwszy tak nazwał swoją księgę Herodot — ten sam, którego sprawdzałeś/łaś w lekcji o Nilu.' },
  telefon: { lemma: 'telefon', parts: [{ gr: 'tēle', pl: 'daleko' }, { gr: 'phōnē', pl: 'głos' }] },
  gimnastyka: { lemma: 'gimnastyka', parts: [{ gr: 'gymnós', pl: 'nagi' }], note: 'Greccy chłopcy ćwiczyli bez ubrań.' },
  biblioteka: { lemma: 'biblioteka', parts: [{ gr: 'biblíon', pl: 'książka' }, { gr: 'thḗkē', pl: 'skrzynia, schowek' }] },
  dinozaur: { lemma: 'dinozaur', parts: [{ gr: 'deinós', pl: 'straszny' }, { gr: 'saûros', pl: 'jaszczur' }], note: 'To słowo ułożył z greckich cząstek angielski uczony Richard Owen w 1842 roku — Grecy dinozaurów nie znali.' },
  geografia: { lemma: 'geografia', parts: [{ gr: 'gē', pl: 'ziemia' }, { gr: 'gráphō', pl: 'piszę, rysuję' }] },
  teatr: { lemma: 'teatr', parts: [{ gr: 'théatron', pl: 'miejsce do oglądania' }] },
  olimpiada: { lemma: 'olimpiada', parts: [{ gr: 'Olympía', pl: 'miejsce igrzysk' }], note: 'U Greków olimpiada to były cztery lata między jednymi igrzyskami a następnymi.' },
  demokracja: { lemma: 'demokracja', parts: [{ gr: 'dēmos', pl: 'lud' }, { gr: 'krátos', pl: 'władza' }] },
  muzyka: { lemma: 'muzyka', parts: [{ gr: 'mousikḗ', pl: 'sztuka Muz' }], note: 'Muzy to greckie boginie śpiewu, poezji i nauki.' },
};

/** Słowa obce, ale nie greckie — z krótką notką. */
const OTHER: Record<string, string> = {
  mape: 'mapa — z łaciny (mappa, „chusta, obrus”).',
  lekcjach: 'lekcja — z łaciny (lectio, „czytanie”).',
  klasa: 'klasa — z łaciny (classis, „grupa”).',
  kolegi: 'kolega — z łaciny (collega, „towarzysz”).',
  ksiazke: 'książka — słowo słowiańskie, bardzo stare. Ale grecka „biblioteka” kryje w sobie książkę!',
};

/** Tekst: `[słowo|klucz]` = słowo greckie z kluczem w GREEK, `{słowo|klucz}` = obce z notką. */
export const TEXT = [
  'Rano biegnę do [szkoły|szkola]. Pierwsza jest [matematyka|matematyka], potem [historia|historia].',
  'Na przerwie dzwoni [telefon|telefon] {kolegi|kolegi}.',
  'Na [gimnastyce|gimnastyka] skaczemy przez kozła.',
  'W [bibliotece|biblioteka] pani pokazuje mi {książkę|ksiazke} o [dinozaurach|dinozaur] i {mapę|mape} do [geografii|geografia].',
  'Po {lekcjach|lekcjach} idziemy całą {klasą|klasa} do [teatru|teatr], a wieczorem oglądam [olimpiadę|olimpiada].',
  'Mama mówi, że w naszym kraju jest [demokracja|demokracja]. Zasypiam przy [muzyce|muzyka].',
];

export type Token =
  | { kind: 'gr'; text: string; key: string; id: string }
  | { kind: 'obce'; text: string; note: string; id: string }
  | { kind: 'pl'; text: string; id: string }
  | { kind: 'sep'; text: string; id: string };

export function tokenize(): Token[][] {
  return TEXT.map((line, li) => {
    const out: Token[] = [];
    const re = /\[([^|\]]+)\|([^\]]+)\]|\{([^|}]+)\|([^}]+)\}|([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)|([^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż[{]+)/g;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(line))) {
      const id = `${li}-${i++}`;
      if (m[1]) out.push({ kind: 'gr', text: m[1], key: m[2], id });
      else if (m[3]) out.push({ kind: 'obce', text: m[3], note: OTHER[m[4]], id });
      else if (m[5]) out.push({ kind: 'pl', text: m[5], id });
      else out.push({ kind: 'sep', text: m[6], id });
    }
    return out;
  });
}

export const GREEK_TOTAL = Object.keys(GREEK).length;

// ── warsztat: sklejanie greckich cząstek ──
export const PARTS: { id: string; pl: string }[] = [
  { id: 'tele', pl: 'daleko' },
  { id: 'mikro', pl: 'mały' },
  { id: 'geo', pl: 'ziemia' },
  { id: 'bio', pl: 'życie' },
  { id: 'foto', pl: 'światło' },
  { id: 'termo', pl: 'ciepło' },
  { id: 'auto', pl: 'sam' },
  { id: 'fon', pl: 'głos, dźwięk' },
  { id: 'skop', pl: 'patrzę' },
  { id: 'graf', pl: 'piszę, rysuję' },
  { id: 'logia', pl: 'nauka o…' },
  { id: 'metr', pl: 'miara' },
];

/** Prawdziwe polskie słowa z dwóch cząstek (pierwsza + druga). */
export const WORDS: Record<string, { word: string; means: string }> = {
  'tele+fon': { word: 'telefon', means: 'głos z daleka' },
  'tele+skop': { word: 'teleskop', means: 'patrzę daleko — oglądasz nim gwiazdy' },
  'tele+graf': { word: 'telegraf', means: 'piszę daleko — przesyłał wiadomości po drucie' },
  'mikro+skop': { word: 'mikroskop', means: 'patrzę na małe — widać w nim komórki' },
  'mikro+fon': { word: 'mikrofon', means: 'mały dźwięk — łapie cichy głos' },
  'geo+graf': { word: 'geografia', means: 'opisuję ziemię' },
  'geo+logia': { word: 'geologia', means: 'nauka o ziemi i skałach' },
  'geo+metr': { word: 'geometria', means: 'mierzę ziemię — Herodot pisał, że Grecy nauczyli się jej od egipskich mierniczych' },
  'bio+logia': { word: 'biologia', means: 'nauka o życiu' },
  'bio+graf': { word: 'biografia', means: 'opisuję życie — książka o czyimś życiu' },
  'foto+graf': { word: 'fotografia', means: 'rysuję światłem' },
  'termo+metr': { word: 'termometr', means: 'miara ciepła' },
  'auto+graf': { word: 'autograf', means: 'sam napisałem — podpis własną ręką' },
  'graf+logia': { word: 'grafologia', means: 'nauka o piśmie — badanie charakteru pisma' },
};

/** Słowa z tekstu nie liczą się do warsztatu — trzeba zbudować nowe. */
export const IN_TEXT = new Set(['telefon', 'geografia']);
export const WORKSHOP_GOAL = 3;

export type ComposeVerdict =
  | { kind: 'slowo'; word: string; means: string; known: boolean }
  | { kind: 'odwrotnie'; why: string }
  | { kind: 'brak'; why: string };

export function compose(a: string, b: string): ComposeVerdict {
  const hit = WORDS[`${a}+${b}`];
  if (hit) return { kind: 'slowo', ...hit, known: IN_TEXT.has(hit.word) };
  if (WORDS[`${b}+${a}`]) return { kind: 'odwrotnie', why: 'Prawie! Takie słowo jest, ale cząstki stoją w nim odwrotnie.' };
  const pa = PARTS.find((p) => p.id === a)!.pl.replace('…', '');
  const pb = PARTS.find((p) => p.id === b)!.pl.replace('…', '');
  return { kind: 'brak', why: `„${a}${b}” — Grek zrozumiałby „${pa} + ${pb}”, ale takiego słowa po polsku nie ma.` };
}
