import { count } from '../../../lib/plural';
import type { ProofCriterion, ProofVerdicts } from '../../task-shell';
import { BLOCKS, HOME, hasHat, run, type Block, type Run, type Sprite } from '../../scratch/engine';

/**
 * Werdykt zadania praktycznego lekcji 29 — **uruchamia program dziecka dwa razy pod rząd**
 * i porównuje oba przebiegi.
 *
 * Zamówienie pyta o coś, czego nie widać w liście klocków: **czy drugie uruchomienie daje
 * ten sam wynik co pierwsze**. To zdanie o powtarzalności, więc rozstrzyga je wykonanie, nie
 * odczytanie skryptu — dwa programy o tym samym kształcie mogą się różnić jedną liczbą.
 *
 * Wykonuje silnik makiety (`run`), ten sam, który animuje scenę obok warsztatu, więc werdykt
 * i to, co dziecko widziało na scenie, nie mogą się rozejść.
 *
 * **Drugi przebieg startuje tam, gdzie skończył pierwszy** — bo dokładnie tak działa zielona
 * flaga w prawdziwym Scratchu. To jest cała usterka, o którą chodzi w lekcji.
 */

export const DELIVERY_CRITERIA: ProofCriterion[] = [
  { id: 'flaga', label: 'Test 1: jest skrypt pod zieloną flagą, a w nim ruch kota' },
  { id: 'start', label: 'Test 2: pierwszy klocek skryptu ustawia miejsce startu' },
  { id: 'droga', label: 'Test 3: kot przechodzi na drugą stronę sceny' },
  { id: 'widac', label: 'Test 4: widać, jak idzie — droga nie jest jednym przeskokiem' },
  { id: 'meta', label: 'Test 5: po ostatnim kroku kot się odzywa — melduje, że dotarł' },
  { id: 'drugi-raz', label: 'Test 6: drugie uruchomienie kończy się tak samo jak pierwsze' },
];

/** Jeden przebieg razem z miejscem, z którego kot ruszył — sam `Run` tego nie pamięta. */
export interface Pass {
  start: Sprite;
  run: Run;
}

export interface Passes {
  first: Pass;
  second: Pass;
}

/** Gdzie kot stoi po przebiegu; przebieg bez klatek (skrypt bez kapelusza) niczego nie ruszył. */
export function endOf(pass: Pass): Sprite {
  return pass.run.frames[pass.run.frames.length - 1]?.sprite ?? pass.start;
}

export function runTwice(stack: Block[]): Passes {
  const first = run(stack, HOME);
  const firstPass: Pass = { start: HOME, run: first };
  /* Zielona flaga niczego nie odstawia na start — drugi przebieg zaczyna tam, gdzie skończył pierwszy. */
  const start = endOf(firstPass);
  return { first: firstPass, second: { start, run: run(stack, start) } };
}

const close = (a: number, b: number) => Math.abs(a - b) <= 1;

export function sameEnd(passes: Passes): boolean {
  const a = endOf(passes.first);
  const b = endOf(passes.second);
  return close(a.x, b.x) && close(a.y, b.y);
}

/**
 * Czy kot przeszedł w obu przebiegach **tę samą drogę**, a nie tylko skończył w tym samym miejscu.
 * Scena zatrzymuje go przy krawędzi, więc program bez klocka startu kończy oba przebiegi przy
 * prawej ścianie — za drugim razem stojąc tam od początku i nie ruszając się ani o krok.
 * Sam koniec by to przepuścił; zakres, po którym kot chodził, nie.
 */
export function sameTrip(passes: Passes): boolean {
  const { first, second } = passes;
  return (
    sameEnd(passes) && close(first.run.minX, second.run.minX) && close(first.run.peakX, second.run.peakX)
  );
}

/** O ile kroków w prawo przesunął się kot w jednym przebiegu. */
export function travelled(pass: Pass): number {
  return Math.round(endOf(pass).x - pass.start.x);
}

/** Napis klocka z podstawioną wartością pola — tak, jak dziecko widzi go na stole. */
function labelOf(block: Block): string {
  return BLOCKS[block.type].label.replace('{}', String(block.value ?? ''));
}

/**
 * W ilu **różnych miejscach** widz zobaczy kota. Kolejne przesunięcia bez czekania między
 * nimi wykonują się w jednym mgnieniu i dają jedną klatkę, więc liczy się zmiana położenia
 * między klatkami, a nie liczba klocków ruchu.
 */
function placesSeen(pass: Pass): number {
  let before = pass.start.x;
  let places = 0;
  for (const frame of pass.run.frames) {
    if (Math.abs(frame.sprite.x - before) > 0.5) places += 1;
    before = frame.sprite.x;
  }
  return places;
}

function differenceBetween(passes: Passes): string {
  const a = endOf(passes.first);
  const b = endOf(passes.second);
  if (!sameEnd(passes))
    return `Drugie uruchomienie skończyło się gdzie indziej niż pierwsze: po pierwszym kot stał w x: ${Math.round(a.x)}, po drugim w x: ${Math.round(b.x)}.`;
  return `Oba przebiegi kończą w tym samym miejscu (x: ${Math.round(a.x)}) tylko dlatego, że scena zatrzymała kota przy krawędzi. Za drugim razem stał tam już od początku i nie ruszył się ani o krok — to nie jest „to samo”, kot ma przejść całą drogę za każdym razem.`;
}

