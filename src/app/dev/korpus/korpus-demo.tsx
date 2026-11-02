'use client';

import { useState } from 'react';
import { KorpusText, type GapSlot, type KorpusMark } from '@/app/jezyk-polski/klasa-4/components/korpus/korpus-text';
import {
  buildKorpus,
  findWords,
  isFirstPersonPlural,
  judgeEvidence,
  judgeGap,
  judgeHighlight,
} from '@/app/jezyk-polski/klasa-4/lib/korpus';
import { DragGhost, useDragToken } from '@/components/block-lesson/use-drag-token';

const COLOR = '#0e7490';

const PROZA = buildKorpus({
  id: 'demo-proza',
  layout: 'prose',
  body: `Rano na klatce schodowej było głośno. [[u1 — Przepraszam, Zuziu, to ja zgubiłem twoją piłkę]] — powiedział Tymek. [[r1 Zuzia kiwnęła głową i podała mu rękę.]]

[[u2 — Zawsze wszystko psujesz!]] — krzyknęła Ola. Zuzia odwróciła się do okna i nic nie powiedziała.

[[u3 — Pani Halino, ma pani kota na głowie]] — zażartował pan Bogdan. [[r3 Pani Halina parsknęła śmiechem.]]`,
  spans: {
    u1: { kind: 'wypowiedz', speaker: 'tymek', to: 'zuzia' },
    u2: { kind: 'wypowiedz', speaker: 'ola', to: 'zuzia' },
    u3: { kind: 'wypowiedz', speaker: 'bogdan', to: 'halina' },
    r1: { kind: 'reakcja' },
    r3: { kind: 'reakcja' },
  },
  anchors: [
    { kind: 'przeprosiny', from: 'u1', to: 'r1' },
    { kind: 'zranienie', from: 'u2', to: 's4' },
    { kind: 'rozsmieszenie', from: 'u3', to: 'r3' },
  ],
});

const LUKI = buildKorpus({
  id: 'demo-luki',
  layout: 'prose',
  body: `Zuzia ma kota{#g1}. Kot śpi na szafie{#g2}.`,
  morph: {
    kota: [{ lemma: 'kot', tag: 'subst:sg:acc:m2' }],
    kot: [{ lemma: 'kot', tag: 'subst:sg:nom:m2' }],
    szafie: [{ lemma: 'szafa', tag: 'subst:sg:loc:f' }],
    szafa: [{ lemma: 'szafa', tag: 'subst:sg:nom:f' }],
  },
});

const WIERSZ = buildKorpus({
  id: 'demo-wiersz',
  layout: 'verse',
  body: `Nie rzucim ziemi, skąd nasz ród,\nNie damy pogrześć mowy.\n\nPolski my naród, polski lud`,
  morph: {
    damy: [{ lemma: 'dać', tag: 'fin:pl:pri:perf' }],
    my: [{ lemma: 'my', tag: 'ppron12:pl:nom:m1:pri' }],
    rzucim: [{ lemma: 'rzucić', tag: 'fin:pl:pri:perf' }],
  },
});

const MARKER = 'color-mix(in srgb, #facc15 55%, transparent)';

