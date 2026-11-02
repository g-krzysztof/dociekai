'use client';

import { cn } from '@/lib/utils';

interface PartChipProps {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

/**
 * Klikalna etykieta nazwy części figury — kliknięcie „aktywuje" odpowiadający
 * element na rysunku obok (`CircleFigure` w `slownik-kola`, `SolidSpinner`
 * w `jezyk-bryl`). Ten sam wzorzec co chipy w `act-rodziny-liczb`; wypromowany
 * z folderu `slownik-kola/` do wspólnego `guides/` po drugim konsumencie.
 */
export function PartChip({ label, color, active, onClick }: PartChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'cursor-pointer border px-4 py-2 text-sm font-semibold transition-all',
        !active && 'hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={
        active
          ? { borderColor: color, backgroundColor: `${color}14`, color }
          : { borderColor: `${color}40`, color: `color-mix(in oklch, ${color} 88%, black)` }
      }
    >
      {label}
    </button>
  );
}
