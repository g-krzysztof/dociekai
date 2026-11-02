'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { KorpusText, type KorpusMark } from '../../korpus/korpus-text';
import { HASLA_KURSU } from '../../../data/slownik/hasla';
import { KORPUSY, ZDANIA, ocenSlowo, tekstOceny, type ZdanieKameleon } from './kameleon';
import { Rysunek } from './rysunki';

/**
 * L10 blok 2 — „Słowo-kameleon”. Dziecko przeciąga numer znaczenia z hasła
 * na zdanie (albo stuka numer, potem zdanie), a potem stuka słowo, które to
 * znaczenie przesądza. Zły numer daje skutek („rycerze w kurtce?”), nie ocenę.
 * Dwie rundy: zamek, potem klucz.
 */

export interface StanKameleona {
  /** id zdania → przypisany (zawsze właściwy) numer znaczenia. */
  numer: Record<string, number>;
  /** id zdania → stuknięta kotwica. */
  kotwica: Record<string, string>;
}

const HASLA = ['zamek', 'klucz'] as const;

interface Props {
  color: string;
  initial?: StanKameleona | null;
  onState?: (s: StanKameleona) => void;
  onComplete: () => void;
}

export function SlowoKameleon({ color, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanKameleona>(() => initial ?? { numer: {}, kotwica: {} });
  const [wybrany, setWybrany] = useState<number | null>(null);
  const [zle, setZle] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [stukniete, setStukniete] = useState<Record<string, string[]>>({});

  const gotowe = (z: ZdanieKameleon) => stan.numer[z.id] != null && stan.kotwica[z.id] != null;
  const runda = HASLA.findIndex((h) => !ZDANIA.filter((z) => z.haslo === h).every(gotowe));
  const haslo = HASLA[runda < 0 ? HASLA.length - 1 : runda];
  const wszystko = runda < 0;
  const wpis = HASLA_KURSU[haslo];
  const nazwy = wpis.znaczenia.map((z) => z.nazwa);
  const wpisZdania = (z: ZdanieKameleon) => HASLA_KURSU[z.haslo];
  // Bieżąca runda na górze (blisko hasła), zrobione rundy pod nią.
  const zdania = [...ZDANIA.filter((z) => z.haslo === haslo), ...ZDANIA.filter((z) => z.haslo !== haslo && HASLA.indexOf(z.haslo) < HASLA.indexOf(haslo))];

  const zmien = (nowy: StanKameleona) => {
    setStan(nowy);
    onState?.(nowy);
    if (ZDANIA.every((z) => nowy.numer[z.id] != null && nowy.kotwica[z.id] != null)) onComplete();
  };

  const przypisz = (n: number, zid: string) => {
    const z = ZDANIA.find((x) => x.id === zid);
    if (!z || z.haslo !== haslo || stan.numer[zid] != null) return;
    setWybrany(null);
    if (n !== z.znaczenie) {
      setZle((p) => ({ ...p, [zid]: n }));
      setMsg((p) => ({ ...p, [zid]: `${z.absurd[n]} Spróbuj innego numeru.` }));
      return;
    }
    setZle((p) => ({ ...p, [zid]: 0 }));
    setMsg((p) => ({ ...p, [zid]: 'Pasuje. Teraz stuknij słowo, które o tym przesądza.' }));
    zmien({ ...stan, numer: { ...stan.numer, [zid]: n } });
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target?.startsWith('zd:')) przypisz(Number(id.slice(2)), target.slice(3));
    },
    onTap: (id) => setWybrany((w) => (w === Number(id.slice(2)) ? null : Number(id.slice(2)))),
    disabled: wszystko,
  });

  const stuknijSlowo = (z: ZdanieKameleon, tokenId: string) => {
    if (stan.numer[z.id] == null || stan.kotwica[z.id] != null) return;
    const k = KORPUSY[z.id];
    const forma = k.tokenById[tokenId]?.form ?? '';
    const o = ocenSlowo(z, tokenId);
    setMsg((p) => ({ ...p, [z.id]: tekstOceny(o, forma, haslo, nazwy) }));
    setStukniete((p) => ({ ...p, [z.id]: [...(p[z.id] ?? []), tokenId] }));
    if (o.rodzaj === 'kotwica') zmien({ ...stan, kotwica: { ...stan.kotwica, [z.id]: tokenId } });
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {/* Hasło w słowniku kursu — numery znaczeń to żetony. */}
      <div className="border bg-[#fbf9f3] p-3 dark:bg-zinc-800 sm:p-4" style={{ borderColor: color }}>
        <p className="font-serif text-2xl font-bold">{wpis.haslo}</p>
        <ol className="mt-1 space-y-0.5 text-xs leading-snug text-muted-foreground sm:text-sm">
          {wpis.znaczenia.map((zn, i) => (
            <li key={i}>
              <span className="font-mono font-bold">{i + 1}.</span> {zn.tekst}
            </li>
          ))}
        </ol>
        <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Numery znaczeń">
          {wpis.znaczenia.map((zn, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                type="button"
                {...drag.bind(`n:${n}`)}
                aria-pressed={wybrany === n}
                aria-label={`Znaczenie ${n}: ${zn.nazwa}`}
                className="flex touch-none flex-col items-center gap-0.5 border bg-white p-1.5 text-xs dark:bg-zinc-900"
                style={wybrany === n ? { outline: `3px solid ${color}`, outlineOffset: 1 } : undefined}
              >
                <span className="flex items-center gap-1.5" style={{ color }}>
                  <span className="flex h-6 w-6 items-center justify-center font-mono text-sm font-bold text-white" style={{ background: color }}>
                    {n}
                  </span>
                  {zn.rysunek && <Rysunek kind={zn.rysunek} className="pointer-events-none h-7 w-9" />}
                </span>
                <span className="leading-tight">{zn.nazwa}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Słownik kursu — znaczenia napisane dla tej lekcji.</p>
      </div>

      <p className="mt-4 text-sm leading-relaxed sm:text-base">
        {wybrany != null
          ? `Numer ${wybrany} w ręku — stuknij zdanie, do którego pasuje.`
          : `Przeciągnij numer znaczenia na zdanie (albo stuknij numer, potem zdanie). Potem stuknij słowo, które o znaczeniu przesądza.`}
      </p>

      <ul className="mt-3 space-y-3">
        {zdania.map((z) => {
          const n = stan.numer[z.id];
          const kot = stan.kotwica[z.id];
          const zly = zle[z.id];
          const marks: Record<string, KorpusMark> = {};
          for (const t of stukniete[z.id] ?? []) marks[t] = 'dim';
          if (kot) marks[kot] = 'ok';
          const hover = drag.hover === `zd:${z.id}`;
          return (
            <li
              key={z.id}
              data-drop={n == null ? `zd:${z.id}` : undefined}
              onClick={() => wybrany != null && przypisz(wybrany, z.id)}
              className="flex items-start gap-3 border p-3"
              style={hover || (wybrany != null && n == null) ? { borderColor: color, borderStyle: 'dashed', borderWidth: 2 } : undefined}
            >
              <span
                className="flex h-14 w-16 shrink-0 flex-col items-center justify-center border"
                style={n != null ? { borderColor: color, color } : { color: '#a8a29e' }}
              >
                {n != null ? (
                  <>
                    <Rysunek kind={wpisZdania(z).znaczenia[n - 1].rysunek!} className="h-8 w-12" />
                    <span className="font-mono text-xs font-bold">{n}</span>
                  </>
                ) : zly ? (
                  <Rysunek kind={wpisZdania(z).znaczenia[zly - 1].rysunek!} className="h-8 w-12 opacity-40" />
                ) : (
                  <span className="font-mono text-lg">?</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <KorpusText
                  korpus={KORPUSY[z.id]}
                  color={color}
                  pick={n != null && !kot ? 'word' : 'none'}
                  onPick={(id) => stuknijSlowo(z, id)}
                  marks={marks}
                  className="font-serif text-lg"
                />
                <p className="mt-1 min-h-[2.5rem] text-sm leading-snug text-muted-foreground" aria-live="polite">
                  {kot && <Check className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />}
                  {msg[z.id] ?? ''}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {runda === 1 && (
        <p className="mt-3 text-sm text-muted-foreground">Zamek zrobiony. Teraz inne słowo z trzema znaczeniami: klucz.</p>
      )}
      {wszystko && (
        <p className="mt-3 text-sm leading-relaxed sm:text-base">
          Samo słowo „{haslo}” nie mówi, o co chodzi. Mówią to słowa obok — wzgórze, piwnica, kurtka, wycieraczka, nuta, gęsi.
        </p>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && (
          <span className="flex h-9 w-9 items-center justify-center font-mono text-lg font-bold text-white" style={{ background: color }}>
            {drag.drag.id.slice(2)}
          </span>
        )}
      </DragGhost>
    </div>
  );
}
