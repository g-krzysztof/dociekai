'use client';

import { useEffect, useState } from 'react';
import { Check, Volume2 } from 'lucide-react';
import { Twarz, type Ksztalt, type MinaTwarzy } from '../../twarz/twarz';
import { useLektor } from '../../../lib/lektor';
import { AUDIO as TON_AUDIO } from './ton.no_pieknie.audio';
import { SYTUACJE, TONY, trafione, zuzia, type Sytuacja, type Ton } from './ton';

/**
 * L4, blok 1 „No pięknie.” — **gest nowy dla kursu: lepi twarz trzema
 * suwakami** (brwi, oczy, kąciki ust) i wybiera ton lektora. Słowa ani razu
 * się nie zmieniają. Zuzia patrzy i słucha, a potem mówi, co zrozumiała;
 * twarz i ton sprzeczne — jest zbita z tropu. Dwie sytuacje: tęcza (zachwyt
 * Oli) i sok na dywanie (złość Tymka).
 */

const START: Ksztalt = { brwi: 0, oczy: 0, usta: 0 };

const SUWAKI: { id: keyof Ksztalt; label: string; lewo: string; prawo: string }[] = [
  { id: 'brwi', label: 'Brwi', lewo: 'zmarszczone', prawo: 'uniesione' },
  { id: 'oczy', label: 'Oczy', lewo: 'zmrużone', prawo: 'szeroko' },
  { id: 'usta', label: 'Kąciki ust', lewo: 'w dół', prawo: 'w górę' },
];

const MINA_ZUZI: Record<string, MinaTwarzy> = { radosc: 'usmiech', zlosc: 'zdziwienie', sprzeczny: 'grymas', nijaki: 'spokoj' };

interface Props {
  color: string;
  onComplete: () => void;
  /** Która sytuacja jest otwarta — karta nad blokiem pokazuje jej obrazek. */
  onSytuacja?: (id: Sytuacja['id']) => void;
}

export function NoPieknie({ color, onComplete, onSytuacja }: Props) {
  const lektor = useLektor(TON_AUDIO);
  const [si, setSi] = useState(0);
  const [twarze, setTwarze] = useState<Record<string, Ksztalt>>({ tecza: START, sok: START });
  const [tony, setTony] = useState<Record<string, Ton | null>>({ tecza: null, sok: null });
  const [udane, setUdane] = useState<Record<string, boolean>>({});
  // Zdanie o sprzecznej twarzy i tonie pada tylko u tego, kto to przeżył.
  const [bylSprzeczny, setBylSprzeczny] = useState(false);

  const s: Sytuacja = SYTUACJE[si];
  const k = twarze[s.id];
  const t = tony[s.id];
  const z = zuzia(s, k, t);
  const ok = trafione(s, k, t);
  const done = SYTUACJE.every((x) => udane[x.id]);

  useEffect(() => {
    if (ok && !udane[s.id]) setUdane((u) => ({ ...u, [s.id]: true }));
  }, [ok, s.id, udane]);
  useEffect(() => {
    if (z.odczyt === 'sprzeczny' && !bylSprzeczny) setBylSprzeczny(true);
  }, [z.odczyt, bylSprzeczny]);
  useEffect(() => {
    onSytuacja?.(s.id);
  }, [s.id, onSytuacja]);
  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const setTon = (id: Ton) => {
    setTony((cur) => ({ ...cur, [s.id]: id }));
    lektor.playOne(id);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex flex-wrap gap-2" role="tablist">
        {SYTUACJE.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={i === si}
            onClick={() => setSi(i)}
            className="flex items-center gap-1.5 border px-3 py-1.5 text-sm"
            style={{ borderColor: i === si ? color : undefined, fontWeight: i === si ? 600 : undefined }}
          >
            {udane[x.id] && <Check className="h-3.5 w-3.5 text-emerald-600" aria-label="Zuzia zrozumiała" />}
            {x.id === 'tecza' ? 'Tęcza' : 'Sok na dywanie'}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed sm:text-base">{s.opis}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="flex items-center gap-3">
          <Twarz kto={s.kto} ksztalt={k} size={112} label={`${s.imie} — twarz, którą lepisz`} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.imie} mówi</p>
            <p className="font-serif text-2xl">„No pięknie.”</p>
            <p className="mt-1 text-xs text-muted-foreground">Słowa zostają te same.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <Twarz kto="zuzia" mina={MINA_ZUZI[z.odczyt]} size={84} label={z.scena ? z.mowi : `Zuzia: ${z.mowi}`} />
          <p className={`min-h-[3.5rem] flex-1 border-l-4 bg-stone-50 px-3 py-2 text-sm leading-snug dark:bg-zinc-800 ${z.scena ? 'text-muted-foreground' : 'italic'}`} style={{ borderColor: '#f4d03f' }} aria-live="polite">
            {z.scena ? z.mowi : `Zuzia: ${z.mowi}`}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {SUWAKI.map((sw) => (
          <label key={sw.id} className="block text-sm">
            <span className="font-medium">{sw.label}</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round(k[sw.id] * 100)}
              onChange={(e) => setTwarze((cur) => ({ ...cur, [s.id]: { ...cur[s.id], [sw.id]: Number(e.target.value) / 100 } }))}
              className="mt-1 w-full cursor-ew-resize"
              style={{ accentColor: color }}
              aria-label={`${sw.label}: od „${sw.lewo}” do „${sw.prawo}”`}
            />
            <span className="flex justify-between text-xs text-muted-foreground">
              <span>{sw.lewo}</span>
              <span>{sw.prawo}</span>
            </span>
          </label>
        ))}
      </div>

      <p className="mt-4 text-sm font-medium">Jakim tonem?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TONY.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={t === x.id}
            onClick={() => setTon(x.id)}
            className="flex items-center gap-1.5 border px-3 py-1.5 text-sm"
            style={{
              borderColor: t === x.id ? color : undefined,
              backgroundColor: t === x.id ? `color-mix(in srgb, ${color} 12%, transparent)` : undefined,
            }}
          >
            <Volume2 className="h-3.5 w-3.5" aria-hidden /> {x.label}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[3.5rem] border-t pt-3 text-sm leading-relaxed sm:text-base" aria-live="polite">
        {done ? (
          <p>
            Dwa razy „No pięknie.” — raz zachwyt, raz złość. Słowa ani drgnęły; znaczenie odwróciły twarz i ton.{' '}
            {bylSprzeczny
              ? 'A gdy twarz mówiła jedno, a głos drugie, Zuzia nie wiedziała, czemu wierzyć.'
              : 'Sprawdź jeszcze jedno: uśmiechnij się i wybierz ton ze złością. Co zrobi Zuzia?'}
          </p>
        ) : (
          <p className="text-muted-foreground">
            {udane[s.id]
              ? 'Zuzia zrozumiała. Przejdź do drugiej sytuacji.'
              : `Ulep twarz i wybierz ton tak, żeby Zuzia na pewno zrozumiała, co czuje ${s.kto === 'ola' ? 'Ola' : 'Tymek'}.`}
          </p>
        )}
      </div>
    </div>
  );
}
