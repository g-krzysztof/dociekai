'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { ikona } from './ikony';
import { KOLEJNOSC_STOPNI, PUSTE_PODIUM, WARTOSCI, odznaka, podiumGotowe, postaw, type MiejscePodium } from './wspolnoty';

/**
 * L8, blok 3 „Moje wartości” `[5.1]` — **gest nowy dla kursu: ustawia trzy
 * wartości na podium**, a przy każdej stawia jedną ze swoich scen z bloku 2
 * („tu to widać”). Bez klucza: każda kolejność i każde przypisanie są dobre;
 * ta sama scena może stać przy kilku wartościach. Podium gotowe = blok
 * zaliczony (gest kończący pracę sam zatwierdza).
 */

const WYSOKOSC = ['h-24', 'h-16', 'h-11'];

interface Props {
  color: string;
  sceny: string[];
  initial?: MiejscePodium[] | null;
  onComplete: (p: MiejscePodium[]) => void;
}

export function PodiumWartosci({ color, sceny, initial, onComplete }: Props) {
  const [podium, setPodium] = useState<MiejscePodium[]>(() => initial ?? PUSTE_PODIUM);
  const [held, setHeld] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const poloz = (tok: string, miejsce: number) => {
    setHeld(null);
    const zeton: { wartosc: string } | { scena: string } = tok.startsWith('w:') ? { wartosc: tok.slice(2) } : { scena: tok.slice(2) };
    const r = postaw(podium, miejsce, zeton, sceny);
    if ('odrzut' in r) {
      setMsg(r.odrzut === 'najpierw-wartosc' ? 'Najpierw postaw na tym stopniu wartość — potem scenę, w której ją widać.' : '');
      return;
    }
    setPodium(r.podium);
    if ('scena' in zeton) setMsg(`${r.podium[miejsce].wartosc} — tu to widać: ${odznaka(zeton.scena)?.label}.`);
    else setMsg('');
    if (podiumGotowe(r.podium)) onComplete(r.podium);
  };

  const drag = useDragToken({
    onDrop: (tok, target) => {
      if (target?.startsWith('m:')) poloz(tok, Number(target.slice(2)));
    },
    onTap: (tok) => setHeld((h) => (h === tok ? null : tok)),
  });

  const naPodium = new Set(podium.map((m) => m.wartosc).filter(Boolean));
  const gotowe = podiumGotowe(podium);
  const opisTrzymanego = (tok: string) => (tok.startsWith('w:') ? tok.slice(2) : odznaka(tok.slice(2))?.label);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Ustaw na podium trzy wartości, które są dla ciebie najważniejsze. Potem przy każdej postaw jedną ze swoich scen — tę, w której
        tę wartość widać. Przeciągnij albo stuknij żeton, a potem stopień. <strong>Inna kolejność niż u kolegi to nie błąd.</strong>
      </p>

      <div className="mt-4 grid grid-cols-3 items-end gap-1.5 sm:gap-3">
        {KOLEJNOSC_STOPNI.map((i) => {
          const m = podium[i];
          const o = m.scena ? odznaka(m.scena) : undefined;
          const Ik = o ? ikona(o.ikona) : null;
          const cel = `m:${i}`;
          return (
            <div
              key={i}
              data-drop={cel}
              onClick={() => held && poloz(held, i)}
              className={`flex min-w-0 flex-col ${held ? 'cursor-pointer' : ''}`}
              aria-label={`Stopień ${i + 1}`}
            >
              <div className="min-h-[6.5rem] border-x border-t px-1.5 py-1.5 text-center" style={{ borderColor: color, outline: drag.hover === cel ? `2px solid ${color}` : undefined }}>
                <p className="truncate font-serif text-base font-semibold sm:text-lg">{m.wartosc ?? <span className="text-muted-foreground">…</span>}</p>
                <div className="mt-1 flex min-h-[2.75rem] items-center justify-center">
                  {o && Ik ? (
                    <span className="flex flex-col items-center gap-0.5 text-[11px] leading-tight sm:text-xs" style={{ color }}>
                      <Ik className="h-4 w-4" aria-hidden />
                      <span className="line-clamp-3 break-words">tu to widać: {o.label}</span>
                    </span>
                  ) : (
                    <span className="block w-full border border-dashed px-1 py-1 text-[11px] leading-tight text-muted-foreground" style={{ borderColor: color }}>
                      {m.wartosc ? 'tu postaw scenę' : 'tu postaw wartość'}
                    </span>
                  )}
                </div>
              </div>
              <div className={`${WYSOKOSC[i]} flex items-start justify-center pt-1 font-mono text-xl font-bold text-white`} style={{ background: color }}>
                {i + 1}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wartości</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {WARTOSCI.map((w) => (
              <button
                key={w}
                type="button"
                {...drag.bind(`w:${w}`)}
                aria-pressed={held === `w:${w}`}
                className="cursor-grab touch-none border-2 bg-white px-2 py-1 font-serif text-sm dark:bg-zinc-900"
                style={{ borderColor: held === `w:${w}` ? '#111' : color, opacity: naPodium.has(w) ? 0.45 : 1 }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twoje sceny</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {sceny.map((id) => {
              const o = odznaka(id)!;
              const Ik = ikona(o.ikona);
              return (
                <button
                  key={id}
                  type="button"
                  {...drag.bind(`s:${id}`)}
                  aria-pressed={held === `s:${id}`}
                  className="flex cursor-grab touch-none items-center gap-1 border-2 border-dashed bg-white px-2 py-1 text-xs sm:text-sm dark:bg-zinc-900"
                  style={{ borderColor: held === `s:${id}` ? '#111' : color }}
                >
                  <Ik className="h-3.5 w-3.5" style={{ color }} aria-hidden />
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="min-h-[2.5rem] text-sm" aria-live="polite">
          {held ? (
            `Trzymasz: ${opisTrzymanego(held)}. Teraz stuknij stopień.`
          ) : gotowe ? (
            <span className="inline-flex items-start gap-1.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              Twoje podium stoi. Każda wartość ma scenę, w której ją widać — to nie słowo z plakatu, tylko coś, co robisz.
            </span>
          ) : (
            msg
          )}
        </p>
      </div>
      <DragGhost drag={drag.drag}>
        <span className="block border-2 bg-white px-2 py-1 text-sm" style={{ borderColor: color }}>
          {drag.drag ? opisTrzymanego(drag.drag.id) : null}
        </span>
      </DragGhost>
    </div>
  );
}
