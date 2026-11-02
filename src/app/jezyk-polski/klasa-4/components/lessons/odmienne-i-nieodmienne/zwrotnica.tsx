'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play } from 'lucide-react';
import { plural } from '@/lib/plural';
import { TASMA, odmienny, poPrzejezdzie, pokazZmiany, wyraz, type Tor } from './odmiana';

/**
 * L13 blok 2 — „Zwrotnica”. Wyrazy jadą taśmą same; dziecko przestawia
 * zwrotnicę **przed** wjazdem: tor gumowy (do magazynu „zmienia kształt”)
 * albo kamienny („zostaje taki sam”). Maszyna przepuszcza wyraz przez
 * wszystkie dźwignie i dopiero wtedy wiadomo. Wyraz na złym torze utyka
 * i pokazuje swoją zmianę (albo jej brak), potem wraca na koniec kolejki —
 * przegrana jest informacją. Po połowie taśma przyspiesza.
 */

export interface StanZwrotnicy {
  kolejka: string[];
  guma: string[];
  kamien: string[];
}

interface Props {
  color: string;
  initial?: StanZwrotnicy | null;
  onState?: (s: StanZwrotnicy) => void;
  onComplete: () => void;
}

const WOLNO_MS = 5200;
const SZYBKO_MS = 3600;

type Faza = 'stoi' | 'jedzie' | 'pokaz';

