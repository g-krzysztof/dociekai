'use client';

import { useState } from 'react';
import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hieroglyphFont } from '../od-pisma-do-alfabetu/fonts';
import { MAX_NAME, SIGNS, SIGN_BY_ID, judgeName, toSounds, vowelIndexes } from './imie';

/**
 * Blok 2 L21 — **imię w kartuszu**. Dziecko wpisuje imię, a potem buduje
 * je ze znaków tacy (stuknięcie dokłada znak na koniec kartusza); sędzia
 * porównuje głoska po głosce i nazywa pierwszą, która się nie zgadza.
 * Po przyjęciu kartusz da się **ustawić w rzędzie albo w kolumnie i odwrócić
 * kierunek** — zwierzęta zawsze patrzą w stronę początku napisu.
 */

type Layout = 'rzad' | 'kolumna';
type Dir = 'od-lewej' | 'od-prawej';

export function ImieWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [name, setName] = useState('');
  const [placed, setPlaced] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; index?: number } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [layout, setLayout] = useState<Layout>('rzad');
  const [dir, setDir] = useState<Dir>('od-lewej');
  const [egyptian, setEgyptian] = useState(false);

  const sounds = toSounds(name);
  const vowels = new Set(vowelIndexes(name));

  const add = (id: string) => {
    if (accepted || placed.length >= MAX_NAME + 2) return;
    setMsg(null);
    setPlaced((p) => [...p, id]);
  };

  const check = () => {
    const v = judgeName(name, placed);
    if (v.ok) {
      setAccepted(true);
      setMsg({ ok: true, text: 'Tak zapisałby Twoje imię egipski pisarz — gdybyś był(a) cudzoziemcem, jak Ptolemeusz.' });
      onDone();
    } else {
      setMsg({ ok: false, text: v.text, index: v.index });
    }
  };

  const shown = placed
    .map((id, i) => ({ id, i }))
    .filter(({ i }) => !(accepted && egyptian && vowels.has(i)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm" htmlFor="imie-kartusz">
          Twoje imię
          <input
            id="imie-kartusz"
            value={name}
            maxLength={MAX_NAME}
            disabled={accepted}
            autoComplete="off"
            onChange={(e) => {
              setName(e.target.value);
              setMsg(null);
            }}
            className="mt-1 block w-44 border bg-background px-2 py-1.5 text-base"
            placeholder="np. Ola"
          />
        </label>
        {sounds.length > 0 && (
          <p className="pb-2 font-mono text-sm tracking-widest" aria-label="głoski imienia">
            {sounds.map((s, i) => (
              <span key={i} className={cn('mr-1', msg && !msg.ok && msg.index === i && 'bg-destructive/20')}>
                {s}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Znaki jednej głoski — stuknij, żeby dopisać do kartusza
          </p>
          <div className="grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-6">
            {SIGNS.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={accepted || sounds.length === 0}
                onClick={() => add(s.id)}
                aria-label={`${s.name}: ${s.sounds.join(', ')}`}
                className="flex flex-col items-center border py-1 hover:bg-muted disabled:opacity-40"
              >
                <span className={cn(hieroglyphFont.className, 'text-2xl leading-none text-[#3b2a14] dark:text-[#f3e6c8]')}>{s.glyph}</span>
                <span className="mt-0.5 font-mono text-[10px] font-bold leading-tight">{s.sounds.join(' ')}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            Egipcjanie nie mieli głosek Ż, RZ, CZ ani C — takie głoski dostają znak, który brzmiał najbliżej.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex min-h-[180px] items-center justify-center border bg-[#efe1c1]/40 p-3 dark:bg-zinc-900/60">
            {placed.length === 0 ? (
              <p className="text-sm text-muted-foreground">{sounds.length ? 'Kartusz czeka na pierwszy znak.' : 'Najpierw wpisz imię.'}</p>
            ) : (
              <div
                className={cn(
                  'flex items-center rounded-full border-[3px] border-[#7a5a2a] bg-[#f6ead0] dark:bg-[#3a2f20]',
                  layout === 'rzad' ? 'flex-row px-3 py-1' : 'flex-col px-1 py-3',
                  layout === 'rzad' && dir === 'od-prawej' && 'flex-row-reverse',
                )}
                aria-label="Twój kartusz"
              >
                {shown.map(({ id, i }) => (
                  <span
                    key={i}
                    className={cn(
                      hieroglyphFont.className,
                      'inline-block text-[28px] leading-[1.15] text-[#3b2a14] transition-transform dark:text-[#f3e6c8]',
                      msg && !msg.ok && msg.index === i && 'bg-destructive/25',
                    )}
                    style={{ transform: dir === 'od-prawej' ? 'scaleX(-1)' : undefined }}
                  >
                    {SIGN_BY_ID.get(id)?.glyph}
                  </span>
                ))}
                <span
                  className={cn('bg-[#7a5a2a]', layout === 'rzad' ? 'mx-1 h-9 w-[3px]' : 'my-1 h-[3px] w-9')}
                  aria-hidden
                />
              </div>
            )}
          </div>

          {!accepted && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={placed.length === 0}
                onClick={() => {
                  setPlaced((p) => p.slice(0, -1));
                  setMsg(null);
                }}
                className="flex items-center gap-1 border px-3 py-2 text-sm disabled:opacity-40"
              >
                <Delete className="h-4 w-4" /> Cofnij znak
              </button>
              <button
                type="button"
                disabled={placed.length === 0}
                onClick={check}
                className="border-2 px-3 py-2 text-sm font-semibold disabled:opacity-40"
                style={{ borderColor: color }}
              >
                Sprawdź kartusz
              </button>
            </div>
          )}

          {accepted && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 text-sm">
                <button type="button" onClick={() => setLayout((l) => (l === 'rzad' ? 'kolumna' : 'rzad'))} className="border px-3 py-1.5">
                  {layout === 'rzad' ? 'Ustaw w kolumnie' : 'Ustaw w rzędzie'}
                </button>
                <button type="button" onClick={() => setDir((d) => (d === 'od-lewej' ? 'od-prawej' : 'od-lewej'))} className="border px-3 py-1.5">
                  Odwróć kierunek
                </button>
                <button type="button" onClick={() => setEgyptian((e) => !e)} className="border px-3 py-1.5">
                  {egyptian ? 'Pokaż samogłoski' : 'Jak Egipcjanin — bez samogłosek'}
                </button>
              </div>
              <p className="text-sm leading-relaxed">
                Egipcjanie pisali <strong>w rzędach albo w kolumnach, z góry na dół</strong> — i od lewej albo od prawej. Skąd czytelnik
                wiedział, od której strony zacząć? Ludzie i zwierzęta w napisie <strong>patrzą w stronę początku</strong>. Odwróć kierunek i
                zobacz, jak się obracają.
              </p>
              {egyptian && (
                <p className="text-sm leading-relaxed">
                  Swoich słów Egipcjanie nie zapisywali z samogłoskami — tylko szkielet ze spółgłosek, jak Fenicjanie. Dlatego do dziś nie wiemy
                  na pewno, jak brzmiały egipskie słowa.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {msg && (
        <p
          aria-live="polite"
          className={cn('border-l-2 pl-3 text-sm leading-relaxed', msg.ok ? '' : 'border-destructive text-destructive')}
          style={msg.ok ? { borderColor: color } : undefined}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
