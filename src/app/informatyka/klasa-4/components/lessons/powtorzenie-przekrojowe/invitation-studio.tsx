'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bold, Check, Eye, Printer, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ATTRACTIONS,
  INITIAL_POSTER,
  LINES,
  PHOTOS,
  SKY,
  BAND,
  TITLE_COLORS,
  boldCount,
  judge,
  readPoster,
  titleContrast,
  MIN_CONTRAST,
  type LineId,
  type Photo,
  type Poster,
  type Report,
  type TitleColor,
} from './invitation';

/**
 * Blok 3 — **Zaproszenie**. Zadanie praktyczne wykonywane w lekcji (zero pliku):
 * plakat na Dzień Otwarty klasy ma pięć usterek z pięciu różnych działów, a
 * dziecko poprawia je na żywo, patrząc na plakat, nie na listę. Trzy etapy jak
 * w `ProofTask` — zlecenie z jawnymi kryteriami, warsztat, odbiór punkt po
 * punkcie — tyle że warsztatem jest strona.
 *
 * Piąte kryterium jest inne od czterech pozostałych: **nie da się go zaliczyć
 * samemu.** Zosia patrzy na plakat cztery sekundy, po czym mu się odwraca i
 * mówi, co zapamiętała — czyli to, czego dziecko nie zobaczy samo, bo autor
 * swojego plakatu zawsze wie, gdzie jest data. To ta sama lekcja co w projekcie
 * rocznym, na plakacie zamiast w quizie.
 *
 * Plakat jest rysowany w stałej ramie 380 px i skalowany do kolumny (`scale`),
 * więc tekst ma zawsze te same proporcje względem zdjęcia — kontrast tytułu
 * liczy się z tego samego nieba, które widać na ekranie.
 */

const W = 380;
const LOOK_SECONDS = 4;
const PHOTO_H = 158;

const fmt = (value: number) => String(value).replace('.', ',');

