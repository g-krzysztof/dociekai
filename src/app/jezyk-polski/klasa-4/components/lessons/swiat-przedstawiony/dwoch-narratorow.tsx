'use client';

import { useState } from 'react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { KARTKI, KARTKI_NA_STOLE, POWOD, SCENA, opowiesc, wloz, wszystkieRozlozone, type Cel, type Gdzie } from './narratorzy';
import { RekaZaKulis, Wycinanka } from './wycinanki';

/**
 * L18 blok 2 — „Ręka wchodzi na scenę”. Część A: dziecko wsuwa rękę
 * narratora zza kulis na figurkę Tymka — tekst przepisuje się w „ja”, scena
 * gaśnie poza reflektorem, a dwa zdania, których Tymek nie widzi, wypadają
 * do ciemności. Część B: cztery kartki ciągu dalszego — do ust Tymka albo do
 * ręki zza kulis; o tym, kto może powiedzieć zdanie, rozstrzyga reflektor.
 */

export interface StanNarratorow {
  etap: 'a' | 'b' | 'koniec';
  rozlozone: Partial<Record<string, Cel>>;
}

/** Środek strefy na scenie (w procentach szerokości). */
const X: Record<Gdzie, number> = { tymek: 34, 'za-plecami': 58, budka: 82 };

