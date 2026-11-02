'use client';

import { useRef, type PointerEvent as ReactPointerEvent } from 'react';

import { cn } from '@/lib/utils';
import { PAPER, type Picture } from '../picture-view';
import { isUpsideDown, normalizeDirection, type Sprite } from './engine';

/**
 * Scena Scratcha i trzy duszki, które chodzą po niej we wszystkich czterech
 * widżetach lekcji.
 *
 * Scena jest **makietą programu**, nie ilustracją kursu — tak samo jak makieta
 * pulpitu w teście diagnostycznym i okno „Zapisz jako”. Ma wyglądać jak scena
 * Scratcha (biały prostokąt 4:3 z zieloną flagą i czerwonym znakiem stop nad
 * nim), żeby dziecko rozpoznało ją, kiedy pierwszy raz otworzy prawdziwego
 * Scratcha. Dlatego duszki mają własne, nieinterfejsowe kolory i nie zmieniają
 * się w trybie ciemnym.
 *
 * **Scena ma stały kształt 4:3, więc jej wysokość rośnie razem z szerokością** —
 * puszczona na całą kolumnę robiła się przy 680 px prawie 510 px wysoka i zjadała
 * ekran, nic na tym nie zyskując (sceny używa pas x od -150 do 150). Dlatego jest
 * ograniczona do rozmiaru „urządzenia” (`max-w-[340px]`) i wyśrodkowana; układy,
 * które dają jej węższą kolumnę, i tak wygrywają.
 *
 * Współrzędne idą prosto ze sceny Scratcha (480 × 360, środek w zerze) i lądują
 * w procentach szerokości, więc scena jest responsywna bez przeliczania pikseli.
 * Ruch animuje przejście CSS — stan zmienia się natychmiast (tak działa Scratch),
 * a płynięcie jest tylko po to, żeby dało się je zobaczyć.
 *
 * **Obrót duszka rysuje `rotationStyle`, nie kierunek** (dołożone w lekcji 25).
 * Kierunek mówi, gdzie duszek idzie; styl obrotu mówi, jak przy tym wygląda — i
 * dlatego przy `dowolny` kot idący w lewo stoi na głowie, przy `lewo-prawo` jest
 * odbity jak w lustrze, a przy `nie obracaj` nie zmienia się wcale. Dymek obrotu
 * **nie dostaje**: w Scratchu też zostaje pionowo, żeby dało się go przeczytać.
 */

export type SpriteKind = 'kot' | 'pilka' | 'gwiazdka';

export const SPRITE_NAME: Record<SpriteKind, string> = {
  kot: 'Kot',
  pilka: 'Piłka',
  gwiazdka: 'Gwiazdka',
};

export interface Actor {
  id: string;
  kind: SpriteKind;
  sprite: Sprite;
  /** Dźwięk grany w tej klatce — rysujemy fale obok duszka. */
  sound?: boolean;
  /** Kostium narysowany przez dziecko — zastępuje figurkę z `kind`. */
  costume?: Picture;
  /** Gotowy obrazek kostiumu (np. `data:`) — ma pierwszeństwo przed `costume`. */
  costumeSrc?: string;
  /**
   * Duszek-litera. Scratch ma w bibliotece gotowe duszki z literami i zadanie
   * Z-8 stoi właśnie na nich, więc makieta musi je umieć narysować. To jedyne
   * miejsce w kursie, w którym na scenie stoi litera — i tak ma być.
   */
  letter?: string;
  /** Klasy kafelka litery — mniejszy, gdy na scenie stoi cały długi wyraz (Z-8 z imieniem dłuższym niż sześć liter). */
  letterClass?: string;
}

export interface Ghost {
  kind: SpriteKind;
  x: number;
  y: number;
}

/** Linia śladu po scenie — łamana przez punkty, którędy duszek przeszedł. */
export interface StageLine {
  points: { x: number; y: number }[];
  color: string;
  dashed?: boolean;
  width?: number;
}

export interface StageTarget {
  x: number;
  y: number;
  /** Krótki podpis przy celu — „tutaj” wystarczy; dłuższy tekst nie mieści się na scenie. */
  label?: string;
}

