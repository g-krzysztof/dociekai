'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Mail, MailX, MoveRight, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Wyjaśnienie lekcji — **bez wyjaśniania**. Zamiast sześciu kart do rozwinięcia
 * z opisem „po co jest podpis”, dziecko dostaje pulpit sterowniczy własnej
 * wiadomości i drugie okno: to samo widziane **oczami odbiorcy**.
 *
 * Każdy przełącznik natychmiast zmienia wiersz w cudzej skrzynce i zdanie,
 * które ta osoba sobie myśli. Reguły nikt tu nie podaje — dziecko odkrywa je,
 * psując wiadomość i patrząc, co się dzieje po drugiej stronie. Blok kończy
 * się, gdy odbiorca w końcu powie, że rozumie.
 *
 * `reaction()` jest czystą funkcją stanu przełączników z jawną kolejnością
 * ważności — najpierw to, co blokuje doręczenie, potem to, co blokuje
 * zrozumienie, na końcu ton.
 */

type Address = 'ok' | 'literowka' | 'niepelny';

interface Draft {
  address: Address;
  temat: boolean;
  powitanie: boolean;
  tresc: boolean;
  podpis: boolean;
  zalacznik: boolean;
  krzyk: boolean;
}

const START: Draft = {
  address: 'niepelny',
  temat: false,
  powitanie: false,
  tresc: false,
  podpis: false,
  zalacznik: false,
  krzyk: false,
};

const ADDRESSES: { id: Address; label: string }[] = [
  { id: 'ok', label: 'a.kowalska@sp7.edu.pl' },
  { id: 'literowka', label: 'a.kowaslka@sp7.edu.pl' },
  { id: 'niepelny', label: 'pani Kowalska' },
];

/** Co myśli odbiorczyni. Kolejność ma znaczenie: najpierw to, co boli najbardziej. */
function reaction(draft: Draft): { text: string; ok: boolean } {
  if (draft.address === 'niepelny')
    return { text: 'Nic do mnie nie dotarło — ta wiadomość w ogóle nie wyszła.', ok: false };
  if (draft.address === 'literowka')
    return { text: 'Kto to? Nie znam nikogo takiego. Kasuję bez czytania.', ok: false };
  if (!draft.tresc)
    return { text: 'Jest powitanie i podpis, ale… o co właściwie chodzi?', ok: false };
  if (!draft.temat)
    return { text: 'Nie wiem, czy to do mnie i czy pilne. Zostawiam na później.', ok: false };
  if (draft.krzyk)
    return { text: 'Dlaczego on na mnie krzyczy? Wolę do tego wrócić jutro.', ok: false };
  if (!draft.podpis)
    return { text: 'Kto to jest „szybki_jez7”? Które to dziecko z klasy?', ok: false };
  if (!draft.powitanie)
    return { text: 'Trochę oschłe — jakby ktoś rzucił mi kartkę na biurko i wyszedł.', ok: false };
  if (!draft.zalacznik)
    return { text: 'Pisze, że coś załącza, ale nic nie ma. Muszę dopytać.', ok: false };
  return {
    text: 'Rozumiem: wiem, od kogo to jest, o co chodzi i co mam zrobić. Odpisuję od razu.',
    ok: true,
  };
}

const SWITCHES: { key: keyof Omit<Draft, 'address'>; label: string; bad?: boolean }[] = [
  { key: 'temat', label: 'Temat' },
  { key: 'powitanie', label: 'Powitanie' },
  { key: 'tresc', label: 'Treść na temat' },
  { key: 'podpis', label: 'Podpis imieniem' },
  { key: 'zalacznik', label: 'Dołączony plik' },
  { key: 'krzyk', label: 'WIELKIE LITERY i !!!', bad: true },
];

interface TwoSidesProps {
  color: string;
  onComplete?: () => void;
}

