'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Link2, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Symulator domykający lekcję i moduł — **udostępnianie pokazane skutkiem, nie
 * definicją**.
 *
 * Różnica między „wyślij plik” a „udostępnij link” brzmi jak drobiazg
 * techniczny, dopóki nie zobaczy się, co z niej wynika. Załącznik **robi kopie**:
 * każdy dostaje swój własny dokument i od tej chwili istnieje ich tyle, ile
 * osób. Ten blok pokazuje to dosłownie — po wysłaniu wracają dwie różne wersje i
 * pada pytanie, na które nie ma dobrej odpowiedzi: która jest teraz prawdziwa?
 *
 * Link nie robi kopii, więc pozostaje pytanie drugie: **co wolno tym, którzy go
 * dostaną**. Trzy uprawnienia dają trzy różne zakończenia i żadne nie jest
 * „najlepsze” — dobre jest to, które pasuje do sytuacji. Dlatego blok nie
 * punktuje wyborów, tylko odgrywa ich konsekwencje (ta sama zasada co `PileOn`
 * i `LicenseCall`), a domyka się, gdy dziecko zobaczy i kopie, i wspólny plik.
 */

type Method = 'zalacznik' | 'link';
type Rights = 'oglada' | 'komentuje' | 'edytuje';

const RIGHTS: { id: Rights; label: string; short: string }[] = [
  { id: 'oglada', label: 'Może tylko oglądać', short: 'oglądanie' },
  { id: 'komentuje', label: 'Może komentować', short: 'komentowanie' },
  { id: 'edytuje', label: 'Może edytować', short: 'edytowanie' },
];

interface Outcome {
  id: string;
  title: string;
  body: string;
  note: string;
  /** Kopie dokumentu, które istnieją po tej operacji. */
  copies: { name: string; who: string; change: string }[];
}

function play(method: Method, rights: Rights): Outcome {
  if (method === 'zalacznik') {
    return {
      id: 'zalacznik',
      title: 'Wysłane. I od tej chwili przepisów jest cztery.',
      body: 'Każdy dostał własny plik i każdy może z nim zrobić, co chce — ty się o tym nie dowiesz.',
      note: 'Mama dopisała krok o myciu rąk, Kuba zmienił jogurt na mleko. Obie poprawki są sensowne i obie siedzą w innym pliku. Który z tych czterech przepisów jest teraz prawdziwy?',
      copies: [
        { name: 'przepis-koktajl.docx', who: 'u ciebie', change: 'bez zmian' },
        { name: 'przepis-koktajl.docx', who: 'u mamy', change: 'dopisany krok „umyj ręce”' },
        { name: 'przepis-koktajl(1).docx', who: 'u Kuby', change: 'jogurt zamieniony na mleko' },
        { name: 'przepis-koktajl.docx', who: 'u pani', change: 'bez zmian' },
      ],
    };
  }
  if (rights === 'edytuje') {
    return {
      id: 'link-edytuje',
      title: 'Udostępnione. Przepis dalej jest jeden.',
      body: 'Wszyscy pracują w tym samym dokumencie, więc poprawki mamy i Kuby widać obok siebie, w jednym miejscu.',
      note: 'Uwaga na drugą stronę tego medalu: skoro każdy może pisać, to każdy może też coś skasować. Przy pracy z całą klasą lepiej dawać edytowanie tylko tym, którzy mają naprawdę coś zmieniać.',
      copies: [{ name: 'Przepis na koktajl truskawkowy', who: 'jeden wspólny dokument', change: 'poprawki mamy i Kuby w środku' }],
    };
  }
  if (rights === 'komentuje') {
    return {
      id: 'link-komentuje',
      title: 'Udostępnione. Uwagi są, tekst nietknięty.',
      body: 'Mama i Kuba nie mogą nic zmienić, ale przykleili na boku dwie uwagi. Ty decydujesz, które przyjmujesz.',
      note: 'To ustawienie jest najlepsze na pracę domową i projekt: cudze pomysły masz zebrane w jednym miejscu, a tekst dalej jest twój — łącznie z odpowiedzialnością za niego.',
      copies: [{ name: 'Przepis na koktajl truskawkowy', who: 'jeden wspólny dokument', change: '2 uwagi na marginesie' }],
    };
  }
  return {
    id: 'link-oglada',
    title: 'Udostępnione. Nikt niczego nie zepsuje — i nikt nie poprawi.',
    body: 'Wszyscy widzą ten sam, gotowy przepis. Kuba zauważył literówkę i musiał napisać ci o niej osobno.',
    note: 'Dobre dla rzeczy skończonych: ogłoszenia, zaproszenia, gotowego przepisu. Złe wtedy, gdy liczysz na czyjąś pomoc.',
    copies: [{ name: 'Przepis na koktajl truskawkowy', who: 'jeden wspólny dokument', change: 'bez zmian' }],
  };
}