interface StageViewProps {
  actors: Actor[];
  /** Blade sylwetki „tu ma stanąć ten duszek”. */
  ghosts?: Ghost[];
  /** Ślady rysowane pod duszkami, w układzie współrzędnych sceny. */
  lines?: StageLine[];
  /** Zielona flaga świeci, gdy program idzie. */
  running?: boolean;
  /** Gdy podane, flaga i znak stop stają się przyciskami — tam, gdzie trzyma je Scratch. */
  onStart?: () => void;
  onStop?: () => void;
  /** Siatka współrzędnych z osiami — Scratch pokazuje ją w tle sceny w edytorze. */
  grid?: boolean;
  /** Cele do trafienia, rysowane jako celowniki w układzie współrzędnych sceny. */
  targets?: StageTarget[];
  /** Zdarzenia wskaźnika przełożone na współrzędne sceny; widżet decyduje, co z nimi zrobi. */
  onStagePointer?: (point: { x: number; y: number }, phase: 'down' | 'move' | 'up') => void;
  /** Podpis pod paskiem sceny — domyślnie „Scena” / „Program idzie”. */
  note?: string;
  className?: string;
}

/** Współrzędne Scratcha (-240…240, -180…180) na procenty sceny. */
function place(x: number, y: number) {
  return { left: `${((x + 240) / 480) * 100}%`, top: `${((180 - y) / 360) * 100}%` };
}

/** Punkt na ekranie z powrotem na współrzędne sceny — dla przeciągania i celowania. */
function toStage(event: { clientX: number; clientY: number }, box: HTMLElement | null) {
  const rect = box?.getBoundingClientRect();
  if (!rect || rect.width === 0) return { x: 0, y: 0 };
  return {
    x: Math.round(((event.clientX - rect.left) / rect.width) * 480 - 240),
    y: Math.round(180 - ((event.clientY - rect.top) / rect.height) * 360),
  };
}

/**
 * Jak duszek jest **narysowany** przy danym kierunku. Kierunek mówi, dokąd idzie;
 * styl obrotu — jak przy tym wygląda. Tu mieszka cała lekcja 25.
 */
export function spriteTransform(sprite: Sprite): string | undefined {
  if (sprite.rotationStyle === 'dowolny')
    return `rotate(${normalizeDirection(sprite.direction) - 90}deg)`;
  if (sprite.rotationStyle === 'lewo-prawo')
    return normalizeDirection(sprite.direction) < 0 ? 'scaleX(-1)' : undefined;
  return undefined;
}

