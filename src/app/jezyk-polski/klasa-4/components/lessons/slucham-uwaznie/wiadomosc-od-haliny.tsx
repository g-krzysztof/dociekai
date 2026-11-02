'use client';

import { useCallback, useState } from 'react';
import { Twarz } from '../../twarz/twarz';
import { AUDIO as ZAKUPY_AUDIO } from './wiadomosci.zakupy.audio';
import { Odtwarzacz } from './odtwarzacz';
import { PYTANIA, odpowiedz, type PytanieId } from './sklep';

/**
 * L5, blok 1 „Wiadomość od pani Haliny” — **gest nowy dla kursu: słucha z
 * licznikiem odsłuchań i notuje w notesie obok.** Dwa odsłuchania (jawnie, od
 * początku), notes to zwykłe pole — nie ocenia pisowni. Na końcu jedno pytanie
 * z kafelków: o ser (jedyną rzecz, której w nagraniu nie było) pani Halina
 * odpowiada; o rzecz powiedzianą wprost — „Przecież mówiłam”.
 */

export interface Blok1 {
  notatka: string;
  pytanie: PytanieId | null;
}

interface Props {
  color: string;
  value: Blok1;
  onChange: (v: Blok1) => void;
  onComplete: () => void;
}

export function WiadomoscOdHaliny({ color, value, onChange, onComplete }: Props) {
  const [listened, setListened] = useState(0);
  const onUsed = useCallback((n: number) => setListened(n), []);
  const odp = value.pytanie ? odpowiedz(value.pytanie) : null;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Pani Halina nagrała ci wiadomość. <strong>Masz dwa odsłuchania</strong> — potem wiadomość się zamyka. Notuj w notesie
        obok, co trzeba kupić. Pisz po swojemu, nikt nie sprawdza pisowni.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <Odtwarzacz manifest={ZAKUPY_AUDIO} limit={2} color={color} title="Wiadomość od pani Haliny" onUsed={onUsed} />
          <div>
            <p className="text-sm font-medium">Masz jedno pytanie do pani Haliny. O co zapytasz?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PYTANIA.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={!!value.pytanie || listened === 0}
                  onClick={() => {
                    onChange({ ...value, pytanie: p.id });
                    onComplete();
                  }}
                  className="border px-3 py-1.5 text-sm disabled:opacity-50"
                  style={{ borderColor: value.pytanie === p.id ? color : undefined, fontWeight: value.pytanie === p.id ? 600 : undefined }}
                >
                  {p.text}
                </button>
              ))}
            </div>
            <div className="mt-3 flex min-h-[4.5rem] items-start gap-3" aria-live="polite">
              {odp ? (
                <>
                  <Twarz kto="halina" mina={odp.nowe ? 'usmiech' : 'zdziwienie'} size={64} />
                  <p className="border-l-4 bg-stone-50 px-3 py-2 text-sm italic dark:bg-zinc-800" style={{ borderColor: '#b7a3d6' }}>
                    {odp.mowi}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {listened === 0 ? 'Najpierw posłuchaj wiadomości.' : 'Wybierz pytanie, kiedy skończysz notować.'}
                </p>
              )}
            </div>
          </div>
        </div>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mój notes</span>
          <textarea
            value={value.notatka}
            onChange={(e) => onChange({ ...value, notatka: e.target.value.slice(0, 600) })}
            rows={9}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="mt-1 block w-full resize-y border bg-[repeating-linear-gradient(transparent_0,transparent_27px,#e5e7eb_28px)] px-3 py-1 font-mono text-[15px] leading-7 dark:bg-zinc-900"
            aria-label="Mój notes"
            placeholder="np. mleko…"
          />
        </label>
      </div>
    </div>
  );
}
