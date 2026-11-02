'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { ACTIVITIES, busyAt, freeHours, HOURS, PEOPLE, place, roman, type ActivityId, type PersonId, type Plan } from './dzien';

const ACT_COLOR: Record<ActivityId, string> = {
  triumf: '#b45309',
  termy: '#0369a1',
  zabawa: '#15803d',
  'uczta-ludu': '#a21caf',
  odpoczynek: '#57534e',
  odejsc: '#57534e',
};

const GENITIVE: Record<PersonId, string> = { gajusz: 'Gajusza', tulia: 'Tulii', dawos: 'Dawosa' };

interface Lived {
  plan: Plan;
}

/**
 * Blok 1 — **Jeden dzień, trzy życia**. Gest: dziecko wkłada zajęcia w wolne
 * godziny dnia (12 godzin rzymskich) — przeciąga kartę na godzinę albo
 * stuk-stuk. Godziny zajęte z góry są szare; karta, która się nie mieści,
 * odbija się z powodem. Pochód triumfalny ma stałą godzinę. Po każdej postaci
 * tabela porównawcza wypełnia się z tego, co dziecko ułożyło.
 */
export function DzienWidget({
  color,
  images,
  onDone,
}: {
  color: string;
  images: Record<PersonId, string>;
  onDone: () => void;
}) {
  const [who, setWho] = useState<PersonId>('gajusz');
  const [plans, setPlans] = useState<Record<PersonId, Plan>>({ gajusz: {}, tulia: {}, dawos: {} });
  const [lived, setLived] = useState<Partial<Record<PersonId, Lived>>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<ActivityId | null>(null);
  const reported = useRef(false);

  const person = PEOPLE.find((p) => p.id === who)!;
  const plan = plans[who];
  const allLived = PEOPLE.every((p) => lived[p.id]);

  useEffect(() => {
    if (allLived && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [allLived, onDone]);

  const put = (a: ActivityId, target: string | null) => {
    if (!target?.startsWith('godz-') || lived[who]) return;
    setSelected(null);
    const r = place(person, plan, a, Number(target.slice(5)));
    if (r.ok) {
      setPlans((ps) => ({ ...ps, [who]: r.plan }));
      setMsg(null);
    } else setMsg(r.message);
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => put(id as ActivityId, target),
    onTap: (id) => {
      const a = id as ActivityId;
      const lock = person.locked?.[a];
      if (lock) {
        setMsg(lock);
        return;
      }
      setSelected((s) => (s === a ? null : a));
    },
    disabled: !!lived[who],
  });

  const remove = (a: ActivityId) => {
    if (lived[who]) return;
    setPlans((ps) => {
      const next = { ...ps[who] };
      delete next[a];
      return { ...ps, [who]: next };
    });
  };

  const occupant = (h: number): ActivityId | null =>
    (Object.keys(plan) as ActivityId[]).find((a) => plan[a] !== undefined && h >= plan[a]! && h < plan[a]! + ACTIVITIES[a].hours) ?? null;

  const chip = (a: ActivityId) => {
    const act = ACTIVITIES[a];
    const locked = !!person.locked?.[a];
    return (
      <button
        key={a}
        type="button"
        {...bind(a)}
        aria-pressed={selected === a}
        className={cn('flex touch-none select-none items-center gap-1 border-2 bg-white px-2 py-1 text-xs font-semibold dark:bg-zinc-900', drag?.id === a && 'opacity-40', locked && 'opacity-70')}
        style={{ borderColor: selected === a ? color : ACT_COLOR[a] }}
      >
        {locked && <Lock className="h-3 w-3" aria-hidden />}
        {act.name}
        <span className="font-normal text-muted-foreground">
          · {act.hours} h{act.fixedStart ? ` (od ${roman(act.fixedStart)})` : ''}
        </span>
      </button>
    );
  };

  const tray = person.activities.filter((a) => plan[a] === undefined);
  const done = lived[who];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Postać">
        {PEOPLE.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={who === p.id}
            onClick={() => {
              setWho(p.id);
              setMsg(null);
              setSelected(null);
            }}
            className={cn('border-2 bg-white text-left text-xs dark:bg-zinc-900', who === p.id && 'font-semibold')}
            style={{ borderColor: who === p.id ? color : 'var(--border)' }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image src={images[p.id]} alt="" width={240} height={180} className="h-full w-full object-cover" />
            </div>
            <span className="block px-2 py-1">
              {p.name} {lived[p.id] && '✓'}
            </span>
          </button>
        ))}
      </div>

      <div className="border bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900/70">
        <p>
          <strong>{person.name}</strong> — {person.who}.
        </p>
        <p className="text-muted-foreground">Śpi {person.sleeps}. Je: {person.eats}.</p>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Dzień od wschodu do zachodu słońca — 12 godzin rzymskich
        </p>
        <div className="grid grid-cols-12 border">
          {Array.from({ length: HOURS }, (_, i) => i + 1).map((h) => {
            const busy = busyAt(person, h);
            const occ = occupant(h);
            const isHover = hover === `godz-${h}`;
            const triumphHour = h >= 6 && h <= 8;
            return (
              <div
                key={h}
                data-drop={busy || occ ? undefined : `godz-${h}`}
                role="button"
                tabIndex={busy ? -1 : 0}
                aria-label={`Godzina ${roman(h)}: ${busy ?? (occ ? ACTIVITIES[occ].name : 'wolna')}`}
                onClick={() => {
                  // Z wybraną kartą — próba włożenia (kolizja da komunikat); bez karty — zdjęcie zajęcia.
                  if (selected) {
                    if (busy) setMsg(`O godzinie ${roman(h)} ${person.name} ma: ${busy}.`);
                    else put(selected, `godz-${h}`);
                  } else if (occ) remove(occ);
                }}
                className={cn('relative flex h-16 flex-col items-center justify-end border-r pb-1 text-[10px] last:border-r-0', isHover && 'outline outline-2 -outline-offset-2')}
                style={{
                  background: busy ? 'repeating-linear-gradient(135deg,#d6d3d1 0 4px,#e7e5e4 4px 8px)' : occ ? ACT_COLOR[occ] : selected ? 'var(--muted)' : undefined,
                  outlineColor: color,
                  color: occ ? '#fff' : undefined,
                }}
              >
                {triumphHour && !occ && <span className="absolute top-0.5 text-[9px] text-amber-700">pochód</span>}
                <span className="font-mono font-semibold">{roman(h)}</span>
              </div>
            );
          })}
        </div>
        <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
          {person.busy.map((b) => (
            <li key={b.from}>
              <span className="mr-1 inline-block h-2.5 w-2.5 align-middle" style={{ background: '#d6d3d1' }} />
              {roman(b.from)}
              {b.to !== b.from ? `–${roman(b.to)}` : ''}: {b.what}
            </li>
          ))}
          {(Object.keys(plan) as ActivityId[]).map((a) => (
            <li key={a}>
              <span className="mr-1 inline-block h-2.5 w-2.5 align-middle" style={{ background: ACT_COLOR[a] }} />
              {roman(plan[a]!)}
              {ACTIVITIES[a].hours > 1 ? `–${roman(plan[a]! + ACTIVITIES[a].hours - 1)}` : ''}: {ACTIVITIES[a].lower}{' '}
              {!done && <span className="italic">(stuknij godzinę, żeby zdjąć)</span>}
            </li>
          ))}
        </ul>
      </div>

      {!done && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {person.name} ma {freeHours(person)} {plural(freeHours(person), { one: 'wolną godzinę', few: 'wolne godziny', many: 'wolnych godzin' })}.
            Przeciągnij zajęcie na godzinę (albo stuknij zajęcie, potem godzinę).
          </p>
          <div className="flex flex-wrap gap-1.5">{tray.map(chip)}</div>
          <button
            type="button"
            onClick={() => {
              setLived((l) => ({ ...l, [who]: { plan } }));
              setMsg(null);
            }}
            className="border-2 px-3 py-1.5 text-sm font-semibold"
            style={{ borderColor: color, color }}
          >
            Koniec dnia {GENITIVE[person.id]}
          </button>
        </div>
      )}

      <p aria-live="polite" className={cn('min-h-[1.5rem] text-sm', msg && 'text-destructive')}>
        {msg}
      </p>

      {Object.keys(lived).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="border-b py-2 pr-2" />
                {PEOPLE.map((p) => (
                  <th key={p.id} className="border-b py-2 pr-2">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="align-top">
              <Row label="Gdzie śpi" cells={PEOPLE.map((p) => (lived[p.id] ? p.sleeps.split(' — ')[0] : ''))} />
              <Row label="Wolne godziny" cells={PEOPLE.map((p) => (lived[p.id] ? `${freeHours(p)} z 12` : ''))} />
              <Row
                label="Triumf"
                cells={PEOPLE.map((p) => {
                  const l = lived[p.id];
                  if (!l) return '';
                  const she = p.id === 'tulia';
                  return l.plan.triumf !== undefined
                    ? `${she ? 'widziała' : 'widział'} ${p.triumphView}`
                    : she
                      ? 'nie widziała — była wtedy zajęta'
                      : 'nie widział — był wtedy zajęty';
                })}
              />
              <Row
                label="Na co starczyło czasu"
                cells={PEOPLE.map((p) => {
                  const l = lived[p.id];
                  if (!l) return '';
                  const list = (Object.keys(l.plan) as ActivityId[]).filter((a) => a !== 'triumf').map((a) => ACTIVITIES[a].lower);
                  return list.length ? list.join(', ') : 'na nic więcej';
                })}
              />
              <Row label="Czy może odejść" cells={PEOPLE.map((p) => (lived[p.id] ? (p.locked?.odejsc ? 'nie — należy do pana' : 'tak') : ''))} />
            </tbody>
          </table>
        </div>
      )}

      {allLived && (
        <p className="border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <strong>Ta sama ulica, ten sam dzień — trzy różne miasta.</strong> W Rzymie za Cezara mieszkało około miliona
          ludzi. Patrycjusze, najstarsze i najbogatsze rody, mieli domy z atrium i czas na naukę. Plebejusze — rzemieślnicy,
          kupcy, piekarze — byli wolni, ale pracowali od świtu i gnieździli się w kamienicach. A niewolnicy nie mieli ani
          czasu, ani wolności: należeli do kogoś innego.
        </p>
      )}

      <DragGhost drag={drag}>{drag ? chip(drag.id as ActivityId) : null}</DragGhost>
    </div>
  );
}

function Row({ label, cells }: { label: string; cells: string[] }) {
  return (
    <tr>
      <td className="border-b py-2 pr-2 font-semibold">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="border-b py-2 pr-2">
          {c}
        </td>
      ))}
    </tr>
  );
}
