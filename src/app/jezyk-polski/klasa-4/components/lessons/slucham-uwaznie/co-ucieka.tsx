'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { KorpusText, type KorpusMark } from '../../korpus/korpus-text';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { buildKorpus } from '../../../lib/korpus';
import { AUDIO as MRUCZEK_AUDIO } from './wiadomosci.mruczek.audio';
import { MRUCZEK, ZAKUPY } from './wiadomosci';
import { Odtwarzacz } from './odtwarzacz';
import { TYP_SZCZEGOLU, mruczek, zanotowane, type BladKuchni, type Karma, type Miska, type Nalozone, type Pora, type ReakcjaKota } from './sklep';
import { Kot } from './kot';

/**
 * L5, blok 3 „Co ucieka?” — porównanie własnego notesu z zapisem nagrania:
 * zapalają się szczegóły, które są w notatce, a dziecko widzi wzór na swoich
 * danych (uciekają liczby, cechy, zmiany zdania). Z tego rama notatki ze
 * słuchu: co? ile? jaki? uwaga! Potem druga wiadomość, jedno odsłuchanie, i
 * **gest nowy dla kursu: odmierza porcje do miski** według własnej notatki —
 * Mruczek reaguje. Na końcu wynik obu rund obok siebie.
 */

const ZAK = buildKorpus(ZAKUPY);
const MRU = buildKorpus(MRUCZEK);
const TYP_LABEL = { liczba: 'liczby (ile?)', cecha: 'cechy (jaki?)', zmiana: 'zmiany zdania (uwaga!)', niewiadoma: 'rzecz, o którą trzeba zapytać' } as const;

const RAMA = ['co?', 'ile?', 'jaki? jaka?', 'uwaga!'] as const;
const KARMY: { id: Karma; label: string }[] = [
  { id: 'mokra', label: 'łyżka mokrej karmy' },
  { id: 'sucha', label: 'łyżka suchej karmy' },
  { id: 'mleko', label: 'mleko' },
];

interface Props {
  color: string;
  notatka: string;
  bledy: BladKuchni[];
  onComplete: () => void;
}

