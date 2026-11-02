import { count } from '../../../lib/plural';
import type { ProofCriterion, ProofOutcome, ProofVerdict } from '../../task-shell';
import {
  hiddenAt,
  oneByOne,
  runStage,
  shownAt,
  together,
  type ActorDef,
  type StageRun,
} from '../../scratch/stage-engine';

/**
 * Werdykt zadania obowiązkowego **Z-8**: „Utwórz program, w którym duszkami będą
 * litery twojego imienia. Po uruchomieniu projektu na scenie powinny pojawiać się
 * kolejne litery, aż będzie widoczne całe imię. Następnie wszystkie litery
 * powinny jednocześnie zniknąć.”
 *
 * **Ten werdykt nie czyta klocków — on uruchamia program.** Pytanie brzmi „czy
 * znikają **jednocześnie**”, a to jest zdanie o czasie. Do tego samego wyniku
 * prowadzą dwie zupełnie różne drogi, obie wymienione w treści zadania — łańcuch
 * czekań albo komunikat — więc ocenianie po kształcie skryptu odrzucałoby połowę
 * poprawnych rozwiązań. Dlatego skrypty ze strony (`ActorDef[]`) idą przez
 * `runStage()` i werdykt patrzy na zegar: kiedy każda litera się pojawiła i kiedy
 * znikła. Ten sam pomiar, którym mierzy się ćwiczenia w środku lekcji.
 *
 * Litery to **wpisane imię**, nie zgadywanie z nazw duszków: dokładnie
 * porównywalna wartość, więc werdykt nie musi odgadywać, co dziecko miało na myśli.
 *
 * Czego świadomie **nie** wymagamy: komunikatu. Trzy litery z równym czekaniem
 * też znikną w tej samej chwili i zadanie tego nie zabrania — więc uznajemy i
 * mówimy wprost, czym komunikat jest lepszy.
 */

/** Ile liter musi mieć imię, żeby „po kolei” miało co znaczyć. */
export const MIN_LETTERS = 3;

/** Litera imienia i id jej duszka w `ActorDef[]`. */
export interface NameLetter {
  id: string;
  letter: string;
}

export interface Z8Letter extends NameLetter {
  shown: number | null;
  hidden: number | null;
}

export interface Z8Report {
  actors: ActorDef[];
  run: StageRun;
  letters: Z8Letter[];
  /** Imię wpisane przez dziecko, wielkimi literami. */
  name: string;
}

export const Z8_CRITERIA: ProofCriterion[] = [
  { id: 'litery', label: 'Duszkami są litery twojego imienia — co najmniej trzy.' },
  { id: 'start', label: 'Po kliknięciu zielonej flagi rusza skrypt każdej litery.' },
  { id: 'pokolei', label: 'Litery pojawiają się jedna po drugiej, a nie wszystkie naraz.' },
  { id: 'cale', label: 'Jest taka chwila, w której widać całe imię.' },
  { id: 'naraz', label: 'Potem wszystkie litery znikają w tej samej chwili.' },
];

const seconds = (ms: number | null) => ((ms ?? 0) / 1000).toFixed(1);