export function judgeDelivery(stack: Block[], passes: Passes): ProofVerdicts {
  const { first } = passes;

  if (!hasHat(stack)) {
    const missing = {
      ok: false,
      note:
        stack.length === 0
          ? 'Na stole nie ma ani jednego klocka. Zacznij od kapelusza „kiedy kliknięto zieloną flagę” z kategorii Zdarzenia i doczep pod niego resztę.'
          : 'Nie znalazłam skryptu pod zieloną flagą. Zacznij od klocka „kiedy kliknięto zieloną flagę” z kategorii Zdarzenia i doczep pod niego resztę.',
    };
    return {
      flaga: missing,
      start: missing,
      droga: missing,
      widac: missing,
      meta: missing,
      'drugi-raz': missing,
    };
  }

  const body = stack.slice(1);
  const moverAt = body.findIndex((block) => block.type === 'idz');
  const homeAt = body.findIndex((block) => block.type === 'wroc');
  const lastMoverAt = body.map((block) => block.type).lastIndexOf('idz');
  const mover = body[moverAt];
  const ending = body.find((block, index) => block.type === 'powiedz' && index > lastMoverAt);

  const away = travelled(first);
  const moves = first.run.log.filter((step) => step.kind === 'ruch' && Math.abs(step.dx ?? 0) > 0.5).length;
  const places = placesSeen(first);

  return {
    flaga: mover
      ? {
          ok: true,
          note: `Skrypt rusza od zielonej flagi, a pierwszym klockiem ruchu jest „${labelOf(mover)}”.`,
        }
      : {
          ok: false,
          note: 'Skrypt pod flagą jest, ale nie ma w nim ani jednego klocka „przesuń o … kroków” — kot nigdzie nie idzie.',
        },

    start:
      mover && homeAt !== -1 && homeAt < moverAt
        ? {
            ok: true,
            note: 'Skrypt ustawia miejsce startu („wróć na start”), zanim kot ruszy. To jest właśnie ten klocek, którego brakowało w usterce z trzeciego bloku.',
          }
        : {
            ok: false,
            note: !mover
              ? 'W skrypcie nie ma ruchu, więc nie ma też czego ustawiać na start.'
              : homeAt !== -1
                ? 'Klocek „wróć na start” stoi dopiero PO drodze: zanim kot ruszy, nikt mu nie mówi, skąd ma zacząć, a na końcu odsyła go tam, skąd przyszedł. Przenieś ten klocek na samą górę skryptu, zaraz pod flagę.'
                : `Twój kot rusza od razu klockiem „${labelOf(mover)}”, a nikt mu wcześniej nie powiedział, skąd ma zacząć. Wstaw na samą górę skryptu, zaraz pod flagę, klocek „wróć na start” z kategorii Ruch.`,
          },

    droga:
      away >= 150
        ? {
            ok: true,
            note: `W pierwszym przebiegu kot przesunął się o ${count(away, 'krok', 'kroki', 'kroków')} w prawo — z x: ${Math.round(first.start.x)} na x: ${Math.round(endOf(first).x)}.`,
          }
        : {
            ok: false,
            note:
              away <= 0
                ? `Po uruchomieniu kot jest w x: ${Math.round(endOf(first).x)}, czyli nie posunął się w prawo ani trochę (start: x: ${Math.round(first.start.x)}).`
                : `Kot przeszedł tylko ${count(away, 'krok', 'kroki', 'kroków')} w prawo. Zamówienie mówi o przejściu na drugą stronę sceny — to co najmniej 150.`,
          },

    widac:
      places >= 3
        ? {
            ok: true,
            note: `Między przesunięciami są przerwy, więc widz zobaczy kota w ${count(places, 'miejscu', 'miejscach', 'miejscach')} — da się zobaczyć, jak idzie.`,
          }
        : {
            ok: false,
            note:
              moves < 3
                ? `Cała droga mieści się w ${count(moves, 'przesunięciu', 'przesunięciach', 'przesunięciach')} — na scenie wygląda to jak przeskok, a nie jak przejście. Rozłóż ją na co najmniej trzy mniejsze kroki.`
                : `Kroki są, ale widz zobaczy kota w ${count(places, 'miejscu', 'miejscach', 'miejscach')} — przesunięcia bez klocka „czekaj” pomiędzy wykonują się w jednym mgnieniu i zlewają się w jeden skok. Wstaw „czekaj” między przesunięcia.`,
          },

    meta: ending
      ? { ok: true, note: `Po ostatnim kroku kot mówi: „${labelOf(ending).replace(/^powiedz /, '')}”.` }
      : {
          ok: false,
          note: 'Po ostatnim ruchu nie ma klocka „powiedz …”. Bez niego nie wiadomo, czy kot uważa, że dotarł — a to właśnie ma zameldować.',
        },

    'drugi-raz': sameTrip(passes)
      ? {
          ok: true,
          note: `Uruchomiłam twój program dwa razy pod rząd i oba przebiegi skończyły się w tym samym miejscu (x: ${Math.round(endOf(first).x)}, y: ${Math.round(endOf(first).y)}), po tej samej drodze. To jest ten test, którego nie przeszła usterka z trzeciego bloku.`,
        }
      : {
          ok: false,
          note: `${differenceBetween(passes)} Zielona flaga nie odstawia kota na start — musisz to zrobić sam/sama, pierwszym klockiem skryptu.`,
        },
  };
}
