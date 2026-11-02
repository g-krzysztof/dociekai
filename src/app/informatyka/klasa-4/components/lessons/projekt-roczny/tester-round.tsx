'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEEDBACK_CATEGORIES } from './feedback';

/**
 * Zanim dziecko poprosi własnych testerów o opinię (w zadaniu), ćwiczy na
 * cudzym przykładzie: gra Kuby wygląda na gotową, ale dwie wiadomości od
 * testerów — z opóźnieniem, jak prawdziwe wiadomości — ujawniają dwie różne
 * usterki. Dziecko dopasowuje każdą do kategorii z tej samej listy, której
 * użyje potem w swoim dzienniku testów.
 */

interface Message {
  from: string;
  text: string;
  category: string;
}

const MESSAGES: Message[] = [
  {
    from: 'Zosia (siostra Kuby)',
    text: '„Kliknęłam w grę i nic się nie zaczęło. Nie wiedziałam, że trzeba nacisnąć zieloną flagę.”',
    category: 'start',
  },
  {
    from: 'Tata Kuby',
    text: '„Kulka wjechała w kąt labiryntu i tam została. Czekałem, czekałem i nic się nie działo.”',
    category: 'utknal',
  },
];

const CHOICES = FEEDBACK_CATEGORIES.filter((category) => category.id !== 'ok');

export function TesterRound({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [visible, setVisible] = useState(0);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const [wrong, setWrong] = useState<Record<number, boolean>>({});
  const reported = useRef(false);

  useEffect(() => {
    if (visible >= MESSAGES.length) return;
    const timer = setTimeout(() => setVisible((value) => value + 1), visible === 0 ? 400 : 1400);
    return () => clearTimeout(timer);
  }, [visible]);

  const solved = MESSAGES.every((message, index) => picked[index] === message.category);

  useEffect(() => {
    if (solved && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [solved, onComplete]);

  const choose = (index: number, categoryId: string) => {
    if (categoryId === MESSAGES[index].category) {
      setPicked((prev) => ({ ...prev, [index]: categoryId }));
      setWrong((prev) => ({ ...prev, [index]: false }));
    } else {
      setWrong((prev) => ({ ...prev, [index]: true }));
    }
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Kuba zrobił grę „Ucieczka z labiryntu” i jest pewien, że działa
      </p>

      <div className="mt-4 space-y-4">
        {MESSAGES.map((message, index) => {
          if (index >= visible) return null;
          const isSolved = picked[index] === message.category;
          return (
            <div key={index} className="border-l-2 pl-3" style={{ borderColor: `${color}55` }}>
              <p className="text-xs font-semibold text-muted-foreground">{message.from}</p>
              <p className="mt-0.5 text-sm leading-relaxed">{message.text}</p>

              {!isSolved && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CHOICES.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => choose(index, choice.id)}
                      className="border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/50"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              )}

              {wrong[index] && !isSolved && (
                <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  To nie to. Przeczytaj wiadomość jeszcze raz — czego dokładnie tester nie mógł zrobić?
                </p>
              )}

              {isSolved && (
                <p
                  className={cn('mt-2 flex items-center gap-1.5 text-xs font-semibold')}
                  style={{ color }}
                >
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {message.category === 'start'
                    ? 'Nie wiedział/a, co robić na starcie.'
                    : 'Utknął/utknęła w jednym miejscu.'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {solved && (
        <div className="mt-5 border-l-2 p-3 text-sm leading-relaxed" style={{ borderColor: color, backgroundColor: `${color}0f` }}>
          Kuba widział swoją grę dziesiątki razy podczas budowania — wie, że trzeba kliknąć flagę, i
          zna trasę na pamięć. Dopiero ktoś, kto tego nie wie, pokazał mu, czego jego grze brakuje.{' '}
          <strong>Prawdziwy test przychodzi zawsze od kogoś, kto nie widział, jak to budowałeś.</strong>
        </div>
      )}
    </div>
  );
}
