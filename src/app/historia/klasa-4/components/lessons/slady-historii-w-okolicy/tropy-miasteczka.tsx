'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { PlanMiasteczka } from './plan-miasteczka';
import {
  CENTURIES,
  RULES,
  TRACES,
  allPlaced,
  earnedRules,
  getTrace,
  judgePlace,
  roman,
  type Placement,
  type Slot,
  type TraceId,
} from './miasteczko';

/**
 * Blok 1 L13 — „Miasteczko, które mówi”. Dziecko **stuka trop na planie**
 * (zbliżenie), a potem **przenosi go z tacy na oś miasteczka**: na kolumnę
 * wieku, gdy trop mówi KIEDY, albo na półkę „Co tu było”, gdy mówi tylko CO.
 * Z każdego przyjętego tropu zostaje reguła do zabrania.
 */
export function TropyMiasteczka({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [found, setFound] = useState<Set<TraceId>>(new Set());
  const [active, setActive] = useState<TraceId | null>(null);
  const [placement, setPlacement] = useState<Placement>({});
  const [selected, setSelected] = useState<TraceId | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const done = allPlaced(placement);
  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const remembered = useMemo(
    () => new Set((Object.keys(placement) as TraceId[]).filter((id) => placement[id] !== undefined)),
    [placement],
  );

  const tapPlan = (id: TraceId) => {
    setActive(id);
    setFound((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  const place = (id: TraceId, slot: Slot) => {
    const t = getTrace(id);
    const v = judgePlace(t, slot);
    setSelected(null);
    if (v.ok) {
      setPlacement((prev) => ({ ...prev, [id]: slot }));
      setNote({ ok: true, text: `${t.label}: ${t.remembers} Reguła do zabrania: ${RULES[t.rule].text}` });
    } else {
      setNote({ ok: false, text: v.note });
    }
  };

  const { drag, hover, bind } = useDragToken({
    onTap: (id) => setSelected((s) => (s === id ? null : (id as TraceId))),
    onDrop: (id, target) => {
      if (!target) return;
      if (target === 'trop:co') place(id as TraceId, 'co');
      else if (target.startsWith('trop:wiek:')) place(id as TraceId, Number(target.slice(10)) as Slot);
    },
  });

  const tray = TRACES.filter((t) => found.has(t.id) && placement[t.id] === undefined);
  const activeTrace = active ? getTrace(active) : null;
  const inSlot = (slot: Slot) => TRACES.filter((t) => placement[t.id] === slot);

  const slotStyle = (drop: string) => ({
    borderColor: hover === drop ? color : 'var(--border)',
    background: hover === drop || selected ? `${color}12` : undefined,
    cursor: selected ? 'pointer' : undefined,
  });

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        To jest plan miasteczka Zawidełki. Wymyśliliśmy je, ale wszystko, co w nim widać, znajdziesz
        w prawdziwych polskich miasteczkach. <strong>Stuknij każde kółko</strong> — to trop. Potem
        przenieś trop z tacy: <strong>na kolumnę wieku</strong>, jeśli mówi, KIEDY coś się działo, albo{' '}
        <strong>na półkę „Co tu było”</strong>, jeśli mówi tylko, CO tu było.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="border bg-white dark:bg-zinc-900">
          <PlanMiasteczka color={color} found={found} remembered={remembered} active={active} onTap={tapPlan} />
        </div>
        <div className="border p-3" aria-live="polite">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Search className="h-3.5 w-3.5" /> Zbliżenie
          </p>
          {activeTrace ? (
            <>
              <p className="mt-2 font-semibold">{activeTrace.label}</p>
              <p className="mt-1">{activeTrace.zoom}</p>
            </>
          ) : (
            <p className="mt-2 text-muted-foreground">Stuknij kółko na planie.</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Tropy: {found.size} z {TRACES.length}
          </p>
        </div>
      </div>

      <div className="min-h-[52px] border border-dashed p-2">
        <p className="mb-2 text-xs text-muted-foreground">
          Taca — przeciągnij trop na oś albo stuknij trop, potem miejsce.
        </p>
        <div className="flex flex-wrap gap-2">
          {tray.map((t) => (
            <button
              key={t.id}
              type="button"
              {...bind(t.id)}
              className="touch-none border-2 bg-white px-3 py-1 text-sm font-semibold dark:bg-zinc-900"
              style={{
                borderColor: color,
                background: selected === t.id ? color : undefined,
                color: selected === t.id ? '#fff' : undefined,
                opacity: drag?.id === t.id ? 0.35 : 1,
              }}
            >
              {t.label}
            </button>
          ))}
          {tray.length === 0 && !done && (
            <span className="text-xs text-muted-foreground">pusto — znajdź kolejny trop na planie</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Oś miasteczka — kiedy działo się to, o czym mówi trop?
        </p>
        <div className="grid grid-cols-9 gap-px border bg-border">
          {CENTURIES.map((c) => {
            const drop = `trop:wiek:${c}`;
            return (
              <div
                key={c}
                data-drop={drop}
                onClick={() => selected && place(selected, c)}
                className="flex min-h-[96px] flex-col items-center gap-1 bg-white p-0.5 transition-colors dark:bg-zinc-900"
                style={slotStyle(drop)}
              >
                <span className="font-mono text-[10px] font-bold sm:text-xs">{roman(c)}</span>
                {inSlot(c).map((t) => (
                  <span
                    key={t.id}
                    className="w-full break-words px-0.5 py-0.5 text-center text-[9px] font-semibold leading-tight text-white sm:text-[11px]"
                    style={{ background: color }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
        <div
          data-drop="trop:co"
          onClick={() => selected && place(selected, 'co')}
          className="mt-2 flex min-h-[48px] flex-wrap items-center gap-2 border-2 border-dashed p-2 transition-colors"
          style={slotStyle('trop:co')}
        >
          <span className="text-xs font-semibold text-muted-foreground">Co tu było (bez daty):</span>
          {inSlot('co').map((t) => (
            <span key={t.id} className="px-2 py-0.5 text-xs font-semibold text-white" style={{ background: color }}>
              {t.label} → {t.remembers}
            </span>
          ))}
        </div>
      </div>

      {note && !done && (
        <p className={`border-l-4 pl-3 ${note.ok ? '' : 'border-amber-500'}`} style={note.ok ? { borderColor: color } : undefined}>
          {note.text}
        </p>
      )}

      {done && (
        <div className="border-2 p-4" style={{ borderColor: color }}>
          <p className="flex items-center gap-2 font-semibold">
            <Check className="h-4 w-4" style={{ color }} /> Miasteczko opowiedziało swoją historię
          </p>
          <p className="mt-2">
            Zawidełki założono według planu w średniowieczu. Na wzgórzu stał zamek, nad strumieniem
            kręcił się młyn i pracowali garbarze. W 1710 roku zaraza ominęła miasteczko, w 1885 dotarła
            tu kolej, a w 1940 roku lotnik stąd walczył nad Anglią. Nikt nie napisał tej historii
            w książce — przeczytałeś/łaś ją z ulic, placu i pamiątek.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reguły do zabrania</p>
          <ul className="mt-1 space-y-1">
            {earnedRules(placement).map((r) => (
              <li key={r}>
                <span className="font-semibold" style={{ color }}>
                  {RULES[r].short}:
                </span>{' '}
                {RULES[r].text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <DragGhost drag={drag}>
        {drag && (
          <span className="block border-2 bg-white px-3 py-1 text-sm font-semibold" style={{ borderColor: color }}>
            {getTrace(drag.id as TraceId).label}
          </span>
        )}
      </DragGhost>
    </div>
  );
}
