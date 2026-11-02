'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Play, RotateCcw, Scissors } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { Twarz } from '../../twarz/twarz';
import { Pisarnia } from '../../pisarnia/pisarnia';
import { analyze } from '../../../lib/pisarnia';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import {
  KIEDY,
  MOMENT,
  ODPOWIEDZ,
  PROSBY,
  SCENA,
  jezySie,
  napiecie,
  ocen,
  type Linia,
  type Strona,
  type Ulozone,
  type Werdykt,
} from './klotnia';
import { twarzNapiecia } from './tasma';

/**
 * L7, blok 3 „Powiedz inaczej” `[1.4]` — **gest: wyjmuje wyrzut z taśmy
 * kłótni i w lukę wkłada komunikat z trzech pasków, a taśma toczy się dalej
 * inaczej.** (Przebudowa 2026-10-19, R4:
 * wcześniej dwie Pisarnie z werdyktem — druga lekcja z rzędu po L6.)
 *
 * Paski: „Czuję…” (uczucie — wybór dziecka, bez klucza), „…kiedy” wycięte z
 * klatek taśmy (fakt albo wyrzut — o tym decydują słowa z bloku 1, `oskarza`),
 * „Proszę, …” z palety. Skutek zamiast oceny: komunikat bez oskarżeń daje
 * odpowiedź drugiej strony i klejenie razem, a oskarżający pasek — tę samą
 * taśmę co przedtem. Na końcu „było” i „teraz” obok siebie. Własne słowa w
 * Pisarni są dopiskiem bez werdyktu (do Teczki).
 */

const LESSON = 'ja-i-my/emocje-i-potrzeby';
const IMIE: Record<Strona, string> = { tymek: 'Tymek', zuzia: 'Zuzia' };
const KTO_LABEL: Record<Linia['kto'], string> = { narrator: 'narrator', tymek: 'Tymek', zuzia: 'Zuzia' };

/** „Czuję…” + rzeczownik uczucia — gramatycznie i bez rodzaju. */
const CZUJE = ['złość', 'smutek', 'żal', 'niepokój', 'zazdrość', 'wstyd', 'radość', 'zaskoczenie'];

const EMPTY: Ulozone = { uczucie: null, kiedy: null, prosba: null };
type Slot = keyof Ulozone;
const BRAK: Record<Slot, string> = { uczucie: 'uczucia', kiedy: 'paska „kiedy…”', prosba: 'prośby' };

interface Props {
  color: string;
  onComplete: () => void;
}

