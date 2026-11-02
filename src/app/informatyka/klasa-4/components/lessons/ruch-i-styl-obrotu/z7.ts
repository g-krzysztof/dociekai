import { count } from '../../../lib/plural';
import type { Picture } from '../../picture-view';
import type { ProofCriterion, ProofOutcome, ProofVerdict } from '../../task-shell';
import {
  BLOCKS,
  HOME,
  normalizeDirection,
  run,
  type Block,
  type RotationStyle,
  type Run,
  type Sprite,
} from '../../scratch/engine';
import { measure } from './sprite-pic';

/**
 * Werdykt zadania obowiązkowego **Z-7**: „Namaluj w programie Scratch duszka według własnego
 * pomysłu. Następnie zbuduj dla niego skrypt, który określi jego poruszanie się w poziomie
 * (lewo, prawo). W skrypcie ustaw taki styl obrotu, aby duszek nie poruszał się głową w dół.”
 *
 * **Werdykt czyta przebieg silnika, nie listę klocków.** Zdanie „nie poruszał się głową w dół”
 * jest o tym, co duszek robi, a nie o tym, z czego skrypt jest zbudowany: klocek stylu obrotu
 * doklejony na sam dół skryptu wygląda jak poprawka, a duszek i tak przeszedł całą drogę na
 * głowie. Dlatego `Run.upsideDown` — dorobiony do silnika właśnie po to — rozstrzyga o stylu, a
 * `wentRight` / `wentLeft` i `dx` / `dy` z logu o tym, czy chodził w bok i w obie strony.
 * Skrypt czytamy tylko tam, gdzie trzeba wskazać winowajcę palcem (który klocek skręca na ukos).
 *
 * Rysunek dziecka jest mierzony (`measure`): czy to rysunek, a nie dwie kreski, i czy jego
 * środek leży na krzyżyku. Pomysł na duszka jest jego i nie podlega ocenie.
 */

/** Skąd duszek rusza — ta sama pozycja, w której stoi na scenie warsztatu. */
export const Z7_START: Sprite = { ...HOME, x: -150, y: 0 };

export const Z7_CRITERIA: ProofCriterion[] = [
  { id: 'wlasny', label: 'Duszek jest twoim rysunkiem — namalowanym i ustawionym na krzyżyku.' },
  { id: 'flaga', label: 'Ten duszek ma skrypt, który zaczyna się od kapelusza z zieloną flagą.' },
  { id: 'poziom', label: 'Duszek porusza się w poziomie: zmienia się x, a wysokość zostaje.' },
  { id: 'obie', label: 'Chodzi w obie strony — i w prawo, i w lewo.' },
  {
    id: 'styl',
    label: 'W skrypcie stoi klocek „ustaw styl obrotu lewo-prawo” — i duszek ani razu nie idzie głową w dół.',
  },
];

export interface Z7Report {
  /** Rysunek dziecka, gdy jest rysunkiem — z niego składa się nagroda. */
  pic: Picture | null;
  /** Styl obrotu ustawiony klockiem w skrypcie (ostatni z nich); `null`, gdy takiego klocka nie ma. */
  style: RotationStyle | null;
  run: Run;
}

const labelOf = (block: Block) => BLOCKS[block.type].label.replace('{}', String(block.value ?? ''));

/** W poziomie są tylko dwa kierunki: 90 w prawo i -90 w lewo. */
const isHorizontal = (direction: number) => Math.abs(normalizeDirection(direction)) === 90;

/** Klocek, po którym kroki poszły na ukos — ostatni „kierunek” albo „obróć” przed pierwszym takim krokiem. */
function slantCulprit(body: Block[]): Block | null {
  let direction = Z7_START.direction;
  let culprit: Block | null = null;
  for (const block of body) {
    if (block.type === 'kierunek') {
      direction = normalizeDirection(Number(block.value ?? 90));
      culprit = block;
    } else if (block.type === 'obroc') {
      direction = normalizeDirection(direction + Number(block.value ?? 0));
      culprit = block;
    } else if (block.type === 'idz' && !isHorizontal(direction)) {
      return culprit;
    }
  }
  return null;
}

