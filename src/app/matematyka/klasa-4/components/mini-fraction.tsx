import { cn } from '@/lib/utils';

interface MiniFractionProps {
  licznik: number;
  mianownik: number;
  /** Część całkowita liczby mieszanej — pomijana, gdy nie ma sensu (0 albo brak). */
  whole?: number;
  /** Domyślnie dziedziczy kolor tekstu rodzica, żeby dało się go wstawić w zdanie dowolnego koloru. */
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Ułamek wpleciony w zdanie — licznik nad kreską, mianownik pod kreską, ale
 * w rozmiarze tekstu, nie plakatu. `FractionNotation` jest osobnym bytem:
 * tam ułamek JEST treścią kroku (klikalne odsłony nazw, `text-6xl`), tu jest
 * jednym wyrazem w wypisanym działaniu.
 *
 * Napisany od razu jako współdzielony, bo powstał na potrzeby trzech lekcji
 * modułu 5 naraz (dodawanie i odejmowanie, mnożenie przez liczbę naturalną,
 * zadania tekstowe) — nie jest to promocja po drugim konsumencie, tylko
 * ten sam próg spełniony w jednym kroku.
 */
export function MiniFraction({ licznik, mianownik, whole, color, size = 'md', className }: MiniFractionProps) {
  const numberClass = size === 'sm' ? 'text-[0.7rem]' : 'text-xs sm:text-sm';

  return (
    <span
      className={cn('inline-flex items-center gap-1 align-middle font-mono font-bold tabular-nums', className)}
      style={color ? { color } : undefined}
    >
      {whole !== undefined && whole !== 0 && (
        <span className={size === 'sm' ? 'text-sm' : 'text-base sm:text-lg'}>{whole}</span>
      )}
      <span className="inline-flex flex-col items-center leading-none">
        <span className={cn('px-1', numberClass)}>{licznik}</span>
        <span className="my-0.5 h-px w-full self-stretch bg-current" aria-hidden />
        <span className={cn('px-1', numberClass)}>{mianownik}</span>
      </span>
    </span>
  );
}
