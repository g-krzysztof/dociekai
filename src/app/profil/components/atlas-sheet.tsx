import { cn } from '@/lib/utils';

interface AtlasSheetProps {
  children: React.ReactNode;
  /** Podpis w „tabliczce rysunkowej" — prawy dolny róg arkusza, jak na rysunku technicznym. */
  stamp?: string;
  className?: string;
  /** Kotwica (`/profil#rytm`) — arkusz zostawia miejsce pod przyklejonym nagłówkiem. */
  id?: string;
}

/**
 * Arkusz — jedyny pojemnik tej strony. Cienka ramka z narożnymi znacznikami
 * pasowania (CSS w globals.css) zamiast zaokrąglonej karty z cieniem.
 *
 * Kolumna flex, bo arkusze stoją obok siebie w siatce i rozciągają się do
 * wspólnej wysokości: tabliczka ma wtedy siedzieć przy dolnej krawędzi, a nie
 * tuż pod krótszą treścią.
 */
export function AtlasSheet({ children, stamp, className, id }: AtlasSheetProps) {
  return (
    <section
      id={id}
      className={cn('profil-sheet flex scroll-mt-24 flex-col px-5 py-6 sm:px-7 sm:py-8', className)}
    >
      <div className="flex-1">{children}</div>
      {stamp && (
        <p className="profil-micro mt-5 border-t border-[var(--rule-faint)] pt-2.5 text-right">
          {stamp}
        </p>
      )}
    </section>
  );
}