export function DwochNarratorow({
  color,
  initial,
  onState,
  onComplete,
}: {
  color: string;
  initial: StanNarratorow | null;
  onState: (s: StanNarratorow) => void;
  onComplete: () => void;
}) {
  const [etap, setEtap] = useState<StanNarratorow['etap']>(initial?.etap ?? 'a');
  const [rekaNaTymku, setRekaNaTymku] = useState(initial ? true : false);
  const [rozlozone, setRozlozone] = useState<Partial<Record<string, Cel>>>(initial?.rozlozone ?? {});
  const [wybrana, setWybrana] = useState<string | null>(null);
  const [znacznik, setZnacznik] = useState<{ gdzie: Gdzie; n: number } | null>(null);
  const [komunikat, setKomunikat] = useState<{ tekst: string; ok: boolean } | null>(null);

  const zapisz = (s: StanNarratorow) => onState(s);

  const ustawReke = (naTymku: boolean) => {
    setRekaNaTymku(naTymku);
    setKomunikat(
      naTymku
        ? { tekst: 'Teraz opowiada Tymek. Światło pada tylko tam, gdzie on patrzy.', ok: true }
        : { tekst: 'Ręka wróciła za kulisy. Narrator z boku znowu widzi całą scenę.', ok: true }
    );
  };

  const rozloz = (id: string, cel: Cel) => {
    const k = KARTKI.find((x) => x.id === id)!;
    const w = wloz(k, cel);
    setZnacznik((z) => ({ gdzie: k.gdzie, n: (z?.n ?? 0) + 1 }));
    setWybrana(null);
    if (!w.ok) {
      setKomunikat({ tekst: POWOD[w.powod], ok: false });
      return;
    }
    const nowe = { ...rozlozone, [id]: cel };
    setRozlozone(nowe);
    setKomunikat({ tekst: cel === 'usta' ? 'Tymek mówi to sam — „ja”.' : 'Ręka zza kulis dopowiada to, czego Tymek nie widzi.', ok: true });
    const koniec = wszystkieRozlozone(nowe);
    if (koniec) setEtap('koniec');
    zapisz({ etap: koniec ? 'koniec' : 'b', rozlozone: nowe });
    if (koniec) onComplete();
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => {
      if (id === 'reka') {
        if (target === 'tymek' || target === 'usta') ustawReke(true);
        else if (target === 'kulisy' || target === 'reka') ustawReke(false);
        return;
      }
      if (target === 'usta' || target === 'tymek') rozloz(id, 'usta');
      else if (target === 'reka' || target === 'kulisy') rozloz(id, 'reka');
    },
    onTap: (id) => {
      if (id === 'reka') ustawReke(!rekaNaTymku);
      else setWybrana((w) => (w === id ? null : id));
    },
  });

  const reflektor = etap !== 'a' || rekaNaTymku;
  const czesc = etap === 'a' ? 'a' : 'b';
  const story = opowiesc(rozlozone);
  const naStole = KARTKI_NA_STOLE.filter((id) => !rozlozone[id]);

  // Cele sceny: w części A — Tymek (ręka) i kulisy; w części B — usta Tymka i ręka zza kulis.
  const celTymka = czesc === 'a' ? 'tymek' : 'usta';
  const celKulis = czesc === 'a' ? 'kulisy' : 'reka';
  const stuknijCel = (cel: 'usta' | 'reka') => {
    if (czesc === 'b' && wybrana) rozloz(wybrana, cel);
  };

  return (
    <div className="mt-4 space-y-3">
      {/* scena lodowiska */}
      <div className="relative select-none border-[6px] border-[#8b5e3c] bg-[#8b5e3c]">
        <div className="relative aspect-[16/8] overflow-hidden bg-[#e0f2fe]">
          {/* banda i lód */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[#f0f9ff]" />
          <div className="absolute inset-x-0 bottom-[45%] h-[4%] bg-[#93c5fd]" />
          {/* budka */}
          <div className="absolute bottom-[38%] left-[74%] w-[17%]">
            <div className="h-0 w-full border-x-[1.2rem] border-b-[0.9rem] border-x-transparent border-b-[#9f1239] sm:border-x-[2rem] sm:border-b-[1.4rem]" />
            <div className="flex h-12 items-center justify-center border border-[#5b4636] bg-[#fef3c7] text-[9px] text-stone-700 sm:h-20 sm:text-xs">herbata</div>
          </div>
          {/* Ola przy budce */}
          <Figurka x={X.budka - 13} podpis="Ola" fill="#bfdbfe" />
          {/* Tymek */}
          <div
            data-drop={celTymka}
            onClick={() => stuknijCel('usta')}
            className="absolute bottom-[8%] w-[16%] -translate-x-1/2"
            style={{ left: `${X.tymek}%`, outline: hover === celTymka ? `3px solid ${color}` : undefined }}
          >
            <Figurka podpis={czesc === 'b' ? 'usta Tymka' : 'Tymek'} fill="#fde68a" w />
            {czesc === 'a' && rekaNaTymku && (
              <div {...bind('reka')} className="absolute -top-2 left-[60%] w-[70%] cursor-grab touch-none" aria-label="Ręka narratora">
                <RekaZaKulis className="pointer-events-none w-full rotate-[60deg]" />
              </div>
            )}
          </div>
          {/* znacznik: tu to się dzieje */}
          {znacznik && (
            <span
              key={znacznik.n}
              className="pointer-events-none absolute bottom-[55%] z-20 -translate-x-1/2 animate-[znak_1.8s_ease-out_forwards] border bg-white px-1 text-[10px] font-semibold text-stone-800 sm:text-xs"
              style={{ left: `${X[znacznik.gdzie]}%`, borderColor: color }}
            >
              tu ▼
            </span>
          )}
          {/* ciemność poza reflektorem */}
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700"
            style={{
              opacity: reflektor ? 1 : 0,
              background: `radial-gradient(circle at ${X.tymek}% 72%, transparent 0, transparent 17%, rgba(15,23,42,0.82) 24%)`,
            }}
          />
          {/* kulisy z ręką */}
          <div
            data-drop={celKulis}
            onClick={() => stuknijCel('reka')}
            className="absolute inset-y-0 left-0 z-10 flex w-[14%] items-center bg-[#9f1239]"
            style={{ outline: hover === celKulis ? `3px solid ${color}` : undefined, outlineOffset: -3 }}
          >
            {(czesc === 'b' || !rekaNaTymku) && (
              <div
                {...(czesc === 'a' ? bind('reka') : {})}
                className={`w-[150%] ${czesc === 'a' ? 'cursor-grab touch-none' : ''}`}
                aria-label="Ręka narratora zza kulis"
              >
                <RekaZaKulis className="pointer-events-none w-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="min-h-[2.5rem] text-sm leading-snug" aria-live="polite" style={komunikat ? { color: komunikat.ok ? color : '#b91c1c' } : undefined}>
        {komunikat?.tekst ??
          (czesc === 'a'
            ? 'Przeciągnij rękę zza kulis na Tymka (albo stuknij rękę).'
            : 'Weź kartkę i daj ją Tymkowi albo ręce zza kulis.')}
      </p>

      {czesc === 'a' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="border bg-white p-3 font-serif text-base leading-relaxed dark:bg-zinc-900/80 sm:p-4">
            {SCENA.filter((z) => !rekaNaTymku || z.ja).map((z) => (
              <span key={z.id} className="transition-colors" style={rekaNaTymku ? { background: `${color}14` } : undefined}>
                {rekaNaTymku ? z.ja : z.zBoku}{' '}
              </span>
            ))}
          </div>
          <div className={`border p-3 text-sm transition-colors sm:p-4 ${rekaNaTymku ? 'bg-slate-800 text-slate-100' : 'border-dashed text-muted-foreground'}`}>
            {rekaNaTymku ? (
              <>
                {SCENA.filter((z) => !z.ja).map((z) => (
                  <p key={z.id} className="font-serif italic">
                    {z.zBoku}
                  </p>
                ))}
                <p className="mt-2 font-semibold">Skąd on miałby to wiedzieć?</p>
              </>
            ) : (
              <p>Tu wypadnie to, czego bohater nie może wiedzieć.</p>
            )}
          </div>
          {rekaNaTymku && (
            <div className="md:col-span-2">
              <p className="text-sm leading-relaxed">
                Ręka zza kulis widziała całe lodowisko. Tymek widzi tylko to, co ma przed oczami. Spróbuj też odwrotnie — odnieś rękę za kulisy.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEtap('b');
                  setKomunikat(null);
                  zapisz({ etap: 'b', rozlozone });
                }}
                className="mt-2 border px-3 py-1.5 text-sm font-semibold text-white"
                style={{ background: color, borderColor: color }}
              >
                Co było dalej?
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Tymek opowiada dalej sam. Ręka zza kulis dopowiada tylko to, czego on nie może wiedzieć.
            </p>
            <div className="flex min-h-[3rem] flex-wrap gap-2">
              {naStole.map((id) => {
                const k = KARTKI.find((x) => x.id === id)!;
                return (
                  <button
                    key={id}
                    type="button"
                    {...bind(id)}
                    className="cursor-grab touch-none border bg-[#fffaf0] px-2 py-1.5 text-left font-serif text-sm text-stone-800 shadow-sm"
                    style={wybrana === id ? { borderColor: color, boxShadow: `0 0 0 2px ${color}` } : undefined}
                  >
                    {k.zBoku}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border bg-white p-3 font-serif text-base leading-relaxed dark:bg-zinc-900/80 sm:p-4">
            <p className="mb-1 font-sans text-xs uppercase tracking-wide text-muted-foreground">Ciąg dalszy</p>
            {story.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
            {story.map((s) => (
              <p key={s.id} className={s.kto === 'reka' ? 'italic text-muted-foreground' : ''}>
                <span className="mr-1 font-sans text-[10px] uppercase tracking-wide" style={{ color }}>
                  {s.kto === 'usta' ? 'Tymek:' : 'z boku:'}
                </span>
                {s.tekst}
              </p>
            ))}
          </div>
        </div>
      )}

      {etap === 'koniec' && (
        <div className="border-l-4 bg-white p-4 text-base leading-relaxed dark:bg-zinc-900/80" style={{ borderColor: color }}>
          <p>
            Ten, kto opowiada, to <strong>narrator</strong>. Może stać <strong>z boku</strong> — wtedy widzi całą scenę, także to, co dzieje się
            za plecami bohatera. Może też być <strong>bohaterem</strong> i mówić „ja” — wtedy wie tylko to, co sam zobaczy, usłyszy i poczuje.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Scena o szaliku została napisana dla tego kursu.</p>
        </div>
      )}

      <DragGhost drag={drag}>
        {drag?.id === 'reka' ? (
          <RekaZaKulis className="w-20" />
        ) : (
          <span className="block max-w-[16rem] border bg-[#fffaf0] px-2 py-1 font-serif text-sm text-stone-800">
            {KARTKI.find((k) => k.id === drag?.id)?.zBoku}
          </span>
        )}
      </DragGhost>
      <style>{`@keyframes znak { 0% { opacity: 0; transform: translate(-50%, -40%) } 20% { opacity: 1; transform: translate(-50%, 0) } 80% { opacity: 1 } 100% { opacity: 0 } }`}</style>
    </div>
  );
}

function Figurka({ x, podpis, fill, w }: { x?: number; podpis: string; fill: string; w?: boolean }) {
  return (
    <div
      className={`${w ? '' : 'absolute bottom-[8%] w-[13%]'} flex flex-col items-center`}
      style={x !== undefined ? { left: `${x}%` } : undefined}
    >
      <Wycinanka ikona="dziecko" rola="deski" fill={fill} className="w-full drop-shadow-[2px_3px_0_rgba(0,0,0,0.2)]" />
      <span className="h-3 w-[3px] bg-[#5b4636]" />
      <span className="whitespace-nowrap bg-white/90 px-1 text-[10px] font-semibold text-stone-800 sm:text-xs">{podpis}</span>
    </div>
  );
}
