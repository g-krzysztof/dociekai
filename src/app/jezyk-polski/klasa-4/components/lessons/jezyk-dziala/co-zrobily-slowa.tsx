'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Check, Eraser } from 'lucide-react';
import { Twarz } from '../../twarz/twarz';
import { buildKorpus } from '../../../lib/korpus';
import { tokenAtPoint } from '../../../lib/korpus/judges';
import { PORANEK } from './poranek';
import { KADRY, MAX_STARTYCH, ocenGumke, tekstFragmentu, type Kadr, type WynikGumki } from './gumka';
import { SKUTKI, SKUTEK_LABEL, SKUTEK_LABEL_JEDNO, type Skutek } from './skutki';

/**
 * L1, blok 2 „Co zrobiły słowa” — **gest: gumka.** (Przebudowa 2026-10-19, R5:
 * wcześniej para stuknięć „słowo →
 * dowód” na tekście z lektorem.) „Poranek przy Lipowej” to pięć kadrów:
 * kwestia w dymku, pod nią twarz i reakcja odbiorcy. Dziecko ściera słowa
 * gumką (pociągnięcie palcem albo stuknięcie słowa); kadr gra bez nich. Jeśli
 * zniknął skutek, którego szuka polecenie, to te słowa go zrobiły — dowód
 * rodzi się z działania dziecka. Sędzia: `ocenGumke` w `gumka.ts`.
 */

const KORPUS = buildKorpus(PORANEK);
const HOLD_MS = 2400;

interface Slowo {
  id: string;
  form: string;
  word: boolean;
  after: string;
}

function slowaKadru(id: string): Slowo[] {
  const ids = KORPUS.spans[id]?.tokenIds ?? [];
  const out = ids.map((t, i) => {
    const tok = KORPUS.tokenById[t];
    return { id: t, form: tok.form, word: tok.type !== 'punct', after: i < ids.length - 1 ? tok.after : '' };
  });
  // Myślnik dialogowy na początku nie jest częścią dymka.
  while (out.length && out[0].form === '—') out.shift();
  return out;
}

const SLOWA: Record<string, Slowo[]> = Object.fromEntries(KADRY.map((k) => [k.id, slowaKadru(k.id)]));

interface Props {
  color: string;
  onComplete: () => void;
  /** Zapis ukończonego bloku — po odświeżeniu znalezione słowa wracają. */
  restored?: { found: Record<string, string[]> } | null;
  onSave?: (value: { found: Record<string, string[]> }) => void;
}

interface Pokaz {
  kadr: Kadr['id'];
  starte: string[];
  wynik: WynikGumki;
}

