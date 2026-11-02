'use client';

import { useState } from 'react';
import { FileText, Folder, Image as ImageIcon, Music, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pick, type GameProps } from '../types';
import { useDragChips } from '../drag';

/**
 * Dział 1 — **DO FOLDERÓW!** Trzy pliki, trzy foldery: o tym, gdzie plik
 * należy, decyduje jego rozszerzenie. Pomyłka kończy grę, bo pytanie brzmi
 * „czy rozpoznajesz rodzaj pliku”, a nie „czy trafisz w końcu metodą prób”.
 */

type Kind = 'zdjecia' | 'dokumenty' | 'muzyka';

const FOLDERS: Record<Kind, { label: string; icon: LucideIcon }> = {
  zdjecia: { label: 'Zdjęcia', icon: ImageIcon },
  dokumenty: { label: 'Dokumenty', icon: FileText },
  muzyka: { label: 'Muzyka', icon: Music },
};

const SETS: { id: string; name: string; kind: Kind }[][] = [
  [
    { id: 'a', name: 'wakacje.jpg', kind: 'zdjecia' },
    { id: 'b', name: 'referat.docx', kind: 'dokumenty' },
    { id: 'c', name: 'piosenka.mp3', kind: 'muzyka' },
  ],
  [
    { id: 'a', name: 'kotek.png', kind: 'zdjecia' },
    { id: 'b', name: 'plan-lekcji.odt', kind: 'dokumenty' },
    { id: 'c', name: 'dzwonek.wav', kind: 'muzyka' },
  ],
];

const ORDERS: Kind[][] = [
  ['dokumenty', 'muzyka', 'zdjecia'],
  ['muzyka', 'zdjecia', 'dokumenty'],
  ['zdjecia', 'dokumenty', 'muzyka'],
];

export function FoldersGame({ finish, seed }: GameProps) {
  const files = pick(SETS, seed);
  const order = pick(ORDERS, seed, 1);
  const [placed, setPlaced] = useState<string[]>([]);

  const { dragging, bind } = useDragChips({
    onDrop: (id, zone) => {
      if (!zone) return;
      const file = files.find((item) => item.id === id);
      if (!file) return;
      if (file.kind !== zone) {
        finish(false);
        return;
      }
      const next = [...placed, id];
      setPlaced(next);
      if (next.length === files.length) finish(true);
    },
  });

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex min-h-[3.5rem] flex-wrap items-center justify-center gap-2">
        {files
          .filter((file) => !placed.includes(file.id))
          .map((file) => {
            const Icon = FOLDERS[file.kind].icon;
            return (
              <div
                key={file.id}
                {...bind(file.id)}
                className={cn(
                  'flex select-none items-center gap-2 border-2 bg-white px-3 py-2 text-sm font-semibold shadow-sm dark:bg-zinc-800',
                  dragging === file.id && 'shadow-lg'
                )}
              >
                <Icon className="h-4 w-4 text-slate-500" aria-hidden />
                {file.name}
              </div>
            );
          })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {order.map((kind) => {
          const count = files.filter((file) => file.kind === kind && placed.includes(file.id)).length;
          return (
            <div
              key={kind}
              data-zone={kind}
              className={cn(
                'flex min-h-[6.5rem] flex-col items-center justify-center gap-1 border-2 border-dashed p-2 text-center text-sm font-semibold',
                count ? 'border-emerald-500 bg-emerald-500/10' : 'bg-muted/30'
              )}
            >
              <Folder className="pointer-events-none h-8 w-8 text-amber-500" aria-hidden />
              <span className="pointer-events-none">{FOLDERS[kind].label}</span>
              {count > 0 && <span className="pointer-events-none text-xs text-emerald-600">✓ jest w środku</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
