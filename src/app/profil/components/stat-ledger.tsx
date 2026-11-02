import { cn } from '@/lib/utils';
import type { LedgerRow } from '../lib/atlas-shape';

/**
 * Odczyty roku jako rejestr równorzędnych pomiarów, nie kafelki — żadna z tych
 * liczb nie jest ważniejsza od pozostałych, więc żadna nie dostaje sceny.
 * Podpis ma zarezerwowane dwa wiersze, żeby rejestry obu kursów kończyły się na
 * tej samej wysokości niezależnie od szerokości arkusza.
 */
export function StatLedger({
  rows,
  ready,
  className,
}: {
  rows: LedgerRow[];
  ready: boolean;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        'mt-8 grid grid-cols-2 border-t border-[var(--rule-faint)] sm:grid-cols-3',
        className
      )}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="border-b border-[var(--rule-faint)] px-1 py-4 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0"
        >
          <dt className="profil-micro">{row.label}</dt>
          <dd className="profil-num mt-2 text-2xl leading-none text-[var(--ink)] sm:text-[1.75rem]">
            {ready ? row.value : '—'}
          </dd>
          <p className="mt-2 h-8 text-[11px] leading-tight text-[var(--ink-faint)]">{row.hint}</p>
        </div>
      ))}
    </dl>
  );
}
