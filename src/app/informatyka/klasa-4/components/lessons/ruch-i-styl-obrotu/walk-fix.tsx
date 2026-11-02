'use client';

import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Picture } from '../../picture-view';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { Bench } from '../../scratch/bench';
import { CostumeArt, SpriteArt, StageView, spriteTransform } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import {
  HOME,
  ROTATION_STYLES,
  make,
  normalizeDirection,
  type Block,
  type BlockType,
  type Category,
  type RotationStyle,
  type Run,
  type Sprite,
} from '../../scratch/engine';

/**
 * „Kot chodzi na głowie” — blok, w którym usterka z haczyka dostaje nazwę i
 * lekarstwo. Usterka **nie jest tu wymyślona**: dokładnie ten obrazek dziecko
 * zrobiło własnym palcem dwa bloki wcześniej, kręcąc tarczą kierunku.
 *
 * Narzędziem jest pracownia klocków z lekcji 24 — w module o Scratchu to jest
 * *ten* przyrząd, tak samo jak edytor obrazka był przyrządem modułu 3. Nowe są
 * cztery klocki w palecie (`ustaw kierunek`, `obróć w prawo`, `jeżeli na brzegu
 * odbij się`, `ustaw styl obrotu`) i jedna rzecz, której w lekcji 24 nie było:
 * **klocek `ustaw styl obrotu` przychodzi z wartością »dowolny«, czyli tą, która
 * niczego nie naprawia**. Samo przeciągnięcie go do skryptu nie wystarczy —
 * trzeba kliknąć w owalne pole i przejść przez wszystkie trzy style. To jedyny
 * sposób, żeby dziecko je zobaczyło, zamiast o nich przeczytać.
 *
 * Werdykty czytają **przebieg programu, nie listę klocków**: `upsideDown` mówi,
 * czy duszek **szedł** głową w dół (liczone przy instrukcjach, które go naprawdę
 * przesunęły, więc styl obrotu doklejony na sam dół skryptu nie przechodzi), a
 * `log` mówi, w którą stronę i przy jakim stylu obrotu szedł.
 *
 * Pasek „ten sam kierunek, trzy style obrotu” pod sceną odświeża się w trakcie
 * biegu programu. To jest całe wyjaśnienie tej lekcji — pokazane, a nie napisane.
 */

const START: Sprite = { ...HOME, x: -150, y: 0, direction: 90, rotationStyle: 'dowolny' };

const PALETTE: BlockType[] = ['flaga', 'idz', 'kierunek', 'obroc', 'odbij', 'styl', 'wroc', 'czekaj'];

interface Order {
  title: string;
  brief: string;
  hint: string;
  /** Skrypt, od którego zaczyna się zlecenie; `null` = zostaje to, co dziecko ma. */
  seed: (() => Block[]) | null;
  check: (run: Run) => { ok: boolean; note: string };
}

/** Styl obrotu w chwili, gdy duszek szedł w lewo — po tym poznajemy „patrzy tam, gdzie idzie”. */
function styleWhileGoingLeft(run: Run): RotationStyle | null {
  const step = run.log.find((item) => item.kind === 'ruch' && (item.dx ?? 0) < -0.5);
  return step ? step.rotationStyle : null;
}

const ORDERS: Order[] = [
  {
    title: 'Usterka: duszek dochodzi do celu głową w dół',
    brief:
      'Ten skrypt już działa — duszek idzie w lewo, tak jak miał. Uruchom go i popatrz, co jest z nim nie tak. Potem popraw tak, żeby szedł w tę samą stronę, ale stopami do dołu.',
    hint: 'W kategorii Ruch, na samym dole, leży klocek, którego jeszcze nie używałeś/używałaś. Przychodzi z wartością „dowolny” — kliknij w białe pole i sprawdź, co potrafią pozostałe dwie.',
    seed: () => [make('flaga'), make('kierunek', -90), make('idz', 100), make('czekaj', 1), make('idz', 100)],
    check: (run) => {
      if (!run.wentLeft)
        return { ok: false, note: 'Duszek nie poszedł w lewo. Kierunek -90 to lewa strona sceny.' };
      if (run.upsideDown)
        return {
          ok: false,
          note: 'Duszek dalej idzie głową w dół. Styl obrotu „dowolny” obraca cały rysunek razem z kierunkiem — przestaw go na coś innego i uruchom jeszcze raz.',
        };
      const style = styleWhileGoingLeft(run);
      if (style === 'nie obracaj')
        return {
          ok: true,
          note: 'Stopami do dołu, zgoda — ale zauważ, że przy „nie obracaj” duszek idzie tyłem: patrzy w prawo, a maszeruje w lewo. Zapamiętaj to na następne zlecenie.',
        };
      return {
        ok: true,
        note: 'Tak właśnie ma być: kierunek dalej wskazuje lewo, ale rysunek zamiast fikołka robi odbicie lustrzane.',
      };
    },
  },
  {
    title: 'Spacer tam i z powrotem',
    brief:
      'Teraz dorób resztę: duszek ma pójść w prawo, przystanąć na chwilę i wrócić w lewo. Przez cały czas ma stać na nogach i patrzeć tam, gdzie idzie.',
    hint: 'Potrzebne będą dwa klocki „ustaw kierunek na …” i przerwa między nimi. Styl obrotu wystarczy ustawić raz — na samym początku.',
    seed: null,
    check: (run) => {
      if (!run.wentRight || !run.wentLeft)
        return {
          ok: false,
          note: run.wentRight
            ? 'Duszek poszedł w prawo, ale nie wrócił. Po przerwie ustaw kierunek na -90 i dołóż kroki.'
            : 'Duszek nie przeszedł w obie strony. Zlecenie jest na spacer: najpierw w prawo, potem z powrotem.',
        };
      if (run.upsideDown)
        return { ok: false, note: 'W drodze powrotnej duszek przewrócił się na głowę — styl obrotu dalej jest „dowolny”.' };
      const style = styleWhileGoingLeft(run);
      if (style !== 'lewo-prawo')
        return {
          ok: false,
          note: 'Duszek stoi na nogach, ale idąc w lewo patrzy w prawo — czyli maszeruje tyłem. Tym razem zlecenie prosi o styl „lewo-prawo”, który odwraca rysunek jak lustro.',
        };
      return {
        ok: true,
        note: 'Spacer w obie strony, stopami do dołu, nosem we właściwą stronę. Dokładnie tego wymaga zadanie Z-7.',
      };
    },
  },
];

