'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { akapity, braki, frazyOtwarcia, gotowa, jestWWidocznych, podziel, PYTANIE, type Otwarcie, type Rola } from './makieta';
import { Scenka } from './scenka';

/**
 * Makieta (L18, bloki 1 i 3): tekst pod (albo obok) scenki. Stuknięcie
 * wyrazu podnosi **całą frazę** wokół niego (zakres wyznacza adnotacja) —
 * fraza ląduje „w ręce” jako pasek papieru, który dziecko przeciąga na
 * scenę (albo stuka scenę). Teatr sam stawia ją według roli. Wyraz spoza
 * fraz nic nie stawia.
 */

export interface StanMakiety {
  postawione: string[];
  widoczne: number;
}

const GDZIE: Record<Rola, string> = {
  tlo: 'opuszcza się z szyny jako tło.',
  lampa: 'zapala lampę — niebo zmienia kolor.',
  deski: 'wjeżdża na patyczku na deski.',
  tasma: 'wsuwa się na taśmę i gra na scenie.',
  narrator: 'nie jest rzeczą ze świata opowieści — ktoś to mówi, ktoś to wie. Bierze to ręka zza kulis.',
};

export function MakietaBlok({
  otwarcie,
  body,
  color,
  initial,
  onState,
  onComplete,
}: {
  otwarcie: Otwarcie;
  /** `ODC_1.body` książki. */
  body: string;
  color: string;
  initial: StanMakiety | null;
  onState: (s: StanMakiety) => void;
  onComplete: () => void;
}) {
  const frazy = useMemo(() => frazyOtwarcia(otwarcie), [otwarcie]);
  const teksty = useMemo(() => akapity(body).slice(0, otwarcie.frazy.length), [body, otwarcie]);
  const kawalki = useMemo(() => teksty.map((t, i) => podziel(t, frazy.filter((f) => f.akapit === i))), [teksty, frazy]);

  const [postawione, setPostawione] = useState<string[]>(initial?.postawione ?? []);
  const [widoczne, setWidoczne] = useState(initial?.widoczne ?? otwarcie.start);
  const [trzyma, setTrzyma] = useState<string | null>(null);
  const [ostatnia, setOstatnia] = useState<string | null>(null);
  const [komunikat, setKomunikat] = useState<{ tekst: string; ton: 'ok' | 'info' } | null>(null);
  const [puste, setPuste] = useState<string | null>(null);
  const zgloszone = useRef(!!initial && gotowa(frazy, initial.postawione));

  const fraza = (id: string | null) => (id ? frazy.find((f) => f.id === id) ?? null : null);
  const trzymana = fraza(trzyma);
  const b = braki(frazy, postawione);
  const skonczona = gotowa(frazy, postawione);

  useEffect(() => {
    if (skonczona && !zgloszone.current) {
      zgloszone.current = true;
      onComplete();
    }
  }, [skonczona, onComplete]);

  const postaw = () => {
    const f = trzymana;
    if (!f) return;
    const nowe = postawione.includes(f.id) ? postawione : [...postawione, f.id];
    setPostawione(nowe);
    setOstatnia(f.id);
    setTrzyma(null);
    setKomunikat({ tekst: `„${f.tekst}” ${GDZIE[f.rola]}`, ton: f.rola === 'narrator' ? 'info' : 'ok' });
    onState({ postawione: nowe, widoczne });
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (_id, target) => {
      if (target === 'scena') postaw();
    },
    onTap: () => setKomunikat({ tekst: 'Przeciągnij pasek na scenę albo stuknij scenę.', ton: 'info' }),
  });

  const stuknij = (k: { tekst: string; fraza?: string }, klucz: string) => {
    if (!k.fraza) {
      setTrzyma(null);
      setPuste(klucz);
      setKomunikat({ tekst: `„${k.tekst}” — to słowo samo nic nie stawia. Stuknij słowo, które coś nazywa: weźmiesz całą frazę.`, ton: 'info' });
      return;
    }
    setPuste(null);
    if (postawione.includes(k.fraza)) {
      setTrzyma(null);
      setKomunikat({ tekst: `„${fraza(k.fraza)!.tekst}” już stoi na scenie.`, ton: 'info' });
      return;
    }
    setTrzyma(k.fraza);
    setKomunikat(null);
  };

  const dalej = () => {
    const w = Math.min(widoczne + 1, teksty.length);
    setWidoczne(w);
    onState({ postawione, widoczne: w });
  };

  // Czego szukać teraz: pierwsze puste miejsce; jeśli w widocznym tekście go nie ma — czytaj dalej.
  const brakMiejsca = b.miejsca[0] ?? null;
  const szukaj: Rola | null = brakMiejsca ?? (b.reka ? null : 'narrator');
  const trzebaDalej = !!szukaj && !jestWWidocznych(frazy, widoczne, szukaj) && widoczne < teksty.length;
  const podpowiedz = skonczona
    ? null
    : brakMiejsca
      ? PYTANIE[brakMiejsca]
      : 'Scena stoi. A czy ktoś za kulisami coś mówi? Poszukaj słów, które nie są rzeczą ze świata opowieści.';

  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      <div className="space-y-2">
        <Scenka frazy={frazy} postawione={postawione} ostatnia={ostatnia} hover={hover === 'scena'} trzyma={!!trzymana} onTap={postaw} />
        {/* pasek w ręce — zawsze ta sama wysokość (bez skoku) */}
        <div className="flex min-h-[2.75rem] items-center gap-2 border border-dashed px-2 py-1">
          {trzymana ? (
            <>
              <span className="shrink-0 text-xs text-muted-foreground">W ręce:</span>
              <button
                type="button"
                {...bind(trzymana.id)}
                className="min-w-0 cursor-grab touch-none border border-[#5b4636]/50 bg-[#fffaf0] px-2 py-1 text-left font-serif text-sm text-stone-800 shadow-sm dark:text-stone-800"
              >
                {trzymana.tekst}
              </button>
              <span className="hidden text-xs text-muted-foreground sm:inline">→ na scenę</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Stuknij słowo w tekście — weźmiesz całą frazę i przeniesiesz ją na scenę.</span>
          )}
        </div>
        <p className="min-h-[2.5rem] text-sm leading-snug" aria-live="polite" style={komunikat?.ton === 'ok' ? { color } : undefined}>
          {komunikat?.tekst ?? podpowiedz ?? ''}
        </p>
      </div>

      <div className="border bg-white p-3 dark:bg-zinc-900/80 sm:p-4">
        <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-1 font-serif text-base leading-relaxed lg:max-h-[26rem]">
          {kawalki.slice(0, widoczne).map((akapit, i) => (
            <p key={i}>
              {akapit.map((k, j) => {
                if (!k.wyraz) return <span key={j}>{k.tekst}</span>;
                const klucz = `${i}-${j}`;
                const stoi = k.fraza && postawione.includes(k.fraza);
                const wRece = k.fraza && k.fraza === trzyma;
                return (
                  <span
                    key={j}
                    role="button"
                    tabIndex={-1}
                    onClick={() => stuknij(k, klucz)}
                    className={`cursor-pointer transition-colors ${puste === klucz ? 'bg-stone-200 dark:bg-stone-700' : ''}`}
                    style={wRece ? { background: `${color}33`, boxShadow: `inset 0 -2px 0 ${color}` } : stoi ? { background: `${color}14` } : undefined}
                  >
                    {k.tekst}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
        {widoczne < teksty.length && (
          <button
            type="button"
            onClick={dalej}
            className="mt-3 flex items-center gap-2 border px-3 py-1.5 text-sm font-medium"
            style={trzebaDalej ? { borderColor: color, color } : undefined}
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Czytaj dalej
          </button>
        )}
        {trzebaDalej && <p className="mt-2 text-sm text-muted-foreground">Tego jeszcze w tekście nie ma. Czytaj dalej — opowieść ci powie.</p>}
      </div>

      <DragGhost drag={drag}>
        <span className="border border-[#5b4636]/50 bg-[#fffaf0] px-2 py-1 font-serif text-sm text-stone-800">{trzymana?.tekst}</span>
      </DragGhost>
    </div>
  );
}
