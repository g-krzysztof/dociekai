'use client';

import { useState } from 'react';
import { Check, RotateCw } from 'lucide-react';
import { FLAG_RED, FLAG_WHITE, judgeWindow, nextTurn, type Turn } from '../symbole-narodowe/flaga';

/**
 * Przypominajka L13 (z L10, dystans 3): 11 listopada w Zawidełkach — flaga
 * w wąskim oknie ratusza. Dziecko obraca ją stuknięciami i wiesza; sędzia
 * z L10 (`judgeWindow`, art. 4 ustawy: w pionie biel po lewej patrzącego).
 * Poza postępem.
 */
export function FlagaNaRatuszu({ color }: { color: string }) {
  const [turn, setTurn] = useState<Turn>(0);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const vertical = turn === 90 || turn === 270;
  const whiteLeft = turn === 270;
  const whiteTop = turn === 0;

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>
        11 listopada. Ratusz w miasteczku ma wąskie, wysokie okna. Obróć flagę tak, żeby zawisła
        w oknie zgodnie z ustawą, i powieś ją.
      </p>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 120 140" className="h-36 w-auto" aria-label="Okno ratusza z flagą">
          <rect x="30" y="10" width="60" height="120" fill="#cfe0ea" stroke="#8a8579" strokeWidth="3" />
          {vertical ? (
            <g>
              <rect x="38" y="18" width="22" height="70" fill={whiteLeft ? FLAG_WHITE : FLAG_RED} stroke="#bbb" />
              <rect x="60" y="18" width="22" height="70" fill={whiteLeft ? FLAG_RED : FLAG_WHITE} stroke="#bbb" />
            </g>
          ) : (
            <g>
              <rect x="20" y="40" width="80" height="25" fill={whiteTop ? FLAG_WHITE : FLAG_RED} stroke="#bbb" />
              <rect x="20" y="65" width="80" height="25" fill={whiteTop ? FLAG_RED : FLAG_WHITE} stroke="#bbb" />
            </g>
          )}
        </svg>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setTurn((t) => nextTurn(t));
              setNote(null);
            }}
            className="flex items-center gap-2 border-2 px-3 py-1.5 font-semibold"
            style={{ borderColor: color }}
          >
            <RotateCw className="h-4 w-4" /> Obróć
          </button>
          <button
            type="button"
            onClick={() => {
              const v = judgeWindow(turn);
              setNote(v.ok ? { ok: true, text: 'Tak — w pionie biel jest po lewej stronie patrzącego.' } : { ok: false, text: v.message });
            }}
            className="border-2 px-3 py-1.5 font-semibold text-white"
            style={{ background: color, borderColor: color }}
          >
            Powieś
          </button>
        </div>
      </div>
      {note && (
        <p className={`flex items-start gap-2 border-l-4 pl-3 ${note.ok ? '' : 'border-amber-500'}`} style={note.ok ? { borderColor: color } : undefined}>
          {note.ok && <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />}
          <span>
            {note.text}
            {note.ok && ' A ten ratusz stoi na rynku, który sam opowiada historię miasteczka — zaraz zobaczysz jak.'}
          </span>
        </p>
      )}
    </div>
  );
}
