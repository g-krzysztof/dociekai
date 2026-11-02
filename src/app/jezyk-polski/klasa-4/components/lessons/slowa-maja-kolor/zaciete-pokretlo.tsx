'use client';

import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import {
  MIN_ZGODNYCH,
  POCZTOWKA,
  POCZTOWKA_NAGLOWEK,
  POCZTOWKA_PODPIS,
  POCZTOWKA_START,
  ocenPocztowke,
  wyraz,
  type Biegun,
  type Miejsce,
  type Wyraz,
} from './kolory';

/**
 * L11 blok 2 — „Zacięte pokrętło” `[3.6]`. Pocztówka ma pomieszane
 * zabarwienie. Dziecko wybiera, co ma być (zachwyt albo narzekanie), stuka
 * słowo — wysuwa się szufladka z trzema wyrazami bliskoznacznymi — i przeciąga
 * jeden na tekst (albo stuka go). Sędzia czyta biegun z danych, a szufladka
 * pokazuje kawałek słowa, który niesie opinię (zdrobnienie, zgrubienie), więc
 * dziecko widzi, skąd werdykt — to nie klucz autora.
 */

export interface StanPocztowki {
  cel: Biegun | null;
  slowa: Record<string, Biegun>;
  wyslana: boolean;
}

interface Props {
  color: string;
  initial?: StanPocztowki | null;
  onState?: (s: StanPocztowki) => void;
  onComplete: () => void;
}

const BIEGUNY: Biegun[] = [1, 0, -1];

function ZeZnakiem({ w, color }: { w: Wyraz; color: string }) {
  if (!w.znak) return <>{w.tekst}</>;
  const i = w.tekst.lastIndexOf(w.znak);
  return (
    <>
      {w.tekst.slice(0, i)}
      <strong className="underline decoration-2 underline-offset-2" style={{ color }}>
        {w.znak}
      </strong>
      {w.tekst.slice(i + w.znak.length)}
    </>
  );
}

