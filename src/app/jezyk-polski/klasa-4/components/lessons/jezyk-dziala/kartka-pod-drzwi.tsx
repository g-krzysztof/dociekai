'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import {
  CZYNNOSC_NAME,
  MIEJSCA,
  NIE_DO_MNIE,
  ODBIORCY,
  SPRAWY,
  judgeKartka,
  kartkaText,
  odbiorca,
  reakcja,
  ulozone,
  type Kafelek,
  type Miejsce,
  type Odbiorca,
  type Odczyt,
  type Reakcja,
  type Znak,
} from './kartki';

/**
 * L1, blok 1 „Kartki pod drzwiami” — **gest nowy dla kursu: dziecko składa
 * kartkę ze słów z koszyka (wstęp, główne słowa, dopełnienie + znak), wsuwa ją
 * pod czyjeś drzwi, a odbiorca mówi, co zrozumiał, i podświetla słowa, które
 * o tym zdecydowały.** Pięć spraw, pięć intencji (ostrzec, poprosić,
 * przeprosić, podać coś, obiecać) — każda potrzebuje innych słów. Zła kartka daje
 * reakcję, nie krzyżyk. Na koniec dziennik nazywa nadawcę, odbiorcę i intencję.
 */

type Card = Partial<Record<Miejsce, Kafelek | null>>;

export interface Wyslana {
  n: number;
  sprawa: string;
  door: Odbiorca;
  tiles: Kafelek[];
  znak: Znak;
  odczyt: Odczyt | null;
  ok: boolean;
  r: Reakcja;
}

