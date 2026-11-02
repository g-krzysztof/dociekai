'use client';

interface FractionTokenRowProps {
  color: string;
  total: number;
  selected: Set<number>;
  onToggle: (index: number) => void;
  ariaLabel: string;
}

/**
 * `total` osobnych żetonów (np. kredek) w rzędzie — kliknięcie zaznacza
 * żeton, budując licznik. Pokazuje, że ułamek działa tak samo dla grupy
 * osobnych przedmiotów jak dla podzielonego kształtu (`FractionPie`) — ten
 * sam mechanizm klikania, inny obiekt do podziału.
 */
export function FractionTokenRow({ color, total, selected, onToggle, ariaLabel }: FractionTokenRowProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={ariaLabel}>
      {Array.from({ length: total }, (_, i) => {
        const isSelected = selected.has(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onToggle(i)}
            aria-pressed={isSelected}
            className="h-11 w-7 cursor-pointer border-2 transition-all hover:-translate-y-0.5 sm:h-14 sm:w-8"
            style={{
              borderColor: color,
              backgroundColor: isSelected ? color : `${color}14`,
              borderRadius: 4,
            }}
          />
        );
      })}
    </div>
  );
}