interface WalkFixProps {
  color: string;
  /** Kostium narysowany w poprzednim bloku — jeśli jest, spaceruje po scenie zamiast kota. */
  costume?: Picture | null;
  onComplete?: () => void;
}

export function WalkFix({ color, costume, onComplete }: WalkFixProps) {
  const [at, setAt] = useState(0);
  const [stacks, setStacks] = useState<Block[][]>(() => [ORDERS[0].seed?.() ?? []]);
  const [category, setCategory] = useState<Category>('ruch');
  const program = useProgram(stacks[0] ?? [], START);
  const anchorRef = useSectionScrollAnchor(at);

  const done = at >= ORDERS.length;
  const order = ORDERS[Math.min(at, ORDERS.length - 1)];
  const verdict = !done && program.finished && program.last ? order.check(program.last) : null;

  const next = () => {
    const following = at + 1;
    setAt(following);
    program.clear();
    const seed = ORDERS[following]?.seed;
    if (seed) setStacks([seed()]);
    if (following >= ORDERS.length) onComplete?.();
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {!done && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Zlecenie {at + 1} z {ORDERS.length} · {order.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{order.brief}</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <Bench
          color={color}
          stacks={stacks}
          onStacksChange={setStacks}
          available={PALETTE}
          category={category}
          onCategoryChange={setCategory}
          active={program.active ? { stack: 0, ...program.active } : null}
          locked={program.running}
          scriptHint="Zacznij od kapelusza z zieloną flagą."
        />

        <div>
          <StageView
            actors={[{ id: 'duszek', kind: 'kot', sprite: program.sprite, costume: costume ?? undefined }]}
            running={program.running}
            onStart={program.start}
            onStop={program.stop}
            note={`kierunek ${Math.round(program.sprite.direction)}`}
          />
          {program.idle && (
            <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              Flaga nie ma czego uruchomić — na górze stosu brakuje kapelusza.
            </p>
          )}
          <StyleStrip sprite={program.sprite} costume={costume} color={color} />
        </div>
      </div>

      {!done && (
        <div className="mt-4 border-t pt-3">
          {verdict ? (
            <div
              className={cn('p-3', !verdict.ok && 'border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30')}
              style={verdict.ok ? { backgroundColor: `${color}14` } : undefined}
            >
              <p
                className="flex items-center gap-2 text-sm font-semibold"
                style={verdict.ok ? { color } : undefined}
              >
                {verdict.ok ? (
                  <>
                    <Check className="h-4 w-4 shrink-0" aria-hidden />
                    Zlecenie wykonane.
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
                    Jeszcze nie.
                  </>
                )}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{verdict.note}</p>
              {verdict.ok && (
                <button
                  type="button"
                  onClick={next}
                  className="mt-2.5 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
                  style={{ borderColor: color, color }}
                >
                  {at + 1 < ORDERS.length ? 'Następne zlecenie' : 'Kończę blok'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Podpowiedź:</strong> {order.hint}
            </p>
          )}
        </div>
      )}

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Oba zlecenia wykonane.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            Kierunek i styl obrotu to <strong>dwie różne rzeczy</strong>. Kierunek mówi, dokąd idą
            kroki. Styl obrotu mówi tylko, jak duszek przy tym wygląda — i nie zmienia ani trasy, ani
            szybkości. Dlatego w Scratchu ustawia się go raz, na początku skryptu, i więcej się do
            niego nie wraca.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Trzy style obrotu przy **bieżącym** kierunku duszka, obok siebie. Odświeża się w
 * trakcie biegu programu, więc różnicę widać w ruchu, a nie na obrazku w książce.
 */
function StyleStrip({
  sprite,
  costume,
  color,
}: {
  sprite: Sprite;
  costume?: Picture | null;
  color: string;
}) {
  return (
    <div className="mt-3 border bg-muted/20 p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
        Ten sam kierunek, trzy style obrotu
      </p>
      {normalizeDirection(sprite.direction) === 90 && (
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          Przy kierunku 90 wszystkie trzy wyglądają tak samo. Różnica pojawia się dopiero wtedy, gdy
          duszek się obróci — uruchom program i popatrz tutaj.
        </p>
      )}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ROTATION_STYLES.map((style) => {
          const shown: Sprite = { ...sprite, rotationStyle: style };
          return (
            <div key={style} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <div style={{ transform: spriteTransform(shown) }}>
                  {costume ? (
                    <div className="h-10 w-10">
                      <CostumeArt pic={costume} />
                    </div>
                  ) : (
                    <SpriteArt kind="kot" className="h-9 w-9" />
                  )}
                </div>
              </div>
              <p
                className={cn(
                  'mt-1 text-[10px] leading-tight',
                  style === sprite.rotationStyle ? 'font-bold text-foreground' : 'text-muted-foreground'
                )}
              >
                {style}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
