'use client';

import { useEffect, useMemo, useState } from 'react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { Twarz } from '../../twarz/twarz';
import { doOdjecia, minaPoOdjeciu, odejmij, slowa, wystajace, zwroty } from './roznice';
import { kafelek, tekstWiadomosci, type Wiadomosc } from './wiadomosc';

/**
 * L3, blok 2 „Czym się różnią?” `[1.5]` — **gest nowy dla kursu: nakłada
 * dwie własne wiadomości jedna na drugą.** Kartka do Tymka (z bloku 1)
 * przeciągnięta na kartkę do pani dyrektor: wspólne słowa się zlewają, różne
 * wystają. Dziecko stuka wystające słowa i je odejmuje: słowo grzeczności
 * znika, a twarz dyrektorki gaśnie; słowo niosące sprawę nie daje się odjąć.
 * Domyka się dopiero po odjęciu wszystkich wystających słów grzeczności.
 * Termin „grzeczność językowa” pada po tym doświadczeniu — jako zmiana
 * odmiany grzeczności (potoczna → oficjalna), nie jej brak.
 */

const bezZnakow = (t: string) => t.replace(/[!?.,]/g, '');

interface Props {
  color: string;
  tymek: Wiadomosc;
  dyrektor: Wiadomosc;
  onComplete: () => void;
}

