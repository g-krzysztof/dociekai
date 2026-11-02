'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, HelpCircle, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteItem {
  id: string;
  label: string;
  /** Czy element powinien znaleźć się w dobrej notatce. */
  good: boolean;
  /** Dlaczego tak / dlaczego nie — pokazywane po kliknięciu. */
  reason: string;
  /** Treść wpisywana do zeszytu (tylko dla dobrych elementów). */
  content?: ReactNode;
}

const PAPER_TEXT = 'text-slate-800';

/**
 * Kolejność jest celowa: dobre elementy i pułapki na przemian, żeby nie dało się
 * ich rozpoznać po miejscu na liście. Świadomie stała, nie losowana — losowanie
 * rozjechałoby render serwera z klientem. Kolejność dobrych elementów jest
 * jednocześnie kolejnością, w jakiej układają się w notatce.
 */
const ITEMS: NoteItem[] = [
  {
    id: 'temat',
    label: '📅 Data i temat lekcji',
    good: true,
    reason: 'Bez tematu za tydzień nie znajdziesz tej notatki w zeszycie.',
    content: (
      <p className="text-sm font-bold sm:text-base">
        12 września · Kolejność wykonywania działań
      </p>
    ),
  },
  {
    id: 'przepisana',
    label: '📖 Cała definicja przepisana z podręcznika',
    good: false,
    reason:
      'Przepisywanie zajmuje 10 minut i nic nie zostaje w głowie — ręka pracuje, głowa odpoczywa. Skróć to do jednego zdania po swojemu.',
  },
  {
    id: 'regula',
    label: '💡 Reguła własnymi słowami',
    good: true,
    reason: 'Przepisana definicja niewiele daje. Reguła powiedziana po swojemu — zostaje.',
    content: (
      <p className="text-sm leading-relaxed sm:text-base">
        Najpierw <strong>nawiasy</strong>, potem <strong>× i :</strong>, na końcu{' '}
        <strong>+ i −</strong>. Jak działania są tego samego rzędu — liczę od lewej do prawej.
      </p>
    ),
  },
  {
    id: 'kartka',
    label: '🗒️ Notatka na luźnej kartce',
    good: false,
    reason: 'Luźna kartka ginie do następnego dnia. Wszystko trzymaj w jednym zeszycie.',
  },
  {
    id: 'przyklad',
    label: '✏️ Jeden przykład krok po kroku',
    good: true,
    reason: 'Jeden porządnie rozpisany przykład jest wart więcej niż pięć samych wyników.',
    content: (
      <div className="font-mono text-sm sm:text-base">
        <p>2 + 3 × 4 =</p>
        <p className="pl-6">
          = 2 + <span className="bg-yellow-200 px-1">12</span>
        </p>
        <p className="pl-6 font-bold">= 14</p>
      </div>
    ),
  },
  {
    id: 'ozdoby',
    label: '🖍️ 10 minut na ozdabianie marginesu',
    good: false,
    reason:
      'Ładna notatka to nie to samo co skuteczna notatka. Wystarczą 2–3 kolory: reguła, przykład, pułapka.',
  },
  {
    id: 'rysunek',
    label: '🎨 Mały rysunek albo schemat',
    good: true,
    reason: 'Rysunek zapamiętujesz szybciej niż zdanie — mózg lubi obrazki.',
    content: (
      <div className="flex flex-wrap items-end gap-2 text-xs font-bold sm:text-sm">
        <span className="bg-indigo-200 px-3 py-3">( )</span>
        <span className="bg-indigo-200 px-3 py-2">× :</span>
        <span className="bg-indigo-200 px-3 py-1">+ −</span>
        <span className="pb-1 text-slate-500">← schodki: od góry do dołu</span>
      </div>
    ),
  },
  {
    id: 'wynik',
    label: '🔢 Sam wynik, bez obliczeń',
    good: false,
    reason: 'Za tydzień zobaczysz „14” i nie będziesz wiedzieć, skąd się wzięło. Zapisz drogę, nie metę.',
  },
  {
    id: 'pulapka',
    label: '⚠️ Moja pułapka — tu robię błąd',
    good: true,
    reason:
      'To najważniejsza linijka w całej notatce. Zapisujesz w niej swój własny, powtarzający się błąd.',
    content: (
      <p className="border-2 border-dashed border-rose-400 bg-rose-50 p-2 text-sm font-semibold text-rose-700">
        UWAGA! Zawsze pędzę od lewej. Najpierw szukam × i :
      </p>
    ),
  },
  {
    id: 'pytanie',
    label: '❓ Pytanie do nauczyciela',
    good: true,
    reason: 'Notatka może zawierać to, czego jeszcze nie rozumiesz. To nie wstyd — to plan na jutro.',
    content: (
      <p className="text-sm italic sm:text-base">
        Czy przy 8 : 4 : 2 też liczę od lewej? — zapytać jutro.
      </p>
    ),
  },
];