const ZNAKI: Znak[] = ['.', '!', '?'];
const ZNAK_NAME: Record<Znak, string> = { '.': 'kropka', '!': 'wykrzyknik', '?': 'pytajnik' };
const MARK_STYLE = (color: string) => ({
  backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`,
  boxShadow: `inset 0 -2px 0 ${color}`,
});

interface Props {
  color: string;
  onComplete: () => void;
  /** Zapis ukończonego bloku — po odświeżeniu dziennik wraca, a sprawy są załatwione. */
  restored?: { log: Wyslana[] } | null;
  onSave?: (value: { log: Wyslana[] }) => void;
}

/** Miejsca na kartce w koszyku — każdy rząd ma jedno miejsce, nowe słowa zastępują stare. */
const RZAD: Record<Miejsce, string> = {
  wstep: 'Na początek',
  glowne: 'Najważniejsze słowa',
  dopelnienie: 'Dopowiedzenie',
};

export function KartkaPodDrzwi({ color, onComplete, restored, onSave }: Props) {
  const [step, setStep] = useState(0);
  const [card, setCard] = useState<Card>({});
  const [znak, setZnak] = useState<Znak | null>(null);
  const [held, setHeld] = useState(false);
  const [log, setLog] = useState<Wyslana[]>([]);
  const [open, setOpen] = useState<Wyslana | null>(null);

  useEffect(() => {
    if (!restored?.log.length) return;
    setLog(restored.log);
    setStep(SPRAWY.length);
  }, [restored]);

  const finished = step >= SPRAWY.length;
  const sprawa = SPRAWY[Math.min(step, SPRAWY.length - 1)];
  const tiles = ulozone(card);
  const ready = tiles.length > 0 && znak !== null;
  const blockedDopelnienie = Boolean(card.glowne?.pelna);

  const place = (t: Kafelek) => {
    setHeld(false);
    setCard((prev) => {
      const next: Card = { ...prev, [t.pos]: prev[t.pos]?.id === t.id ? null : t };
      if (t.pos === 'glowne' && t.pelna) next.dopelnienie = null;
      if (t.pos === 'dopelnienie' && prev.glowne?.pelna) next.glowne = null;
      return next;
    });
  };

  const send = (door: Odbiorca) => {
    if (!ready || finished) return;
    const v = judgeKartka(sprawa, tiles, znak!, door);
    const read = v.ok || v.reason === 'inna-czynnosc' ? v.odczyt : null;
    const entry: Wyslana = {
      n: log.length + 1,
      sprawa: sprawa.id,
      door,
      tiles,
      znak: znak!,
      odczyt: read,
      ok: v.ok,
      r: read ? reakcja(sprawa, read) : NIE_DO_MNIE,
    };
    const nextLog = [...log, entry];
    setLog(nextLog);
    setOpen(entry);
    setHeld(false);
    if (v.ok) {
      setCard({});
      setZnak(null);
      setStep(step + 1);
      if (step + 1 === SPRAWY.length) {
        onSave?.({ log: nextLog });
        onComplete();
      }
    }
  };

  const tileById = (id: string) => sprawa.koszyk.find((t) => t.id === id);
  const drag = useDragToken({
    disabled: finished,
    onDrop: (id, target) => {
      if (id === 'kartka') {
        if (target?.startsWith('door:')) send(target.slice(5) as Odbiorca);
        return;
      }
      if (target !== 'card') return;
      if (id.startsWith('znak:')) setZnak(id.slice(5) as Znak);
      else {
        const t = tileById(id);
        if (t && card[t.pos]?.id !== t.id) place(t);
      }
    },
    onTap: (id) => {
      if (id === 'kartka') {
        if (ready) setHeld((h) => !h);
        return;
      }
      if (id.startsWith('znak:')) setZnak((z) => (z === id.slice(5) ? null : (id.slice(5) as Znak)));
      else {
        const t = tileById(id);
        if (t) place(t);
      }
    },
  });

  const ghostText = (() => {
    const id = drag.drag?.id;
    if (!id) return '';
    if (id === 'kartka') return kartkaText(tiles, znak);
    if (id.startsWith('znak:')) return id.slice(5);
    return tileById(id)?.text ?? '';
  })();

  return (
    <div className="grid gap-4 border bg-white p-4 dark:bg-zinc-900/80 sm:p-5 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-4">
        {/* Sprawa */}
        <div className="min-h-[5.5rem] border-l-4 bg-muted/40 px-4 py-3 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
          {finished ? (
            <p>
              <strong>Pięć spraw załatwionych</strong> — i na każdą trzeba było innych słów. Ostrzeżenie, prośbę,
              przeprosiny, podanie rzeczy i obietnicę robią słowa, a znak na końcu podpowiada, jak je wypowiedzieć: bez
              wykrzyknika „Uważaj” nie brzmi pilnie.
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                Sprawa {step + 1} z {SPRAWY.length}
              </p>
              <p className="mt-1" data-testid="sprawa">
                {sprawa.brief}
              </p>
            </>
          )}
        </div>

        {/* Drzwi */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {ODBIORCY.map((d) => {
            const isOpen = open?.door === d.id;
            const hot = drag.hover === `door:${d.id}`;
            return (
              <button
                key={d.id}
                type="button"
                data-drop={`door:${d.id}`}
                onClick={() => held && send(d.id)}
                disabled={finished}
                aria-label={`Drzwi: ${d.name}${held ? ' — wsuń tu kartkę' : ''}`}
                className="flex flex-col items-center gap-1.5 text-center disabled:cursor-default"
              >
                <span
                  className="relative block aspect-[3/4] w-full max-w-[96px] overflow-hidden border-2 bg-stone-800 [perspective:400px] sm:aspect-[3/5]"
                  style={{ borderColor: hot || held ? color : '#78716c' }}
                >
                  <span className="absolute inset-0 flex items-end justify-center pb-2 text-[11px] font-semibold text-amber-100 sm:text-xs">
                    {d.name}
                  </span>
                  <motion.span
                    className="absolute inset-0 origin-left border-r border-amber-950/40 bg-[#a0703f]"
                    animate={{ rotateY: isOpen ? -68 : 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                  >
                    <span className="absolute inset-x-[14%] top-[10%] h-[34%] border border-amber-950/30" />
                    <span className="absolute inset-x-[14%] bottom-[12%] h-[34%] border border-amber-950/30" />
                    <span className="absolute right-[12%] top-1/2 h-2 w-2 rounded-full bg-amber-300" />
                  </motion.span>
                  {hot && <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundColor: color }} />}
                </span>
                <span className="h-1 w-[90%] max-w-[104px] bg-stone-300 dark:bg-stone-600" aria-hidden />
                <span className="text-[11px] font-medium leading-tight sm:text-sm">{d.name}</span>
              </button>
            );
          })}
        </div>

        {/* Kartka + koszyk */}
        {!finished && (
          <div className="space-y-3">
            <div
              data-drop="card"
              className="flex min-h-[4.5rem] flex-wrap items-center gap-x-1.5 gap-y-2 border bg-amber-50 px-3 py-2 font-serif text-lg text-zinc-900 shadow-sm"
              style={{ outline: drag.hover === 'card' ? `3px solid ${color}` : undefined, outlineOffset: 2 }}
              data-testid="kartka"
            >
              {MIEJSCA.map((m) => {
                const t = card[m];
                if (m === 'dopelnienie' && blockedDopelnienie) return null;
                if (!sprawa.koszyk.some((k) => k.pos === m)) return null;
                return t ? (
                  <button
                    key={m}
                    type="button"
                    onClick={() => place(t)}
                    aria-label={`Zdejmij z kartki: ${t.text}`}
                    className="inline-flex items-center gap-1 border border-amber-900/20 bg-white/70 px-2 py-0.5"
                  >
                    {t.text}
                    <X className="h-3 w-3 opacity-50" aria-hidden />
                  </button>
                ) : (
                  <span key={m} className="inline-block h-7 w-12 border-b-2 border-dashed border-stone-400" aria-hidden />
                );
              })}
              <span
                className="inline-flex h-8 w-6 items-center justify-center border-b-2 border-dashed border-stone-400 text-2xl font-bold"
                aria-label={znak ? `Znak: ${ZNAK_NAME[znak]}` : 'Brak znaku na końcu'}
              >
                {znak ?? ''}
              </span>
            </div>
            <p className="min-h-[1.5rem] text-sm" aria-live="polite" data-testid="kartka-text">
              {tiles.length ? (
                <span>
                  Na kartce: <span className="font-serif text-base">{kartkaText(tiles, znak)}</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Kartka jest pusta.</span>
              )}
            </p>
            <div className="space-y-2" data-testid="koszyk">
              {MIEJSCA.filter((m) => sprawa.koszyk.some((t) => t.pos === m)).map((m) => (
                <div key={m} className="flex flex-wrap items-center gap-2">
                  <span className="w-full text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {RZAD[m]} · jedno
                  </span>
                  {sprawa.koszyk
                    .filter((t) => t.pos === m)
                    .map((t) => {
                      const on = card[t.pos]?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          {...drag.bind(t.id)}
                          aria-pressed={on}
                          aria-label={`Słowa: ${t.text}`}
                          className="cursor-grab touch-none select-none border bg-white px-3 py-1.5 font-serif text-base dark:bg-zinc-800"
                          style={on ? { borderColor: color, color, opacity: 0.55 } : undefined}
                        >
                          {t.text}
                        </button>
                      );
                    })}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-full text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Znak na końcu · jeden</span>
                {ZNAKI.map((z) => (
                  <button
                    key={z}
                    type="button"
                    {...drag.bind(`znak:${z}`)}
                    aria-label={`Znak: ${ZNAK_NAME[z]}`}
                    className="flex h-10 w-10 cursor-grab touch-none select-none items-center justify-center border-2 bg-white font-serif text-2xl font-bold dark:bg-zinc-800"
                    style={znak === z ? { borderColor: color, color } : undefined}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div
                {...(ready ? drag.bind('kartka') : {})}
                role="button"
                tabIndex={ready ? 0 : -1}
                aria-disabled={!ready}
                aria-label="Gotowa kartka — przeciągnij pod drzwi"
                className="touch-none select-none border bg-amber-50 px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm aria-disabled:opacity-40"
                style={{ outline: held ? `3px solid ${color}` : undefined, outlineOffset: 2 }}
              >
                ✉ Kartka gotowa
              </div>
              <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                {!tiles.length
                  ? 'Przeciągnij słowa z koszyka na kartkę (albo je stuknij). Z każdego rzędu mieści się jedno.'
                  : !znak
                    ? 'Kartka potrzebuje znaku na końcu.'
                    : held
                      ? 'Stuknij drzwi, pod które wsuwasz kartkę.'
                      : 'Przeciągnij kartkę pod drzwi (albo stuknij ją, potem drzwi).'}
              </p>
            </div>
          </div>
        )}

        {/* Reakcja — stała wysokość, bez skoku */}
        <div aria-live="polite" className="min-h-[8.5rem] border px-4 py-3 text-sm sm:text-base" data-testid="reakcja">
          {open ? (
              <motion.div key={open.n} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <p className="font-serif text-base">
                  <SentCard w={open} color={color} />
                  <span className="ml-2 font-sans text-xs text-muted-foreground">→ {odbiorca(open.door).name}</span>
                </p>
                <p className="mt-1 text-muted-foreground">{open.r.act}</p>
                <p className="mt-0.5 font-medium">— {open.r.say}</p>
                <Werdykt w={open} color={color} />
              </motion.div>
            ) : (
              <p className="text-muted-foreground">Tu zobaczysz, co się stanie za drzwiami.</p>
            )}
        </div>
        <DragGhost drag={drag.drag}>
          <span className="block border bg-amber-50 px-3 py-2 font-serif text-lg text-zinc-900">{ghostText}</span>
        </DragGhost>
      </div>

      {/* Dziennik wysłanych kartek */}
      <aside className="min-w-0 border-t pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wysłane kartki</p>
        <ol className="mt-2 space-y-2 text-sm" data-testid="kartki-log">
          {log.length === 0 && <li className="text-muted-foreground">Jeszcze żadnej.</li>}
          {log.map((w) => (
            <li key={w.n} className="border-b pb-1.5 last:border-b-0">
              <span className="font-serif">{kartkaText(w.tiles, w.znak)}</span>
              {w.ok && <Check className="ml-1 inline h-3.5 w-3.5" style={{ color }} aria-label="sprawa załatwiona" />}
              <span className="block text-xs text-muted-foreground">
                {finished ? <strong style={{ color }}>odbiorca: </strong> : '→ '}
                {odbiorca(w.door).name}
                {w.odczyt && ` · ${odbiorca(w.door).understood}: ${CZYNNOSC_NAME[w.odczyt.czynnosc]}`}
              </span>
            </li>
          ))}
        </ol>
        {finished && <Nazwy color={color} />}
      </aside>
    </div>
  );
}

/** Wysłana kartka z podświetlonymi słowami, które zdecydowały o odczycie. */
function SentCard({ w, color }: { w: Wyslana; color: string }) {
  const dowod = new Set(w.odczyt?.dowod ?? []);
  const full = kartkaText(w.tiles, null);
  const lower = full.toLocaleLowerCase('pl');
  let pos = 0;
  const pieces = w.tiles.map((t) => {
    const at = lower.indexOf(t.text, pos);
    const sep = full.slice(pos, at);
    const body = full.slice(at, at + t.text.length);
    pos = at + t.text.length;
    return (
      <span key={t.id}>
        {sep}
        <span style={dowod.has(t.id) ? MARK_STYLE(color) : undefined}>{body}</span>
      </span>
    );
  });
  return (
    <span data-testid="sent-card">
      {pieces}
      <span style={dowod.has(w.znak) ? MARK_STYLE(color) : undefined}>{w.znak}</span>
    </span>
  );
}

function Werdykt({ w, color }: { w: Wyslana; color: string }) {
  const sprawa = SPRAWY.find((s) => s.id === w.sprawa)!;
  const to = odbiorca(sprawa.to);
  if (w.ok) {
    const czynnosc = w.odczyt!.czynnosc;
    const ids = new Set(w.tiles.map((t) => t.id));
    const prosze = w.tiles.some((t) => t.cechy.includes('prosze'));
    const note =
      sprawa.okNote?.[czynnosc] ??
      (sprawa.id === 'kaluza' && ids.has('stoj')
        ? '„Stój” to polecenie, ale z wykrzyknikiem, w biegu, przed kałużą — ostrzega.'
        : sprawa.id === 'okulary' && prosze
        ? 'Zauważ: tu „proszę” nie prosi, tylko podaje.'
        : sprawa.id === 'rower' && ids.has('pomoz') && !prosze
          ? 'Z „proszę” brzmiałoby grzeczniej.'
          : ids.has('przepraszam-pania')
            ? 'Zauważ: „panią” — tak grzecznie zwracamy się do dorosłej osoby.'
            : null);
    return (
      <p className="mt-2 font-medium" style={{ color }}>
        Udało się — {to.name} {to.understood} dokładnie to, o co ci chodziło: {CZYNNOSC_NAME[czynnosc]}.
        {note && ` ${note}`}
      </p>
    );
  }
  if (!w.odczyt) {
    return <p className="mt-2 text-muted-foreground">To jest sprawa {to.gen}. Wyślij kartkę jeszcze raz.</p>;
  }
  return (
    <p className="mt-2 text-muted-foreground">
      {to.name} {to.understood}: <strong>{CZYNNOSC_NAME[w.odczyt.czynnosc]}</strong>. A ty chcesz {sprawa.intencja}.
      Podświetlone słowa zdecydowały — zmień je i wyślij jeszcze raz.
    </p>
  );
}

function Nazwy({ color }: { color: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2 text-sm leading-relaxed" data-testid="nazwy">
      <p>
        <strong style={{ color }}>nadawca</strong> — ty: ten, kto pisze kartkę.
      </p>
      <p>
        <strong style={{ color }}>odbiorca</strong> — ten, pod czyje drzwi trafia kartka.
      </p>
      <p>
        <strong style={{ color }}>komunikat</strong> — to, co nadawca przekazuje odbiorcy: tu twoja kartka.
      </p>
      <p>
        <strong style={{ color }}>intencja</strong> — to, co chcesz osiągnąć: ostrzec, poprosić, przeprosić, podać coś
        („proszę”), obiecać. Odbiorca odczytuje ją z twoich słów i znaku. Do każdej intencji trzeba innych słów.
      </p>
    </motion.div>
  );
}