export function judgeZ7(stack: Block[], pic: Picture | null): ProofOutcome<Z7Report> {
  const result = run(stack, Z7_START);
  const sprite = measure(pic);
  const body = stack.slice(1);

  const moves = result.log.filter((step) => step.kind === 'ruch');
  const sideways = moves.filter((step) => Math.abs(step.dx ?? 0) > 0.5 && Math.abs(step.dy ?? 0) <= 0.5);
  const slanted = moves.filter((step) => Math.abs(step.dy ?? 0) > 0.5);
  const end = result.frames[result.frames.length - 1]?.sprite ?? Z7_START;

  const styleBlocks = body.filter((block) => block.type === 'styl');
  const style = styleBlocks.length > 0 ? ((styleBlocks[styleBlocks.length - 1].value as RotationStyle) ?? null) : null;

  const wlasny = (): ProofVerdict => {
    if (!sprite.drawn)
      return {
        ok: false,
        note: 'Nie ma jeszcze rysunku. Narysuj duszka pędzlem w kratce nad skryptem — kilka kresek wystarczy, a pomysł jest twój.',
      };
    if (!sprite.centered)
      return {
        ok: false,
        note: `Rysunek leży ${sprite.offset.toFixed(1)} pola od krzyżyka, a duszek obraca się i odbija właśnie wokół niego — będzie odskakiwał przy każdym zwrocie. Weź narzędzie „przesuń cały rysunek” i przeciągnij go na krzyżyk.`,
      };
    return {
      ok: true,
      note: `Twój duszek: ${count(sprite.cells, 'zamalowane pole', 'zamalowane pola', 'zamalowanych pól')}, środek rysunku ${sprite.offset.toFixed(1)} pola od krzyżyka — obraca się w miejscu.`,
    };
  };

  const missing: ProofVerdict = {
    ok: false,
    note:
      stack.length === 0
        ? 'Na stole nie ma ani jednego klocka. Zacznij od kapelusza „kiedy kliknięto zieloną flagę” z kategorii Zdarzenia i doczep pod niego resztę.'
        : 'Nie znalazłam skryptu pod zieloną flagą. Zacznij od klocka „kiedy kliknięto zieloną flagę” z kategorii Zdarzenia i doczep pod niego resztę.',
  };

  const flaga = (): ProofVerdict =>
    result.started
      ? { ok: true, note: `Skrypt duszka zaczyna się od zielonej flagi i ma pod nią ${count(body.length, 'klocek', 'klocki', 'klocków')}.` }
      : missing;

  const poziom = (): ProofVerdict => {
    if (!result.started) return missing;
    if (slanted.length > 0) {
      const culprit = slantCulprit(body);
      return {
        ok: false,
        note: culprit
          ? `Po klocku „${labelOf(culprit)}” kroki idą na ukos — zmienia się nie tylko x, ale i y. W poziomie są tylko dwa kierunki: 90 w prawo i -90 w lewo.`
          : 'Duszek w którymś kroku zszedł z poziomu — zmienia się nie tylko x, ale i y. W poziomie są tylko dwa kierunki: 90 w prawo i -90 w lewo.',
      };
    }
    if (sideways.length === 0)
      return {
        ok: false,
        note: 'Duszek nigdzie nie poszedł w bok. Najprostszy klocek to „przesuń o … kroków” z niebieskiej kategorii Ruch — a kierunek 90 albo -90 powie mu, w którą stronę.',
      };
    return {
      ok: true,
      note: `Ruch w poziomie: ${count(sideways.length, 'krok w bok', 'kroki w bok', 'kroków w bok')}, a wysokość przez cały spacer zostaje taka sama (y: ${Math.round(Z7_START.y)}).`,
    };
  };

  const obie = (): ProofVerdict => {
    if (!result.started) return missing;
    if (result.wentRight && result.wentLeft)
      return {
        ok: true,
        note:
          result.bounces > 0
            ? 'Duszek doszedł do brzegu i sam zawrócił — „jeżeli na brzegu, odbij się” to najlepsze rozwiązanie tego zadania.'
            : `Duszek doszedł w prawo do x: ${Math.round(result.peakX)}, a potem wrócił i stanął w x: ${Math.round(end.x)}.`,
      };
    const only = result.wentRight ? 'w prawo' : result.wentLeft ? 'w lewo' : null;
    return {
      ok: false,
      note: only
        ? `Duszek chodzi tylko ${only}. Dołóż drogę powrotną: „ustaw kierunek na …” z liczbą po przeciwnej stronie tarczy (90 ↔ -90) albo „obróć o 180 stopni”.`
        : 'Duszek nie przeszedł ani w prawo, ani w lewo.',
    };
  };

  const styl = (): ProofVerdict => {
    if (!result.started) return missing;
    if (style === null)
      return {
        ok: false,
        note: `Nie ma klocka „ustaw styl obrotu”. Znajdziesz go w niebieskiej kategorii Ruch, pod klockami od kierunku.${
          result.upsideDown
            ? ' Widać po tym, co robi: duszek idąc w lewo staje na głowie — tak zachowuje się domyślny styl „dowolny”.'
            : ''
        }`,
      };
    if (style === 'nie obracaj')
      return {
        ok: false,
        note: 'W skrypcie stoi „ustaw styl obrotu nie obracaj”. Głową w dół duszek rzeczywiście nie chodzi — ale idąc w lewo patrzy w prawo, czyli maszeruje tyłem. Zlecenie prosi o „lewo-prawo”.',
      };
    if (style === 'dowolny')
      return {
        ok: false,
        note: 'W skrypcie stoi „ustaw styl obrotu dowolny” — to właśnie ten styl, przez który duszek przewraca się na głowę. Kliknij w białe pole klocka i wybierz „lewo-prawo”.',
      };
    if (result.upsideDown)
      return {
        ok: false,
        note: 'Styl „lewo-prawo” jest w skrypcie, ale za późno: duszek szedł już głową w dół, zanim ten klocek się wykonał. Przenieś go na samą górę skryptu, zaraz pod flagę, przed pierwszym krokiem.',
      };
    return {
      ok: true,
      note: 'Jest: „ustaw styl obrotu lewo-prawo”, przed pierwszym krokiem. Dzięki niemu duszek idąc w lewo odbija się jak w lustrze, zamiast robić fikołka.',
    };
  };

  return {
    data: { pic: sprite.drawn ? pic : null, style, run: result },
    verdicts: { wlasny: wlasny(), flaga: flaga(), poziom: poziom(), obie: obie(), styl: styl() },
  };
}
