/**
 * Tekst z adnotacją (silnik `korpus`, E2) — typy.
 *
 * Tekst lekcji jest DANYMI: zdania (albo wersy), wyrazy z lematem i znacznikiem
 * morfologicznym, nazwane fragmenty (wypowiedzi, uczucia, obietnice) i kotwice
 * dowodów między nimi. Sędziowie czytają te adnotacje, nie zgadują — dlatego
 * pytanie „po czym to poznałeś?” ma odpowiedź zapisaną w tekście, a nie klucz
 * autora w głowie.
 *
 * Źródło tekstu pisze człowiek (`KorpusSource`, znaczniki w `body`), analizy
 * wyrazów daje skrypt `scripts/polski-adnotuj.py` (słownik SGJP), a
 * `buildKorpus()` skleja jedno z drugim w gotowy `Korpus`.
 */

/** Jedna analiza wyrazu ze słownika SGJP: lemat i znacznik NKJP/SGJP (`subst:sg:nom:m3`). */
export interface Morph {
  lemma: string;
  tag: string;
}

/** Tabela analiz z `*.morph.ts` — klucz to forma małymi literami; pierwsza analiza jest domyślna. */
export type MorphTable = Record<string, Morph[]>;

/** Części mowy tak, jak uczy ich szkoła (klasa 4), a nie tak, jak dzieli je słownik. */
export type SchoolPos =
  | 'rzeczownik'
  | 'czasownik'
  | 'przymiotnik'
  | 'przyslowek'
  | 'liczebnik'
  | 'zaimek'
  | 'przyimek'
  | 'spojnik'
  | 'partykula'
  | 'wykrzyknik'
  | 'imieslow'
  | 'skrot';

/** Opis nazwanego fragmentu — znaczniki `[[id …]]` w `body`, metadane tutaj. */
export interface SpanMeta {
  /** Rodzaj fragmentu, np. `wypowiedz`, `uczucie`, `potrzeba`, `obietnica`. */
  kind: string;
  /** Kto mówi (identyfikator postaci), jeśli fragment jest wypowiedzią. */
  speaker?: string;
  /** Do kogo (identyfikator postaci). */
  to?: string;
  /** Dowolne dane lekcji (np. `skutek: 'przeprosiny'`). */
  data?: Record<string, string | number | boolean>;
}

/**
 * Kotwica dowodu: „fragment `from` ma skutek/dowód w `to`”. `to` to id fragmentu
 * (`[[id …]]`) albo zdania/wersu (`s3`, `v2`). Lekcja nadaje `kind` (np.
 * `przeprosiny`, `rozsmieszenie`, `uczucie`, `potrzeba`).
 */
export interface AnchorDef {
  kind: string;
  from: string;
  to: string;
}

export interface KorpusSource {
  id: string;
  /**
   * `prose` — akapity oddzielone pustą linią, zdania dzielone automatycznie.
   * `verse` — każda linia to wers, pusta linia to granica strofy.
   */
  layout: 'prose' | 'verse';
  /**
   * Tekst ze znacznikami:
   * - `[[id treść]]` — nazwany fragment (id: `[a-z0-9-]+`, bez zagnieżdżania,
   *   w obrębie jednego akapitu/strofy);
   * - `wyraz{lemat|tag}`, `wyraz{|tag}`, `wyraz{=zaimek}`, `wyraz{lemat|tag=zaimek}`
   *   — nadpisanie analizy dla tego jednego wystąpienia (ujednoznacznienie);
   * - `wyraz{#id}` — własny identyfikator wyrazu (dla luk i kotwic do wyrazu).
   */
  body: string;
  spans?: Record<string, SpanMeta>;
  anchors?: AnchorDef[];
  morph?: MorphTable;
}

export type TokenType = 'word' | 'punct';

export interface Token {
  /** `t0`, `t1`… albo własny z `{#id}`. */
  id: string;
  /** Kolejność w całym tekście. */
  index: number;
  type: TokenType;
  /** Forma dokładnie jak w tekście. */
  form: string;
  /** Odstęp po tokenie przy wyświetlaniu (`' '`, `''`). */
  after: string;
  unitId: string;
  /** Fragmenty `[[…]]`, do których należy wyraz. */
  spanIds: string[];
  /** Tylko dla wyrazów: wybrana analiza (nadpisanie albo pierwsza z tabeli). */
  morph?: Morph;
  /** Wszystkie analizy z tabeli (do raportu wieloznaczności). */
  alternatives?: Morph[];
  pos?: SchoolPos;
  /** Analiza nadpisana w tekście — autor ujednoznacznił ten wyraz. */
  resolved?: boolean;
}

export interface Unit {
  /** `s0`, `s1`… (zdania) albo `v0`, `v1`… (wersy). */
  id: string;
  index: number;
  kind: 'sentence' | 'verse';
  /** Akapit (proza) albo strofa (wiersz), od 0. */
  block: number;
  tokenIds: string[];
  /** Tekst zdania/wersu złożony z form i odstępów. */
  text: string;
}

export interface Span {
  id: string;
  meta: SpanMeta;
  tokenIds: string[];
  /** Zdania/wersy, przez które fragment przechodzi. */
  unitIds: string[];
}

export interface Korpus {
  id: string;
  layout: KorpusSource['layout'];
  tokens: Token[];
  tokenById: Record<string, Token>;
  units: Unit[];
  unitById: Record<string, Unit>;
  /** Akapity/strofy jako listy id zdań/wersów. */
  blocks: string[][];
  spans: Record<string, Span>;
  anchors: AnchorDef[];
  morph: MorphTable;
}
