'use client';

import { cn } from '@/lib/utils';
import type { ImageBlock, TableBlock, WriterPicture } from './model';

/** Obraz w dokumencie — cały blok jest jednym celem, który można wybrać dotknięciem. */
export function ImageView({
  block,
  picture,
  active,
  color,
  onActivate,
}: {
  block: ImageBlock;
  picture: WriterPicture | undefined;
  active: boolean;
  color: string;
  onActivate: (id: string) => void;
}) {
  return (
    <div
      role="group"
      tabIndex={0}
      data-kind="image"
      data-wrap={block.wrap}
      data-active={active || undefined}
      aria-label={`Obraz${picture ? `: ${picture.name}` : ''}, ${
        block.wrap === 'float' ? 'tekst opływa obraz' : 'obraz w wierszu'
      }`}
      onClick={() => onActivate(block.id)}
      onFocus={() => onActivate(block.id)}
      className={cn(
        'shrink-0 cursor-pointer border-l-2 py-1 pl-2 outline-none focus-visible:bg-black/5',
        !active && 'border-transparent'
      )}
      style={{ borderColor: active ? color : undefined }}
    >
      {picture ? (
        /* Obraz z banku lekcji — zwykły <img>, bo to adres z `public/` albo `data:`, nie zdjęcie do optymalizacji. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={picture.src}
          alt={picture.name}
          draggable={false}
          className={cn('block h-auto max-h-44 object-contain', block.wrap === 'float' ? 'w-36' : 'w-auto')}
        />
      ) : (
        <span className="block border border-dashed p-6 text-sm text-muted-foreground">
          Brak obrazu
        </span>
      )}
    </div>
  );
}

/** Tabela z komórkami do wpisania. Wiersze i kolumny dodaje się w pasku narzędzi. */
export function TableView({
  block,
  active,
  color,
  onActivate,
  onCell,
  onFocusCell,
}: {
  block: TableBlock;
  active: boolean;
  color: string;
  onActivate: (id: string) => void;
  onCell: (id: string, row: number, column: number, value: string) => void;
  onFocusCell: (id: string, row: number, column: number) => void;
}) {
  return (
    <div
      data-kind="table"
      data-active={active || undefined}
      className={cn('border-l-2 py-1 pl-2', !active && 'border-transparent')}
      style={{ borderColor: active ? color : undefined }}
    >
      <table className="w-full table-fixed border-collapse">
        <tbody>
          {block.cells.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="border border-zinc-400 p-0">
                  <input
                    value={cell}
                    lang="pl"
                    spellCheck={false}
                    aria-label={`Tabela, wiersz ${r + 1}, kolumna ${c + 1}`}
                    onFocus={() => {
                      onActivate(block.id);
                      onFocusCell(block.id, r, c);
                    }}
                    onChange={(event) => onCell(block.id, r, c, event.currentTarget.value)}
                    className="block w-full min-w-0 bg-transparent px-2 py-1.5 text-base text-zinc-900 outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
