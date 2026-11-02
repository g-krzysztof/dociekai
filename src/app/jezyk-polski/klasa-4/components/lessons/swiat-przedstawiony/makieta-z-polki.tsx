'use client';

import { useState } from 'react';
import { Theater } from 'lucide-react';
import { bookById } from '../../../data/czytelnia';
import { useShelf } from '../../../lib/polka/use-shelf';
import { gotowa, frazyOtwarcia } from './makieta';
import { MakietaBlok, type StanMakiety } from './makieta-blok';
import { OTWARCIA } from './otwarcia';

/**
 * L18 blok 3 — „Makieta z twojej półki”: grzbiety książek Czytelni (bez
 * „Brzydkiego kaczątka” — jego makieta stoi w bloku 1), wybór wolny, książka
 * z Półki dziecka świeci. Ta sama scenka, bez podpowiedzi kolejności; gotowa
 * makieta zostaje przy grzbiecie (zapis bloku, tylko na urządzeniu).
 */

export interface StanPolki {
  wybrana: string | null;
  makiety: Record<string, StanMakiety>;
}

const ZDANIE_O_FIKCJI =
  'Świat przedstawiony może mieszać prawdziwe z wymyślonym: Warszawa ze „Złotej kaczki” naprawdę istnieje, ale szewczyka Lutka ktoś wymyślił. To jest fikcja — nawet w prawdziwym mieście.';

export function MakietaZPolki({
  color,
  initial,
  onState,
  onComplete,
}: {
  color: string;
  initial: StanPolki | null;
  onState: (s: StanPolki) => void;
  onComplete: () => void;
}) {
  const { shelf } = useShelf();
  const [stan, setStan] = useState<StanPolki>(initial ?? { wybrana: null, makiety: {} });

  const zmien = (s: StanPolki) => {
    setStan(s);
    onState(s);
  };

  const gotoweKsiazki = OTWARCIA.filter((o) => {
    const m = stan.makiety[o.bookId];
    return m && gotowa(frazyOtwarcia(o), m.postawione);
  }).map((o) => o.bookId);

  const otwarcie = OTWARCIA.find((o) => o.bookId === stan.wybrana) ?? null;
  const ksiazka = otwarcie ? bookById(otwarcie.bookId) : undefined;

  return (
    <div className="mt-4 space-y-3">
      {/* grzbiety */}
      <div className="flex items-end gap-1.5 overflow-x-auto border-b-[6px] border-[#8b5e3c] px-1 pt-2">
        {OTWARCIA.map((o) => {
          const b = bookById(o.bookId)!;
          const naPolce = !!shelf.entries[o.bookId];
          const wybrana = stan.wybrana === o.bookId;
          const zrobiona = gotoweKsiazki.includes(o.bookId);
          return (
            <button
              key={o.bookId}
              type="button"
              onClick={() => zmien({ ...stan, wybrana: o.bookId })}
              className={`relative flex h-40 w-12 shrink-0 flex-col items-center justify-between border border-[#5b4636]/50 py-2 transition-transform sm:h-48 sm:w-14 ${wybrana ? '-translate-y-2' : ''}`}
              style={{ background: wybrana ? color : naPolce ? `${color}55` : '#f5efe3', boxShadow: naPolce ? `0 0 0 2px ${color}` : undefined }}
              aria-pressed={wybrana}
              aria-label={`${b.title}${naPolce ? ' — z twojej Półki' : ''}${zrobiona ? ' — makieta gotowa' : ''}`}
            >
              <span
                className={`line-clamp-2 font-serif text-[11px] leading-tight [writing-mode:vertical-rl] sm:text-xs ${wybrana ? 'text-white' : 'text-stone-800'}`}
              >
                {b.title}
              </span>
              {zrobiona && <Theater className={`h-4 w-4 ${wybrana ? 'text-white' : ''}`} style={wybrana ? undefined : { color }} aria-hidden />}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Wybierz książkę z Czytelni — którąkolwiek. Podświetlone grzbiety stoją na twojej Półce.
      </p>

      {otwarcie && ksiazka && (
        <div key={otwarcie.bookId}>
          <p className="font-serif text-lg">
            {ksiazka.title} <span className="text-sm text-muted-foreground">— {ksiazka.author}, początek</span>
          </p>
          <MakietaBlok
            otwarcie={otwarcie}
            body={ksiazka.episodes[0].source.body}
            color={color}
            initial={stan.makiety[otwarcie.bookId] ?? null}
            onState={(m) => zmien({ ...stan, makiety: { ...stan.makiety, [otwarcie.bookId]: m } })}
            onComplete={onComplete}
          />
          {gotoweKsiazki.includes(otwarcie.bookId) && (
            <div className="mt-2 border-l-4 bg-white p-4 text-base leading-relaxed dark:bg-zinc-900/80" style={{ borderColor: color }}>
              <p>Makieta otwarcia stoi. Zostaje przy grzbiecie tej książki — możesz ułożyć jeszcze inną.</p>
              <p className="mt-2">{otwarcie.fikcja ?? ZDANIE_O_FIKCJI}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