export function InvitationStudio({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [poster, setPoster] = useState<Poster>(INITIAL_POSTER);
  const [big, setBig] = useState(false);
  const [looking, setLooking] = useState<number | null>(null);
  const [report, setReport] = useState<{ sig: string; value: Report } | null>(null);
  const [cover, setCover] = useState(false);
  const [sent, setSent] = useState(false);
  const reported = useRef(false);

  const sig = useMemo(() => JSON.stringify(poster), [poster]);
  const validReport = report && report.sig === sig ? report.value : null;
  const verdict = useMemo(() => judge(poster, validReport), [poster, validReport]);
  const allOk = verdict.every((item) => item.ok);
  const contrast = titleContrast(poster);
  const busy = looking !== null;

  const edit = (patch: Partial<Poster>) => {
    setPoster((prev) => ({ ...prev, ...patch }));
    setCover(false);
    setSent(false);
  };

  // Zosia patrzy cztery sekundy.
  useEffect(() => {
    if (looking === null) return;
    if (looking <= 0) {
      setReport({ sig, value: readPoster(poster) });
      setLooking(null);
      setCover(true);
      return;
    }
    const id = window.setTimeout(() => setLooking((value) => (value === null ? null : value - 1)), 1000);
    return () => window.clearTimeout(id);
    // `poster` nie zmienia się w czasie patrzenia (sterowanie jest zablokowane).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [looking]);

  const send = () => {
    setSent(true);
    if (allOk && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* 1. Zlecenie */}
      <div className="border bg-muted/40 p-4 text-sm leading-relaxed sm:text-base">
        <p>
          Zosia zrobiła plakat na <strong>Dzień Otwarty klasy 4</strong> — ale zanim pójdzie do druku, ktoś musi go
          poprawić. Ma się zmieścić w pięciu warunkach. Nic nie jest ukryte: znasz je z góry.
        </p>
        <ol className="mt-3 space-y-1.5">
          {verdict.map((item, index) => (
            <li key={item.id} className="flex items-start gap-2.5">
              <StatusDot state={sent ? (item.ok ? 'ok' : 'no') : 'idle'} index={index + 1} />
              <span className="leading-snug">{item.title}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 2. Warsztat */}
      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
        <div className="sticky top-9 z-10 -mx-5 bg-white px-5 pb-2 pt-1 dark:bg-zinc-900 sm:-mx-6 sm:px-6 lg:sticky lg:top-12 lg:z-auto lg:mx-0 lg:self-start lg:bg-transparent lg:px-0 lg:dark:bg-transparent">
          <PosterView poster={poster} big={big} looking={looking} cover={cover} report={validReport} onUncover={() => setCover(false)} />
        </div>

        <fieldset disabled={busy} className="mt-3 min-w-0 space-y-3 lg:mt-0">
          <legend className="sr-only">Narzędzia poprawiania plakatu</legend>

          <Row label="Zdjęcie">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PHOTOS) as Photo[]).map((id) => {
                const info = PHOTOS[id];
                const active = poster.photo === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => edit({ photo: id })}
                    aria-pressed={active}
                    className={cn('cursor-pointer border-2 p-1.5 text-left text-xs leading-snug', active ? 'bg-muted/60' : 'hover:bg-muted/30')}
                    style={{ borderColor: active ? color : 'var(--border)' }}
                  >
                    <svg viewBox="0 0 480 200" className="mb-1 block h-14 w-full" aria-hidden>
                      <PhotoArt photo={id} />
                    </svg>
                    <span className="block font-semibold">{info.name}</span>
                    <span className="block text-muted-foreground">
                      {info.author} · {info.license}
                    </span>
                  </button>
                );
              })}
            </div>
          </Row>

          <Row label="Tytuł">
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(TITLE_COLORS) as TitleColor[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => edit({ color: id })}
                  aria-pressed={poster.color === id}
                  aria-label={`Kolor tytułu: ${TITLE_COLORS[id].label}`}
                  title={TITLE_COLORS[id].label}
                  className="h-9 w-9 cursor-pointer border-2"
                  style={{
                    backgroundColor: TITLE_COLORS[id].hex,
                    borderColor: poster.color === id ? color : 'var(--border)',
                    outline: poster.color === id ? `2px solid ${color}` : undefined,
                    outlineOffset: 2,
                  }}
                />
              ))}
              <Switch on={poster.band} onChange={(value) => edit({ band: value })} label="Ciemny pas pod tytułem" />
            </div>
            <p className={cn('mt-1.5 text-xs tabular-nums', contrast >= MIN_CONTRAST ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
              Kontrast tytułu z tłem: {fmt(contrast)} : 1 {contrast >= MIN_CONTRAST ? '✓' : `(trzeba ${fmt(MIN_CONTRAST)})`}
            </p>
          </Row>

          <Row label="Pogrubienia">
            <div className="flex flex-wrap gap-1.5">
              {LINES.map((line) => {
                const on = poster.bold[line.id];
                return (
                  <button
                    key={line.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => edit({ bold: { ...poster.bold, [line.id]: !on } as Record<LineId, boolean> })}
                    className={cn(
                      'inline-flex min-h-9 cursor-pointer items-center gap-1.5 border px-2.5 text-xs font-medium',
                      on ? 'border-foreground bg-foreground text-background' : 'text-muted-foreground hover:bg-muted/40'
                    )}
                  >
                    <Bold className={cn('h-3.5 w-3.5', on ? 'opacity-100' : 'opacity-40')} aria-hidden />
                    {line.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Pogrubione: {boldCount(poster)} z {LINES.length}.</p>
          </Row>

          <Row label="Atrakcje i druk">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Switch on={poster.realList} onChange={(value) => edit({ realList: value })} label="Prawdziwa lista (styl)" />
              <Switch on={big} onChange={(value) => { setBig(value); setCover(false); }} label="Podgląd w większym druku" />
            </div>
          </Row>

          <Row label="Podpis">
            <Switch on={poster.credit} onChange={(value) => edit({ credit: value })} label="Autor zdjęcia pod plakatem" />
          </Row>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setCover(false);
                setLooking(LOOK_SECONDS);
              }}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 px-4 text-sm font-semibold hover:bg-muted/40"
              style={{ borderColor: color, color }}
            >
              <Eye className="h-4 w-4" aria-hidden />
              Pokaż Zosi na {LOOK_SECONDS} s
            </button>
            <button
              type="button"
              onClick={send}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-5 text-sm font-bold text-white"
              style={{ backgroundColor: color }}
            >
              <Printer className="h-4 w-4" aria-hidden />
              Wyślij do druku
            </button>
          </div>
        </fieldset>
      </div>

      {/* 3. Odbiór */}
      <div aria-live="polite">
        <AnimatePresence>
          {sent && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 border p-4">
              <p className="text-sm font-semibold">
                {allOk ? 'Plakat idzie do druku — wszystkie pięć warunków spełnione.' : 'Drukarnia odesłała plakat. Oto, co jeszcze nie gra:'}
              </p>
              <ul className="mt-3 space-y-2">
                {verdict.map((item, index) => (
                  <li key={item.id} className="flex items-start gap-2.5 text-sm leading-snug">
                    <StatusDot state={item.ok ? 'ok' : 'no'} index={index + 1} />
                    <span>
                      <span className="font-semibold">{item.title}.</span> {item.reason}
                    </span>
                  </li>
                ))}
              </ul>
              {allOk && (
                <p className="mt-3 border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
                  Zosia: „Nikt z nas nie zrobiłby go lepiej sam — dopiero drugie oczy pokazały, gdzie jest data.”
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drobne elementy                                                     */
/* ------------------------------------------------------------------ */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="inline-flex min-h-9 cursor-pointer items-center gap-2 text-left text-sm"
    >
      <span
        className={cn('relative inline-block h-5 w-9 shrink-0 border transition-colors', on ? 'border-emerald-600 bg-emerald-500' : 'bg-muted')}
        aria-hidden
      >
        <span className={cn('absolute top-0.5 h-3.5 w-3.5 bg-white shadow transition-all', on ? 'left-[1.3rem]' : 'left-0.5')} />
      </span>
      {label}
    </button>
  );
}

function StatusDot({ state, index }: { state: 'idle' | 'ok' | 'no'; index: number }) {
  return (
    <span
      className={cn(
        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center text-[11px] font-bold text-white',
        state === 'ok' ? 'bg-emerald-600' : state === 'no' ? 'bg-rose-600' : 'bg-slate-400 dark:bg-zinc-600'
      )}
      aria-label={state === 'ok' ? 'spełnione' : state === 'no' ? 'niespełnione' : `warunek ${index}`}
    >
      {state === 'ok' ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : state === 'no' ? <X className="h-3.5 w-3.5" strokeWidth={3.5} /> : index}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Plakat                                                              */
/* ------------------------------------------------------------------ */

function PhotoArt({ photo }: { photo: Photo }) {
  return (
    <>
      <rect width="480" height="200" fill={SKY} />
      <circle cx="424" cy="50" r="20" fill="#fde68a" />
      {photo === 'szkola' ? (
        <>
          <rect x="70" y="98" width="320" height="86" fill="#d98b6a" />
          <rect x="62" y="90" width="336" height="12" fill="#b8654a" />
          {[0, 1, 2, 3, 4, 5].map((col) =>
            [0, 1].map((row) => (
              <rect key={`${col}-${row}`} x={92 + col * 50} y={112 + row * 34} width="28" height="22" fill="#eaf5ff" stroke="#8a5a45" strokeWidth="2" />
            ))
          )}
          <rect x="212" y="146" width="36" height="38" fill="#7c4a2d" />
          <line x1="430" y1="184" x2="430" y2="96" stroke="#6b7280" strokeWidth="3" />
          <path d="M430 98 L456 106 L430 114 Z" fill="#ef4444" />
          <rect y="184" width="480" height="16" fill="#86c98a" />
        </>
      ) : (
        <>
          <ellipse cx="200" cy="230" rx="330" ry="80" fill="#9bd39b" />
          <path d="M300 200 L300 128 L360 200 Z" fill="#f59e0b" />
          <rect x="296" y="120" width="8" height="82" fill="#78716c" />
          <circle cx="120" cy="128" r="12" fill="#f5cba7" />
          <rect x="108" y="140" width="24" height="40" fill="#f87171" />
          <circle cx="170" cy="134" r="11" fill="#f5cba7" />
          <rect x="159" y="145" width="22" height="36" fill="#60a5fa" />
          <circle cx="232" cy="142" r="10" fill="#f5cba7" />
          <rect x="222" y="152" width="20" height="30" fill="#34d399" />
          <rect y="184" width="480" height="16" fill="#86c98a" />
        </>
      )}
    </>
  );
}

function PosterView({
  poster,
  big,
  looking,
  cover,
  report,
  onUncover,
}: {
  poster: Poster;
  big: boolean;
  looking: number | null;
  cover: boolean;
  report: Report | null;
  onUncover: () => void;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);
  const [height, setHeight] = useState(360);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      setScale(outer.clientWidth / W);
      setHeight(inner.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  const titleColor = TITLE_COLORS[poster.color].hex;
  const text = big ? 18 : 14;
  const weight = (id: LineId) => (poster.bold[id] ? 700 : 400);
  const photoInfo = PHOTOS[poster.photo];

  return (
    <div>
      <div ref={outerRef} className="relative mx-auto w-full max-w-[520px] overflow-hidden border shadow-sm" style={{ height: height * scale }}>
        <div
          ref={innerRef}
          className="absolute left-0 top-0 bg-white text-zinc-900"
          style={{ width: W, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <div className="relative" style={{ height: PHOTO_H }}>
            <svg viewBox="0 0 480 200" width={W} height={PHOTO_H} className="block" aria-hidden>
              <PhotoArt photo={poster.photo} />
            </svg>
            <div
              className="absolute left-4 right-4 top-3 px-3 py-2"
              style={{ backgroundColor: poster.band ? `rgba(15,23,42,${BAND.alpha})` : 'transparent' }}
            >
              <p className="text-[27px] font-extrabold uppercase leading-none tracking-tight" style={{ color: titleColor }}>
                Dzień Otwarty
              </p>
              <p className="mt-1 text-[17px] font-semibold leading-none" style={{ color: titleColor }}>
                klasy 4 zaprasza
              </p>
            </div>
          </div>

          <div className="space-y-1 px-4 pb-3 pt-3" style={{ fontSize: text, lineHeight: 1.3 }}>
            <p style={{ fontWeight: weight('haslo') }}>Przyjdź, zobacz, spróbuj!</p>
            <p style={{ fontWeight: weight('data') }}>sobota, 14 czerwca · godz. 10:00</p>
            <p style={{ fontWeight: weight('miejsce') }}>sala 12, Szkoła Podstawowa nr 5</p>
            {poster.realList ? (
              <ul className="list-disc pl-5" style={{ fontWeight: weight('atrakcje') }}>
                {ATTRACTIONS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontWeight: weight('atrakcje') }}>
                {ATTRACTIONS.map((item) => (
                  <div key={item}>– {item}</div>
                ))}
              </div>
            )}
            <p style={{ fontWeight: weight('stopka'), fontSize: text - 2 }}>Wstęp wolny — zapraszamy całe rodziny</p>
            {poster.credit && (
              <p className="text-right italic text-zinc-500" style={{ fontSize: 10 }}>
                Zdjęcie: {photoInfo.author}
                {poster.photo === 'szkola' ? ', CC BY 4.0' : ''}
              </p>
            )}
          </div>
        </div>

        {looking !== null && (
          <div className="absolute right-2 top-2 bg-slate-900/85 px-2.5 py-1 text-xs font-bold text-white" aria-live="polite">
            Zosia patrzy… {looking}
          </div>
        )}

        <AnimatePresence>
          {cover && report && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100/95 p-4 text-center text-zinc-900 backdrop-blur-sm dark:bg-zinc-900/95 dark:text-zinc-100"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zosia odwróciła się i mówi:</p>
              <p className="max-w-sm text-sm font-medium leading-snug sm:text-base">„{report.words}”</p>
              <div className="flex gap-2 text-xs font-semibold">
                <Chip ok={report.co} label="co" />
                <Chip ok={report.kiedy} label="kiedy" />
                <Chip ok={report.gdzie} label="gdzie" />
              </div>
              <button
                type="button"
                onClick={onUncover}
                className="min-h-9 cursor-pointer border px-4 text-xs font-semibold hover:border-primary/50 hover:text-primary"
              >
                Zobacz plakat jeszcze raz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Chip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1', ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>
      {ok ? <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden /> : <X className="h-3 w-3" strokeWidth={3.5} aria-hidden />}
      {label}
    </span>
  );
}
