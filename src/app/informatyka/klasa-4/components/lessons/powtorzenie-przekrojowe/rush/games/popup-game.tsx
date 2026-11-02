'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { GameProps } from '../types';

/**
 * Dział 2 — **ZAMKNIJ!** Krzykliwe okno z „nagrodą” i licznikiem, który tyka
 * na niby. Wielki zielony przycisk jest pułapką, malutki krzyżyk — wyjściem;
 * dokładnie ta sama zamiana, co w `UrgencyClock` z lekcji o zagrożeniach.
 * Pole „odbierz” niczego tu nie ładuje ani nie wysyła: to tylko plansza.
 */

export function PopupGame({ finish }: GameProps) {
  const [left, setLeft] = useState(9);

  useEffect(() => {
    const id = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grid h-full place-items-center bg-gradient-to-br from-fuchsia-100 via-yellow-50 to-cyan-100 p-3 dark:from-fuchsia-950 dark:via-zinc-900 dark:to-cyan-950">
      <div className="relative w-full max-w-[19rem] border-4 border-red-500 bg-yellow-200 p-4 text-center text-zinc-900 shadow-xl">
        <button
          type="button"
          onClick={() => finish(true)}
          aria-label="Zamknij okno"
          className="absolute -right-3 -top-3 grid h-10 w-10 cursor-pointer place-items-center"
        >
          <span className="grid h-5 w-5 place-items-center bg-zinc-300 text-zinc-600">
            <X className="h-3 w-3" strokeWidth={3} aria-hidden />
          </span>
        </button>
        <p className="text-lg font-black uppercase leading-tight text-red-600">Gratulacje!</p>
        <p className="mt-1 text-sm font-bold leading-snug">Właśnie wygrałeś/aś NOWY TELEFON!</p>
        <p className="mt-2 font-mono text-xs font-bold text-red-700">Oferta znika za 00:0{left}</p>
        <button
          type="button"
          onClick={() => finish(false)}
          className="mt-3 w-full cursor-pointer bg-green-500 py-3 text-base font-black uppercase text-white shadow hover:bg-green-600"
        >
          Odbierz nagrodę
        </button>
        <p className="mt-2 text-[11px] leading-snug text-zinc-600">Wystarczy jedno kliknięcie. Bez żadnych zobowiązań!</p>
      </div>
    </div>
  );
}
