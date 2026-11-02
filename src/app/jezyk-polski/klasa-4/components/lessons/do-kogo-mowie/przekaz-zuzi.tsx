'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Send } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { Twarz } from '../../twarz/twarz';
import { OGLOSZENIE, TACKA, cofnij, kawalki, upusc, werdykt, type Przeklad, type Werdykt } from './ogloszenie';

/**
 * L3, blok 3 „Przekaż Zuzi” — **gest nowy dla kursu: upuszcza prostsze słowo
 * na trudne słowo w tekście.** Ogłoszenie pani dyrektor jest pocięte na
 * kawałki-cele; przy każdym trudnym kawałku Zuzia pyta (jej słownik to dane,
 * widoczne przez reakcję). Zamiennik pasuje tylko do jednego kawałka;
 * stuknięcie zmienionego kawałka przywraca oryginał. „Przekaż” — werdykt z
 * dwóch stron: Zuzia rozumie (zero pytań) i wie to samo (dzień, godzina,
 * obowiązek, strój) — zgubiona informacja daje skutek, nie krzyżyk.
 */

/** Tacka w stałym, przemieszanym porządku (dobre i gubiące informację na zmianę). */
const TACKA_ORDER = ['z6', 'z10', 'z2', 'z9', 'z5', 'z1', 'z7', 'z3', 'z8', 'z4'];

interface Props {
  color: string;
  onComplete: () => void;
}

export function PrzekazZuzi({ color, onComplete }: Props) {
  const [p, setP] = useState<Przeklad>({});
  const [held, setHeld] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [wynik, setWynik] = useState<Werdykt | null>(null);

  useEffect(() => {
    if (wynik?.ok) onComplete();
  }, [wynik, onComplete]);

  const place = (zid: string, kid: string) => {
    const res = upusc(p, zid, kid);
    setHeld(null);
    if (!res.ok) {
      setMsg(res.mowi);
      return;
    }
    setP(res.next);
    setMsg('');
    setWynik(null);
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target?.startsWith('k:')) place(id, target.slice(2));
    },
    onTap: (id) => setHeld((h) => (h === id ? null : id)),
  });

  const used = new Set(Object.values(p));
  const teraz = werdykt(p);
  const pytanie = teraz.niejasne[0];
  // Uśmiech dopiero po werdykcie: znać słowa to jeszcze nie wiedzieć, co robić.
  const mina = pytanie || (wynik && !wynik.ok) ? 'grymas' : wynik?.ok ? 'usmiech' : 'zdziwienie';
  const linia = pytanie
    ? pytanie.pyta
    : wynik?.ok
      ? 'Wszystko rozumiem!'
      : wynik?.zgubione.length
        ? 'Rozumiem… ale co mam zrobić? Patrz niżej.'
        : 'Słowa już znam. Przekaż mi, to zobaczymy, czy wiem, co robić.';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="grid items-start gap-4 sm:grid-cols-[120px_1fr]">
        <div className="flex flex-col items-center">
          <Twarz kto="zuzia" mina={mina} size={110} />
          <p className="text-xs text-muted-foreground">Zuzia, 5 lat</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ogłoszenie pani dyrektor</p>
          <p className="mt-2 text-base leading-[2.6] sm:text-lg">
            {kawalki(p).map((k) => {
              const src = OGLOSZENIE.find((o) => o.id === k.id)!;
              if (k.text === '.') return <span key={k.id}>.{' '}</span>;
              const hot = drag.hover === `k:${k.id}`;
              const unclear = !!src.trudny && !k.zmieniony;
              return (
                <span key={k.id}>
                  <button
                    type="button"
                    data-drop={`k:${k.id}`}
                    onClick={() => {
                      if (held) place(held, k.id);
                      else if (k.zmieniony) {
                        setP((cur) => cofnij(cur, k.id));
                        setWynik(null);
                      }
                    }}
                    className="px-0.5 transition-colors"
                    style={{
                      outline: hot || (held && !k.zmieniony) ? `2px dashed ${color}` : undefined,
                      backgroundColor: k.zmieniony
                        ? 'color-mix(in srgb, #16a34a 14%, transparent)'
                        : unclear
                          ? 'color-mix(in srgb, #f59e0b 14%, transparent)'
                          : undefined,
                      textDecoration: unclear ? 'underline wavy #d97706' : undefined,
                      textUnderlineOffset: '5px',
                    }}
                    aria-label={k.zmieniony ? `${k.text} — stuknij, żeby przywrócić` : k.text}
                  >
                    {k.text}
                  </button>
                  {k.after}
                </span>
              );
            })}
          </p>
          <p className="mt-1 min-h-[2.5rem] border-l-4 bg-stone-50 px-3 py-1.5 text-sm italic dark:bg-zinc-800" style={{ borderColor: '#f4d03f' }} aria-live="polite">
            Zuzia: {linia}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm">Prostsze słowa — przeciągnij na trudny kawałek (albo stuknij słowo, potem kawałek):</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TACKA_ORDER.map((id) => {
          const z = TACKA.find((t) => t.id === id)!;
          // Użyty kafelek zostaje na swoim miejscu, wyszarzony — sąsiedzi nie przeskakują pod palec.
          if (used.has(id))
            return (
              <span key={id} aria-hidden className="border-2 border-dashed px-3 py-1.5 text-sm font-medium text-muted-foreground/40">
                {z.text}
              </span>
            );
          return (
            <button
              key={id}
              type="button"
              {...drag.bind(id)}
              aria-pressed={held === id}
              className="cursor-grab touch-none border-2 bg-white px-3 py-1.5 text-sm font-medium dark:bg-zinc-900"
              style={{ borderColor: held === id ? '#111' : color }}
            >
              {z.text}
            </button>
          );
        })}
      </div>
      <p className="mt-2 min-h-[2.5rem] text-sm text-amber-700 dark:text-amber-400" aria-live="polite">
        {msg}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setWynik(werdykt(p))}
          className="flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color, borderColor: color }}
        >
          <Send className="h-4 w-4" /> Przekaż Zuzi
        </button>
        {Object.keys(p).length > 0 && (
          <button
            type="button"
            onClick={() => {
              setP({});
              setWynik(null);
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Od nowa
          </button>
        )}
      </div>

      <div className="mt-4 min-h-[4.5rem] border-t pt-3 text-sm leading-relaxed sm:text-base" aria-live="polite">
        {wynik &&
          (wynik.ok ? (
            <p>
              <strong>Zuzia zrozumiała i wie to samo:</strong> w poniedziałek o dziewiątej, z ubraniem na WF. Prościej — ale
              ani słowa mniej o tym, co ważne.
            </p>
          ) : (
            <ul className="space-y-1">
              {wynik.niejasne.length > 0 && (
                <li>
                  Zuzia jeszcze nie rozumie: {wynik.niejasne.map((n) => `„${OGLOSZENIE.find((o) => o.id === n.id)!.text}”`).join(', ')}.
                </li>
              )}
              {wynik.zgubione.map((z) => (
                <li key={z.info}>{z.skutek}</li>
              ))}
            </ul>
          ))}
      </div>

      <DragGhost drag={drag.drag}>
        {drag.drag && (
          <span className="block border-2 bg-white px-3 py-1.5 text-sm font-medium" style={{ borderColor: color }}>
            {TACKA.find((t) => t.id === drag.drag!.id)?.text}
          </span>
        )}
      </DragGhost>
    </div>
  );
}
