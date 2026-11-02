import { cn } from '@/lib/utils';
import { formatDecimal, type DecimalValue } from '../../../lib/decimal';

interface DecimalNumeralProps {
  value: DecimalValue;
  color: string;
  className?: string;
}

/**
 * Duża liczba z przecinkiem, w kursowym stylu numerału (`font-mono` +
 * `tabular-nums`). W foncie o stałej szerokości przecinek zajmuje całą komórkę
 * cyfry, więc „3,25” rozjeżdża się optycznie w „3 , 25” — dostaje więc ujemny
 * margines, który przywraca normalny odstęp, nie ruszając kolumn cyfr.
 */
export function DecimalNumeral({ value, color, className }: DecimalNumeralProps) {
  const [whole, fraction] = formatDecimal(value).split(',');

  return (
    <span className={cn('font-mono font-black tabular-nums', className)} style={{ color }}>
      {whole}
      {fraction !== undefined && (
        <>
          <span className="-mx-[0.24em] inline-block">,</span>
          {fraction}
        </>
      )}
    </span>
  );
}