export function CzymSieRoznia({ color, tymek, dyrektor, onComplete }: Props) {
  const a = useMemo(() => slowa(tekstWiadomosci(tymek)), [tymek]);
  const b = useMemo(() => slowa(tekstWiadomosci(dyrektor)), [dyrektor]);
  const [overlaid, setOverlaid] = useState(false);
  const [removed, setRemoved] = useState<number[]>([]);
  const [shake, setShake] = useState<{ i: number; key: number } | null>(null);
  const [msg, setMsg] = useState('');
  const stick = useMemo(() => wystajace(a, b), [a, b]);
  // Odjąć da się tylko słowa grzeczności, które wystają (wspólne z kartką do Tymka się zlały) — i trzeba wszystkie.
  const target = useMemo(() => doOdjecia(b, stick), [b, stick]);
  const total = target.length;
  const done = overlaid && target.every((i) => removed.includes(i));
  // Grzeczność potoczna z kartki do Tymka i słowa wspólne obu kartek — do podsumowania.
  const potoczne = [tymek.powitanie, tymek.zakonczenie].map((id) => kafelek(id ?? '')?.text).filter((t): t is string => !!t && t !== 'Dziękuję!').map(bezZnakow);
  const wspolne = b.filter((s) => !stick.has(s.i) && odejmij(s).ok).map((s) => bezZnakow(s.form));
  const moglaby = removed.some((i) => b[i].low === 'mogłaby');

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const drag = useDragToken({
    disabled: overlaid,
    onDrop: (_id, target) => target === 'karta-dyrektor' && setOverlaid(true),
    onTap: () => setOverlaid(true),
  });

  const tap = (i: number) => {
    if (!overlaid || done || removed.includes(i) || !stick.has(i)) return;
    const s = b[i];
    const res = odejmij(s);
    if (res.ok) {
      setRemoved((r) => [...r, i]);
      setMsg('');
    } else {
      setShake({ i, key: Date.now() });
      setMsg(res.mowi);
    }
  };

  const mina = minaPoOdjeciu(removed.length, total);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        {overlaid
          ? 'Wspólne słowa się zlały, różne wystają. Stuknij wystające słowo, żeby je odjąć — i patrz na twarz pani dyrektor.'
          : 'Przeciągnij kartkę do Tymka na kartkę do pani dyrektor.'}
      </p>

      <div className="mt-4 grid items-start gap-4 sm:grid-cols-[1fr_130px]">
        <div className="space-y-3">
          {!overlaid && (
            <button
              type="button"
              {...drag.bind('karta-tymek')}
              className="block w-full cursor-grab touch-none border-2 bg-amber-50 p-3 text-left dark:bg-zinc-800"
              style={{ borderColor: '#f08a3c' }}
              aria-label="Kartka do Tymka — przeciągnij na kartkę do pani dyrektor"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">do Tymka</span>
              <span className="mt-1 block text-base">{a.map((s) => s.form).join(' ')}</span>
            </button>
          )}

          <div
            data-drop="karta-dyrektor"
            className="relative border-2 p-3 transition-colors"
            style={{
              borderColor: drag.hover === 'karta-dyrektor' ? color : '#2f4a6d',
              backgroundColor: drag.hover === 'karta-dyrektor' ? `color-mix(in srgb, ${color} 8%, transparent)` : undefined,
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              do pani dyrektor{overlaid ? ' + do Tymka (nałożone)' : ''}
            </span>
            <p className="mt-2 flex flex-wrap gap-x-1.5 gap-y-3 text-base sm:text-lg">
              {b.map((s) => {
                const out = removed.includes(s.i);
                const sticks = overlaid && stick.has(s.i);
                const shaking = shake?.i === s.i;
                return (
                  <button
                    key={`${s.i}-${shaking ? shake.key : 0}`}
                    type="button"
                    onClick={() => tap(s.i)}
                    disabled={!sticks || out}
                    className={`px-1 transition-all ${shaking ? 'animate-[pol-shake_0.35s]' : ''}`}
                    style={{
                      transform: sticks && !out ? 'translateY(-5px)' : undefined,
                      boxShadow: sticks && !out ? `0 3px 0 ${color}` : undefined,
                      backgroundColor: sticks && !out ? `color-mix(in srgb, ${color} 10%, transparent)` : undefined,
                      opacity: out ? 0.25 : overlaid && !sticks ? 0.55 : 1,
                      textDecoration: out ? 'line-through' : undefined,
                      cursor: sticks && !out ? 'pointer' : 'default',
                    }}
                  >
                    {s.form}
                  </button>
                );
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Twarz kto="dyrektor" mina={mina} size={120} />
          <p className="text-xs text-muted-foreground">pani dyrektor</p>
        </div>
      </div>

      <p className="mt-3 min-h-[2.75rem] text-sm leading-snug" aria-live="polite">
        {msg}
      </p>

      <div className="mt-2 min-h-[4rem] border-t pt-3 text-sm leading-relaxed sm:text-base" aria-live="polite">
        {removed.length > 0 && (
          <p>
            Odjęte:{' '}
            {removed.map((i) => (
              <span key={i} className="mr-1 inline-block border px-1.5 py-0.5 text-sm" style={{ borderColor: color }}>
                {b[i].form.replace(/[!?.,]/g, '')}
              </span>
            ))}
          </p>
        )}
        {done && (
          <div className="mt-2 space-y-2">
            <p>
              Bez tych słów kartka brzmi do pani dyrektor jak do kolegi — stąd jej mina. A sprawa została ta sama: piłka.
            </p>
            <p>
              Grzeczność była w obu kartkach, tylko w innej odmianie. Do Tymka — <strong>potoczna</strong>
              {potoczne.length > 0 && <>: {potoczne.map((t) => `„${t}”`).join(', ')}</>}. Do pani dyrektor —{' '}
              <strong>oficjalna</strong>: {zwroty(b, removed).map((t) => `„${t}”`).join(', ')}.
              {wspolne.length > 0 && <> {wspolne.map((t) => `„${t}”`).join(', ')} pasuje do obojga, więc się nie wysunęło.</>}
              {moglaby && <> „Mogłaby” zamiast „oddasz” też zmiękcza prośbę: pytasz, czy pani może, zamiast od razu chcieć.</>}
            </p>
            <p>
              Słowa, które niosą szacunek, to <strong>zwroty grzecznościowe</strong>. Dobieranie ich odmiany — potocznej do
              kolegi, oficjalnej do dorosłego — to <strong>grzeczność językowa</strong>.
            </p>
          </div>
        )}
      </div>

      <style>{'@keyframes pol-shake{0%,100%{translate:0}25%{translate:-4px}75%{translate:4px}}'}</style>
      <DragGhost drag={drag.drag}>
        <span className="block max-w-[260px] border-2 bg-amber-50 p-2 text-sm" style={{ borderColor: '#f08a3c' }}>
          {a.map((s) => s.form).join(' ')}
        </span>
      </DragGhost>
    </div>
  );
}
