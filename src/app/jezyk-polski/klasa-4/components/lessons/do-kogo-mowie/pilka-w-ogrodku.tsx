'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Twarz } from '../../twarz/twarz';
import { GNIAZDA, KAFELKI, ODBIORCY, reakcja, tekstWiadomosci, type Odbiorca, type Wiadomosc } from './wiadomosc';

/**
 * L3, blok 1 „Piłka w ogródku” — **gest nowy dla kursu: przesuwa suwak
 * odbiorcy pod wiadomością, a nad nią zmienia się twarz adresata.** Jedna
 * wiadomość z trzech gniazd (powitanie, prośba, podziękowanie), kafelki od
 * „Cześć!” do „Szanowna Pani!”. Twarz reaguje na żywo na każdy kafelek i na
 * każde przesunięcie suwaka; zawsze mówi jednym zdaniem dlaczego. Cel: dla
 * każdego z trojga ułożyć wiadomość, przy której twarz się uśmiecha.
 */

export type Udane = Partial<Record<Odbiorca, Wiadomosc>>;

interface Props {
  color: string;
  onComplete: (udane: Required<Udane>) => void;
}

export function PilkaWOgrodku({ color, onComplete }: Props) {
  const [o, setO] = useState(0);
  const [w, setW] = useState<Wiadomosc>({});
  const [udane, setUdane] = useState<Udane>({});
  const [reported, setReported] = useState<string | null>(null);

  const odbiorca = ODBIORCY[o];
  const r = reakcja(odbiorca.id, w);
  const done = ODBIORCY.every((x) => udane[x.id]);

  // Uśmiech zapisuje wiadomość dla tego odbiorcy — zawsze ostatnią uśmiechniętą,
  // żeby podsumowanie (i blok 2) zgadzało się z tym, co zaznaczone.
  const zapis = JSON.stringify(w);
  useEffect(() => {
    if (r.mina === 'usmiech' && r.pelna && JSON.stringify(udane[odbiorca.id]) !== zapis) setUdane((u) => ({ ...u, [odbiorca.id]: JSON.parse(zapis) as Wiadomosc }));
  }, [r.mina, r.pelna, odbiorca.id, zapis, udane]);

  // Po ukończeniu każda nowa uśmiechnięta wersja też idzie dalej (blok 2 porównuje aktualne kartki).
  const komplet = JSON.stringify(udane);
  useEffect(() => {
    if (done && reported !== komplet) {
      setReported(komplet);
      onComplete(JSON.parse(komplet) as Required<Udane>);
    }
  }, [done, reported, komplet, onComplete]);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div>
        <div>
          <div className="flex items-start gap-3">
            <div className="flex w-[88px] shrink-0 flex-col items-center sm:w-[130px]">
              <span className="sm:hidden">
                <Twarz kto={odbiorca.id} mina={r.mina} size={84} label={`${odbiorca.label}: ${r.mowi}`} />
              </span>
              <span className="hidden sm:block">
                <Twarz kto={odbiorca.id} mina={r.mina} size={124} label={`${odbiorca.label}: ${r.mowi}`} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {odbiorca.label} <span className="font-normal text-muted-foreground">· {odbiorca.kto}</span>
              </p>
              <p className="mt-1 min-h-[4.5rem] border-l-4 bg-stone-50 px-3 py-2 text-sm italic leading-snug dark:bg-zinc-800 sm:min-h-[3.5rem] sm:text-base" style={{ borderColor: color }} aria-live="polite">
                {r.mowi}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{odbiorca.gdzie}</p>

          <div className="mt-3 border-2 border-dashed p-3" style={{ borderColor: color }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twoja wiadomość</p>
            <p className="mt-1 min-h-[3rem] text-base sm:text-lg">
              {GNIAZDA.map((g) => {
                const id = w[g.id];
                const k = KAFELKI.find((x) => x.id === id);
                const winny = r.przez && r.przez === id;
                return (
                  <span key={g.id} className="mr-1.5 inline-block">
                    {k ? (
                      <span
                        className="px-0.5"
                        style={winny ? { backgroundColor: 'color-mix(in srgb, #dc2626 16%, transparent)', boxShadow: 'inset 0 -2px 0 #dc2626' } : undefined}
                      >
                        {k.text}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">[{g.label.toLowerCase()}]</span>
                    )}
                  </span>
                );
              })}
            </p>
          </div>

          <div className="mt-3">
            <label htmlFor="odbiorca" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Do kogo? Przesuń suwak
            </label>
            <input
              id="odbiorca"
              type="range"
              min={0}
              max={2}
              step={1}
              value={o}
              onChange={(e) => setO(Number(e.target.value))}
              className="mt-1 w-full cursor-ew-resize"
              style={{ accentColor: color }}
              aria-valuetext={odbiorca.label}
            />
            <div className="grid grid-cols-3 text-xs">
              {ODBIORCY.map((x, i) => (
                <span key={x.id} className={`flex items-center gap-1 ${i === 1 ? 'justify-center' : i === 2 ? 'justify-end' : ''}`} style={{ fontWeight: i === o ? 700 : undefined, color: i === o ? color : undefined }}>
                  {udane[x.id] && <Check className="h-3.5 w-3.5 text-emerald-600" aria-label="uśmiech zdobyty" />}
                  {x.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {GNIAZDA.map((g) => (
          <div key={g.id}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</p>
            <div className="flex flex-wrap gap-2">
              {KAFELKI.filter((k) => k.gniazdo === g.id).map((k) => (
                <button
                  key={k.id}
                  type="button"
                  aria-pressed={w[g.id] === k.id}
                  onClick={() => setW((cur) => ({ ...cur, [g.id]: k.id }))}
                  className="border px-3 py-1.5 text-sm transition-colors"
                  style={{
                    borderColor: w[g.id] === k.id ? color : undefined,
                    backgroundColor: w[g.id] === k.id ? `color-mix(in srgb, ${color} 12%, transparent)` : undefined,
                  }}
                >
                  {k.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 min-h-[3rem] border-t pt-3 text-sm leading-relaxed sm:text-base" aria-live="polite">
        {done ? (
          <>
            <ul className="space-y-1">
              {ODBIORCY.map((x) => (
                <li key={x.id}>
                  <strong>{x.label}:</strong> {tekstWiadomosci(udane[x.id]!)}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Ta sama sprawa — trzy różne wiadomości. To nie udawanie, tylko szacunek: słowa dobiera się do osoby, z
              którą się rozmawia. A za grzecznie też nie trafia — Tymek śmieje się z „Szanowna Pani”.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">
            Uśmiech zdobyty: {ODBIORCY.filter((x) => udane[x.id]).length} z 3. Ułóż wiadomość, przy której uśmiechnie się
            każde z trojga.
          </p>
        )}
      </div>
    </div>
  );
}
