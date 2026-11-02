'use client';

import Image from 'next/image';
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SourcePassport } from '../../source-desk/source-passport';
import { ICHTHYS, PLINIUSZ_BANK, PLINIUSZ_FIELDS, PLINIUSZ_LIST, PULL_PX, TRAJAN_ODPOWIEDZ, pulled } from './pliniusz';

/**
 * Blok 3 — **List Pliniusza**. Gesty: paszport źródła (kto, kiedy, po co —
 * dystraktory odbite treścią listu), potem **pociąga w dół każdą literę
 * ryby ΙΧΘΥΣ**, a litera rozwija się w greckie słowo; z pięciu słów
 * składa się zdanie. `onDone` po ostatniej literze.
 */
export function PliniuszWidget({ color, photo, onDone }: { color: string; photo: string; onDone: () => void }) {
  const [passport, setPassport] = useState(false);
  const [open, setOpen] = useState<boolean[]>(ICHTHYS.map(() => false));
  const reported = useRef(false);
  const all = open.every(Boolean);

  const unfold = (i: number) => {
    if (open[i]) return;
    const next = open.map((v, k) => v || k === i);
    setOpen(next);
    if (next.every(Boolean) && !reported.current) {
      reported.current = true;
      onDone();
    }
  };

  return (
    <div className="space-y-4">
      <div className="border bg-[#fbf6e9] p-4 dark:bg-zinc-900">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          List do cesarza · omówienie własnymi słowami
        </p>
        <div className="space-y-2 font-serif text-[15px] leading-relaxed">
          {PLINIUSZ_LIST.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </div>
      </div>

      <SourcePassport
        color={color}
        fields={PLINIUSZ_FIELDS}
        bank={PLINIUSZ_BANK}
        locked={passport}
        onDone={() => setPassport(true)}
        intro={<p className="text-sm">Wypełnij paszport tego źródła: stuknij karteczkę, a potem pole.</p>}
      />

      {passport && (
        <>
          <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
            <p>
              <strong>Dlaczego historycy tak cenią ten list?</strong> Chrześcijanin mógłby swoją gminę chwalić. Pliniusz nie miał
              żadnego powodu, żeby chrześcijan chwalić — a jednak zapisał, że obiecują nie kraść i nie oszukiwać. Kiedy ktoś
              z zewnątrz, a nawet przeciwnik, mówi o kimś coś dobrego, historyk bardziej mu wierzy.
            </p>
            <p>{TRAJAN_ODPOWIEDZ} Chrześcijanie żyli więc w niepewności: przez lata mógł ich nikt nie ruszać, a jeden donos mógł
              wszystko zmienić.</p>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-sm leading-relaxed">
              Chrześcijanie mieli też swój znak, który z zewnątrz wyglądał niewinnie: <strong>rybę</strong>. Po grecku ryba to
              ΙΧΘΥΣ (czytaj: ichtys). <strong>Pociągnij w dół każdą literę</strong> (albo stuknij ją i naciśnij Enter) — zobaczysz,
              co chrześcijanie w niej czytali.
            </p>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {ICHTHYS.map((l, i) => (
                <PullLetter key={l.letter} color={color} letter={l.letter} open={open[i]} onPull={() => unfold(i)}>
                  <span className="block font-serif text-sm sm:text-base">{l.greek}</span>
                  <span className="block text-[11px] text-muted-foreground">{l.read}</span>
                  <span className="mt-1 block text-xs font-semibold sm:text-sm" style={{ color }}>
                    {l.pl}
                  </span>
                </PullLetter>
              ))}
            </div>
            {all && (
              <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
                <strong>Jezus Chrystus, Syn Boga, Zbawiciel</strong> — pierwsze litery tych pięciu słów składają się w słowo
                „ryba”. Rzymianin widział na murze zwykłą rybę. Chrześcijanin czytał w niej całe wyznanie wiary. Taki napis, w którym
                pierwsze litery tworzą nowe słowo, to <strong>akrostych</strong>.
              </p>
            )}
            <figure>
              <Image
                src={photo}
                alt="Fotografia: na białej marmurowej płycie wyryte i podkreślone na czerwono greckie litery ΙΧΘΥΣ, pod nimi łukowata linia, a obok koło przecięte ośmioma promieniami"
                width={1000}
                height={399}
                className="h-auto w-full max-w-[560px]"
              />
              <figcaption className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Napis ΙΧΘΥΣ wyryty w marmurowej płycie w ruinach Efezu (dziś Turcja). W kole też kryją się te litery, nałożone na
                siebie. Fot. Mufunyo, Wikimedia Commons, CC BY-SA 3.0.
              </figcaption>
            </figure>
          </div>
        </>
      )}
    </div>
  );
}

/** Litera, którą trzeba pociągnąć w dół — za progiem rozwija się w słowo. */
function PullLetter({
  color,
  letter,
  open,
  onPull,
  children,
}: {
  color: string;
  letter: string;
  open: boolean;
  onPull: () => void;
  children: ReactNode;
}) {
  const start = useRef<number | null>(null);
  const [dy, setDy] = useState(0);

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (open) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez przechwycenia też działa, dopóki palec jest nad literą
    }
    start.current = e.clientY;
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (start.current === null) return;
    const d = Math.max(0, Math.min(PULL_PX * 1.6, e.clientY - start.current));
    setDy(d);
  };
  const up = () => {
    if (start.current === null) return;
    start.current = null;
    if (pulled(dy)) onPull();
    setDy(0);
  };
  const key = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      onPull();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        aria-label={open ? `Litera ${letter} — rozwinięta` : `Pociągnij literę ${letter} w dół`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
        className={cn(
          'flex h-14 w-full touch-none items-center justify-center border-2 bg-white font-serif text-3xl dark:bg-zinc-900 sm:h-16 sm:text-4xl',
          !open && 'cursor-ns-resize'
        )}
        style={{ borderColor: open || dy > 0 ? color : undefined, transform: `translateY(${Math.round(dy)}px)`, color: open ? color : undefined }}
      >
        {letter}
      </button>
      {!open && <span className="mt-1 text-xs text-muted-foreground" aria-hidden>↓</span>}
      {open && <div className="mt-1.5 w-full border-x border-b bg-white px-1 py-1.5 text-center dark:bg-zinc-900">{children}</div>}
    </div>
  );
}