export function KorpusDemo() {
  // 1. para stuknięć
  const [claim, setClaim] = useState<string | null>(null);
  const [pairMsg, setPairMsg] = useState('Stuknij wypowiedź, potem zdanie, które pokazuje jej skutek.');
  const [pairMarks, setPairMarks] = useState<Record<string, KorpusMark>>({});

  const onPick = (id: string) => {
    if (PROZA.spans[id]?.meta.kind === 'wypowiedz') {
      setClaim(id);
      setPairMarks({ [id]: 'picked' });
      setPairMsg('Teraz zdanie-dowód.');
      return;
    }
    if (!claim) return;
    const v = judgeEvidence(PROZA, claim, id);
    if (v.ok) {
      setPairMarks({ [claim]: 'ok', [id]: 'ok' });
      setPairMsg(`Tak — ${v.anchor.kind}.`);
    } else if (v.reason === 'cudzy-dowod') {
      setPairMarks({ [claim]: 'picked', [id]: 'bad', [v.owner]: 'hint' });
      setPairMsg(`To zdanie pokazuje skutek innej wypowiedzi (${v.owner}).`);
    } else {
      setPairMarks({ [claim]: 'picked', [id]: 'bad' });
      setPairMsg('To zdanie niczego o tej wypowiedzi nie mówi.');
    }
    setClaim(null);
  };

  // 2. zakreślacz
  const [hl, setHl] = useState<Record<string, string>>({});
  const verdict = judgeHighlight(PROZA, Object.keys(hl), ['u1', 'u2', 'u3'], { maxExtras: 2 });

  // 3. luki
  const [gaps, setGaps] = useState<Record<string, GapSlot>>({ g1: { placed: null }, g2: { placed: null } });
  const [held, setHeld] = useState<string | null>(null);
  const place = (word: string, target: string | null) => {
    if (!target?.startsWith('gap:')) return;
    const id = target.slice(4);
    const v = judgeGap(LUKI, id, word);
    setGaps((g) => ({ ...g, [id]: { placed: word, state: v.ok ? 'ok' : 'bad' } }));
  };
  const drag = useDragToken({ onDrop: place, onTap: (id) => setHeld((h) => (h === id ? null : id)) });

  const my = findWords(WIERSZ, (t) => Boolean(t.morph && isFirstPersonPlural(t.morph)));

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <h1 className="text-2xl font-bold">Silnik korpus — harness</h1>

      <section className="space-y-3 border p-4">
        <h2 className="font-semibold">1. Para stuknięć „wypowiedź → dowód”</h2>
        <KorpusText korpus={PROZA} color={COLOR} pick={claim ? 'unit' : 'span'} pickable={claim ? undefined : ['u1', 'u2', 'u3']} onPick={onPick} marks={pairMarks} />
        <p data-testid="pair-msg" className="text-sm">{pairMsg}</p>
      </section>

      <section className="space-y-3 border p-4">
        <h2 className="font-semibold">2. Zakreślacz — zakreśl wszystkie wypowiedzi</h2>
        <KorpusText
          korpus={PROZA}
          color={COLOR}
          highlighter={MARKER}
          highlights={hl}
          onHighlight={(ids) =>
            setHl((prev) => {
              const next = { ...prev };
              const removing = ids.every((id) => next[id]);
              ids.forEach((id) => (removing ? delete next[id] : (next[id] = MARKER)));
              return next;
            })
          }
        />
        <p data-testid="hl-msg" className="text-sm">
          trafione: {verdict.hits.join(', ') || '—'} · brak: {verdict.misses.join(', ') || '—'} · nadmiar: {verdict.extras.length}
          {verdict.complete ? ' · GOTOWE' : ''}
        </p>
      </section>

      <section className="space-y-3 border p-4">
        <h2 className="font-semibold">3. Luki — przeciągnij słowo albo stuknij słowo i lukę</h2>
        <div className="flex flex-wrap gap-2">
          {['kot', 'kota', 'psa', 'szafie', 'szafa'].map((w) => (
            <button key={w} {...drag.bind(w)} className="border-2 px-3 py-1" style={{ borderColor: held === w ? COLOR : undefined }}>
              {w}
            </button>
          ))}
        </div>
        <KorpusText korpus={LUKI} color={COLOR} gaps={gaps} dropHover={drag.hover} onGapTap={(id) => held && (place(held, `gap:${id}`), setHeld(null))} />
        <DragGhost drag={drag.drag}>
          <span className="border-2 bg-white px-3 py-1">{drag.drag?.id}</span>
        </DragGhost>
      </section>

      <section className="space-y-3 border p-4">
        <h2 className="font-semibold">4. Wiersz — „my” w końcówkach</h2>
        <KorpusText korpus={WIERSZ} color={COLOR} marks={Object.fromEntries(my.map((t) => [t.id, 'ok' as const]))} />
        <p data-testid="my-msg" className="text-sm">{my.map((t) => t.form).join(', ')}</p>
      </section>
    </main>
  );
}