export function CoZrobilySlowa({ color, onComplete, restored, onSave }: Props) {
  const [active, setActive] = useState<Skutek['kind']>(SKUTKI[0].kind);
  const [found, setFound] = useState<Partial<Record<Skutek['kind'], string[]>>>({});
  const [pokaz, setPokaz] = useState<Pokaz | null>(null);
  const [msg, setMsg] = useState('Zetrzyj gumką słowa w dymku — pociągnij po nich palcem albo stuknij słowo. Patrz, co się stanie z odbiorcą.');

  const done = Object.keys(found).length === SKUTKI.length;
  const skutek = SKUTKI.find((s) => s.kind === active)!;

  useEffect(() => {
    if (!restored) return;
    setFound(restored.found as Partial<Record<Skutek['kind'], string[]>>);
    setMsg('Ten blok masz już za sobą — podkreślone słowa to te, które znalazłeś/aś.');
  }, [restored]);

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  // Po chwili starte słowa wracają, a kadr gra jak w tekście.
  useEffect(() => {
    if (!pokaz) return;
    const t = window.setTimeout(() => setPokaz(null), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [pokaz]);

  const zetrzyj = (kadrId: Kadr['id'], tokenIds: string[]) => {
    if (done || !tokenIds.length) return;
    const formy = tokenIds.map((id) => KORPUS.tokenById[id].form);
    const wynik = ocenGumke(kadrId, formy, active);
    setPokaz({ kadr: kadrId, starte: tokenIds, wynik });
    const label = SKUTEK_LABEL[wynik.kadr.kind];
    const jedno = tokenIds.length === 1;
    if (wynik.wynik === 'trafione') {
      const next = { ...found, [active]: wynik.klucz };
      setFound(next);
      const left = SKUTKI.find((s) => !next[s.kind]);
      // Komunikat mówi, której zakładki dotyczy — zakładka zaraz przeskoczy na następną.
      setMsg(`„${skutek.label}” — zaliczone. ${wynik.kadr.wyjasnienie}${left ? ` Teraz: słowa, które ${left.verb}.` : ''}`);
      if (left) setActive(left.kind);
      else onSave?.({ found: next as Record<string, string[]> });
    } else if (wynik.wynik === 'inny-skutek') {
      setMsg(
        `W tym kadrze zmieniła się reakcja — ale ${jedno ? 'to słowo' : 'te słowa'} ${jedno ? SKUTEK_LABEL_JEDNO[wynik.kadr.kind] : label}, a szukamy słów, które ${skutek.verb}.`
      );
    } else if (wynik.wynik === 'za-duzo') {
      setMsg(`Zniknęło dużo naraz. Które słowo naprawdę to robiło? Zetrzyj najwyżej ${MAX_STARTYCH}.`);
    } else {
      setMsg(`Reakcja się nie zmieniła — ${jedno ? 'to słowo tego nie robiło' : 'te słowa tego nie robiły'}. Spróbuj innych.`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Polecenia">
          {SKUTKI.map((s) => (
            <button
              key={s.kind}
              type="button"
              role="tab"
              aria-selected={active === s.kind}
              onClick={() => {
                if (s.kind === active) return;
                setActive(s.kind);
                // Komunikat po poprzedniej zakładce nie może wisieć pod nowym poleceniem.
                if (!done) setMsg(found[s.kind] ? 'To polecenie masz już wykonane.' : 'Zetrzyj gumką słowa w dymku i patrz, co się stanie z odbiorcą.');
              }}
              className="inline-flex items-center gap-1 border px-2.5 py-1 text-sm"
              style={{
                borderColor: active === s.kind ? color : undefined,
                fontWeight: active === s.kind ? 600 : undefined,
                color: found[s.kind] ? color : undefined,
              }}
            >
              {found[s.kind] && <Check className="h-3.5 w-3.5" aria-hidden />}
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold sm:text-base">
          {done ? 'Wszystkie polecenia wykonane.' : `Znajdź słowa, które ${skutek.verb} — zetrzyj je i zobacz, co zniknie.`}
        </p>
        <p aria-live="polite" className="mt-1 min-h-[2.75rem] text-sm text-muted-foreground" data-testid="skutki-msg">
          {msg}
        </p>
      </div>

      <p className="text-xs uppercase tracking-wide text-muted-foreground">Poranek przy Lipowej · tekst napisany dla kursu</p>
      <ol className="grid gap-3 md:grid-cols-2">
        {KADRY.map((k, i) => (
          <KadrView
            key={k.id}
            kadr={k}
            nr={i + 1}
            color={color}
            pokaz={pokaz?.kadr === k.id ? pokaz : null}
            znalezione={found[k.kind] ?? null}
            disabled={done}
            onZetrzyj={(ids) => zetrzyj(k.id, ids)}
          />
        ))}
      </ol>

      {done && (
        <p className="border-l-4 px-3 py-2 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
          Niektóre słowa same są czynnością — „przepraszam”, „dziękuję”. Czasem skutek robi słowo razem z resztą zdania:
          śmieszy kot, który czyta; obiecuje to, kto, co i kiedy naprawi. Ale zawsze robią go słowa. Słowa nie tylko coś znaczą — one coś{' '}
          <strong>robią</strong>: przepraszają, obiecują, dziękują, rozśmieszają, ranią.
        </p>
      )}
    </div>
  );
}

function KadrView({
  kadr,
  nr,
  color,
  pokaz,
  znalezione,
  disabled,
  onZetrzyj,
}: {
  kadr: Kadr;
  nr: number;
  color: string;
  pokaz: Pokaz | null;
  znalezione: string[] | null;
  disabled: boolean;
  onZetrzyj: (ids: string[]) => void;
}) {
  const slowa = SLOWA[kadr.id];
  const bubbleRef = useRef<HTMLDivElement>(null);
  const stroke = useRef<{ rects: { id: string; rect: DOMRect }[]; ids: Set<string>; last: { x: number; y: number } } | null>(null);
  /** Pociągnięcie właśnie się skończyło — następny `click` na słowie to jego echo, nie osobne stuknięcie. */
  const justStroked = useRef(false);
  const [rubbing, setRubbing] = useState<Set<string> | null>(null);

  const starte = rubbing ?? (pokaz ? new Set(pokaz.starte) : null);
  const zmienione = pokaz && pokaz.wynik.wynik !== 'zostal';
  const trafione = pokaz?.wynik.wynik === 'trafione';
  const reakcja = zmienione ? kadr.bez.reakcja : tekstFragmentu(KORPUS, kadr.reakcja);

  const wordRects = () =>
    [...(bubbleRef.current?.querySelectorAll<HTMLElement>('[data-word]') ?? [])].map((el) => ({
      id: el.dataset.token!,
      rect: el.getBoundingClientRect(),
    }));

  /** Gumka zbiera słowa wzdłuż całej drogi palca — także gdy zdarzenia ruchu przychodzą rzadko. */
  const touch = (x: number, y: number) => {
    const s = stroke.current;
    if (!s) return;
    const steps = Math.max(1, Math.ceil(Math.hypot(x - s.last.x, y - s.last.y) / 6));
    let changed = false;
    for (let i = 1; i <= steps; i++) {
      const id = tokenAtPoint(s.rects, s.last.x + ((x - s.last.x) * i) / steps, s.last.y + ((y - s.last.y) * i) / steps, 6);
      if (id && !s.ids.has(id)) {
        s.ids.add(id);
        changed = true;
      }
    }
    s.last = { x, y };
    if (changed) setRubbing(new Set(s.ids));
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* syntetyczne zdarzenia */
    }
    justStroked.current = false;
    stroke.current = { rects: wordRects(), ids: new Set(), last: { x: e.clientX, y: e.clientY } };
    touch(e.clientX, e.clientY);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!stroke.current) return;
    touch(e.clientX, e.clientY);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (stroke.current && e.type === 'pointerup') touch(e.clientX, e.clientY);
    const s = stroke.current;
    stroke.current = null;
    setRubbing(null);
    if (s && s.ids.size) {
      justStroked.current = true;
      onZetrzyj([...s.ids]);
    }
  };

  // Stuknięcie bez zdarzeń wskaźnika (czytnik ekranu, sterowanie bez myszy) też ściera słowo.
  const onClickWord = (id: string) => () => {
    if (justStroked.current) {
      justStroked.current = false;
      return;
    }
    if (disabled) return;
    onZetrzyj([id]);
  };

  const onKey = (id: string) => (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onZetrzyj([id]);
    }
  };

  const znalezioneSet = new Set((znalezione ?? []).map((s) => s.toLowerCase()));

  return (
    <li className="border bg-white p-3 dark:bg-zinc-900/80" style={{ borderColor: znalezione ? color : undefined }} data-kadr={kadr.id}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {nr}. {kadr.podpis}
        </span>
        {znalezione && (
          <span className="inline-flex items-center gap-1 font-semibold" style={{ color }}>
            <Check className="h-3.5 w-3.5" aria-hidden /> {SKUTEK_LABEL[kadr.kind]}
          </span>
        )}
      </div>
      <div
        ref={bubbleRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={`relative mt-2 select-none border-2 px-3 py-2 text-[15px] leading-relaxed ${disabled ? '' : 'touch-none cursor-crosshair'}`}
        style={{ borderColor: '#1f2937', backgroundColor: 'var(--background)' }}
        aria-label={`Dymek: ${slowa.map((s) => s.form + s.after).join('')}`}
      >
        {slowa.map((s) =>
          s.word ? (
            <span key={s.id}>
              <span
                data-word=""
                data-token={s.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={disabled ? undefined : onKey(s.id)}
                onClick={onClickWord(s.id)}
                aria-label={`zetrzyj: ${s.form}`}
                className="transition-opacity duration-150"
                style={{
                  opacity: starte?.has(s.id) ? 0.12 : 1,
                  boxShadow: znalezioneSet.has(s.form.toLowerCase()) ? `inset 0 -3px 0 ${color}` : undefined,
                  fontWeight: znalezioneSet.has(s.form.toLowerCase()) ? 600 : undefined,
                }}
              >
                {s.form}
              </span>
              {s.after}
            </span>
          ) : (
            <span key={s.id} style={{ opacity: starte ? 0.6 : 1 }}>
              {s.form}
              {s.after}
            </span>
          )
        )}
        {!disabled && <Eraser className="pointer-events-none absolute -right-2 -top-2 h-4 w-4 bg-background text-muted-foreground" aria-hidden />}
      </div>
      <div className="mt-2 flex min-h-[4.5rem] items-start gap-3" aria-live="polite">
        <Twarz
          kto={kadr.slucha}
          mina={zmienione ? kadr.bez.mina : kadr.twarz.mina}
          ksztalt={zmienione ? undefined : kadr.twarz.ksztalt}
          size={56}
          label={kadr.podpis.split(' do ')[1] ?? ''}
        />
        <p
          className="text-sm italic leading-snug"
          style={{ color: zmienione ? (trafione ? color : '#b45309') : undefined }}
          data-testid={`reakcja-${kadr.id}`}
        >
          {reakcja}
        </p>
      </div>
    </li>
  );
}