export function PowiedzInaczej({ color, onComplete }: Props) {
  const [strona, setStrona] = useState<Strona>('tymek');
  const [wyjeta, setWyjeta] = useState(false);
  const [u, setU] = useState<Ulozone>(EMPTY);
  const [werdykt, setWerdykt] = useState<Werdykt | null>(null);
  const [krok, setKrok] = useState(0);
  const [sukces, setSukces] = useState<Strona[]>([]);
  const [wlasne, setWlasne] = useState('');
  const [zapisane, setZapisane] = useState(false);
  const { save } = useTeczka();

  useEffect(() => {
    if (sukces.length > 0) onComplete();
  }, [sukces, onComplete]);

  const druga: Strona = strona === 'tymek' ? 'zuzia' : 'tymek';
  const momentIdx = SCENA.findIndex((l) => l.id === MOMENT[strona]);
  const przed = SCENA.slice(0, momentIdx);
  const wyrzut = SCENA[momentIdx];

  // Co gra taśma po luce: odpowiedź i koniec albo stara kłótnia od następnej klatki.
  const dalej = useMemo<{ kto: Linia['kto']; text: string }[]>(() => {
    if (!werdykt) return [];
    if (werdykt.ok) {
      return [
        { kto: druga, text: ODPOWIEDZ[strona].mowi },
        { kto: 'narrator', text: ODPOWIEDZ[strona].koniec },
      ];
    }
    if ('slowo' in werdykt) {
      return [
        { kto: 'narrator', text: jezySie(strona, werdykt.slowo) },
        ...SCENA.slice(momentIdx + 1).map((l) => ({ kto: l.kto, text: l.text })),
      ];
    }
    return [];
  }, [werdykt, strona, druga, momentIdx]);

  // Taśma po luce odsłania się klatka po klatce.
  useEffect(() => {
    if (!werdykt || krok >= dalej.length) return;
    const t = window.setTimeout(() => setKrok((k) => k + 1), 1100);
    return () => window.clearTimeout(t);
  }, [werdykt, krok, dalej.length]);

  const zmienStrone = (s: Strona) => {
    setStrona(s);
    setWyjeta(false);
    setU(EMPTY);
    setWerdykt(null);
    setKrok(0);
    setWlasne('');
    setZapisane(false);
  };

  const poloz = (slot: Slot, value: string) => {
    setU((cur) => ({ ...cur, [slot]: value }));
    setWerdykt(null);
    setKrok(0);
  };

  const tokenSlot = (id: string): [Slot, string] => {
    const [kind, ...rest] = id.split(':');
    return [kind === 'u' ? 'uczucie' : kind === 'k' ? 'kiedy' : 'prosba', rest.join(':')];
  };

  const drag = useDragToken({
    onTap: (id) => {
      if (id === 'wyrzut') return setWyjeta(true);
      const [slot, value] = tokenSlot(id);
      poloz(slot, value);
    },
    onDrop: (id, target) => {
      if (id === 'wyrzut') {
        if (target === 'kosz') setWyjeta(true);
        return;
      }
      const [slot, value] = tokenSlot(id);
      if (target === `slot:${slot}` || target === 'luka') poloz(slot, value);
    },
    disabled: !!werdykt?.ok,
  });

  const brakuje = (Object.keys(BRAK) as Slot[]).filter((s) => !u[s]);

  const pusc = () => {
    const w = ocen(u, strona);
    setWerdykt(w);
    setKrok(0);
    if (w.ok) {
      save({
        id: `${LESSON}#komunikat-${strona}`,
        lesson: LESSON,
        kind: 'komunikat',
        title: `Komunikat „ja” — jako ${IMIE[strona]}`,
        text: w.zdanie,
      });
      setWlasne(w.zdanie);
      setSukces((s) => (s.includes(strona) ? s : [...s, strona]));
    }
  };

  const zapiszWlasne = () => {
    const text = wlasne.trim();
    if (!text) return;
    save({
      id: `${LESSON}#komunikat-${strona}`,
      lesson: LESSON,
      kind: 'komunikat',
      title: `Komunikat „ja” — jako ${IMIE[strona]}`,
      text,
    });
    setZapisane(true);
  };

  const analiza = useMemo(() => analyze(wlasne), [wlasne]);
  const pasekKiedy = KIEDY[strona].find((p) => p.id === u.kiedy);
  const pasekProsba = PROSBY[strona].find((p) => p.id === u.prosba);
  const koniec = werdykt && krok >= dalej.length && dalej.length > 0;
  const stare = napiecie(SCENA.length - 1);
  const draggedLabel = (() => {
    const id = drag.drag?.id;
    if (!id) return null;
    if (id === 'wyrzut') return wyrzut.text;
    const [slot, value] = tokenSlot(id);
    if (slot === 'uczucie') return value;
    return (slot === 'kiedy' ? KIEDY : PROSBY)[strona].find((p) => p.id === value)?.text ?? null;
  })();

  const slotBox = (slot: Slot, prefix: string, text: string | null | undefined, suffix: string) => {
    const hot = drag.hover === `slot:${slot}` || drag.hover === 'luka';
    return (
      <button
        type="button"
        data-drop={`slot:${slot}`}
        onClick={() => text && poloz(slot, '')}
        disabled={!!werdykt?.ok}
        className="flex min-h-11 w-full items-baseline gap-1.5 border-2 border-dashed px-3 py-2 text-left text-[15px] leading-snug"
        style={{ borderColor: text ? color : hot ? color : '#d6d3d1', backgroundColor: hot ? `color-mix(in srgb, ${color} 10%, transparent)` : undefined, borderStyle: text ? 'solid' : 'dashed' }}
        aria-label={text ? `${prefix} ${text} — stuknij, żeby zdjąć` : `${prefix} — puste miejsce`}
      >
        <span className="shrink-0 font-semibold">{prefix}</span>
        <span className={text ? '' : 'text-muted-foreground'}>{text ? `${text}${suffix}` : '…'}</span>
      </button>
    );
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">Mówisz jako:</span>
        {(['tymek', 'zuzia'] as Strona[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={strona === k}
            onClick={() => zmienStrone(k)}
            className="border px-3 py-1.5 text-sm"
            style={{ borderColor: strona === k ? color : undefined, fontWeight: strona === k ? 600 : undefined }}
          >
            {IMIE[k]}
            {sukces.includes(k) ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {/* Taśma do luki */}
      <ol className="mt-4 space-y-1.5" aria-label="Taśma kłótni">
        {przed.map((l) => (
          <li key={l.id} className="flex items-start gap-2 border px-2 py-1.5 text-sm leading-snug" style={{ fontStyle: l.kto === 'narrator' ? 'italic' : undefined }}>
            <span className="w-16 shrink-0 text-xs text-muted-foreground">{KTO_LABEL[l.kto]}</span>
            <span className="flex-1">{l.text}</span>
          </li>
        ))}
        <li>
          {!wyjeta ? (
            <button
              type="button"
              {...drag.bind('wyrzut')}
              className="flex w-full touch-none items-start gap-2 border-2 px-2 py-2 text-left text-sm leading-snug"
              style={{ borderColor: '#dc2626', backgroundColor: 'color-mix(in srgb, #dc2626 8%, transparent)' }}
              aria-label={`Wyrzut: ${wyrzut.text} — przeciągnij w dół albo stuknij, żeby wyjąć z taśmy`}
            >
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{KTO_LABEL[wyrzut.kto]}</span>
              <span className="flex-1 font-medium">{wyrzut.text}</span>
              <Scissors className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
            </button>
          ) : (
            <div data-drop="luka" className="space-y-1.5 border-2 p-2" style={{ borderColor: color }} data-testid="luka">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                {IMIE[strona]} mówi inaczej:
              </p>
              {slotBox('uczucie', 'Czuję', u.uczucie, ',')}
              {slotBox('kiedy', 'kiedy', pasekKiedy?.text, '.')}
              {slotBox('prosba', 'Proszę,', pasekProsba?.text, '.')}
            </div>
          )}
        </li>
        {werdykt &&
          dalej.slice(0, krok).map((l, i) => (
            <li
              key={i}
              className="flex items-start gap-2 border px-2 py-1.5 text-sm leading-snug"
              style={{
                fontStyle: l.kto === 'narrator' ? 'italic' : undefined,
                borderColor: werdykt.ok ? color : '#fca5a5',
              }}
            >
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{KTO_LABEL[l.kto]}</span>
              <span className="flex-1">{l.text}</span>
            </li>
          ))}
      </ol>

      {!wyjeta && (
        <div
          data-drop="kosz"
          className="mt-3 flex min-h-14 items-center justify-center border-2 border-dashed px-3 text-center text-sm text-muted-foreground"
          style={{ borderColor: drag.hover === 'kosz' ? '#dc2626' : '#d6d3d1' }}
        >
          Wyjmij wyrzut z taśmy — przeciągnij czerwoną klatkę tutaj albo ją stuknij.
        </div>
      )}

      {/* Paski do luki */}
      {wyjeta && !werdykt?.ok && (
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-snug">
            Wyjęta klatka leży obok: <span className="italic line-through decoration-red-600">„{wyrzut.text}”</span>. Złóż w luce
            nowe zdanie: przeciągnij paski albo je stuknij.
          </p>
          <div>
            <p className="text-sm font-semibold">Czuję…</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CZUJE.map((c) => (
                <button
                  key={c}
                  type="button"
                  {...drag.bind(`u:${c}`)}
                  aria-pressed={u.uczucie === c}
                  className="touch-none border px-2 py-1 text-sm"
                  style={{ borderColor: u.uczucie === c ? color : undefined, backgroundColor: u.uczucie === c ? `color-mix(in srgb, ${color} 12%, transparent)` : undefined }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">…kiedy — paski wycięte z taśmy</p>
            <div className="mt-1 grid gap-1.5">
              {KIEDY[strona].map((p) => {
                const from = SCENA.find((l) => l.id === p.z)!;
                return (
                  <button
                    key={p.id}
                    type="button"
                    {...drag.bind(`k:${p.id}`)}
                    aria-pressed={u.kiedy === p.id}
                    className="flex touch-none items-baseline justify-between gap-2 border px-2.5 py-1.5 text-left text-sm"
                    style={{ borderColor: u.kiedy === p.id ? color : undefined }}
                  >
                    <span>{p.text}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">z klatki: {KTO_LABEL[from.kto]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Proszę, …</p>
            <div className="mt-1 grid gap-1.5">
              {PROSBY[strona].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  {...drag.bind(`p:${p.id}`)}
                  aria-pressed={u.prosba === p.id}
                  className="touch-none border px-2.5 py-1.5 text-left text-sm"
                  style={{ borderColor: u.prosba === p.id ? color : undefined }}
                >
                  {p.text}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={pusc}
              disabled={brakuje.length > 0}
              className="flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Play className="h-4 w-4" aria-hidden /> Puść taśmę dalej
            </button>
            <span className="min-h-5 text-sm text-muted-foreground" aria-live="polite">
              {brakuje.length > 0 ? `W luce brakuje ${brakuje.map((b) => BRAK[b]).join(' i ')}.` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Było i teraz */}
      <div className="mt-4 min-h-[7rem]" aria-live="polite">
        {koniec && werdykt && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">było</span>
                <div className="flex gap-1">
                  <Twarz kto="tymek" ksztalt={twarzNapiecia('tymek', stare.tymek)} size={56} label="Tymek" />
                  <Twarz kto="zuzia" ksztalt={twarzNapiecia('zuzia', stare.zuzia)} size={56} label="Zuzia" />
                </div>
                <span className="text-center text-xs text-muted-foreground">skrzydło pękło</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: werdykt.ok ? color : '#dc2626' }}>
                  teraz
                </span>
                <div className="flex gap-1">
                  {(['tymek', 'zuzia'] as Strona[]).map((k) => (
                    <Twarz
                      key={k}
                      kto={k}
                      ksztalt={werdykt.ok ? { brwi: 0.3, oczy: 0.2, usta: 0.7 } : twarzNapiecia(k, stare[k])}
                      size={56}
                      label={IMIE[k]}
                    />
                  ))}
                </div>
                <span className="text-center text-xs text-muted-foreground">{werdykt.ok ? 'kleją razem' : 'tak samo jak przedtem'}</span>
              </div>
            </div>
            {werdykt.ok ? (
              <>
                <p className="flex items-start gap-2 text-sm leading-relaxed sm:text-base">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  Ten sam spór, inne zdanie — i inna taśma. Mówisz, co czujesz, co się stało i o co prosisz. Nikt nie musi się bronić.
                </p>
                {sukces.length === 1 && (
                  <p className="text-sm text-muted-foreground">Spróbuj jeszcze z drugiej strony — jako {IMIE[druga]}.</p>
                )}
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold">Po swojemu (nieobowiązkowo)</p>
                  <p className="text-sm text-muted-foreground">Możesz zmienić słowa. Do Teczki trafi to, co tu zostawisz.</p>
                  <div className="mt-2">
                    <Pisarnia
                      value={wlasne}
                      onChange={(v) => {
                        setWlasne(v);
                        setZapisane(false);
                      }}
                      color={color}
                      label="Twój komunikat"
                      marks={[]}
                      analysis={analiza}
                      minRows={2}
                      maxLength={300}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={zapiszWlasne}
                    disabled={!wlasne.trim() || zapisane}
                    className="mt-2 inline-flex items-center gap-2 border px-3 py-1.5 text-sm disabled:opacity-50"
                    style={{ borderColor: color }}
                  >
                    {zapisane ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden /> Zapisane w Teczce
                      </>
                    ) : (
                      'Zapisz w Teczce'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm leading-relaxed sm:text-base">
                  Słowo „{'slowo' in werdykt ? werdykt.slowo : ''}” to oskarżenie z pierwszej taśmy. Podmień ten pasek.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setWerdykt(null);
                    setKrok(0);
                  }}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Popraw
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <DragGhost drag={drag.drag}>
        {draggedLabel && <span className="block max-w-[260px] border bg-white px-2 py-1 text-sm dark:bg-zinc-900">{draggedLabel}</span>}
      </DragGhost>
    </div>
  );
}