export function TwoSides({ color, onComplete }: TwoSidesProps) {
  const [draft, setDraft] = useState<Draft>(START);
  const [solved, setSolved] = useState(false);

  const verdict = reaction(draft);

  useEffect(() => {
    if (!verdict.ok || solved) return;
    setSolved(true);
    onComplete?.();
  }, [verdict.ok, solved, onComplete]);

  const toggle = (key: keyof Omit<Draft, 'address'>) =>
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));

  const subjectLine = draft.temat
    ? draft.krzyk
      ? 'PROŚBA O PRZEŁOŻENIE TERMINU!!!'
      : 'Prośba o przełożenie terminu pracy z przyrody'
    : '(brak tematu)';

  const snippet = draft.tresc
    ? draft.krzyk
      ? 'NIE ZDĄŻĘ ODDAĆ PRACY NA JUTRO!!! CHOROWAŁEM TRZY DNI!!!'
      : 'Nie zdążę oddać pracy z przyrody na jutro — chorowałem przez trzy dni…'
    : '(pusto)';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Po lewej twoja wiadomość, po prawej <strong>ta sama wiadomość w skrzynce pani Kowalskiej</strong>.
        Przestawiaj przełączniki i patrz w prawo — nie na to, co napisałeś/napisałaś, tylko na to, co
        z tego zrozumiała.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Twoja strona */}
        <div className="border p-3 sm:p-4" style={{ borderColor: `${color}55` }}>
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-wide"
            style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            Ty piszesz
          </p>

          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Adres odbiorcy</p>
          <div className="mb-4 flex flex-col gap-1.5">
            {ADDRESSES.map((entry) => {
              const on = draft.address === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, address: entry.id }))}
                  aria-pressed={on}
                  className={cn(
                    'cursor-pointer border px-2.5 py-1.5 text-left font-mono text-xs transition-colors hover:bg-muted/60',
                    on && 'font-semibold'
                  )}
                  style={on ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>

          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Części wiadomości</p>
          <div className="flex flex-wrap gap-1.5">
            {SWITCHES.map((item) => {
              const on = draft[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggle(item.key)}
                  aria-pressed={on}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted/60',
                    on && 'font-semibold',
                    on && item.bad && 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  )}
                  style={
                    on && !item.bad
                      ? { borderColor: color, backgroundColor: `${color}14`, color }
                      : undefined
                  }
                >
                  {on && <Check className="h-3 w-3 shrink-0" aria-hidden />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strona odbiorcy */}
        <div className="border p-3 sm:p-4" style={{ borderColor: `${color}55` }}>
          <p
            className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
            style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            <MoveRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Skrzynka pani Kowalskiej
          </p>

          {draft.address === 'niepelny' ? (
            <div className="flex items-center gap-2 border border-red-300 bg-red-50 px-3 py-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              <MailX className="h-4 w-4 shrink-0" aria-hidden />
              Nie wysłano — to nie jest adres. Brakuje znaku @ i domeny.
            </div>
          ) : draft.address === 'literowka' ? (
            <div className="border bg-zinc-100 p-3 dark:bg-zinc-800">
              <p className="text-xs text-muted-foreground">
                Doszło — ale do kogoś innego. Jedna przestawiona litera to inny adres i inna osoba.
              </p>
            </div>
          ) : (
            <div className="border bg-zinc-100 dark:bg-zinc-800">
              <div className="flex items-center gap-1.5 border-b bg-zinc-200 px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                <Mail className="h-3 w-3" aria-hidden />
                Odebrane
              </div>
              <div className="bg-white p-2.5 dark:bg-zinc-900">
                <p className="truncate text-xs font-semibold">
                  {draft.podpis ? 'Julia Mazur (4b)' : 'szybki_jez7@poczta.pl'}
                </p>
                <p
                  className={cn(
                    'mt-0.5 truncate text-sm',
                    !draft.temat && 'italic text-muted-foreground'
                  )}
                >
                  {subjectLine}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {draft.powitanie ? 'Dzień dobry, Pani Aniu, ' : ''}
                  {snippet}
                </p>
                {draft.zalacznik && (
                  <p className="mt-1.5 inline-block border px-1.5 py-0.5 text-[10px]" style={{ borderColor: color, color }}>
                    praca-przyroda.odt
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Co sobie myśli */}
          <div className="mt-3 flex items-start gap-2">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
              <UserRound className="h-3.5 w-3.5" aria-hidden />
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={verdict.text}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'min-w-0 flex-1 border-l-2 pl-2.5 text-sm italic leading-relaxed',
                  verdict.ok ? 'font-medium' : 'text-muted-foreground'
                )}
                style={{ borderColor: verdict.ok ? color : 'var(--border)' }}
              >
                „{verdict.text}”
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {solved && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Żadna z tych części nie jest ozdobnikiem.</strong> Zły adres — nie dociera.
            Brak tematu — ląduje na później. Brak podpisu — nie wiadomo, kto pisze. Wielkie litery —
            brzmi jak krzyk. Wciąż możesz coś wyłączyć i sprawdzić, co wtedy pomyśli odbiorczyni;
            po to jest ten pulpit.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