interface ShareBoxProps {
  color: string;
  onComplete?: () => void;
}

export function ShareBox({ color, onComplete }: ShareBoxProps) {
  const [method, setMethod] = useState<Method>('zalacznik');
  const [rights, setRights] = useState<Rights>('edytuje');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [seen, setSeen] = useState<string[]>([]);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(outcome?.id ?? 'wybor');
  /** Domykamy, gdy dziecko zobaczyło i rozejście się kopii, i wspólny dokument. */
  const done = seen.includes('zalacznik') && seen.some((id) => id.startsWith('link-'));

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const send = () => {
    const result = play(method, rights);
    setOutcome(result);
    setSeen((prev) => (prev.includes(result.id) ? prev : [...prev, result.id]));
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Przepis gotowy. Mają go dostać trzy osoby: mama, Kuba i pani od informatyki.
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Wybierz sposób i sprawdź, co się naprawdę stanie. Potem spróbuj drugiego.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMethod('zalacznik')}
          aria-pressed={method === 'zalacznik'}
          className={cn('border-2 p-3 text-left transition', method !== 'zalacznik' && 'hover:bg-black/5 dark:hover:bg-white/5')}
          style={{
            borderColor: method === 'zalacznik' ? color : `${color}33`,
            backgroundColor: method === 'zalacznik' ? `${color}12` : undefined,
          }}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Paperclip className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            Wyślij plik e-mailem
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Każdy dostaje własny plik na swój komputer.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMethod('link')}
          aria-pressed={method === 'link'}
          className={cn('border-2 p-3 text-left transition', method !== 'link' && 'hover:bg-black/5 dark:hover:bg-white/5')}
          style={{
            borderColor: method === 'link' ? color : `${color}33`,
            backgroundColor: method === 'link' ? `${color}12` : undefined,
          }}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            Udostępnij linkiem
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Plik zostaje jeden, w chmurze. Wysyłasz tylko adres.
          </span>
        </button>
      </div>

      {method === 'link' && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Co wolno osobom z linkiem
          </p>
          <div className="flex flex-wrap gap-1.5">
            {RIGHTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRights(item.id)}
                aria-pressed={rights === item.id}
                className={cn(
                  'border-2 px-2.5 py-1.5 text-sm transition',
                  rights !== item.id && 'hover:bg-black/5 dark:hover:bg-white/5'
                )}
                style={{
                  borderColor: rights === item.id ? color : `${color}33`,
                  backgroundColor: rights === item.id ? `${color}14` : undefined,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={send}
        className="mt-3 px-4 py-2 text-sm font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {method === 'zalacznik' ? 'Wyślij wszystkim' : 'Wyślij link wszystkim'}
      </button>

      <AnimatePresence mode="wait">
        {outcome && (
          <motion.div
            key={outcome.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{
              backgroundColor: outcome.id === 'zalacznik' ? undefined : `${color}14`,
              borderLeft: outcome.id === 'zalacznik' ? '2px solid #d97706' : undefined,
            }}
          >
            <p className="text-sm font-semibold">{outcome.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{outcome.body}</p>

            <ul className="mt-3 space-y-1.5">
              {outcome.copies.map((copy, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-baseline gap-x-2 border bg-white px-2.5 py-1.5 text-xs dark:bg-zinc-900"
                >
                  <span className="font-mono font-semibold">{copy.name}</span>
                  <span className="text-muted-foreground">{copy.who}</span>
                  <span className="ml-auto" style={{ color: copy.change === 'bez zmian' ? undefined : color }}>
                    {copy.change}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{outcome.note}</p>
          </motion.div>
        )}

        {done && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 border-t pt-4"
          >
            <p className="flex items-start gap-2 text-sm font-semibold sm:text-base">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>Jedna różnica, z której wynika cała reszta.</span>
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="border-l-2 p-3" style={{ borderColor: color }}>
                <p className="text-sm font-semibold">Załącznik = kopie</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Po wysłaniu plik przestaje być jeden. Każda poprawka ląduje w innym egzemplarzu i
                  nikt już nie wie, który jest aktualny. Dobre do rzeczy skończonych — kartki,
                  zdjęcia, gotowego wydruku.
                </p>
              </div>
              <div className="border-l-2 p-3" style={{ borderColor: color }}>
                <p className="text-sm font-semibold">Link = jeden plik</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Dokument zostaje jeden, a ty decydujesz, co wolno innym: patrzeć, dopisywać uwagi
                  czy pisać. Dobre do wszystkiego, nad czym ktoś ma z tobą pracować.
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              I jedna rzecz, o której łatwo zapomnieć: <strong>link działa dla każdego, kto go
              dostanie</strong>. Jeśli trafi dalej, niż planowałeś/planowałaś, dokument idzie razem z
              nim — dlatego uprawnienia ustawia się przed wysłaniem, a nie potem.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
