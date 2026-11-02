'use client';

import { motion } from 'framer-motion';

export interface DivisibilityRule {
  id: string;
  divisor: number;
  kind: 'lastDigits' | 'digitSum';
  /** Tylko dla `lastDigits`: ile cyfr od końca decyduje (1 dla ÷2/÷5/÷10, 2 dla ÷4/÷100). */
  lastDigits?: number;
}

interface DivisibilityInspectorProps {
  value: number;
  rule: DivisibilityRule;
  /** Po odsłonięciu: reguły `lastDigits` tylko utrwalają podświetlenie, `digitSum` dodatkowo zwijają cyfry w sumę. */
  revealed: boolean;
  color: string;
  ariaLabel: string;
  className?: string;
}

/**
 * Rząd cyfr liczby, w którym te istotne dla wybranej cechy podzielności są
 * podświetlone, a reszta wygaszona. Dla reguł opartych na ostatnich cyfrach
 * (÷2, ÷4, ÷5, ÷10, ÷100) to wszystko — podświetlenie samo w sobie jest
 * odpowiedzią. Dla reguł opartych na sumie cyfr (÷3, ÷9) kliknięcie
 * „Sprawdź” dodatkowo zwija WSZYSTKIE cyfry do jednej wspólnej kolumny
 * siatki — `layout` z framer-motion animuje to jako złączenie w jeden
 * kafelek sumy, który zanika w cyfry i pojawia się osobno. To dokładnie
 * odwrotny ruch niż w `DealerBoard` z poprzedniej lekcji (tam jeden żeton
 * rozjeżdżał się na wiele grup, tu wiele cyfr zjeżdża się w jedną sumę) —
 * pierwszy w kursie widget „wiele do jednego” zamiast „jeden do wielu”.
 */
export function DivisibilityInspector({
  value,
  rule,
  revealed,
  color,
  ariaLabel,
  className,
}: DivisibilityInspectorProps) {
  const digits = String(value).split('').map(Number);
  const len = digits.length;
  const relevantFrom = rule.kind === 'digitSum' ? 0 : len - (rule.lastDigits ?? 1);
  const collapsedColumn = Math.ceil(len / 2);
  const dimColor = `color-mix(in oklch, ${color} 35%, gray)`;

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-4">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${len}, minmax(0, 1fr))` }}>
          {digits.map((digit, i) => {
            const relevant = i >= relevantFrom;
            const collapsing = revealed && relevant && rule.kind === 'digitSum';

            return (
              <motion.div
                key={i}
                layout
                animate={{ opacity: collapsing ? 0 : 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                style={{
                  gridColumn: collapsing ? collapsedColumn + 1 : i + 1,
                  borderColor: relevant ? color : `${color}33`,
                  backgroundColor: relevant ? `${color}1a` : 'transparent',
                  color: relevant ? color : dimColor,
                }}
                className="flex aspect-square items-center justify-center border-2 font-mono text-xl font-black tabular-nums sm:text-2xl"
              >
                {digit}
              </motion.div>
            );
          })}
        </div>

        {revealed && rule.kind === 'digitSum' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
            className="flex h-14 w-14 items-center justify-center border-2 font-mono text-2xl font-black tabular-nums"
            style={{ borderColor: color, backgroundColor: `${color}1a`, color }}
          >
            {digits.reduce((sum, digit) => sum + digit, 0)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