export function StageView({
  actors,
  ghosts,
  lines,
  running,
  onStart,
  onStop,
  grid,
  targets,
  onStagePointer,
  note,
  className,
}: StageViewProps) {
  const box = useRef<HTMLDivElement>(null);
  /* Bez tego duszek chodziłby za samym kursorem, bez naciśnięcia — gest ma być ciągnięciem. */
  const held = useRef(false);
  const pointer = (phase: 'down' | 'move' | 'up') => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!onStagePointer) return;
    if (phase === 'move' && !held.current) return;
    if (phase === 'down') {
      held.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (phase === 'up') held.current = false;
    onStagePointer(toStage(event, box.current), phase);
  };

  return (
    <div className={cn('mx-auto w-full max-w-[340px]', className)}>
      <div className="flex items-center gap-2 border border-b-0 bg-zinc-100 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
        {onStart ? (
          <button
            type="button"
            onClick={onStart}
            aria-label="Uruchom program — zielona flaga"
            className="inline-flex h-7 w-7 items-center justify-center transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            <GreenFlag lit={running} className="h-5 w-5" />
          </button>
        ) : (
          <GreenFlag lit={running} />
        )}
        {onStop ? (
          <button
            type="button"
            onClick={onStop}
            disabled={!running}
            aria-label="Zatrzymaj program"
            className="inline-flex h-7 w-7 items-center justify-center transition hover:bg-black/5 disabled:opacity-35 dark:hover:bg-white/10"
          >
            <StopSign className="h-5 w-5" />
          </button>
        ) : (
          <StopSign />
        )}
        <span className="ml-auto text-[10px] uppercase tracking-wide text-zinc-500">
          {note ?? (running ? 'Program idzie' : 'Scena')}
        </span>
      </div>
      <div
        ref={box}
        onPointerDown={pointer('down')}
        onPointerMove={pointer('move')}
        onPointerUp={pointer('up')}
        onPointerCancel={pointer('up')}
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden border bg-white dark:border-zinc-700',
          onStagePointer && 'cursor-crosshair touch-none'
        )}
      >
        {grid && <StageGridLines />}

        {lines && lines.length > 0 && (
          <svg viewBox="0 0 480 360" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {lines.map((line, i) => (
              <polyline
                key={`line-${i}`}
                points={line.points.map((p) => `${p.x + 240},${180 - p.y}`).join(' ')}
                fill="none"
                stroke={line.color}
                strokeWidth={line.width ?? 6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={line.dashed ? '2 12' : undefined}
              />
            ))}
          </svg>
        )}

        {targets?.map((target, i) => (
          <div
            key={`target-${i}`}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={place(target.x, target.y)}
          >
            <TargetMark />
            {target.label && (
              <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-[#c2410c]">
                {target.label}
              </span>
            )}
          </div>
        ))}

        {ghosts?.map((ghost, i) => (
          <div
            key={`${ghost.kind}-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={place(ghost.x, ghost.y)}
            aria-hidden
          >
            <div className="flex h-[var(--size)] w-[var(--size)] items-center justify-center rounded-full border-2 border-dashed border-zinc-300 [--size:56px] sm:[--size:68px]">
              <SpriteArt kind={ghost.kind} className="h-3/4 w-3/4 opacity-25" />
            </div>
          </div>
        ))}

        {actors.map((actor) => (
          <div
            key={actor.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
            style={{ ...place(actor.sprite.x, actor.sprite.y), opacity: actor.sprite.visible ? 1 : 0 }}
          >
            <div className="relative">
              {/* Obrót siedzi na własnej warstwie, żeby dymek i fale dźwięku zostały pionowo. */}
              <div
                className="transition-transform duration-300 ease-out"
                style={{ transform: spriteTransform(actor.sprite) }}
              >
                <ActorArt actor={actor} />
              </div>
              {actor.sound && <SoundWaves />}
              {actor.sprite.say && actor.sprite.visible && (
                <SayBubble text={actor.sprite.say} x={actor.sprite.x} />
              )}
            </div>
            <span className="sr-only">
              {actor.letter
                ? `Litera ${actor.letter.toUpperCase()}`
                : actor.costume || actor.costumeSrc
                  ? 'Twój duszek'
                  : SPRITE_NAME[actor.kind]}
              {actor.sprite.visible ? '' : ' (ukryty)'}
              {isUpsideDown(actor.sprite) ? ', obrócony głową w dół' : ''}
              {actor.sprite.say ? `, mówi: ${actor.sprite.say}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Wygląd duszka: kostium narysowany przez dziecko ma pierwszeństwo przed figurką
 * z palety. Rysunek z `Picture` renderujemy **w całej swojej kratce**, a nie
 * przycięty do zamalowanych pól — dzięki temu duszek narysowany w rogu kratki
 * naprawdę siedzi w rogu, tak jak w prawdziwym edytorze kostiumów.
 */
function ActorArt({ actor }: { actor: Actor }) {
  /*
   * Kostium dostaje większe pudełko niż figurka z palety: rysunek dziecka
   * zwykle zajmuje ułamek kratki, a przycinać go nie wolno — wtedy przestałby
   * siedzieć tam, gdzie dziecko go postawiło względem krzyżyka.
   */
  const size = 'h-[72px] w-[72px] sm:h-20 sm:w-20';
  if (actor.costumeSrc)
    /* Kostium z pliku dziecka: zwykły <img> z `data:`, więc SVG nie wykonuje niczego. */
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={actor.costumeSrc} alt="" className={cn(size, 'object-contain')} />;
  if (actor.costume)
    return (
      <div className={size}>
        <CostumeArt pic={actor.costume} />
      </div>
    );
  if (actor.letter) return <LetterArt letter={actor.letter} className={actor.letterClass} />;
  return <SpriteArt kind={actor.kind} className="h-12 w-12 sm:h-14 sm:w-14" />;
}

/**
 * Duszek-litera — odpowiednik gotowych duszków z literami z biblioteki Scratcha.
 * Kolor bierze się ze znaku, więc każda litera imienia ma swój własny i nie
 * trzeba go nigdzie zapisywać. To jedyne miejsce w kursie, w którym na scenie
 * stoi litera, i tak ma być: zadanie Z-8 jest dosłownie o literach imienia.
 */
export function LetterArt({ letter, className }: { letter: string; className?: string }) {
  const palette = ['#e2564a', '#f2a03d', '#4cbb17', '#4c97ff', '#9966ff', '#cf63cf'];
  const shade = palette[letter.toUpperCase().charCodeAt(0) % palette.length];
  return (
    <div
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-[10px] text-2xl font-black text-white shadow-sm sm:h-12 sm:w-12 sm:text-[26px]',
        className
      )}
      style={{ backgroundColor: shade }}
      aria-hidden
    >
      {letter.toUpperCase()}
    </div>
  );
}

/**
 * Rysunek z kratki jako duszek. W edytorze puste pole jest białe (`PAPER`), bo
 * tam kratka jest kartką; na scenie **to samo pole musi być przezroczyste**,
 * inaczej duszek nosiłby ze sobą biały kwadrat. Rysunek zostaje w całej swojej
 * kratce, nieprzycięty — dzięki temu środek kostiumu z bloku „Pracownia duszka”
 * znaczy na scenie dokładnie to samo, co znaczył w kratce.
 */
export function CostumeArt({ pic, className }: { pic: Picture; className?: string }) {
  return (
    <svg viewBox={`0 0 ${pic.w} ${pic.h}`} className={cn('block h-full w-full', className)} aria-hidden>
      {pic.cells.map((color, i) =>
        color === PAPER ? null : (
          <rect key={i} x={i % pic.w} y={Math.floor(i / pic.w)} width={1.02} height={1.02} fill={color} />
        )
      )}
    </svg>
  );
}

/** Siatka współrzędnych sceny: linie co 60 jednostek, osie grubsze. */
function StageGridLines() {
  const lines = [-180, -120, -60, 60, 120, 180];
  return (
    <svg viewBox="0 0 480 360" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {lines.map((value) => (
        <line key={`v${value}`} x1={240 + value} y1={0} x2={240 + value} y2={360} stroke="#dbe4ee" strokeWidth={1} />
      ))}
      {[-120, -60, 60, 120].map((value) => (
        <line key={`h${value}`} x1={0} y1={180 - value} x2={480} y2={180 - value} stroke="#dbe4ee" strokeWidth={1} />
      ))}
      <line x1={0} y1={180} x2={480} y2={180} stroke="#9fb3c8" strokeWidth={1.6} />
      <line x1={240} y1={0} x2={240} y2={360} stroke="#9fb3c8" strokeWidth={1.6} />
      <circle cx={240} cy={180} r={3} fill="#9fb3c8" />
    </svg>
  );
}

/** Celownik „tu ma stanąć duszek”. */
function TargetMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#c2410c]" fill="none" stroke="currentColor" aria-hidden>
      <circle cx={12} cy={12} r={7} strokeWidth={1.8} strokeDasharray="3 2.4" />
      <path d="M12 5.5v13M5.5 12h13" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}

/** Dymek odchyla się od krawędzi sceny, tak jak w Scratchu — inaczej wychodziłby poza obraz. */
function SayBubble({ text, x }: { text: string; x: number }) {
  const side = x > 70 ? 'right' : x < -70 ? 'left' : 'center';
  return (
    <div
      className={cn(
        'absolute bottom-[92%] w-max max-w-[130px] border-2 border-zinc-300 bg-white px-2 py-1 text-center text-[11px] font-medium leading-tight text-zinc-800 shadow-sm sm:text-xs',
        side === 'center' && 'left-1/2 -translate-x-1/2',
        side === 'left' && 'left-0',
        side === 'right' && 'right-0'
      )}
      style={{ borderRadius: 10 }}
    >
      {text}
      <span
        className={cn(
          'absolute top-full h-0 w-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-zinc-300',
          side === 'center' && 'left-1/2 -translate-x-1/2',
          side === 'left' && 'left-3',
          side === 'right' && 'right-3'
        )}
      />
    </div>
  );
}

function SoundWaves() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute -right-4 top-1 h-5 w-5 animate-pulse text-[#cf63cf]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 9c2 2 2 4 0 6" />
      <path d="M12 6c3.5 3.5 3.5 8.5 0 12" />
    </svg>
  );
}

export function GreenFlag({ lit, className }: { lit?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} aria-hidden>
      <path
        d="M5 3v18"
        stroke={lit ? '#3aa53a' : '#9aa39a'}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <path d="M6 4.5h12l-3 3.5 3 3.5H6z" fill={lit ? '#4cbb17' : '#b6c4b6'} />
    </svg>
  );
}

export function StopSign({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} aria-hidden>
      <path d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7z" fill="#e2564a" />
    </svg>
  );
}