export function ZacietePokretlo({ color, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanPocztowki>(() => initial ?? { cel: null, slowa: { ...POCZTOWKA_START }, wyslana: false });
  const [otwarte, setOtwarte] = useState<string | null>(null);
  const [werdykt, setWerdykt] = useState<ReturnType<typeof ocenPocztowke> | null>(null);
  const [msg, setMsg] = useState('');

  const zapisz = (s: StanPocztowki) => {
    setStan(s);
    onState?.(s);
  };

  const wstaw = (miejsce: string, b: Biegun) => {
    if (stan.wyslana) return;
    const m = POCZTOWKA.find((x) => x.id === miejsce)!;
    if (stan.slowa[miejsce] === b) return;
    zapisz({ ...stan, slowa: { ...stan.slowa, [miejsce]: b } });
    setWerdykt(null);
    const w = wyraz(m, b);
    setMsg(w.cecha ?? `„${w.tekst}” — słowo zwyczajne, bez opinii.`);
  };

  const drag = useDragToken({
    onDrop: (tok, target) => {
      const [miejsce, b] = tok.split(':');
      if (target === `slowo:${miejsce}`) wstaw(miejsce, Number(b) as Biegun);
    },
    onTap: (tok) => {
      const [miejsce, b] = tok.split(':');
      wstaw(miejsce, Number(b) as Biegun);
    },
    disabled: stan.wyslana,
  });

  const wybierzCel = (cel: Biegun) => {
    if (stan.wyslana) return;
    zapisz({ ...stan, cel });
    setWerdykt(null);
    setMsg('');
  };

  const wyslij = () => {
    const w = ocenPocztowke(stan.cel, stan.slowa);
    setWerdykt(w);
    setOtwarte(null);
    if (w.ok) {
      zapisz({ ...stan, wyslana: true });
      setMsg('');
      onComplete();
    } else if (w.powod === 'brak-wyboru') setMsg('Najpierw ustaw pokrętło pocztówki: ma być zachwyt czy narzekanie?');
    else if (w.powod === 'odstaja')
      setMsg(
        `Babcia się pogubi: ${w.odstaja.length === 1 ? 'to słowo mówi' : 'te słowa mówią'} co innego niż reszta. Stuknij ${w.odstaja.length === 1 ? 'je' : 'każde'} i wysuń szufladkę.`
      );
    else
      setMsg(
        `Babcia nie wyczyta ani zachwytu, ani narzekania — wszystko brzmi zwyczajnie. Niech co najmniej ${MIN_ZGODNYCH} słowa mówią to, co chcesz.`
      );
  };

  const odstaja = werdykt && !werdykt.ok && werdykt.powod === 'odstaja' ? werdykt.odstaja : [];
  const mOtwarte = POCZTOWKA.find((m) => m.id === otwarte);

  const slowo = (m: Miejsce) => {
    const b = stan.slowa[m.id] ?? 0;
    const zle = odstaja.includes(m.id);
    const akt = otwarte === m.id;
    return (
      <button
        type="button"
        data-drop={`slowo:${m.id}`}
        disabled={stan.wyslana}
        onClick={() => setOtwarte(akt ? null : m.id)}
        className="inline border-b-2 border-dashed px-0.5 font-serif"
        style={{
          borderColor: zle ? '#dc2626' : color,
          background: drag.hover === `slowo:${m.id}` || akt ? `${color}30` : zle ? '#fee2e2' : undefined,
        }}
        data-testid={`slowo-${m.id}`}
        aria-expanded={akt}
      >
        {wyraz(m, b).tekst}
      </button>
    );
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Maszyna się zacięła i pomieszała słowa na pocztówce Antka. Ustaw, co ma być, a potem napraw słowa, które odstają.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Co ma być na pocztówce">
        <span className="text-sm font-medium">Ma być:</span>
        {([1, -1] as Biegun[]).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={stan.cel === c}
            disabled={stan.wyslana}
            onClick={() => wybierzCel(c)}
            className="border-2 px-3 py-1 text-sm font-medium"
            style={stan.cel === c ? { borderColor: color, background: `${color}22` } : undefined}
          >
            {c === 1 ? 'zachwyt' : 'narzekanie'}
          </button>
        ))}
      </div>

      <div className="relative mt-3 border-2 bg-[#fffdf6] p-3 text-base leading-loose dark:bg-zinc-800 sm:p-4 sm:text-lg" style={{ borderColor: '#d6c7a1' }}>
        {stan.wyslana && (
          <span
            className="absolute right-2 top-2 rotate-6 border-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
            style={{ borderColor: color, color }}
          >
            wysłana
          </span>
        )}
        <p className="font-serif">{POCZTOWKA_NAGLOWEK}</p>
        <p className="font-serif">
          {POCZTOWKA.map((m) => (
            <span key={m.id}>
              {m.przed}{' '}
              {slowo(m)}
              {m.po.startsWith('.') ? '' : ' '}
              {m.po}{' '}
            </span>
          ))}
        </p>
        <p className="text-right font-serif">{POCZTOWKA_PODPIS}</p>
      </div>

      {/* Szufladka — zawsze ma swoje miejsce, żeby nic nie skakało. */}
      <div className="mt-3 min-h-[5.5rem] border bg-[#f5efe0] p-2 dark:bg-zinc-800" data-testid="szufladka">
        {mOtwarte && !stan.wyslana ? (
          <>
            <p className="text-xs text-muted-foreground">Szufladka: przeciągnij słowo na pocztówkę albo je stuknij.</p>
            <div className="mt-2 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
              {BIEGUNY.map((b) => {
                const w = wyraz(mOtwarte, b);
                const teraz = (stan.slowa[mOtwarte.id] ?? 0) === b;
                return (
                  <button
                    key={b}
                    type="button"
                    {...drag.bind(`${mOtwarte.id}:${b}`)}
                    disabled={teraz}
                    className="touch-none border bg-white px-3 py-1.5 font-serif text-base disabled:opacity-40 dark:bg-zinc-900"
                  >
                    <ZeZnakiem w={w} color={color} />
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{stan.wyslana ? 'Szufladka zamknięta — pocztówka poszła.' : 'Stuknij słowo na pocztówce, a szufladka się wysunie.'}</p>
        )}
      </div>

      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>

      {!stan.wyslana ? (
        <button type="button" onClick={wyslij} className="mt-1 flex items-center gap-2 border-2 px-3 py-1.5 text-sm font-medium" style={{ borderColor: color }}>
          <Send className="h-4 w-4" aria-hidden />
          Wyślij pocztówkę
        </button>
      ) : (
        <p className="flex items-start gap-2 text-sm leading-relaxed sm:text-base">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Pocztówka mówi jednym głosem: {stan.cel === 1 ? 'zachwyt' : 'narzekanie'}. Opinię niosły końcówki: zdrobnienie (-ek, -ik, -eczek)
            brzmi czule, zgrubienie (-isko, -ysko) — niechętnie. Zostaje na pulpicie.
          </span>
        </p>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && mOtwarte && (
          <span className="block border bg-white px-3 py-1.5 font-serif text-base">{wyraz(mOtwarte, Number(drag.drag.id.split(':')[1]) as Biegun).tekst}</span>
        )}
      </DragGhost>
    </div>
  );
}
