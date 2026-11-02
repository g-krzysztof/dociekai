'use client';

import { useState } from 'react';
import { CzytelniaReader } from '@/app/jezyk-polski/klasa-4/components/czytelnia/czytelnia-reader';
import { CZYTELNIA } from '@/app/jezyk-polski/klasa-4/data/czytelnia';
import { useShelf } from '@/app/jezyk-polski/klasa-4/lib/polka/use-shelf';
import { useTeczka } from '@/app/jezyk-polski/klasa-4/lib/teczka/use-teczka';

const COLOR = '#7c5a2e';
const BOOK = CZYTELNIA[0];

export function CzytelniaDemo() {
  const [n, setN] = useState(1);
  const [finished, setFinished] = useState<number | null>(null);
  const { shelf } = useShelf();
  const { items, save, remove } = useTeczka();

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <h1 className="text-2xl font-bold">Czytelnia — harness</h1>

      <section data-testid="demo-reader" className="space-y-4 border p-4">
        <div className="flex flex-wrap gap-2">
          {BOOK.episodes.map((e) => (
            <button
              key={e.n}
              type="button"
              onClick={() => setN(e.n)}
              className="border px-3 py-1 text-sm"
              style={e.n === n ? { borderColor: COLOR, color: COLOR } : undefined}
            >
              Odcinek {e.n}
            </button>
          ))}
        </div>
        <CzytelniaReader key={n} book={BOOK} n={n} color={COLOR} onFinished={setFinished} />
        <p data-testid="finished" className="text-sm">onFinished: {finished ?? '—'}</p>
      </section>

      <section className="space-y-2 border p-4">
        <h2 className="font-semibold">Półka (zapis)</h2>
        <pre data-testid="shelf" className="overflow-x-auto whitespace-pre-wrap break-all text-xs">
          {JSON.stringify(shelf, null, 1)}
        </pre>
      </section>

      <section className="space-y-2 border p-4">
        <h2 className="font-semibold">Teczka (tylko urządzenie)</h2>
        <button
          type="button"
          onClick={() => save({ id: 'dev/proba#1', lesson: 'dev/proba', kind: 'wrazenie', title: 'Próba', text: 'Kaczątko jest smutne.', ref: BOOK.id })}
          className="border px-3 py-1 text-sm"
        >
          Zapisz próbną kartkę
        </button>
        <ul data-testid="teczka" className="text-sm">
          {items.map((it) => (
            <li key={it.id}>
              {it.title}: {it.text}{' '}
              <button type="button" onClick={() => remove(it.id)} className="underline">
                usuń
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
