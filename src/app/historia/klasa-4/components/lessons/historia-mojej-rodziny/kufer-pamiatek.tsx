'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ScanSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LupaPlane } from '../../source-desk/lupa';
import { ChestSvg } from './kufer-svg';
import {
  CHEST,
  LIST_CROSSCHECK,
  judgeCrosscheck,
  judgeStoryStep,
  judgeYear,
  type ChestId,
} from './kufer';

/**
 * Blok 3 — **„Kufer pamiątek”** (źródło; drugi konsument lupy `source-desk`).
 *
 * Gest: dziecko **przesuwa lupę po przedmiocie z kufra** — napisy są tak drobne,
 * że bez lupy ich nie przeczyta — i **wpisuje rok z napisu na kartę muzealną**
 * (przy legitymacji stoją dwie daty, więc trzeba czytać pytanie). Przy liście
 * liczy jeszcze rok urodzenia syna: wychodzi to samo, co na drzewie z poprzedniego
 * bloku — dwa źródła się potwierdzają. Z czterech kart dziecko **układa opowieść
 * o pradziadku od najdawniejszej**, a kolejność sędziuje się z lat, które samo
 * odczytało (nie z tablicy autora).
 *
 * Rodzina i przedmioty są wymyślone — podpis pod kufrem mówi to wprost.
 */
