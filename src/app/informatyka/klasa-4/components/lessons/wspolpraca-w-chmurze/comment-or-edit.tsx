'use client';

import { useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Wyjaśnienie przez doświadczenie: Kuba napisał wstęp z błędem, ale jego część
 * jest zablokowana do bezpośredniej edycji — bo w chmurze cudzej pracy się nie
 * nadpisuje. Dziecko najpierw próbuje poprawić tekst wprost (nic się nie dzieje,
 * krótkie potrząśnięcie tłumaczy dlaczego), potem odkrywa komentarz jako
 * właściwe narzędzie. Kuba odpowiada i sam poprawia swój tekst — komentarz
 * zadziałał, nadpisanie by nie zadziałało.
 */

const WRONG = 'Ssaki oddychają skrzelami, tak jak ryby.';
const FIXED = 'Ssaki oddychają płucami — nie skrzelami, jak ryby.';

export function CommentOrEdit({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [shake, setShake] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState('');
  const [posted, setPosted] = useState(false);
  const [fixed, setFixed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryDirectEdit = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const submitComment = () => {
    if (comment.trim().length < 3) return;
    setPosted(true);
    timer.current = setTimeout(() => setFixed(true), 1400);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Kuba napisał wstęp prezentacji o zwierzętach. Ta część jest jego — możesz ją{' '}
        <strong>przeczytać i skomentować</strong>, ale nie edytować wprost.
      </p>

      <div className="border-l-4 p-4" style={{ borderColor: color, backgroundColor: `${color}0a` }}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Wstęp — Kuba
        </p>
        <p
          onClick={tryDirectEdit}
          className={cn('cursor-text text-sm leading-relaxed transition-colors', shake && 'text-red-600')}
        >
          Ssaki to zwierzęta, które karmią młode mlekiem.{' '}
          <span className={cn('underline decoration-dotted', fixed && 'text-muted-foreground line-through decoration-solid')}>
            {WRONG}
          </span>
          {fixed && <span> {FIXED}</span>}
        </p>
        {shake && (
          <p className="mt-2 text-xs font-medium" style={{ color }}>
            Ten fragment jest zablokowany do edycji — możesz tylko dodać komentarz.
          </p>
        )}
      </div>

      {!posted && (
        <button
          type="button"
          onClick={() => setCommenting(true)}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/40"
          style={{ borderColor: color, color }}
        >
          <MessageSquare className="h-4 w-4" />
          Dodaj komentarz
        </button>
      )}

      {commenting && !posted && (
        <div className="mt-3 flex gap-2">
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Np. Ssaki oddychają płucami, nie skrzelami :)"
            className="min-w-0 flex-1 border-2 px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: color }}
          />
          <button
            type="button"
            onClick={submitComment}
            disabled={comment.trim().length < 3}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            <Send className="h-3.5 w-3.5" />
            Wyślij
          </button>
        </div>
      )}

      {posted && (
        <div className="mt-3 space-y-2 border-l-4 pl-3 text-sm" style={{ borderColor: color }}>
          <p>
            <strong>Ty:</strong> {comment}
          </p>
          {fixed && (
            <p className="leading-relaxed">
              <strong>Kuba:</strong> Ups, racja! Poprawiam 🙂
            </p>
          )}
        </div>
      )}

      {fixed && (
        <p className="mt-4 text-sm leading-relaxed">
          Zauważ, co się stało: <strong>nie</strong> nadpisałeś/aś zdania Kuby — zostawiłeś/aś
          komentarz, a poprawił je Kuba, właściciel tej części. Gdybyś spróbował/a nadpisać wprost,
          w prawdziwym wspólnym dokumencie skasowałbyś/abyś jego pracę bez pytania.
        </p>
      )}
    </div>
  );
}
