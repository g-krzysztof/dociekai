import { cn } from '@/lib/utils';

interface CompletionStampProps {
  label?: string;
  className?: string;
}

/**
 * Duża, obrócona „pieczątka” ukończenia — czytelniejsza niż mała plakietka.
 * Wzorowana na stemplu „Prawda/Mit” z lekcji `jak-sie-uczyc` (`myth-check.tsx`).
 */
export function CompletionStamp({ label = 'Ukończono', className }: CompletionStampProps) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute -rotate-12 select-none whitespace-nowrap rounded-xl border-[3px] border-emerald-500',
        'bg-white/90 px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-emerald-600 shadow-lg backdrop-blur-sm',
        'dark:bg-zinc-900/90 sm:px-4 sm:py-1.5 sm:text-lg',
        className
      )}
    >
      {label}
    </span>
  );
}