/**
 * Trzy duszki. Świadomie rysowane z kształtów, a nie pobierane jako obrazki:
 * mają być ostre w każdym rozmiarze i identyczne po stronie serwera i klienta.
 */
export function SpriteArt({ kind, className }: { kind: SpriteKind; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      {kind === 'kot' && <CatArt />}
      {kind === 'pilka' && <BallArt />}
      {kind === 'gwiazdka' && <StarArt />}
    </svg>
  );
}

function CatArt() {
  return (
    <g>
      <path
        d="M13 47c-7-2-7-14 0-17"
        fill="none"
        stroke="#c9702a"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <ellipse cx={29} cy={45} rx={15} ry={12} fill="#f5a04a" stroke="#c9702a" strokeWidth={2} />
      <rect x={22} y={50} width={7} height={9} rx={3.5} fill="#f5a04a" stroke="#c9702a" strokeWidth={2} />
      <rect x={33} y={50} width={7} height={9} rx={3.5} fill="#f5a04a" stroke="#c9702a" strokeWidth={2} />
      <path d="M31 22 L33 9 L44 16 Z" fill="#f5a04a" stroke="#c9702a" strokeWidth={2} strokeLinejoin="round" />
      <path d="M53 22 L51 9 L40 16 Z" fill="#f5a04a" stroke="#c9702a" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={42} cy={28} r={13} fill="#ffb266" stroke="#c9702a" strokeWidth={2} />
      <circle cx={38} cy={26} r={2.3} fill="#3b2412" />
      <circle cx={47} cy={26} r={2.3} fill="#3b2412" />
      <path d="M42.5 30.5 l-2 1.8 h4 z" fill="#c9702a" />
      <path
        d="M40 34c1.5 1.4 3.5 1.4 5 0"
        fill="none"
        stroke="#c9702a"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <g stroke="#c9702a" strokeWidth={1.4} strokeLinecap="round">
        <path d="M29 27h6M29 31h6M52 27h6M52 31h6" />
      </g>
    </g>
  );
}

function BallArt() {
  return (
    <g>
      <circle cx={32} cy={32} r={23} fill="#e94b4b" stroke="#b32f2f" strokeWidth={2} />
      <path
        d="M11 25q21 9 42 0M11 39q21 9 42 0"
        fill="none"
        stroke="#fff6f0"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <ellipse cx={23} cy={20} rx={6} ry={4} fill="#ffffff" opacity={0.45} transform="rotate(-25 23 20)" />
    </g>
  );
}

function StarArt() {
  return (
    <g>
      <path
        d="M32 6 L38.5 23.1 L56.7 24 L42.5 35.4 L47.3 53 L32 43 L16.7 53 L21.5 35.4 L7.3 24 L25.5 23.1 Z"
        fill="#ffcc33"
        stroke="#d99e00"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={27} cy={28} r={2} fill="#7a5800" />
      <circle cx={37} cy={28} r={2} fill="#7a5800" />
      <path
        d="M28 34c2.2 2 5.8 2 8 0"
        fill="none"
        stroke="#7a5800"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </g>
  );
}
