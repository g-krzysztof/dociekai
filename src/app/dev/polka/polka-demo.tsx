'use client';

import { useEffect, useRef, useState } from 'react';
import { PolkaView } from '@/app/jezyk-polski/klasa-4/components/polka/polka-view';
import { TeczkaView } from '@/app/jezyk-polski/klasa-4/components/teczka/teczka-view';
import { Ksiazeczka } from '@/app/jezyk-polski/klasa-4/components/teczka/ksiazeczka';
import { useShelf } from '@/app/jezyk-polski/klasa-4/lib/polka/use-shelf';
import { useTeczka } from '@/app/jezyk-polski/klasa-4/lib/teczka/use-teczka';
import {
  addBook,
  markEpisodeDone,
  setBookmark,
  setImpression,
  setPlan,
  setStatus,
} from '@/app/jezyk-polski/klasa-4/lib/polka/model';
import { bookletItems } from '@/app/jezyk-polski/klasa-4/lib/polka/summary';
import { addDays, todayKey } from '@/lib/streak/school-calendar';
import type { TeczkaItem } from '@/app/jezyk-polski/klasa-4/lib/teczka/types';

const COLOR = '#7c5a2e';

const BTN = 'border px-3 py-1 text-sm';

export function PolkaDemo() {
  const { update } = useShelf();
  const { items, save, remove } = useTeczka();
  const [opened, setOpened] = useState<string | null>(null);
  const [showBooklet, setShowBooklet] = useState(false);
  const [title, setTitle] = useState('Moja książeczka');
  const [author, setAuthor] = useState('');
  const bookletRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!showBooklet) return;
    bookletRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowBooklet(false);
  }, [showBooklet]);

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <h1 className="text-2xl font-bold">Półka i Teczka — harness</h1>

      <section data-testid="demo-seed" className="space-y-2 border p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="seed-shelf"
            className={BTN}
            onClick={() =>
              update((rec, now) => {
                const today = todayKey();
                let next = addBook(rec, 'brzydkie-kaczatko', 'czytelnia', now);
                next = markEpisodeDone(next, 'brzydkie-kaczatko', 1, 4, now);
                next = markEpisodeDone(next, 'brzydkie-kaczatko', 2, 4, now);
                next = setPlan(next, 'brzydkie-kaczatko', { [today]: 1, [addDays(today, 2)]: 1 }, now);
                next = setBookmark(next, 'brzydkie-kaczatko', 3, 's4', now);
                next = setImpression(next, 'brzydkie-kaczatko', 72, 'ciekawosc', now);
                next = markEpisodeDone(
                  addBook(next, 'lekcja:start/jezyk-dziala', 'lekcja', now + 1),
                  'lekcja:start/jezyk-dziala',
                  1,
                  1,
                  now + 1,
                );
                next = addBook(next, 'nieznana-ksiazka', 'czytelnia', now + 2);
                return next;
              })
            }
          >
            Wypełnij półkę
          </button>
          <button
            type="button"
            data-testid="shelf-odloz"
            className={BTN}
            onClick={() => update((rec, now) => setStatus(rec, 'brzydkie-kaczatko', 'odlozona', now))}
          >
            Odłóż kaczątko
          </button>
          <button
            type="button"
            data-testid="clear-shelf"
            className={BTN}
            onClick={() => update(() => ({ v: 1, entries: {} }))}
          >
            Wyczyść półkę
          </button>
          <button
            type="button"
            data-testid="seed-teczka"
            className={BTN}
            onClick={() => {
              save({
                id: 'start/jezyk-dziala#wizytowka',
                lesson: 'start/jezyk-dziala',
                kind: 'wizytowka',
                title: 'Moja wizytówka',
                text: 'Mam na imię Ala.\nLubię koty i deszcz.',
              });
              save({
                id: 'start/ja-czytelnik#wrazenie',
                lesson: 'start/ja-czytelnik',
                kind: 'wrazenie',
                title: 'Pierwsze wrażenie',
                text: 'Kaczątko jest smutne, ale chcę wiedzieć, co dalej.',
                ref: 'brzydkie-kaczatko',
              });
              save({
                id: 'komunikacja/do-kogo-mowie#liscik',
                lesson: 'komunikacja/do-kogo-mowie',
                kind: 'list',
                title: 'Liścik do sąsiadki',
                text: 'Droga Pani Haniu!\n\nDziękuję za ciasto. Było pyszne.\n\nAla',
              });
            }}
          >
            Wypełnij teczkę
          </button>
          <button
            type="button"
            data-testid="clear-teczka"
            className={BTN}
            onClick={() => items.forEach((it: TeczkaItem) => remove(it.id))}
          >
            Wyczyść teczkę
          </button>
        </div>
      </section>

      <section data-testid="demo-polka" className="border p-4">
        <h2 className="font-semibold">Półka</h2>
        <PolkaView color={COLOR} onOpen={(id, n) => setOpened(`${id} #${n}`)} />
        <p data-testid="opened" className="text-sm">onOpen: {opened ?? '—'}</p>
      </section>

      <section data-testid="demo-teczka" className="border p-4">
        <h2 className="font-semibold">Teczka</h2>
        <TeczkaView color={COLOR} onOpenBooklet={() => setShowBooklet(true)} />
      </section>

      <section ref={bookletRef} data-testid="demo-ksiazeczka" className="border p-4">
        <h2 className="font-semibold">Książeczka</h2>
        <label className="block text-sm">
          Tytuł
          <input
            data-testid="booklet-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-2 py-1 text-sm w-full"
          />
        </label>
        <label className="block text-sm">
          Autor
          <input
            data-testid="booklet-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border px-2 py-1 text-sm w-full"
          />
        </label>
        <Ksiazeczka color={COLOR} title={title} author={author || undefined} items={bookletItems(items)} />
      </section>
    </main>
  );
}