export function CoUcieka({ color, notatka, bledy, onComplete }: Props) {
  const noted = useMemo(() => zanotowane(notatka), [notatka]);
  const marks: Record<string, KorpusMark> = {};
  for (const s of Object.keys(TYP_SZCZEGOLU)) marks[s] = noted.has(s) ? 'ok' : 'bad';
  const uciekly = Object.keys(TYP_SZCZEGOLU).filter((s) => !noted.has(s));
  const byTyp = uciekly.reduce<Record<string, number>>((acc, s) => ({ ...acc, [TYP_SZCZEGOLU[s]]: (acc[TYP_SZCZEGOLU[s]] ?? 0) + 1 }), {});

  const [rama, setRama] = useState<string[][]>(() => Array.from({ length: 4 }, () => ['', '', '', '']));
  const [sluchane, setSluchane] = useState(false);
  const onUsed = useCallback(() => setSluchane(true), []);

  return (
    <div className="space-y-5">
      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <p className="text-sm leading-relaxed sm:text-base">
          Tak brzmiała wiadomość. <span className="bg-green-100 px-1 dark:bg-green-900/40">Na zielono</span> — szczegóły, które
          są w twoim notesie; <span className="bg-red-100 px-1 dark:bg-red-900/40">na czerwono</span> — te, które uciekły.
        </p>
        <KorpusText korpus={ZAK} color={color} marks={marks} className="mt-3 text-[15px] leading-7 sm:text-base" />
        <div className="mt-3 border-t pt-3 text-sm leading-relaxed sm:text-base">
          {uciekly.length === 0 ? (
            <p>Nic nie uciekło — świetne ucho. Zobacz jednak, czego trzeba było szukać: liczb, cech i zmian zdania.</p>
          ) : (
            <p>
              Uciekło: {Object.entries(byTyp).map(([t, n]) => `${TYP_LABEL[t as keyof typeof TYP_LABEL]} — ${n}`).join('; ')}.{' '}
              {bledy.length > 0 && `W kuchni pani Haliny było ${bledy.length} ${bledy.length === 1 ? 'kłopot' : bledy.length < 5 ? 'kłopoty' : 'kłopotów'}.`}
            </p>
          )}
          <p className="mt-2">
            Słuchając, łap najpierw to, co najłatwiej ucieka. Notatka ze słuchu ma cztery pytania: <strong>co? ile? jaki? uwaga!</strong>
          </p>
        </div>
      </div>

      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <p className="text-sm leading-relaxed sm:text-base">
          Druga wiadomość. Tym razem <strong>tylko jedno odsłuchanie</strong> — notuj w ramce.
        </p>
        <div className="mt-3">
          <Odtwarzacz manifest={MRUCZEK_AUDIO} limit={1} color={color} title="Pani Halina: karmienie Mruczka" onUsed={onUsed} />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-sm">
            <thead>
              <tr>
                {RAMA.map((h) => (
                  <th key={h} className="border px-1.5 py-1 text-left font-semibold" style={{ color }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rama.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border p-0">
                      <input
                        value={cell}
                        onChange={(e) => setRama((cur) => cur.map((rr, ri) => (ri === r ? rr.map((cc, ci) => (ci === c ? e.target.value.slice(0, 40) : cc)) : rr)))}
                        className="w-full bg-transparent px-1.5 py-1.5 outline-none"
                        aria-label={`Ramka: wiersz ${r + 1}, ${RAMA[c]}`}
                        spellCheck={false}
                        autoCapitalize="off"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sluchane && <Kuchnia color={color} bledyRunda1={bledy.length} onComplete={onComplete} />}
    </div>
  );
}

/** Kuchnia pani Haliny: dwie miski, łyżki karmy przeciągane do miski, pora dnia. */
function Kuchnia({ color, bledyRunda1, onComplete }: { color: string; bledyRunda1: number; onComplete: () => void }) {
  const [pora, setPora] = useState<Pora>('rano');
  const [nal, setNal] = useState<Record<Pora, Nalozone>>({ rano: {}, wieczor: {} });
  const [reakcje, setReakcje] = useState<Record<Pora, ReakcjaKota | null>>({ rano: null, wieczor: null });
  const [pomylki, setPomylki] = useState(0);
  const [held, setHeld] = useState<Karma | null>(null);
  const done = !!reakcje.rano?.ok && !!reakcje.wieczor?.ok;

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const put = (karma: Karma, miska: Miska) => {
    setHeld(null);
    setReakcje((r) => ({ ...r, [pora]: null }));
    setNal((cur) => {
      const key = `${miska}:${karma}`;
      return { ...cur, [pora]: { ...cur[pora], [key]: (cur[pora][key] ?? 0) + 1 } };
    });
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target?.startsWith('miska:')) put(id as Karma, target.slice(6) as Miska);
    },
    onTap: (id) => setHeld((h) => (h === id ? null : (id as Karma))),
  });

  const podaj = () => {
    const r = mruczek(pora, nal[pora]);
    if (!r.ok) setPomylki((p) => p + 1);
    setReakcje((cur) => ({ ...cur, [pora]: r }));
  };

  const reakcja = reakcje[pora];
  const count = (m: Miska) => Object.entries(nal[pora]).filter(([k]) => k.startsWith(m)).reduce((s, [, v]) => s + v, 0);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Kuchnia pani Haliny. Według swojej ramki nałóż Mruczkowi jedzenie — najpierw rano, potem wieczorem. Przeciągnij łyżkę do
        miski (albo stuknij łyżkę, potem miskę).
      </p>
      <div className="mt-3 flex gap-2" role="tablist">
        {(['rano', 'wieczor'] as Pora[]).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={pora === p}
            onClick={() => setPora(p)}
            className="flex items-center gap-1 border px-3 py-1.5 text-sm"
            style={{ borderColor: pora === p ? color : undefined, fontWeight: pora === p ? 600 : undefined }}
          >
            {reakcje[p]?.ok && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            {p === 'rano' ? 'rano' : 'wieczorem'}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {KARMY.map((k) => (
          <button
            key={k.id}
            type="button"
            {...drag.bind(k.id)}
            aria-pressed={held === k.id}
            className="cursor-grab touch-none border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900"
            style={{ borderColor: held === k.id ? '#111' : k.id === 'mleko' ? '#93c5fd' : '#b45309' }}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-center gap-6">
        {(['niebieska', 'zolta'] as Miska[]).map((m) => (
          <button
            key={m}
            type="button"
            data-drop={`miska:${m}`}
            onClick={() => held && put(held, m)}
            className="flex flex-col items-center"
            aria-label={`${m === 'niebieska' ? 'Niebieska' : 'Żółta'} miska, łyżek: ${count(m)}`}
          >
            <svg width="110" height="56" viewBox="0 0 110 56" className="block">
              <ellipse cx="55" cy="16" rx="50" ry="12" fill={drag.hover === `miska:${m}` ? '#fef3c7' : '#f5f5f4'} stroke={m === 'niebieska' ? '#3b82f6' : '#eab308'} strokeWidth="3" />
              <path d="M 5 16 Q 12 52 55 52 Q 98 52 105 16" fill={m === 'niebieska' ? '#93c5fd' : '#fde047'} stroke={m === 'niebieska' ? '#3b82f6' : '#eab308'} strokeWidth="3" />
              {Array.from({ length: Math.min(count(m), 8) }, (_, i) => (
                <circle key={i} cx={30 + (i % 4) * 16} cy={i < 4 ? 14 : 8} r="6" fill="#92400e" opacity="0.8" />
              ))}
            </svg>
            <span className="text-xs">{m === 'niebieska' ? 'niebieska' : 'żółta'} · {count(m)}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={podaj} className="border-2 px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: color, borderColor: color }}>
          Zawołaj Mruczka
        </button>
        <button
          type="button"
          onClick={() => {
            setNal((cur) => ({ ...cur, [pora]: {} }));
            setReakcje((r) => ({ ...r, [pora]: null }));
          }}
          className="text-sm text-muted-foreground"
        >
          Umyj miski
        </button>
      </div>
      <div className="mt-2 flex min-h-[5.75rem] items-center gap-3">
        <Kot poza={reakcja?.poza ?? 'czeka'} size={104} />
        <p className="min-w-0 flex-1 text-sm leading-snug" aria-live="polite" style={{ color: reakcja?.ok ? '#047857' : undefined }}>
          {reakcja?.mowi}
          {reakcja && !reakcja.ok && ` (Pani Halina mówiła: „${MRU.unitById[MRU.spans[reakcja.span].unitIds[0]].text}”)`}
        </p>
      </div>
      {done && (
        <p className="border-t pt-3 text-sm leading-relaxed sm:text-base">
          Zakupy: {bledyRunda1} {bledyRunda1 === 1 ? 'kłopot' : bledyRunda1 >= 2 && bledyRunda1 <= 4 ? 'kłopoty' : 'kłopotów'} w kuchni. Mruczek:{' '}
          {pomylki === 0 ? 'ani jednej pomyłki' : `${pomylki} ${pomylki === 1 ? 'pomyłka' : pomylki < 5 ? 'pomyłki' : 'pomyłek'}`} — i to przy jednym
          odsłuchaniu zamiast dwóch. Ramka „co? ile? jaki? uwaga!” łapie to, co ucieka.
        </p>
      )}
      <DragGhost drag={drag.drag}>
        <span className="block border-2 bg-white px-3 py-1.5 text-sm" style={{ borderColor: '#b45309' }}>
          {KARMY.find((k) => k.id === drag.drag?.id)?.label}
        </span>
      </DragGhost>
    </div>
  );
}