const GOOD_COUNT = ITEMS.filter((item) => item.good).length;

interface NoteBuilderProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenie: dziecko wybiera, co trafia do notatki, a co jest stratą czasu. */
export function NoteBuilder({ color, onComplete }: NoteBuilderProps) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<NoteItem | null>(null);

  const complete = placed.length === GOOD_COUNT;

  useEffect(() => {
    if (complete) onComplete?.();
  }, [complete, onComplete]);

  const handleClick = (item: NoteItem) => {
    setFeedback(item);
    if (item.good) {
      setPlaced((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    } else {
      setRejected((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    }
  };

  const placedItems = ITEMS.filter((item) => placed.includes(item.id));

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Przed tobą pusta kartka w zeszycie i lista rzeczy, które można na niej umieścić. Kliknij te,
        które naprawdę pomogą ci za tydzień. Cztery z nich to pułapki — je też kliknij, żeby
        zobaczyć dlaczego.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Lista elementów */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Co wpisujesz do zeszytu?
          </p>
          <ul className="grid gap-2">
            {ITEMS.map((item) => {
              const isPlaced = placed.includes(item.id);
              const isRejected = rejected.includes(item.id);
              const used = isPlaced || isRejected;

              return (
                <li key={item.id}>
                  <motion.button
                    type="button"
                    onClick={() => handleClick(item)}
                    animate={isRejected ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 border px-4 py-3 text-left text-sm transition-all',
                      !used && 'hover:-translate-y-0.5 hover:shadow-md',
                      isPlaced && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                      isRejected &&
                        'border-rose-300 bg-rose-50/60 text-muted-foreground line-through dark:bg-rose-950/30'
                    )}
                    style={!used ? { borderColor: `${color}40` } : undefined}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center',
                        isPlaced && 'bg-emerald-500 text-white',
                        isRejected && 'bg-rose-400 text-white'
                      )}
                      style={
                        !used ? { backgroundColor: `${color}1a`, color } : undefined
                      }
                    >
                      {isRejected ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </motion.button>
                </li>
              );
            })}
          </ul>

          {/* Komentarz do ostatniego kliknięcia */}
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={cn(
                  'mt-3 flex items-start gap-3 p-4 text-sm leading-relaxed',
                  feedback.good
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                    : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100'
                )}
              >
                {feedback.good ? (
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                )}
                <p>{feedback.reason}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kartka w zeszycie */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Twoja notatka
            </p>
            <span className="text-xs font-semibold" style={{ color }}>
              {placed.length}/{GOOD_COUNT}
            </span>
          </div>

          <div
            className="relative min-h-[340px] overflow-hidden border border-slate-300 shadow-inner"
            style={{
              backgroundColor: '#fffdf5',
              backgroundImage:
                'repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(148,163,184,0.35) 28px)',
            }}
          >
            {/* Czerwony margines */}
            <span
              aria-hidden
              className="absolute inset-y-0 left-8 w-px bg-rose-300"
            />

            <div className={cn('relative space-y-3 py-4 pl-11 pr-4', PAPER_TEXT)}>
              <AnimatePresence>
                {placedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  >
                    {item.content}
                  </motion.div>
                ))}
              </AnimatePresence>

              {placed.length === 0 && (
                <p className="pt-10 text-center text-sm italic text-slate-400">
                  Kartka jest pusta. Kliknij coś z listy obok →
                </p>
              )}
            </div>
          </div>

          {complete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 text-sm leading-relaxed"
              style={{ backgroundColor: `${color}14` }}
            >
              <strong>Gotowe!</strong> Taka notatka zajmuje pół strony i 5 minut, a za tydzień
              wystarczy na nią zerknąć, żeby wszystko wróciło. Zapamiętaj trzy rzeczy:{' '}
              <strong>krótko</strong>, <strong>własnymi słowami</strong>,{' '}
              <strong>z jednym przykładem</strong>.
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
