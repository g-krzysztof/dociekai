'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { findSentence, getFigure } from './postacie';
import { formatYear } from './rok';
import { ratingWord, useTeczka } from './teczka-state';

type Phase = 'plansza' | 'gosc' | 'pytanie' | 'gotowe';

/** Pytania gościa wystawy — gość wybiera jedno, dziecko odpowiada na głos. */
function questions(she: boolean, name: string): string[] {
  const o = she ? 'niej' : 'nim';
  return [
    `Co powiedziałby o ${o} ${she ? 'jej' : 'jego'} wróg?`,
    'Któremu świadkowi z teczki ufasz najmniej — i dlaczego?',
    `Czy ludzie w tamtych czasach oceniliby ${name} tak samo jak Ty?`,
    'Który dowód jest najmocniejszy i dlaczego właśnie ten?',
    'Co musiałoby się znaleźć w nowym źródle, żebyś zmienił(a) zdanie?',
  ];
}

/**
 * Blok 4 — **Wystawa**. Z pracy dziecka powstaje plansza (fotografia, oś
 * życia, ocena, trzy dowody z autorami, kontrargument, miara). Gest:
 * **dziecko podaje urządzenie komuś w domu** — gość czyta planszę, wybiera
 * jedno pytanie, dziecko odpowiada na głos, gość oddaje urządzenie.
 * Bez oceny odpowiedzi. `onDone` po oddaniu urządzenia.
 */
export function WystawaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const { work } = useTeczka();
  const fig = work.figure ? getFigure(work.figure) : undefined;
  const [phase, setPhase] = useState<Phase>('plansza');
  const [question, setQuestion] = useState<string | null>(null);
  const reported = useRef(false);

  if (!fig || !work.order) return <p className="text-sm text-muted-foreground">Plansza powstanie z pracy w blokach 1–3.</p>;

  const evidence = work.evidence.map((id) => findSentence(fig, id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const counter = work.counter ? findSentence(fig, work.counter) : undefined;
  const life = work.order.map((id) => fig.life.find((e) => e.id === id)!).filter(Boolean);

  const finish = () => {
    setPhase('gotowe');
    if (!reported.current) {
      reported.current = true;
      onDone();
    }
  };

  return (
    <div className="space-y-4">
      {phase === 'plansza' && (
        <p className="text-sm leading-relaxed">
          Oto Twoja plansza wystawy — zrobiona tylko z Twojej pracy. <strong>Podaj urządzenie komuś w domu</strong> i poproś, żeby
          ją obejrzał i zadał Ci jedno pytanie.
        </p>
      )}

      <section className="border-2 bg-[#fbf6e9] p-4 dark:bg-zinc-900" style={{ borderColor: color }} aria-label="Plansza wystawy">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wystawa · teczka postaci</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-[120px_1fr]">
          <Image src={fig.photo} alt={fig.photoAlt} width={120} height={159} className="h-auto w-[96px] sm:w-[120px]" style={{ height: 'auto' }} />
          <div>
            <h3 className="text-xl font-bold leading-tight">{fig.name}</h3>
            <p className="text-sm text-muted-foreground">
              {fig.role}, {fig.lived}
            </p>
            <dl className="mt-3 grid gap-1 text-sm">
              <div>
                <dt className="inline font-semibold">Dla {fig.own}: </dt>
                <dd className="inline">{ratingWord(work.rating.own, fig.she)}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Dla {fig.others}: </dt>
                <dd className="inline">{ratingWord(work.rating.others, fig.she)}</dd>
              </div>
              <div className="text-xs text-muted-foreground">Miarą {work.measure === 'tamte' ? 'tamtych czasów' : 'naszych czasów'}.</div>
            </dl>
          </div>
        </div>

        <h4 className="mt-4 text-sm font-semibold">Życie</h4>
        <ol className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {life.map((e) => (
            <li key={e.id}>
              <span className="font-semibold tabular-nums" style={{ color }}>
                {formatYear(e.year, e.approx)}
              </span>{' '}
              {e.text}
            </li>
          ))}
        </ol>

        <h4 className="mt-4 text-sm font-semibold">Dowody</h4>
        <ul className="mt-1 space-y-1.5 text-sm">
          {evidence.map(({ card, sentence }) => (
            <li key={sentence.id} className="border-l-2 pl-2" style={{ borderColor: color }}>
              „{sentence.text}”
              <span className="block text-xs text-muted-foreground">
                — {card.author}, {card.when}
              </span>
            </li>
          ))}
        </ul>

        {counter && (
          <>
            <h4 className="mt-4 text-sm font-semibold">Wiem, że ktoś powie inaczej</h4>
            <p className="mt-1 text-sm italic">
              „{counter.sentence.text}”
              <span className="block text-xs not-italic text-muted-foreground">
                — {counter.card.author}, {counter.card.when}
              </span>
            </p>
          </>
        )}
      </section>

      {phase === 'plansza' && (
        <button type="button" onClick={() => setPhase('gosc')} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
          Podaję urządzenie gościowi
        </button>
      )}

      {phase === 'gosc' && (
        <div className="space-y-2 border bg-white p-3 dark:bg-zinc-900">
          <p className="text-sm">
            <strong>Dla gościa wystawy:</strong> przeczytaj planszę i stuknij jedno pytanie, które chcesz zadać autorowi.
          </p>
          <div className="space-y-1.5">
            {questions(fig.she, fig.acc).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuestion(q);
                  setPhase('pytanie');
                }}
                className="block w-full border px-2.5 py-1.5 text-left text-sm hover:bg-muted/50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {(phase === 'pytanie' || phase === 'gotowe') && question && (
        <div className="space-y-3 border bg-white p-4 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pytanie gościa</p>
          <p className="text-lg font-semibold leading-snug">{question}</p>
          {phase === 'pytanie' && (
            <>
              <p className="text-sm text-muted-foreground">Autor wystawy odpowiada na głos. Kiedy skończy, gość oddaje urządzenie.</p>
              <button type="button" onClick={finish} className={cn('border-2 px-3 py-1.5 text-sm font-semibold')} style={{ borderColor: color, color }}>
                Usłyszałem/am odpowiedź — oddaję urządzenie
              </button>
            </>
          )}
        </div>
      )}

      {phase === 'gotowe' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Twoja wystawa została obejrzana. Zrobiłeś/łaś to, co robią historycy: zebrałeś/łaś świadków, oddzieliłeś/łaś fakty od
          ocen, ułożyłeś/łaś życie na osi, wydałeś/łaś ocenę z dowodami — i obroniłeś/łaś ją przed pytaniem. Możesz wrócić do
          bloku 1, wybrać inną teczkę i zrobić drugą wystawę.
        </p>
      )}
    </div>
  );
}