export function Zwrotnica({ color, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanZwrotnicy>(() => initial ?? { kolejka: [...TASMA], guma: [], kamien: [] });
  const [tor, setTor] = useState<Tor>('guma');
  const torRef = useRef<Tor>('guma');
  const [faza, setFaza] = useState<Faza>('stoi');
  const [ruszyl, setRuszyl] = useState(false);
  const [ostatni, setOstatni] = useState<{ id: string; tor: Tor; trafiony: boolean } | null>(null);
  const [przejazd, setPrzejazd] = useState(0);
  const gotowe = stan.kolejka.length === 0;
  const trafione = stan.guma.length + stan.kamien.length;
  const czas = trafione < TASMA.length / 2 ? WOLNO_MS : SZYBKO_MS;

  const przestaw = () => {
    const t: Tor = tor === 'guma' ? 'kamien' : 'guma';
    torRef.current = t;
    setTor(t);
  };

  // Jazda: start przejazdu → po `czas` ms rozstrzygnięcie na zwrotnicy.
  useEffect(() => {
    if (faza !== 'jedzie') return;
    const raf = requestAnimationFrame(() => setRuszyl(true));
    const t = window.setTimeout(() => {
      const id = stan.kolejka[0];
      const wybrany = torRef.current;
      const { kolejka, trafiony } = poPrzejezdzie(stan.kolejka, wybrany);
      const s: StanZwrotnicy = trafiony
        ? { kolejka, guma: wybrany === 'guma' ? [...stan.guma, id] : stan.guma, kamien: wybrany === 'kamien' ? [...stan.kamien, id] : stan.kamien }
        : { ...stan, kolejka };
      setStan(s);
      onState?.(s);
      setOstatni({ id, tor: wybrany, trafiony });
      setFaza('pokaz');
      if (kolejka.length === 0) onComplete();
    }, czas);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
    // Rozstrzygnięcie czyta stan z chwili startu przejazdu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faza, przejazd]);

  // Pokaz wyniku, potem następny wyraz.
  useEffect(() => {
    if (faza !== 'pokaz') return;
    const t = window.setTimeout(
      () => {
        setRuszyl(false);
        if (stan.kolejka.length === 0) {
          setFaza('stoi');
          return;
        }
        setFaza('jedzie');
        setPrzejazd((n) => n + 1);
      },
      ostatni?.trafiony ? 1100 : 2600
    );
    return () => window.clearTimeout(t);
  }, [faza, ostatni, stan.kolejka.length]);

  const start = () => {
    if (gotowe) return;
    setOstatni(null);
    setRuszyl(false);
    setFaza('jedzie');
    setPrzejazd((n) => n + 1);
  };
  const stop = () => {
    setFaza('stoi');
    setRuszyl(false);
    setOstatni(null);
  };

  const jedzie = faza === 'jedzie' ? stan.kolejka[0] : undefined;
  const pokazany = faza === 'pokaz' ? ostatni : null;
  const zly = pokazany && !pokazany.trafiony ? wyraz(pokazany.id) : null;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Wyrazy jadą same. Przestaw zwrotnicę, <strong>zanim</strong> wyraz do niej dojedzie: górny tor gumowy — dla wyrazów, które zmieniają
        kształt; dolny kamienny — dla tych, które zostają takie same.
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          W kolejce: {stan.kolejka.length} · na torach: {trafione}
        </span>
        {trafione >= TASMA.length / 2 && !gotowe && <span className="font-semibold" style={{ color }}>Taśma przyspieszyła!</span>}
      </div>

      {/* Tor */}
      <div className="relative mt-2 h-44 select-none overflow-hidden border bg-[#f5f5f4] dark:bg-zinc-800" data-testid="tory">
        {/* taśma */}
        <div aria-hidden className="absolute left-0 top-1/2 h-8 w-[62%] -translate-y-1/2" style={{ background: 'repeating-linear-gradient(90deg,#a8a29e 0 2px,#d6d3d1 2px 14px)' }} />
        {/* tory */}
        <div aria-hidden className="absolute right-0 top-3 h-8 w-[34%]" style={{ background: '#44403c' }} />
        <div aria-hidden className="absolute bottom-3 right-0 h-8 w-[34%]" style={{ background: 'repeating-linear-gradient(90deg,#a8a29e 0 18px,#d6d3d1 18px 20px)' }} />
        <span className="absolute right-1 top-4 text-[11px] font-semibold text-white">guma</span>
        <span className="absolute bottom-4 right-1 text-[11px] font-semibold text-stone-700">kamień</span>
        {/* zwrotnica */}
        <button
          type="button"
          onClick={przestaw}
          disabled={gotowe}
          aria-label={`Zwrotnica: ${tor === 'guma' ? 'tor gumowy' : 'tor kamienny'}. Stuknij, żeby przestawić.`}
          className="absolute left-[60%] top-1/2 flex h-24 w-14 -translate-y-1/2 items-center justify-center border-2 bg-white dark:bg-zinc-900"
          style={{ borderColor: color }}
          data-testid="zwrotnica"
        >
          <svg viewBox="0 0 40 60" className="h-16 w-10" aria-hidden>
            <path d="M4 30 H16" stroke="#78716c" strokeWidth={6} />
            <path d={tor === 'guma' ? 'M16 30 L36 6' : 'M16 30 L36 54'} stroke={color} strokeWidth={6} strokeLinecap="round" className="transition-all duration-200" />
            <circle cx="16" cy="30" r="5" fill={color} />
          </svg>
        </button>
        {/* wyraz */}
        {(jedzie || pokazany) && (
          <span
            className={`absolute border-2 bg-white px-2 py-0.5 font-serif text-base shadow-sm dark:bg-zinc-900 ${zly ? 'animate-pulse' : ''}`}
            style={
              jedzie
                ? { left: ruszyl ? '46%' : '1%', top: '50%', transform: 'translateY(-50%)', transition: ruszyl ? `left ${czas}ms linear` : 'none', borderColor: '#78716c' }
                : {
                    left: pokazany!.trafiony ? '78%' : '70%',
                    top: pokazany!.tor === 'guma' ? '14px' : 'auto',
                    bottom: pokazany!.tor === 'kamien' ? '14px' : 'auto',
                    transition: 'left 500ms ease-out',
                    borderColor: pokazany!.trafiony ? color : '#dc2626',
                  }
            }
            data-testid="wyraz-na-tasmie"
          >
            {wyraz((jedzie ?? pokazany!.id) as string).tekst}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={przestaw}
          disabled={gotowe}
          className="border-2 px-3 py-1.5 text-sm font-medium"
          style={{ borderColor: color }}
          data-testid="przestaw"
        >
          Przestaw zwrotnicę — teraz: {tor === 'guma' ? 'guma ↗' : 'kamień ↘'}
        </button>
        {!gotowe &&
          (faza === 'stoi' ? (
            <button type="button" onClick={start} className="flex items-center gap-1.5 border px-3 py-1.5 text-sm" data-testid="start-tasmy">
              <Play className="h-4 w-4" aria-hidden /> {trafione || stan.kolejka.length < TASMA.length ? 'Puść taśmę dalej' : 'Uruchom taśmę'}
            </button>
          ) : (
            <button type="button" onClick={stop} className="flex items-center gap-1.5 border px-3 py-1.5 text-sm">
              <Pause className="h-4 w-4" aria-hidden /> Zatrzymaj
            </button>
          ))}
      </div>

      <div className="mt-3 min-h-[3.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {pokazany?.trafiony && <p>„{wyraz(pokazany.id).tekst}” na dobrym torze.</p>}
        {zly && (
          <p>
            „{zly.tekst}” utknął.{' '}
            {odmienny(zly) ? (
              <>
                Maszyna zrobiła z nim to: <span className="font-serif">{pokazZmiany(zly).join(' → ')}</span>. To nie kamień. Wraca na koniec kolejki.
              </>
            ) : (
              <>Pod każdą dźwignią wyszedł taki sam: „{zly.tekst}”. Guma się nie przyda. Wraca na koniec kolejki.</>
            )}
          </p>
        )}
      </div>

      <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
        {(['guma', 'kamien'] as const).map((t) => (
          <div key={t} className="border p-2">
            <p className="text-xs font-semibold text-muted-foreground">{t === 'guma' ? 'magazyn: zmienia kształt' : 'magazyn: zostaje taki sam'}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {stan[t].map((id) => (
                <span key={id} className="border bg-[#fffdf6] px-1.5 font-serif dark:bg-zinc-800">
                  {wyraz(id).tekst}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {gotowe && (
        <div className="mt-3 border-2 p-3 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
          <p className="flex items-start gap-2">
            <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <span>
              Wszystkie {stan.guma.length + stan.kamien.length} {plural(stan.guma.length + stan.kamien.length, { one: 'wyraz', few: 'wyrazy', many: 'wyrazów' })}{' '}
              na torach. Wyrazy z gumowego magazynu — {stan.guma.map((id) => wyraz(id).tekst).join(', ')} — to <strong>wyrazy odmienne</strong>:
              zmieniają kształt razem ze zdaniem. Z kamiennego — {stan.kamien.map((id) => wyraz(id).tekst).join(', ')} — to{' '}
              <strong>wyrazy nieodmienne</strong>: zawsze takie same.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
