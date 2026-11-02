'use client';

import { useRef, useState } from 'react';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { getCorePin } from '../../../lib/timeline/pins';
import type { VillageStats } from './wioska';

/**
 * Blok 3 (oś czasu): **schemat z moich liczb**. Przyczyna → wydarzenie →
 * skutki; pola skutków czekają na liczby z symulacji dziecka (bloku 1).
 * Dziecko przeciąga kartkę z liczbą do pola (albo stuk-stuk) — kartka ma
 * podpis z jego wioski, więc miejsce jest jednoznaczne; odrzut mówi, czego
 * dotyczy liczba. Potem przypina na Osi dziejów rewolucję neolityczną
 * i Jerycho.
 */

const LESSON = 'poczatki-cywilizacji/rewolucja-neolityczna';

type SlotId = 'nadwyzka' | 'wolni' | 'domy';

interface Tag {
  id: SlotId;
  value: number;
  label: string;
}

const SLOTS: { id: SlotId; before: string; after: (n: number) => string; what: string }[] = [
  { id: 'nadwyzka', before: 'Ziarna jest więcej, niż ludzie zjadają:', after: (n) => `${plural(n, { one: 'worek', few: 'worki', many: 'worków' })} zapasu w spichlerzu.`, what: 'zapasu w spichlerzu' },
  { id: 'wolni', before: 'Nie każdy musi zdobywać jedzenie:', after: (n) => `${plural(n, { one: 'osoba robi', few: 'osoby robią', many: 'osób robi' })} co innego (garnki, domy, płótno…).`, what: 'ludzi, którzy nie zdobywają jedzenia' },
  { id: 'domy', before: 'Osada rośnie:', after: (n) => `${plural(n, { one: 'dom', few: 'domy', many: 'domów' })} zamiast 3 na początku.`, what: 'domów we wsi' },
];

export function SchematLiczb({ color, stats, onComplete, done }: { color: string; stats: VillageStats; onComplete: () => void; done: boolean }) {
  const tags: Tag[] = [
    { id: 'wolni', value: stats.freed, label: 'nowi mieszkańcy, którzy nie sieją' },
    { id: 'domy', value: stats.houses, label: 'domy we wsi po 10 latach' },
    { id: 'nadwyzka', value: stats.granary, label: 'worki w spichlerzu po 10 latach' },
  ];
  const [filled, setFilled] = useState<SlotId[]>([]);
  const [picked, setPicked] = useState<SlotId | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);
  const completed = useRef(false);

  const schemaDone = filled.length === SLOTS.length;

  const put = (tag: SlotId, slot: string) => {
    setPicked(null);
    if (tag === slot) {
      setFilled((f) => (f.includes(tag) ? f : [...f, tag]));
      setMsg(null);
      return;
    }
    const t = tags.find((x) => x.id === tag)!;
    const s = SLOTS.find((x) => x.id === slot);
    setMsg(`${t.value} to ${t.label} — a to pole czeka na liczbę ${s?.what ?? ''}.`);
  };

  const { drag, hover, bind } = useDragToken({
    disabled: schemaDone,
    onDrop: (id, target) => {
      if (target?.startsWith('pole-')) put(id as SlotId, target.slice(5));
    },
    onTap: (id) => setPicked((p) => (p === id ? null : (id as SlotId))),
  });

  const pin = (id: string) => {
    const next = pinned.includes(id) ? pinned : [...pinned, id];
    setPinned(next);
    if (next.length === 2 && !completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  const neolit = getCorePin('neolit');
  const jerycho = getCorePin('jerycho');

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed">
        Pamiętasz schemat „przyczyna → skutek”? Tym razem wypełnij go <strong>liczbami ze swojej wioski</strong>
        {stats.sample ? ' (nie dokończyłeś/łaś symulacji, więc to liczby z przykładowej wioski)' : ''}. Przeciągnij kartkę
        z liczbą do pola — albo stuknij kartkę, potem pole.
      </p>

      <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_2fr] md:items-stretch">
        <div className="border p-3 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Przyczyna</p>
          Ludzie zaczęli siać zboże i oswajać zwierzęta.
        </div>
        <div className="self-center text-center text-xl" aria-hidden>
          →
        </div>
        <div className="border p-3 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Wydarzenie</p>
          Zostają przy polu — powstaje wioska.
        </div>
        <div className="self-center text-center text-xl" aria-hidden>
          →
        </div>
        <div className="space-y-1.5 border p-3 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Skutki</p>
          {SLOTS.map((s) => {
            const ok = filled.includes(s.id);
            const value = tags.find((t) => t.id === s.id)!.value;
            return (
              <p key={s.id} className="leading-relaxed">
                {s.before}{' '}
                <button
                  type="button"
                  data-drop={`pole-${s.id}`}
                  onClick={() => picked && put(picked, s.id)}
                  aria-label={ok ? `${value}` : 'puste pole na liczbę'}
                  className="inline-flex min-w-[3rem] justify-center border-b-2 px-2 font-mono font-bold tabular-nums"
                  style={{ borderColor: ok || hover === `pole-${s.id}` ? color : undefined, color: ok ? color : undefined }}
                >
                  {ok ? value : '…'}
                </button>{' '}
                {ok ? s.after(value) : s.after(5)}
              </p>
            );
          })}
          <p className="leading-relaxed text-muted-foreground">I dalej: z wiosek wyrosną miasta, a z miast — pierwsze państwa.</p>
        </div>
      </div>

      {!schemaDone && (
        <div className="flex flex-wrap gap-2">
          {tags
            .filter((t) => !filled.includes(t.id))
            .map((t) => (
              <button
                key={t.id}
                type="button"
                {...bind(t.id)}
                className="touch-none border bg-white px-3 py-1.5 text-left dark:bg-zinc-900"
                style={{ outline: picked === t.id ? `3px solid ${color}` : undefined }}
              >
                <span className="font-mono text-lg font-bold tabular-nums">{t.value}</span>
                <span className="ml-2 text-xs text-muted-foreground">{t.label}</span>
              </button>
            ))}
        </div>
      )}
      {msg && <p className="text-sm text-destructive">{msg}</p>}
      <DragGhost drag={drag}>
        <span className="block border bg-white px-3 py-1.5 font-mono text-lg font-bold">{tags.find((t) => t.id === drag?.id)?.value}</span>
      </DragGhost>

      {(schemaDone || done) && neolit && jerycho && (
        <div className="space-y-4 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Kiedy to było? Przypnij na Osi dziejów dwie pinezki. Uważaj — to czasy bardzo dawne, dużo wcześniej niż piramidy.
          </p>
          <PrzypnijPinezke pin={neolit} color={color} lesson={LESSON} mode="ludzkosc" done={done || pinned.includes('neolit')} onPinned={() => pin('neolit')} />
          {(pinned.includes('neolit') || done) && (
            <PrzypnijPinezke pin={jerycho} color={color} lesson={LESSON} mode="ludzkosc" done={done || pinned.includes('jerycho')} onPinned={() => pin('jerycho')} />
          )}
        </div>
      )}
    </div>
  );
}
