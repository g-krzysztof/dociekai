'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import type { DrillScore } from './mouse-keyboard-drill';

/**
 * Sprawdzian zasad bezpieczeństwa w sieci — jedyny blok tego testu, w którym
 * odpowiedź jest wiedzą, a nie umiejętnością, więc jedyny zbudowany jako
 * pytania z odpowiedziami. Odsłonięcie jest jednorazowe (tryb „egzaminacyjny”,
 * tak samo jak `DiagnosticQuiz` w matematyce) — po kliknięciu nie da się
 * poprawić, bo to ma zmierzyć stan wiedzy na wejściu.
 *
 * Poprawne odpowiedzi są celowo rozrzucone po różnych pozycjach (c, a, d, c, b).
 * Nigdy nie ustawiaj ich w jednym miejscu — dziecko uczy się wtedy pozycji,
 * nie treści.
 *
 * Numery pomocowe na końcu są zweryfikowane i pochodzą z programu kursu;
 * pełna lista instytucji to zadanie obowiązkowe Z-3 w module 2.
 */

interface Situation {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
}

const SITUATIONS: Situation[] = [
  {
    id: 'dane',
    question:
      'W grze online ktoś, kogo nie znasz, pyta cię o imię, nazwisko i nazwę twojej szkoły.',
    options: [
      { id: 'a', text: 'Podaję — w grach wszyscy się tak przedstawiają.' },
      { id: 'b', text: 'Podaję samo imię, to chyba nic takiego.' },
      { id: 'c', text: 'Nie podaję nic i mówię o tym rodzicowi albo opiekunowi.' },
      { id: 'd', text: 'Najpierw pytam jego o to samo.' },
    ],
    correctId: 'c',
    explanation:
      'Imię plus nazwisko plus szkoła wystarczą, żeby cię odnaleźć w prawdziwym świecie. W sieci nikt nie musi być tym, za kogo się podaje — dlatego takie pytania zawsze zgłasza się dorosłemu.',
  },
  {
    id: 'nagroda',
    question:
      'Dostajesz wiadomość: „Wygrałeś telefon! Kliknij w link i podaj dane, żeby odebrać nagrodę”.',
    options: [
      { id: 'a', text: 'Nie klikam i kasuję wiadomość — nie brałem/brałam udziału w żadnym konkursie.' },
      { id: 'b', text: 'Klikam, żeby zobaczyć, co tam jest.' },
      { id: 'c', text: 'Klikam i podaję dane, ale tylko imię.' },
      { id: 'd', text: 'Przesyłam znajomym, żeby też odebrali nagrodę.' },
    ],
    correctId: 'a',
    explanation:
      'Nie da się wygrać w konkursie, w którym się nie brało udziału. Takie wiadomości mają jeden cel: żebyś kliknął/kliknęła i zostawił/a swoje dane albo dane rodziców.',
  },
  {
    id: 'haslo',
    question: 'Które z tych haseł jest najbezpieczniejsze?',
    options: [
      { id: 'a', text: '123456' },
      { id: 'b', text: 'antek2016 — imię i rok urodzenia' },
      { id: 'c', text: 'qwerty' },
      { id: 'd', text: 'ZielonyKrokodylLampa7 — trzy przypadkowe słowa i cyfra' },
    ],
    correctId: 'd',
    explanation:
      'Dobre hasło jest długie i nie da się go zgadnąć z tego, co o tobie wiadomo. Imię z rokiem urodzenia zna pół klasy, a „123456” i „qwerty” to od lat dwa najczęściej używane hasła świata — program łamiący hasła sprawdza je pierwsze.',
  },
  {
    id: 'przemoc',
    question: 'Ktoś w internecie od kilku dni ci dokucza i cię wyzywa. Co robisz najpierw?',
    options: [
      { id: 'a', text: 'Odpisuję mu tym samym.' },
      { id: 'b', text: 'Kasuję konto i nikomu nie mówię.' },
      { id: 'c', text: 'Nie odpisuję, robię zrzuty ekranu i mówię o tym dorosłemu.' },
      { id: 'd', text: 'Czekam, aż samo przejdzie.' },
    ],
    correctId: 'c',
    explanation:
      'Odpisanie tym samym rozkręca awanturę, a skasowanie konta niszczy dowody. Zrzut ekranu zostaje — i to on pozwala dorosłym coś z tym zrobić. To nie jest skarżenie, tylko proszenie o pomoc.',
  },
  {
    id: 'kolega',
    question:
      'Kolega z klasy prosi, żebyś dał/dała mu swoje hasło do konta w grze — chce tylko chwilę pograć.',
    options: [
      { id: 'a', text: 'Daję, przecież to kolega.' },
      { id: 'b', text: 'Nie daję. Hasło jest tylko moje — nawet najlepszemu koledze się go nie podaje.' },
      { id: 'c', text: 'Daję, ale każę mu obiecać, że niczego nie zmieni.' },
      { id: 'd', text: 'Daję hasło zmienione o jedną literę.' },
    ],
    correctId: 'b',
    explanation:
      'Hasło jest jak klucz do domu: pożyczone przestaje być twoje. Nawet jeśli kolega nie ma złych zamiarów, może je komuś pokazać albo zapisać w miejscu, do którego dostanie się ktoś inny.',
  },
];

