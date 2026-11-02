'use client';

import { useState } from 'react';
import { AlertTriangle, Check, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji: dziecko gra w cudzy quiz i samo natrafia na usterkę, którą
 * autor przeoczył — bo autor testował go, znając odpowiedzi. Dowolna odpowiedź
 * dostaje to samo „Super, dobrze!”. To ta sama myśl, na której stoi cała
 * lekcja: autor nie widzi własnych błędów, bo wie, jak to działa. Prawdziwy
 * test przychodzi dopiero od kogoś, kto zgaduje na oślep — tak jak dziecko
 * przed chwilą.
 */

const QUESTIONS = [
  {
    text: 'Które z tych urządzeń NIE jest urządzeniem wejścia?',
    options: ['Mysz', 'Klawiatura', 'Głośnik'],
  },
  {
    text: 'Ile lat ma najstarszy zapisany przepis kulinarny?',
    options: ['Około 40 lat', 'Około 400 lat', 'Około 4000 lat'],
  },
];

const DIAGNOSIS_OPTIONS = [
  { id: 'trudne', label: 'Pytania są za trudne jak na quiz Ali.', ok: false },
  { id: 'nie-sprawdza', label: 'Quiz nie sprawdza, czy odpowiedź jest poprawna — zawsze chwali.', ok: true },
  { id: 'za-malo-czasu', label: 'Jest za mało czasu na zastanowienie się nad odpowiedzią.', ok: false },
];

type Phase = 'q1' | 'q2' | 'reveal';

export function BuggyQuizDemo({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [phase, setPhase] = useState<Phase>('q1');
  const [picked, setPicked] = useState<string | null>(null);
  const [wrongTry, setWrongTry] = useState(false);
  const [done, setDone] = useState(false);

  const question = phase === 'q1' ? QUESTIONS[0] : phase === 'q2' ? QUESTIONS[1] : null;

  const answer = (option: string) => {
    setPicked(option);
  };

  const next = () => {
    setPicked(null);
    setPhase(phase === 'q1' ? 'q2' : 'reveal');
  };

  const diagnose = (id: string) => {
    const chosen = DIAGNOSIS_OPTIONS.find((item) => item.id === id);
    if (!chosen) return;
    if (chosen.ok) {
      setDone(true);
      setWrongTry(false);
      onComplete?.();
    } else {
      setWrongTry(true);
    }
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Quiz Ali — „Czy to wiesz?”
      </p>

      {question && (
        <div className="mt-3">
          <p className="text-base font-medium">{question.text}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={picked !== null}
                onClick={() => answer(option)}
                className={cn(
                  'border p-3 text-left text-sm transition-colors',
                  picked === option ? 'font-semibold' : 'hover:bg-muted/50',
                  picked !== null && picked !== option && 'text-muted-foreground'
                )}
                style={picked === option ? { borderColor: color, backgroundColor: `${color}14` } : undefined}
              >
                {option}
              </button>
            ))}
          </div>

          {picked && (
            <div className="mt-4 flex items-center gap-2 p-3" style={{ backgroundColor: `${color}14` }}>
              <PartyPopper className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <p className="text-sm font-semibold" style={{ color }}>
                Super, dobrze!
              </p>
              <button
                type="button"
                onClick={next}
                className="ml-auto cursor-pointer border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/50"
                style={{ borderColor: color, color }}
              >
                Dalej
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'reveal' && (
        <div className="mt-3">
          <p className="text-sm leading-relaxed">
            Zauważ coś: nie ma znaczenia, którą odpowiedź kliknąłeś/kliknęłaś — quiz zawsze mówi to
            samo. Ala napisała ten quiz i sama go „przetestowała”, klikając odpowiedzi, które{' '}
            <strong>znała</strong>. Nigdy nie kliknęła złej — więc nigdy nie zobaczyła, że quiz i tak
            by ją pochwalił.
          </p>

          <p className="mt-4 text-sm font-medium">Co jest tu naprawdę nie tak?</p>
          <div className="mt-2 grid gap-2">
            {DIAGNOSIS_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => diagnose(option.id)}
                disabled={done}
                className="flex items-start gap-2.5 border p-3 text-left text-sm transition-colors hover:bg-muted/50 disabled:hover:bg-transparent"
                style={done && option.ok ? { borderColor: color, backgroundColor: `${color}14` } : undefined}
              >
                {done && option.ok && <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />}
                {option.label}
              </button>
            ))}
          </div>

          {wrongTry && !done && (
            <p className="mt-3 flex items-start gap-2 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              Przyjrzyj się jeszcze raz temu, co się działo po TWOICH kliknięciach — nie treści pytań.
            </p>
          )}

          {done && (
            <p className="mt-4 border-l-2 p-3 text-sm leading-relaxed" style={{ borderColor: color, backgroundColor: `${color}0f` }}>
              Dokładnie. I to jest sedno tej lekcji: <strong>autor sam siebie nie przetestuje</strong> —
              zna odpowiedzi, zna sterowanie, wie, gdzie kliknąć. Prawdziwy test przychodzi dopiero od
              kogoś, kto tego wszystkiego nie wie.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
