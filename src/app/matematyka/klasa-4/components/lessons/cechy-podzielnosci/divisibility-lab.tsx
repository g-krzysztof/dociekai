'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DivisibilityInspector, type DivisibilityRule } from './divisibility-inspector';

const PRESETS = [132, 4230, 245];

const RULES: DivisibilityRule[] = [
  { id: '2', divisor: 2, kind: 'lastDigits', lastDigits: 1 },
  { id: '5', divisor: 5, kind: 'lastDigits', lastDigits: 1 },
  { id: '10', divisor: 10, kind: 'lastDigits', lastDigits: 1 },
  { id: '4', divisor: 4, kind: 'lastDigits', lastDigits: 2 },
  { id: '100', divisor: 100, kind: 'lastDigits', lastDigits: 2 },
  { id: '3', divisor: 3, kind: 'digitSum' },
  { id: '9', divisor: 9, kind: 'digitSum' },
];

function hintFor(rule: DivisibilityRule): string {
  if (rule.kind === 'digitSum') return `Zsumuj wszystkie cyfry i sprawdź, czy suma dzieli się przez ${rule.divisor}.`;
  const n = rule.lastDigits ?? 1;
  return n === 1
    ? `Spójrz tylko na ostatnią cyfrę.`
    : `Spójrz tylko na ostatnie ${n} cyfry, jakby były osobną liczbą.`;
}

function verdictFor(value: number, rule: DivisibilityRule): string {
  const divisible = value % rule.divisor === 0;
  if (rule.kind === 'lastDigits') {
    const n = rule.lastDigits ?? 1;
    const tail = String(value % 10 ** n).padStart(n, '0');
    return divisible
      ? `Ostatnie ${n === 1 ? 'cyfra' : `${n} cyfry`} to ${tail} — to wystarczy, żeby ${value} dzieliło się przez ${rule.divisor}.`
      : `Ostatnie ${n === 1 ? 'cyfra' : `${n} cyfry`} to ${tail} — ${value} NIE dzieli się przez ${rule.divisor}.`;
  }
  const sum = String(value)
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
  return divisible
    ? `Suma cyfr to ${sum}, a ${sum} dzieli się przez ${rule.divisor} — więc ${value} też.`
    : `Suma cyfr to ${sum}, a ${sum} NIE dzieli się przez ${rule.divisor} — więc ${value} też nie.`;
}

interface DivisibilityLabProps {
  color: string;
  onComplete?: () => void;
}

/** Nowe pojęcie: wybierz liczbę i regułę, zobacz, które cyfry mają znaczenie, i sprawdź werdykt. */
export function DivisibilityLab({ color, onComplete }: DivisibilityLabProps) {
  const [base, setBase] = useState(PRESETS[0]);
  const [ruleId, setRuleId] = useState(RULES[0].id);
  const [revealed, setRevealed] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const rule = RULES.find((item) => item.id === ruleId) ?? RULES[0];

  const pickBase = (value: number) => {
    setBase(value);
    setRevealed(false);
  };

  const pickRule = (id: string) => {
    setRuleId(id);
    setRevealed(false);
  };

  const check = () => {
    setRevealed(true);
    if (!visited.has(ruleId)) {
      const updated = new Set(visited).add(ruleId);
      setVisited(updated);
      if (updated.size >= 4) onComplete?.();
    }
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => pickBase(value)}
            className={cn(
              'border px-3 py-1.5 font-mono text-sm font-bold tabular-nums transition-all hover:-translate-y-0.5 hover:shadow-md',
              base === value && 'text-white'
            )}
            style={base === value ? { backgroundColor: color, borderColor: color } : undefined}
          >
            {value.toLocaleString('pl-PL')}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {RULES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pickRule(item.id)}
            className={cn(
              'w-14 border py-2 text-center font-mono text-sm font-bold tabular-nums transition-all hover:-translate-y-0.5 hover:shadow-md',
              ruleId === item.id && 'text-white'
            )}
            style={ruleId === item.id ? { backgroundColor: color, borderColor: color } : undefined}
          >
            ÷{item.divisor}
          </button>
        ))}
      </div>

      <DivisibilityInspector
        value={base}
        rule={rule}
        revealed={revealed}
        color={color}
        ariaLabel={`Cyfry liczby ${base}, sprawdzanie podzielności przez ${rule.divisor}`}
        className="mx-auto mb-4 max-w-xs"
      />

      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">{hintFor(rule)}</p>

      {!revealed ? (
        <div className="flex justify-center">
          <Button onClick={check} className="gap-1.5">
            <Search className="h-4 w-4" />
            Sprawdź regułę
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 text-sm leading-relaxed"
          style={{ backgroundColor: `${color}0f` }}
        >
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <p>{verdictFor(base, rule)}</p>
        </motion.div>
      )}

      {visited.size < 4 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sprawdź jeszcze {4 - visited.size} {4 - visited.size === 1 ? 'inną regułę' : 'inne reguły'}, żeby
          zaliczyć ten krok.
        </p>
      )}
    </div>
  );
}
