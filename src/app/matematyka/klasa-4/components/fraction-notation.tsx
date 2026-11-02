'use client';

import { cn } from '@/lib/utils';

interface FractionNotationProps {
  licznik: number;
  mianownik: number;
  color: string;
  licznikRevealed?: boolean;
  mianownikRevealed?: boolean;
  onClickLicznik?: () => void;
  onClickMianownik?: () => void;
  size?: 'md' | 'lg';
}

/**
 * Pionowy zapis ułamka — licznik nad kreską, mianownik pod kreską; pierwszy
 * w kursie prawdziwy zapis ułamka. Każda liczba to osobny przycisk
 * odsłaniający swoją nazwę pod sobą, ten sam wzorzec kliknięcia co `TermSlot`
 * w `slownik-dzialan`, tylko ułożony pionowo wokół kreski ułamkowej zamiast
 * w poziomym równaniu.
 *
 * Pierwotnie `guides/slownik-ulamkow/`, wypromowany do współdzielonych
 * 2026-08-24 po drugim konsumencie (`lekcje/ulamek-jako-czesc-calosci`) —
 * ten sam precedens co `CircleFigure`/`ProblemUnpacker`.
 */
export function FractionNotation({
  licznik,
  mianownik,
  color,
  licznikRevealed,
  mianownikRevealed,
  onClickLicznik,
  onClickMianownik,
  size = 'lg',
}: FractionNotationProps) {
  return (
    <div className="flex flex-col items-center">
      <NumberSlot value={licznik} label="licznik" color={color} revealed={licznikRevealed} onClick={onClickLicznik} size={size} />
      <div className="my-1 h-1 w-14 sm:w-16" style={{ backgroundColor: color }} aria-hidden />
      <NumberSlot
        value={mianownik}
        label="mianownik"
        color={color}
        revealed={mianownikRevealed}
        onClick={onClickMianownik}
        size={size}
      />
    </div>
  );
}

interface NumberSlotProps {
  value: number;
  label: string;
  color: string;
  revealed?: boolean;
  onClick?: () => void;
  size: 'md' | 'lg';
}

function NumberSlot({ value, label, color, revealed, onClick, size }: NumberSlotProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const numberClass = size === 'lg' ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl';
  const clickable = Boolean(onClick);
  const showLabelRow = clickable || revealed;

  const content = (
    <>
      <span className={cn('font-mono font-black leading-none tabular-nums', numberClass)} style={{ color }}>
        {value}
      </span>
      {showLabelRow && (
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wide sm:text-xs',
            !revealed && 'text-muted-foreground'
          )}
          style={revealed ? { color: textColor } : undefined}
        >
          {revealed ? label : '?'}
        </span>
      )}
      {clickable && !revealed && <span className="sr-only">{label}</span>}
    </>
  );

  if (!clickable) {
    return <div className="flex flex-col items-center gap-0.5 px-2 py-1">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={revealed}
      className={cn('flex cursor-pointer flex-col items-center gap-0.5 px-2 py-1 transition-transform', !revealed && 'hover:-translate-y-0.5')}
    >
      {content}
    </button>
  );
}
