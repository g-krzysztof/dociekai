'use client';

import { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { allSentences, getFigure, type Kind, type LifeEvent } from './postacie';
import { formatYear } from './rok';
import { judgeKind, judgeOrder } from './teczka';
import { useTeczka } from './teczka-state';
import { SourceCardView } from './wybor-widget';

export const KIND_LOOK: Record<Kind, { label: string; bg: string; dot: string }> = {
  fakt: { label: 'do sprawdzenia', bg: 'rgba(56, 161, 105, 0.22)', dot: '#2f855a' },
  zdanie: { label: 'czyjeś zdanie', bg: 'rgba(221, 107, 32, 0.22)', dot: '#c05621' },
};

/** Stała, „losowa” kolejność kart zdarzeń — z identyfikatorów, bez Math.random (hydracja). */
function shuffled(life: readonly LifeEvent[]): LifeEvent[] {
  return [...life].sort((a, b) => ((a.id.charCodeAt(a.id.length - 1) * 7) % 11) - ((b.id.charCodeAt(b.id.length - 1) * 7) % 11));
}

/**
 * Blok 2 — **Biurko**. Gesty: zakreślacz z L3 (wybiera kolor „do sprawdzenia”
 * albo „czyjeś zdanie” i stuka zdania na wszystkich kartach teczki —
 * odrzut wskazuje słowo, które zdradza ocenę), potem **układa życie postaci
 * na osi**: stuka zdarzenia po kolei, od najdawniejszego; sędzią są lata
 * (przed naszą erą — malejące). `onDone` po dobrej osi.
 */
export function BiurkoWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const { work, update } = useTeczka();
  const fig = work.figure ? getFigure(work.figure) : undefined;
  const [pen, setPen] = useState<Kind>('fakt');
  const [msg, setMsg] = useState<{ id: string; text: string } | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [orderMsg, setOrderMsg] = useState<{ text: string; pair: [string, string] } | null>(null);
  const reported = useRef(false);
  const tray = useMemo(() => (fig ? shuffled(fig.life) : []), [fig]);

  if (!fig) return <p className="text-sm text-muted-foreground">Najpierw wybierz teczkę w bloku 1.</p>;

  const sentences = allSentences(fig);
  const marked = sentences.filter((x) => work.kinds[x.sentence.id]).length;
  const allMarked = marked >= sentences.length;
  const lifeDone = Boolean(work.order);

  const mark = (id: string) => {
    if (work.kinds[id]) return;
    const v = judgeKind(fig, id, pen);
    if (!v.ok) {
      setMsg({ id, text: v.message });
      return;
    }
    setMsg(null);
    update({ kinds: { ...work.kinds, [id]: pen } });
  };

  const tapEvent = (id: string) => {
    setOrderMsg(null);
    setPlaced((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const check = () => {
    const order = placed.map((id) => fig.life.find((e) => e.id === id)!);
    const v = judgeOrder(order);
    if (!v.ok) {
      setOrderMsg({ text: v.message, pair: v.pair });
      return;
    }
    update({ order: placed });
    if (!reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const shownOrder = lifeDone ? work.order! : placed;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Jak w lekcji o wiarygodności źródeł: <strong>weź zakreślacz i oznacz każde zdanie</strong> w teczce. Zielony — to, co da się
        sprawdzić. Pomarańczowy — czyjeś zdanie, czyli ocena. Kolor zmieniasz na pasku na dole.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        {fig.cards.map((card) => (
          <SourceCardView key={card.id} card={card} color={color}>
            <div className="space-y-1 font-serif text-[15px] leading-relaxed">
              {card.sentences.map((s) => {
                const k = work.kinds[s.id];
                return (
                  <div key={s.id}>
                    <button
                      type="button"
                      onClick={() => mark(s.id)}
                      className={cn('rounded-sm px-0.5 text-left', !k && 'cursor-pointer hover:bg-muted/60')}
                      style={{
                        background: k ? KIND_LOOK[k].bg : undefined,
                        outline: msg?.id === s.id ? '2px solid var(--destructive)' : undefined,
                      }}
                    >
                      {s.text}
                    </button>
                    {msg?.id === s.id && <p className="mt-1 font-sans text-xs text-destructive">{msg.text}</p>}
                  </div>
                );
              })}
            </div>
          </SourceCardView>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border bg-white/95 p-2 backdrop-blur dark:bg-zinc-900/95">
        {(Object.keys(KIND_LOOK) as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={pen === k}
            onClick={() => setPen(k)}
            className={cn('flex items-center gap-1.5 border-2 px-2.5 py-1 text-sm', pen === k && 'font-semibold')}
            style={{ borderColor: pen === k ? KIND_LOOK[k].dot : undefined, background: pen === k ? KIND_LOOK[k].bg : undefined }}
          >
            <span className="h-3 w-3 rounded-full" style={{ background: KIND_LOOK[k].dot }} aria-hidden />
            {KIND_LOOK[k].label}
          </button>
        ))}
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {marked} / {sentences.length}
        </span>
      </div>

      {allMarked && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Każde zdanie oznaczone. Z faktów da się ułożyć życie postaci. <strong>Stuknij zdarzenia po kolei, od najdawniejszego</strong>{' '}
            — wskoczą na oś. Stuknięcie zdarzenia na osi zdejmuje je.
          </p>
          {!lifeDone && (
            <div className="flex flex-wrap gap-2 border border-dashed p-2">
              {tray
                .filter((e) => !placed.includes(e.id))
                .map((e) => (
                  <button key={e.id} type="button" onClick={() => tapEvent(e.id)} className="border-2 bg-white px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900">
                    <span className="block text-xs font-semibold tabular-nums" style={{ color }}>
                      {formatYear(e.year, e.approx)}
                    </span>
                    {e.text}
                  </button>
                ))}
              {placed.length === fig.life.length && <span className="text-sm text-muted-foreground">Wszystkie zdarzenia na osi.</span>}
            </div>
          )}
          <ol className="relative space-y-2 border-l-2 pl-4" style={{ borderColor: color }}>
            {shownOrder.map((id, i) => {
              const e = fig.life.find((x) => x.id === id)!;
              const bad = orderMsg?.pair.includes(id);
              return (
                <li key={id} className="relative">
                  <span className="absolute -left-[23px] top-2 h-3 w-3 rounded-full border-2 bg-white" style={{ borderColor: color }} aria-hidden />
                  <button
                    type="button"
                    disabled={lifeDone}
                    onClick={() => tapEvent(id)}
                    className="w-full border bg-white px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900"
                    style={{ borderColor: bad ? 'var(--destructive)' : undefined }}
                  >
                    <span className="mr-2 text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
                    <span className="font-semibold tabular-nums">{formatYear(e.year, e.approx)}</span> — {e.text}
                  </button>
                </li>
              );
            })}
            {shownOrder.length === 0 && <li className="text-sm text-muted-foreground">Oś jest jeszcze pusta.</li>}
          </ol>
          {orderMsg && <p className="text-sm text-destructive">{orderMsg.text}</p>}
          {!lifeDone && placed.length === fig.life.length && (
            <button type="button" onClick={check} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
              Sprawdź oś
            </button>
          )}
          {lifeDone && (
            <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              Oś się zgadza. Zobacz: fakty z różnych kart układają się w jedno życie — a oceny tych samych zdarzeń bywają zupełnie
              różne. Teraz Twoja kolej, żeby ocenić.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