export function judgeZ8(cast: NameLetter[], actors: ActorDef[]): ProofOutcome<Z8Report> {
  const run = runStage(actors, { kind: 'flaga' });

  const letters: Z8Letter[] = cast.map((item) => {
    const actor = actors.find((candidate) => candidate.id === item.id);
    return {
      ...item,
      shown: actor ? shownAt(run, item.id, actor.home) : null,
      hidden: actor ? hiddenAt(run, item.id, actor.home) : null,
    };
  });

  const big = (list: Z8Letter[]) => list.map((item) => item.letter.toUpperCase()).join(', ');
  const one = (list: Z8Letter[], single: string, many: string) => (list.length === 1 ? single : many);
  const timed = (list: Z8Letter[], at: 'shown' | 'hidden') =>
    list.map((item) => `${item.letter.toUpperCase()} w ${seconds(item[at])} s`).join(', ');

  const name = letters.map((item) => item.letter.toUpperCase()).join('');
  const shows = letters.map((item) => item.shown);
  const hides = letters.map((item) => item.hidden);
  const silent = letters.filter((item) => !run.woken.includes(item.id));
  const never = letters.filter((item) => item.shown == null);
  const stillThere = letters.filter((item) => item.hidden == null);
  const tooFew = letters.length < MIN_LETTERS;
  const needLetters = 'Najpierw muszą być co najmniej trzy litery.';

  /* „Widać całe imię” = ostatnia litera zdążyła się pokazać, zanim pierwsza znikła. */
  const lastShown = shows.every((time) => time != null) ? Math.max(...(shows as number[])) : null;
  const firstHidden = hides.some((time) => time != null)
    ? Math.min(...hides.filter((time): time is number => time != null))
    : null;
  const whole = lastShown != null && (firstHidden == null || lastShown < firstHidden);

  const usedBroadcast = run.log.some((step) => step.kind === 'komunikat');
  /*
   * „Kolejne litery” z treści zadania to litery **w kolejności imienia**: K, potem A, potem S.
   * Same różne chwile nie wystarczą — imię czytane od prawej do lewej albo z jedną literą
   * widoczną od początku, a resztą później, to nie jest „pojawiają się kolejne litery”.
   */
  const inOrder = shows.every((time, index) => {
    const before = index > 0 ? shows[index - 1] : null;
    return index === 0 || (time != null && before != null && time > before);
  });
  const oneAfterAnother = oneByOne(shows);
  /* Komunikat, który poszedł, zanim ostatnie litery się pojawiły, „ukrywa” niewidoczne — i one zostają. */
  const firstBroadcast = run.log.find((step) => step.kind === 'komunikat');
  const tooEarly = firstBroadcast
    ? stillThere.filter((item) => item.shown != null && item.shown > firstBroadcast.t)
    : [];

  const litery = (): ProofVerdict => {
    if (!tooFew)
      return {
        ok: true,
        note: `Na scenie stoją litery twojego imienia, od lewej do prawej: ${letters.map((item) => item.letter.toUpperCase()).join(' ')}.`,
      };
    return {
      ok: false,
      note:
        letters.length > 0
          ? `Masz tylko ${count(letters.length, 'literę', 'litery', 'liter')} (${big(letters)}). „Po kolei” potrzebuje co najmniej trzech — wpisz swoje imię w całości albo, jeśli jest krótkie, to, jak cię wołają w domu.`
          : 'Nie ma jeszcze ani jednej litery. Wpisz swoje imię w polu nad skryptami — każda litera będzie osobnym duszkiem.',
    };
  };

  const start = (): ProofVerdict => {
    if (letters.length === 0) return { ok: false, note: needLetters };
    if (silent.length === 0)
      return {
        ok: true,
        note: `Zielona flaga uruchamia ${count(run.woken.length, 'skrypt', 'skrypty', 'skryptów')} — żadna litera nie została bez zajęcia.`,
      };
    return {
      ok: false,
      note: `Po zielonej fladze nic się nie dzieje u ${one(silent, 'litery', 'liter')} ${big(silent)}. Sprawdź, czy ${one(silent, 'ta litera ma', 'te litery mają')} skrypt zaczynający się od kapelusza — od flagi albo od komunikatu, który ktoś naprawdę nadaje.`,
    };
  };

  const pokolei = (): ProofVerdict => {
    if (tooFew) return { ok: false, note: needLetters };
    if (never.length > 0)
      return {
        ok: false,
        note: `${one(never, 'Litera', 'Litery')} ${big(never)} w ogóle się nie ${one(never, 'pojawia', 'pojawiają')} — ${one(never, 'jest ukryta i nikt jej', 'są ukryte i nikt ich')} nie pokazuje klockiem „pokaż”.`,
      };
    if (oneAfterAnother && inOrder)
      return { ok: true, note: `Pojawiają się po kolei: ${timed(letters, 'shown')}.` };
    if (oneAfterAnother)
      return {
        ok: false,
        note: `Pojawiają się jedna po drugiej, ale nie w kolejności imienia: ${timed(letters, 'shown')}. „Kolejne litery” to ${letters.slice(0, 3).map((item) => item.letter.toUpperCase()).join(', potem ')}… — daj im czekania rosnące od lewej do prawej.`,
      };
    if (letters.every((item) => item.shown === 0))
      return {
        ok: false,
        note: 'Wszystkie litery są widoczne od pierwszej chwili — nie ma czego oglądać. Każda litera musi zacząć skrypt od klocka „ukryj”, a dopiero po swoim czekaniu wykonać „pokaż”.',
      };
    return {
      ok: false,
      note: 'Co najmniej dwie litery pojawiają się w tej samej chwili. Daj każdej inne czekanie przed klockiem „pokaż”.',
    };
  };

  const cale = (): ProofVerdict => {
    if (tooFew) return { ok: false, note: needLetters };
    if (!whole) {
      if (never.length > 0) return { ok: false, note: 'Nie wszystkie litery zdążyły się pokazać.' };
      return {
        ok: false,
        note: `Litera zaczyna znikać, zanim pojawi się ostatnia — pierwsze zniknięcie jest w ${seconds(firstHidden)} s, a ostatnia litera pokazuje się dopiero w ${seconds(lastShown)} s. Odsuń znikanie w czasie, żeby całe imię dało się przeczytać.`,
      };
    }
    /* Litery widoczne od pierwszej chwili to „całe imię” tylko z nazwy — nic się nie pojawiło. */
    if ((lastShown ?? 0) === 0)
      return {
        ok: false,
        note: 'Całe imię jest widoczne od pierwszej chwili — nic się nie pojawia, więc nie ma czego oglądać. Zobacz wyżej, dlaczego.',
      };
    return { ok: true, note: `Całe imię „${name}” jest widoczne od ${seconds(lastShown)} s.` };
  };

  const naraz = (): ProofVerdict => {
    if (tooFew) return { ok: false, note: needLetters };
    if (never.length > 0)
      return { ok: false, note: 'Najpierw wszystkie litery muszą się pojawić — zobacz wyżej, której brakuje.' };
    if (tooEarly.length > 0)
      return {
        ok: false,
        note: `Komunikat poszedł w ${seconds(firstBroadcast?.t ?? 0)} s, a ${one(tooEarly, 'litera', 'litery')} ${big(tooEarly)} ${one(tooEarly, 'pokazuje się', 'pokazują się')} dopiero potem — ${one(tooEarly, 'jej', 'ich')} „ukryj” wykonało się, zanim ${one(tooEarly, 'ją', 'je')} było widać, i ${one(tooEarly, 'zostaje', 'zostają')} na scenie. Nadaj komunikat później niż pojawi się ostatnia litera.`,
      };
    if (stillThere.length > 0)
      return {
        ok: false,
        note: `${one(stillThere, 'Litera', 'Litery')} ${big(stillThere)} ${one(stillThere, 'zostaje', 'zostają')} na scenie. Sprawdź, czy ${one(stillThere, 'ma', 'mają')} klocek „ukryj” i czy jego kapelusz czeka na komunikat, który ktoś naprawdę nadaje.`,
      };
    if (!together(hides))
      return {
        ok: false,
        note: `Znikają, ale nie razem: ${timed(letters, 'hidden')}. Najpewniejszy sposób to jeden komunikat („znikaj”) nadany raz i odebrany przez wszystkie litery.`,
      };
    return {
      ok: true,
      note: usedBroadcast
        ? `Wszystkie znikają w ${seconds(hides[0])} s — jednym komunikatem, dokładnie tak, jak prosi zadanie.`
        : `Wszystkie znikają w ${seconds(hides[0])} s. Zrobiłeś/zrobiłaś to równymi czekaniami i to działa — uznaję. Komunikat byłby jednak pewniejszy: przy nim nie trzeba przeliczać czekań od nowa, gdy zmienisz tempo pojawiania się.`,
    };
  };

  return {
    data: { actors, run, letters, name },
    verdicts: { litery: litery(), start: start(), pokolei: pokolei(), cale: cale(), naraz: naraz() },
  };
}
