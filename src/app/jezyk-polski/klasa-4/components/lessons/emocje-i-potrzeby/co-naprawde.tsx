'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { KorpusText, type KorpusMark } from '../../korpus/korpus-text';
import { buildKorpus } from '../../../lib/korpus';
import { UCZUCIA } from '../../../data/uczucia';
import { MODEL, judgeDowod, type Rodzaj } from './klotnia';

/**
 * L7, blok 2 „Co tam naprawdę jest?” `[5.5]` — para stuknięć z L1 na
 * uczuciach: dla każdego z rodzeństwa dziecko wybiera uczucie z palety (bez
 * oceny wyboru) i stuka zdanie, które je pokazuje, oraz zdanie, z którego
 * widać, czego ta osoba potrzebowała. Sędzia czyta kotwice (właściciel i
 * rodzaj fragmentu), nie dobór słowa.
 */

const KORPUS = buildKorpus(MODEL);
type Kto = 'tymek' | 'zuzia';

interface Stan {
  uczucie: string | null;
  dowodU: string | null;
  dowodP: string | null;
}

interface Props {
  color: string;
  onComplete: () => void;
}

export function CoNaprawde({ color, onComplete }: Props) {
  const [kto, setKto] = useState<Kto>('tymek');
  const [szukam, setSzukam] = useState<Rodzaj>('uczucie');
  const [st, setSt] = useState<Record<Kto, Stan>>({ tymek: { uczucie: null, dowodU: null, dowodP: null }, zuzia: { uczucie: null, dowodU: null, dowodP: null } });
  const [msg, setMsg] = useState('');
  const gotowe = (k: Kto) => !!st[k].uczucie && !!st[k].dowodU && !!st[k].dowodP;
  const done = gotowe('tymek') && gotowe('zuzia');

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const pick = (spanId: string) => {
    const r = judgeDowod(KORPUS.spans, spanId, kto, szukam);
    setMsg(r.mowi);
    if (!r.ok) return;
    setSt((cur) => ({ ...cur, [kto]: { ...cur[kto], [szukam === 'uczucie' ? 'dowodU' : 'dowodP']: spanId } }));
    if (szukam === 'uczucie') setSzukam('potrzeba');
  };

  const marks: Record<string, KorpusMark> = {};
  for (const k of ['tymek', 'zuzia'] as Kto[]) {
    if (st[k].dowodU) marks[st[k].dowodU!] = k === kto ? 'ok' : 'dim';
    if (st[k].dowodP) marks[st[k].dowodP!] = k === kto ? 'ok' : 'dim';
  }
  const imie = kto === 'tymek' ? 'Tymek' : 'Zuzia';
  const a = kto === 'tymek' ? '' : 'a';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex gap-2" role="tablist">
        {(['tymek', 'zuzia'] as Kto[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kto === k}
            onClick={() => {
              setKto(k);
              setSzukam(st[k].dowodU ? 'potrzeba' : 'uczucie');
              setMsg('');
            }}
            className="flex items-center gap-1 border px-3 py-1.5 text-sm"
            style={{ borderColor: kto === k ? color : undefined, fontWeight: kto === k ? 600 : undefined }}
          >
            {gotowe(k) && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            {k === 'tymek' ? 'Tymek' : 'Zuzia'}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm font-medium">1. Co {imie} czuł{a}? (to twój wybór)</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {UCZUCIA.map((u) => (
          <button
            key={u.id}
            type="button"
            aria-pressed={st[kto].uczucie === u.id}
            onClick={() => setSt((cur) => ({ ...cur, [kto]: { ...cur[kto], uczucie: u.id } }))}
            className="border px-2 py-1 text-sm"
            style={{ borderColor: st[kto].uczucie === u.id ? color : undefined, backgroundColor: st[kto].uczucie === u.id ? `color-mix(in srgb, ${color} 12%, transparent)` : undefined }}
          >
            {u.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm font-medium">
        {szukam === 'uczucie' ? `2. Stuknij w tekście zdanie, z którego widać, co ${imie} czuł${a}.` : `3. Stuknij zdanie, z którego widać, czego ${imie} potrzebował${a}.`}
      </p>
      <KorpusText korpus={KORPUS} color={color} pick="span" onPick={pick} marks={marks} className="mt-2 text-[15px] leading-7 sm:text-base" />
      <p className="mt-2 min-h-[2.75rem] text-sm leading-snug" aria-live="polite">
        {msg}
      </p>
      {done && (
        <p className="border-t pt-3 text-sm leading-relaxed sm:text-base">
          Pod krzykiem były potrzeby: Tymek kleił model od rana, Zuzia od tygodnia czekała na zabawę. Krzyk o tym nie mówił — ale
          tekst tak. Uczucie nazwałeś albo nazwałaś po swojemu; dowód stoi w zdaniu.
        </p>
      )}
    </div>
  );
}
