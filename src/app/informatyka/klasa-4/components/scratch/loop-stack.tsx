'use client';

import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BlockChip } from './bench';
import { BLOCKS, CATEGORIES, type Block } from './engine';

/**
 * Rysowanie skryptu, w którym są **klocki z paszczą**. `Bench` z lekcji 24 tego
 * nie umie i celowo nie uczy się tego w lekcji 27: tam stos jest płaski, a cała
 * jego mechanika przeciągania liczy miejsce wstawienia z jednego wymiaru.
 * Zagnieżdżone upuszczanie to inny problem i inny gest — dołożone do benchu
 * „przy okazji” zepsułoby trzy widżety, które już na nim stoją.
 *
 * Zamiast tego każdy blok tej lekcji ma **własny gest na pętli**: zwijanie
 * zaznaczonego fragmentu (`LoopFold`), wkładanie jednego klocka w jedno z trzech
 * miejsc (`EdgeGuard`), przestawianie klatek (`Flipbook`). Ten plik daje im
 * wspólny rysunek, nic więcej — stan trzyma widżet.
 *
 * **Kształt klocka niesie regułę, tak samo jak w benchu.** Pętla ma lewy słupek i
 * dolną belkę, więc widać, co jest w środku, a co pod spodem. `zawsze` nie
 * dostaje wypustki pod dolną belką — w Scratchu też jej nie ma, bo pod pętlą,
 * która się nie kończy, nic nie ma prawa się wykonać.
 *
 * **Wypromowane z `lessons/petle-i-warunki/` przy lekcji 28** — drugiej, która
 * sięgnęła po klocki obejmujące (zasada „promote on second use”, ta sama
 * ścieżka, którą przeszedł sam bench po lekcji 24).
 */

/** Ścieżka klocka w zagnieżdżonym stosie: `"2"` na wierzchu, `"2.0"` w paszczy. */
export type BlockPath = string;

export interface ScriptDecor {
  /** Klocek należy do zaznaczonego fragmentu. */
  marked?: boolean;
  /** Klocek wygaszony — leży poza tym, o czym w tej chwili mowa. */
  dim?: boolean;
  /** Klocek właśnie się wykonuje. */
  running?: boolean;
}

interface ScriptProps {
  blocks: Block[];
  /** Owalne pola stają się klikalne. */
  editable?: boolean;
  onValueClick?: (path: BlockPath, block: Block) => void;
  decorate?: (path: BlockPath, block: Block) => ScriptDecor | undefined;
  onBlockDown?: (path: BlockPath, block: Block, event: ReactPointerEvent) => void;
  onBlockOver?: (path: BlockPath, block: Block) => void;
  /** Zawartość doklejana w paszczy — gniazdo, podpowiedź, cokolwiek widżet tam chce. */
  renderMouth?: (path: BlockPath, block: Block) => ReactNode;
  /**
   * To samo dla drugiej paszczy („w przeciwnym razie”). Ścieżka klocków w niej to
   * `"<ścieżka klocka>!.<indeks>"`, więc gniazdo drugiej paszczy nazywa się
   * `"<ścieżka klocka>!"` — o jeden znak inaczej niż gniazdo pierwszej.
   */
  renderElseMouth?: (path: BlockPath, block: Block) => ReactNode;
  /**
   * Zawartość doklejana **pod** danym klockiem, wewnątrz stosu. Gniazdo „nad
   * pętlą” musi być narysowane nad pętlą, a nie pod całym skryptem — inaczej
   * podpis kłóci się z tym, co dziecko widzi, i to w bloku, którego cała treść
   * jest o miejscu klocka.
   */
  renderAfter?: (path: BlockPath, block: Block) => ReactNode;
  /** Zawartość doklejana pod całym stosem — u nas trzecie gniazdo `EdgeGuard`. */
  footer?: ReactNode;
  className?: string;
}

export function Script({
  blocks,
  editable,
  onValueClick,
  decorate,
  onBlockDown,
  onBlockOver,
  renderMouth,
  renderElseMouth,
  renderAfter,
  footer,
  className,
}: ScriptProps) {
  return (
    <div className={cn('w-fit min-w-0 select-none', className)}>
      <Level
        blocks={blocks}
        prefix=""
        editable={editable}
        onValueClick={onValueClick}
        decorate={decorate}
        onBlockDown={onBlockDown}
        onBlockOver={onBlockOver}
        renderMouth={renderMouth}
        renderElseMouth={renderElseMouth}
        renderAfter={renderAfter}
      />
      {footer}
    </div>
  );
}