export function KuferPamiatek({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [active, setActive] = useState<ChestId>('zegarek');
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [years, setYears] = useState<Partial<Record<ChestId, number>>>({});
  const [crossDone, setCrossDone] = useState(false);
  const [picked, setPicked] = useState<ChestId[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [crossText, setCrossText] = useState('');
  const reported = useRef(false);

  const item = CHEST.find((c) => c.id === active)!;
  const isDone = (id: ChestId) => years[id] !== undefined && (id !== 'list' || crossDone);
  const allDone = CHEST.every((c) => isDone(c.id));
  const storyDone = picked.length === CHEST.length;
  const needCross = active === 'list' && years.list !== undefined && !crossDone;

  useEffect(() => {
    if (storyDone && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [storyDone, onComplete]);

  const choose = (id: ChestId) => {
    setActive(id);
    setPos({ x: 0.5, y: 0.5 });
    setText('');
    setCrossText('');
    setNote(null);
  };

  const submit = () => {
    const verdict = judgeYear(item, text);
    if (!verdict.ok) {
      setNote(verdict.note ?? null);
      return;
    }
    setNote(null);
    setYears((prev) => ({ ...prev, [item.id]: Number(text.trim()) }));
    setText('');
  };

  const submitCross = () => {
    const verdict = judgeCrosscheck(crossText);
    if (!verdict.ok) {
      setNote(verdict.note ?? null);
      return;
    }
    setNote(null);
    setCrossDone(true);
  };

  const pick = (id: ChestId) => {
    const verdict = judgeStoryStep(years, picked, id);
    if (!verdict.ok) {
      setNote(verdict.note ?? null);
      return;
    }
    setNote(null);
    setPicked((prev) => [...prev, id]);
  };

  const remaining = CHEST.filter((c) => !picked.includes(c.id));

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Przedmioty z kufra" className="grid grid-cols-4 gap-2">
        {CHEST.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            onClick={() => choose(c.id)}
            className={cn('relative border-2 bg-[#f4f1ea] p-1 text-left', active === c.id ? 'opacity-100' : 'opacity-70')}
            style={{ borderColor: active === c.id ? color : 'var(--border)' }}
          >
            <ChestSvg id={c.id} className="h-auto w-full" />
            <span className="mt-0.5 block truncate text-[11px] font-medium capitalize text-zinc-800">
              {c.id === 'legitymacja' ? 'legitymacja' : c.id}
            </span>
            {isDone(c.id) && (
              <span
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                <Check className="h-3 w-3" aria-hidden />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[26rem]">
        <LupaPlane
          color={color}
          pos={pos}
          onPosChange={setPos}
          zoom={2.6}
          lupaPx={150}
          className="aspect-[4/3]"
          ariaLabel={`Przedmiot z kufra: ${item.what}. Przeciągnij palcem albo przesuwaj lupę strzałkami i przeczytaj napis.`}
        >
          <ChestSvg id={item.id} className="h-full w-full" />
        </LupaPlane>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ScanSearch className="h-3.5 w-3.5 shrink-0" aria-hidden /> Kufer jest wymyślony na potrzeby lekcji — przedmioty też.
        </p>
      </div>

      {!isDone(item.id) && !needCross && (
        <div className="space-y-2">
          <p className="text-base leading-relaxed">
            <strong>{item.what.replace(/^./, (c) => c.toUpperCase())}.</strong> {item.question}
          </p>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="sr-only" htmlFor="kufer-rok">Rok z napisu</label>
            <input
              id="kufer-rok"
              inputMode="numeric"
              maxLength={4}
              value={text}
              onChange={(e) => setText(e.target.value.replace(/\D/g, ''))}
              placeholder="rok"
              className="w-24 border-2 bg-white px-3 py-2 text-center text-lg font-semibold tabular-nums dark:bg-zinc-900"
            />
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
              Wpisz na kartę
            </button>
          </form>
          <p className="text-sm text-muted-foreground">{item.hint}</p>
        </div>
      )}

      {needCross && (
        <div className="space-y-2 border-2 p-3" style={{ borderColor: color }}>
          <p className="text-base leading-relaxed">
            Rok listu wpisany: <strong>{years.list}</strong>. {LIST_CROSSCHECK.question}
          </p>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitCross();
            }}
          >
            <label className="sr-only" htmlFor="kufer-urodzony">Rok urodzenia Józka</label>
            <input
              id="kufer-urodzony"
              inputMode="numeric"
              maxLength={4}
              value={crossText}
              onChange={(e) => setCrossText(e.target.value.replace(/\D/g, ''))}
              placeholder="rok"
              className="w-24 border-2 bg-white px-3 py-2 text-center text-lg font-semibold tabular-nums dark:bg-zinc-900"
            />
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
              Sprawdź z drzewem
            </button>
          </form>
        </div>
      )}

      {isDone(item.id) && (
        <p className="border p-3 text-sm leading-relaxed" style={{ borderColor: color, backgroundColor: `${color}10` }}>
          <strong>Karta gotowa.</strong> {item.says}
          {item.id === 'list' && ` ${LIST_CROSSCHECK.note}`}
        </p>
      )}

      <div aria-live="polite" className="min-h-[1.5rem]">
        {note && <p className="border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">{note}</p>}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Karty muzealne
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CHEST.map((c) => (
            <li
              key={c.id}
              className={cn('border p-2 text-sm leading-snug', isDone(c.id) ? 'bg-white dark:bg-zinc-900' : 'border-dashed text-muted-foreground')}
            >
              {isDone(c.id) ? (
                <>
                  <span className="block font-semibold">{c.what.split(' (')[0]}</span>
                  <span className="block text-xs text-muted-foreground">należał do Wincentego Lisieckiego · rok {years[c.id]}</span>
                  <span className="mt-1 block">{c.says}</span>
                </>
              ) : (
                <span>pusta karta — przeczytaj przedmiot lupą</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {allDone && (
        <div className="space-y-3 border-2 p-3" style={{ borderColor: color }}>
          <p className="text-base leading-relaxed">
            <strong>Cztery karty — jedna opowieść.</strong> Stuknij kartę, od której zacząć: opowieść idzie od
            najdawniejszego roku do najnowszego, a rok bierzemy z <em>twoich</em> kart.
          </p>
          {!storyDone && (
            <div className="flex flex-wrap gap-2">
              {remaining.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(c.id)}
                  className="border-2 bg-white px-3 py-2 text-sm font-semibold dark:bg-zinc-900"
                  style={{ borderColor: color }}
                >
                  {years[c.id]} · {c.what.split(' (')[0]}
                </button>
              ))}
            </div>
          )}
          {picked.length > 0 && (
            <ol className="space-y-1.5 text-base leading-relaxed">
              {picked.map((id) => {
                const c = CHEST.find((x) => x.id === id)!;
                return (
                  <li key={id}>{c.story.replace('{y}', String(years[id]))}</li>
                );
              })}
            </ol>
          )}
          {storyDone && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Wincentym nie ma żadnej książki. Ta opowieść powstała z czterech rzeczy z kufra — i każde jej zdanie ma
              swoje źródło. Tak historyk odtwarza życie zwykłego człowieka.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
