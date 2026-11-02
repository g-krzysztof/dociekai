'use client';

import { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';

/**
 * Symulator: dziecko pisze w tym samym akapicie co „Zosia” — i widzi na własnych
 * oczach, jak ich zdania się mieszają, bo oboje piszą w tej samej chwili w to
 * samo miejsce. To nowy gest w repo: dziecko normalnie pisze w polu tekstowym,
 * a program wtrąca w TO SAMO pole cudze słowa w losowych miejscach, w trakcie
 * pisania — bałagan jest prawdziwy, nie opisany. Druga runda, w wolnym akapicie,
 * pokazuje to samo bez kolizji: różnica bierze się wyłącznie z tego, gdzie kto
 * pisze, nie z tego, jak dobrze się pisze.
 */

const GHOST_WORDS = [' kurtkę', ' i gumowce,', ' parasol', ' oraz latarkę'];
const GHOST_DELAY = 900;
const GHOST_STEP = 1000;

export function SameParagraph({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [sharedText, setSharedText] = useState('');
  const [flash, setFlash] = useState(false);
  const [ghostActive, setGhostActive] = useState(false);
  const [ghostDone, setGhostDone] = useState(false);
  const [cleanText, setCleanText] = useState('');
  const started = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const cleanDone = cleanText.trim().length >= 8;

  useEffect(() => {
    if (ghostDone && cleanDone) onComplete?.();
  }, [ghostDone, cleanDone, onComplete]);

  const handleSharedChange = (value: string) => {
    setSharedText(value);
    if (started.current) return;
    if (value.trim().length === 0) return;
    started.current = true;
    setGhostActive(true);

    GHOST_WORDS.forEach((word, index) => {
      const timer = setTimeout(
        () => {
          setSharedText((prev) => {
            const at = Math.max(1, Math.floor(Math.random() * prev.length));
            return `${prev.slice(0, at)}${word}${prev.slice(at)}`;
          });
          setFlash(true);
          setTimeout(() => setFlash(false), 500);
          if (index === GHOST_WORDS.length - 1) {
            setGhostActive(false);
            setGhostDone(true);
          }
        },
        GHOST_DELAY + index * GHOST_STEP
      );
      timers.current.push(timer);
    });
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        To wspólny dokument klasy — <strong>ten sam</strong> plik widzi teraz też Zosia. Zacznij
        pisać w akapicie „Co zabieramy” — Zosia pisze w nim naraz z Tobą.
      </p>

      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Co zabieramy
        {ghostActive && (
          <span className="inline-flex items-center gap-1 normal-case" style={{ color }}>
            <Users className="h-3 w-3" /> Zosia pisze teraz obok Ciebie…
          </span>
        )}
      </div>
      <textarea
        value={sharedText}
        onChange={(event) => handleSharedChange(event.target.value)}
        rows={3}
        placeholder="Zabieram ze sobą…"
        className="w-full resize-none border-2 p-3 text-sm leading-relaxed transition-colors focus:outline-none"
        style={{ borderColor: flash ? '#dc2626' : color, backgroundColor: flash ? '#dc262610' : undefined }}
      />

      {ghostDone && (
        <div className="mt-4 border-l-4 p-4 text-sm leading-relaxed" style={{ borderColor: color, backgroundColor: `${color}0f` }}>
          <p>
            Widzisz to zdanie? Część słów jest Twoja, część wpisała Zosia — w tej samej chwili,
            w tym samym miejscu. Nikt nie zrobił nic złego, po prostu <strong>oboje pisaliście
            naraz w to samo zdanie</strong>. W chmurze to się naprawdę zdarza, kiedy dwie osoby nie
            umówiły się, kto pisze gdzie.
          </p>
          <p className="mt-2">
            Spróbuj teraz akapitu, w którym Zosia dziś nie pisze.
          </p>
        </div>
      )}

      {ghostDone && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kontakt do rodzica w razie czego
          </p>
          <textarea
            value={cleanText}
            onChange={(event) => setCleanText(event.target.value)}
            rows={2}
            placeholder="Numer telefonu, do kogo dzwonić…"
            className="w-full resize-none border-2 p-3 text-sm leading-relaxed focus:outline-none"
            style={{ borderColor: cleanDone ? color : 'var(--border)' }}
          />
          {cleanDone && (
            <p className="mt-2 text-sm text-muted-foreground">
              Bez kolizji — bo nikt inny w tej chwili nie pisał w tym samym miejscu.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