interface SafetyCheckProps {
  color: string;
  onFinish?: (result: DrillScore) => void;
}

export function SafetyCheck({ color, onFinish }: SafetyCheckProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const situation = SITUATIONS[index] ?? SITUATIONS[SITUATIONS.length - 1];
  const answered = picked !== null;

  const choose = (id: string) => {
    if (answered) return;
    setPicked(id);
    if (id === situation.correctId) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (index + 1 < SITUATIONS.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    onFinish?.({ score, total: SITUATIONS.length });
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Bezpieczeństwo w sieci — wynik
        </p>
        <p className="mb-4 text-2xl font-bold" style={{ color }}>
          {score} / {SITUATIONS.length}
        </p>
        <p className="mb-5 text-sm leading-relaxed">
          Cały moduł 2 kursu jest o tym — od oceniania informacji po to, co zrobić, gdy ktoś ci
          zagraża. Jedna rzecz jest jednak ważniejsza niż wynik tego testu i nie trzeba na nią
          czekać do modułu 2:
        </p>
        <div className="border-t-2 p-4" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Phone className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            Gdy dzieje się coś, co cię przeraża
          </p>
          <p className="text-sm leading-relaxed">
            Powiedz o tym rodzicowi, opiekunowi albo wychowawcy. Jeśli nie masz komu — zadzwoń pod{' '}
            <strong>116 111</strong>, Telefon Zaufania dla Dzieci i Młodzieży. Jest bezpłatny,
            anonimowy i czynny cały czas. W nagłym niebezpieczeństwie dzwoni się pod{' '}
            <strong>112</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs font-bold tracking-wide" style={{ color }}>
          SYTUACJA {index + 1} Z {SITUATIONS.length}
        </p>
        <p className="font-mono text-xs text-muted-foreground">punkty: {score}</p>
      </div>

      <p className="mb-4 text-base font-semibold leading-relaxed">{situation.question}</p>

      <ul className="space-y-2">
        {situation.options.map((option) => {
          const isPicked = picked === option.id;
          const isCorrect = option.id === situation.correctId;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => choose(option.id)}
                disabled={answered}
                className={cn(
                  'flex w-full items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  !answered && 'cursor-pointer hover:bg-muted/40',
                  answered && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                  answered && isPicked && !isCorrect && 'border-amber-500 bg-amber-500/10',
                  answered && !isPicked && !isCorrect && 'opacity-60'
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {answered && isCorrect ? (
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                  ) : answered && isPicked ? (
                    <X className="h-4 w-4 text-amber-600" aria-hidden />
                  ) : (
                    <span className="font-mono text-xs font-bold uppercase text-muted-foreground">
                      {option.id}
                    </span>
                  )}
                </span>
                {option.text}
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {answered && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="mb-3 text-sm leading-relaxed">{situation.explanation}</p>
            <button
              type="button"
              onClick={next}
              className="cursor-pointer border-t-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/40"
              style={{ borderColor: color, color }}
            >
              {index + 1 < SITUATIONS.length ? 'Następna sytuacja' : 'Pokaż wynik'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