function Level({
  blocks,
  prefix,
  editable,
  onValueClick,
  decorate,
  onBlockDown,
  onBlockOver,
  renderMouth,
  renderElseMouth,
  renderAfter,
}: Omit<ScriptProps, 'className' | 'footer'> & { prefix: string }) {
  return (
    <>
      {blocks.map((block, index) => {
        const path = prefix ? `${prefix}.${index}` : String(index);
        const decor = decorate?.(path, block) ?? {};
        const wrapper = BLOCKS[block.type].shape === 'obejmujacy';
        const spine = CATEGORIES[BLOCKS[block.type].category].color;

        return (
          <div
            key={block.id}
            className={cn('transition-opacity', decor.dim && 'opacity-35')}
            style={
              decor.marked
                ? { boxShadow: '0 0 0 2px #1f2937', borderRadius: 4, marginBlock: 2 }
                : undefined
            }
          >
            <div
              className={cn('w-fit', onBlockDown && 'cursor-grab touch-none')}
              onPointerDown={(event) => onBlockDown?.(path, block, event)}
              onPointerEnter={() => onBlockOver?.(path, block)}
            >
              <BlockChip
                block={block}
                editable={editable}
                onValueClick={() => onValueClick?.(path, block)}
                running={decor.running}
              />
            </div>

            {wrapper && (
              <>
                <div className="flex">
                  <div className="w-3 shrink-0" style={{ backgroundColor: spine }} aria-hidden />
                  <div className="min-h-[18px] py-1 pl-1">
                    <Level
                      blocks={block.inner ?? []}
                      prefix={path}
                      editable={editable}
                      onValueClick={onValueClick}
                      decorate={decorate}
                      onBlockDown={onBlockDown}
                      onBlockOver={onBlockOver}
                      renderMouth={renderMouth}
                      renderElseMouth={renderElseMouth}
                      renderAfter={renderAfter}
                    />
                    {renderMouth?.(path, block)}
                  </div>
                </div>

                {/* Druga paszcza — tylko „jeżeli … w przeciwnym razie”. */}
                {block.inner2 && (
                  <>
                    <div
                      className="w-fit min-w-[92px] rounded-[3px] px-2.5 py-1 text-[11px] font-semibold leading-tight text-white sm:text-xs"
                      style={{ backgroundColor: spine }}
                    >
                      w przeciwnym razie
                    </div>
                    <div className="flex">
                      <div className="w-3 shrink-0" style={{ backgroundColor: spine }} aria-hidden />
                      <div className="min-h-[18px] py-1 pl-1">
                        <Level
                          blocks={block.inner2}
                          prefix={`${path}!`}
                          editable={editable}
                          onValueClick={onValueClick}
                          decorate={decorate}
                          onBlockDown={onBlockDown}
                          onBlockOver={onBlockOver}
                          renderMouth={renderMouth}
                          renderElseMouth={renderElseMouth}
                          renderAfter={renderAfter}
                        />
                        {renderElseMouth?.(path, block)}
                      </div>
                    </div>
                  </>
                )}
                <div
                  className="relative h-3.5 w-[92px] rounded-b-[3px]"
                  style={{ backgroundColor: spine }}
                  aria-hidden
                >
                  {/*
                   * Wypustka pod dolną belką — u `zawsze` jej nie ma, bo pod pętlą
                   * bez końca nic się nie wykona. To jedyna różnica w rysunku obu
                   * pętli i jest w Scratchu dokładnie taka sama.
                   */}
                  {block.type !== 'zawsze' && (
                    <span
                      className="absolute left-3 top-full h-[5px] w-5 rounded-b-[3px]"
                      style={{ backgroundColor: spine }}
                    />
                  )}
                </div>
              </>
            )}
            {renderAfter?.(path, block)}
          </div>
        );
      })}
    </>
  );
}

/** Puste gniazdo do upuszczenia klocka — rysowane tam, gdzie widżet na niego czeka. */
export function Slot({
  color,
  label,
  active,
  onClick,
}: {
  color: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
  );
  const style = {
    borderColor: color,
    backgroundColor: active ? `${color}26` : `${color}0f`,
    color,
  };

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="my-1 flex h-[30px] min-w-[150px] cursor-pointer items-center justify-center border-2 border-dashed px-2 transition-colors"
      style={style}
    >
      {content}
    </button>
  ) : (
    <div
      className="my-1 flex h-[30px] min-w-[150px] items-center justify-center border-2 border-dashed px-2"
      style={style}
    >
      {content}
    </div>
  );
}

/** Jeden klocek narysowany poza stosem — leżący luzem na blacie. */
export function LooseBlock({
  block,
  grabbed,
  onPointerDown,
}: {
  block: Block;
  grabbed?: boolean;
  onPointerDown?: (event: ReactPointerEvent) => void;
}) {
  return (
    <div
      className={cn('w-fit touch-none', onPointerDown && 'cursor-grab', grabbed && 'opacity-40')}
      onPointerDown={onPointerDown}
    >
      <BlockChip block={block} />
    </div>
  );
}

/** Co niesie ze sobą przeciągany klocek — rysowany pod palcem. */
export function DragGhost({ block, x, y }: { block: Block; x: number; y: number }): ReactNode {
  return (
    <div
      className="pointer-events-none fixed z-50 opacity-90"
      style={{ left: x, top: y, transform: 'translate(-24px, -14px)' }}
    >
      <BlockChip block={block} />
    </div>
  );
}
