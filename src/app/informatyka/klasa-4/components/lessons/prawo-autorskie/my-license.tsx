'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, Check, Inbox, Store, User, Wand2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DrawingCanvas, type Drawing } from './my-mark';

/**
 * Wyjaśnienie lekcji — bez wykładu o licencjach. Dziecko ustawia trzy warunki
 * **dla własnego rysunku z bloku 1**, a maszyna nazywa to, co ustawiło,
 * prawdziwą licencją Creative Commons. Potem otwiera skrzynkę i przychodzą trzy
 * prośby o zgodę — **odpowiada na nie licencja, nie dziecko**. To jest cała
 * pointa bloku: licencja to odpowiedź udzielona z góry, żeby nie trzeba było
 * pisać do autora za każdym razem.
 *
 * Warunki są tak dobrane, żeby każdy przełącznik był widoczny w co najmniej
 * jednej odpowiedzi: sklep nie podpisuje (BY), sklep zarabia (NC), Igor przerabia
 * (ND). Reguła „NC i ND nie istnieją bez BY” jest w kodzie mechanizmem, nie
 * notką — włączenie któregoś z nich samo dokłada BY i mówi, dlaczego.
 */

interface License {
  share: boolean;
  by: boolean;
  nc: boolean;
  nd: boolean;
}

const START: License = { share: false, by: false, nc: false, nd: false };

/** Nazwa tego, co dziecko właśnie ustawiło — same prawdziwe licencje. */
function licenseName(license: License): { code: string; label: string } {
  if (!license.share) return { code: '©', label: 'Wszystkie prawa zastrzeżone' };
  if (!license.by && !license.nc && !license.nd)
    return { code: 'CC0', label: 'Robisz z tym, co chcesz' };
  const parts = ['CC', 'BY'];
  if (license.nc) parts.push('NC');
  if (license.nd) parts.push('ND');
  const code = `${parts[0]} ${parts.slice(1).join('-')}`;
  const label = [
    'Podpisz mnie',
    license.nc ? 'nie zarabiaj' : null,
    license.nd ? 'nie przerabiaj' : null,
  ]
    .filter(Boolean)
    .join(', ');
  return { code, label };
}

interface Request {
  id: string;
  from: string;
  icon: typeof User;
  text: string;
  /** Czy zamierza podpisać autora, zarobić, przerobić rysunek. */
  credit: boolean;
  money: boolean;
  change: boolean;
}

const REQUESTS: Request[] = [
  {
    id: 'zosia',
    from: 'Zosia z 4b',
    icon: User,
    text: 'Chcę wkleić twój rysunek do gazetki szkolnej i podpiszę pod nim, że to ty. Gazetkę rozdajemy za darmo.',
    credit: true,
    money: false,
    change: false,
  },
  {
    id: 'sklep',
    from: 'Sklep z kubkami',
    icon: Store,
    text: 'Wydrukujemy twój rysunek na kubkach i będziemy je sprzedawać po 39 zł. Podpisu nie damy — na kubku nie ma miejsca.',
    credit: false,
    money: true,
    change: false,
  },
  {
    id: 'igor',
    from: 'Igor z podwórka',
    icon: Wand2,
    text: 'Dorysuję twojemu rysunkowi wąsy i wrzucę jako śmieszny obrazek. Podpiszę, że rysunek twój, i nic na tym nie zarabiam.',
    credit: true,
    money: false,
    change: true,
  },
];

/** Odpowiedź wynika wyłącznie z licencji — dziecko nie klika „zgadzam się”. */
function answer(license: License, request: Request): { ok: boolean; text: string } {
  if (!license.share)
    return {
      ok: false,
      text: 'Musi poczekać na twoją odpowiedź. Nie pozwoliłeś/pozwoliłaś nikomu używać rysunku bez pytania.',
    };
  if (license.by && !request.credit)
    return { ok: false, text: 'Nie — twoja licencja wymaga podpisu, a tu podpisu nie będzie.' };
  if (license.nc && request.money)
    return { ok: false, text: 'Nie — twoja licencja mówi: nie wolno na tym zarabiać.' };
  if (license.nd && request.change)
    return { ok: false, text: 'Nie — twoja licencja mówi: nie wolno przerabiać.' };
  return { ok: true, text: 'Tak, wolno. Twoja licencja pozwala na to z góry — nie musisz odpisywać.' };
}

const SWITCHES: { key: keyof Omit<License, 'share'>; label: string; hint: string }[] = [
  { key: 'by', label: 'Musi mnie podpisać', hint: 'skrót: BY' },
  { key: 'nc', label: 'Nie wolno na tym zarabiać', hint: 'skrót: NC' },
  { key: 'nd', label: 'Nie wolno tego przerabiać', hint: 'skrót: ND' },
];

interface MyLicenseProps {
  color: string;
  /** Rysunek z bloku 1 — jeśli dziecko go pominęło, ramka zostaje pusta. */
  drawing: Drawing | null;
  onComplete?: () => void;
}

export function MyLicense({ color, drawing, onComplete }: MyLicenseProps) {
  const [license, setLicense] = useState<License>(START);
  const [autoBy, setAutoBy] = useState(false);
  const [opened, setOpened] = useState(false);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  const named = licenseName(license);

  useEffect(() => {
    if (!opened || shown >= REQUESTS.length) return;
    const timer = setTimeout(() => setShown((prev) => prev + 1), shown === 0 ? 400 : 1600);
    return () => clearTimeout(timer);
  }, [opened, shown]);

  useEffect(() => {
    if (shown < REQUESTS.length || done) return;
    setDone(true);
    onComplete?.();
  }, [shown, done, onComplete]);

  useEffect(() => {
    if (!autoBy) return;
    const timer = setTimeout(() => setAutoBy(false), 5000);
    return () => clearTimeout(timer);
  }, [autoBy]);

  const toggle = (key: keyof Omit<License, 'share'>) => {
    setLicense((prev) => {
      const value = !prev[key];
      // Licencja CC z warunkami zawsze zawiera BY — maszyna dokłada go sama.
      if (value && (key === 'nc' || key === 'nd') && !prev.by) {
        return { ...prev, [key]: value, by: true };
      }
      // Wyłączenie BY przy włączonym NC/ND znaczy „bez warunków” — czyli CC0.
      if (!value && key === 'by') return { ...prev, by: false, nc: false, nd: false };
      return { ...prev, [key]: value };
    });
    if ((key === 'nc' || key === 'nd') && !license[key] && !license.by) setAutoBy(true);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Ten sam rysunek, tylko teraz <strong>ty jesteś tym, który stawia warunki</strong>. Ustaw
        przełączniki tak, jak ci pasuje — a potem otwórz skrzynkę.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Rysunek + warunki */}
        <div className="border p-3 sm:p-4" style={{ borderColor: `${color}55` }}>
          <div className="mx-auto mb-4 max-w-[220px] border bg-white">
            {drawing && drawing.strokes.length > 0 ? (
              <DrawingCanvas drawing={drawing} />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center p-3 text-center text-xs text-muted-foreground">
                Tu będzie twój rysunek z bloku 1 — wróć na górę i narysuj coś.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setLicense((prev) => (prev.share ? START : { ...prev, share: true }))}
            aria-pressed={license.share}
            className={cn(
              'mb-3 flex w-full cursor-pointer items-center gap-2.5 border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors'
            )}
            style={
              license.share
                ? { borderColor: color, backgroundColor: `${color}14`, color }
                : undefined
            }
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center border-2',
                !license.share && 'border-muted-foreground'
              )}
              style={license.share ? { borderColor: color, backgroundColor: color } : undefined}
            >
              {license.share && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
            </span>
            Zgadzam się, żeby inni używali mojego rysunku
          </button>

          <div className={cn('space-y-2 pl-1', !license.share && 'pointer-events-none opacity-40')}>
            {SWITCHES.map((item) => {
              const on = license[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggle(item.key)}
                  aria-pressed={on}
                  disabled={!license.share}
                  className="flex w-full cursor-pointer items-center gap-2.5 border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
                  style={on ? { borderColor: color, backgroundColor: `${color}0f` } : undefined}
                >
                  <span
                    className={cn(
                      'relative h-5 w-9 shrink-0 border transition-colors',
                      !on && 'border-muted-foreground/50'
                    )}
                    style={on ? { borderColor: color, backgroundColor: `${color}33` } : undefined}
                  >
                    <span
                      className="absolute top-0.5 h-3.5 w-3.5 transition-all"
                      style={{
                        left: on ? '1.25rem' : '0.125rem',
                        backgroundColor: on ? color : 'var(--muted-foreground)',
                      }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    {item.label}
                    <span className="ml-1.5 text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {autoBy && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 border-l-2 pl-2.5 text-xs leading-relaxed"
                style={{ borderColor: color }}
              >
                Dołożyłem/am ci <strong>BY</strong>. Jeśli stawiasz warunki, musisz też chcieć być
                podpisany/a — każda licencja Creative Commons z warunkami zaczyna się od BY.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Nazwa licencji + co ona znaczy */}
        <div className="border p-3 sm:p-4" style={{ borderColor: `${color}55` }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            To, co ustawiłeś/ustawiłaś, ma swoją nazwę
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={named.code}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="border-2 p-4 text-center"
              style={{ borderColor: color }}
            >
              <p className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color }}>
                {named.code}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{named.label}</p>
            </motion.div>
          </AnimatePresence>

          <p className="mt-4 text-sm leading-relaxed">
            {license.share ? (
              <>
                Takie skróty widzisz pod zdjęciami, filmami i dźwiękami w internecie. To nie są
                ozdobniki — <strong>to zdania takie jak twoje</strong>, napisane przez autora
                zanim ktokolwiek zapytał.
              </>
            ) : (
              <>
                Dopóki nic nie włączysz, twój rysunek ma najmocniejszą ochronę, jaka istnieje —
                i tak samo jest z każdym zdjęciem w sieci, <strong>przy którym nic nie
                napisano</strong>. Brak informacji nie znaczy „wolno”.
              </>
            )}
          </p>

          {!opened && (
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Inbox className="h-4 w-4" aria-hidden />
              Otwórz skrzynkę z prośbami
            </button>
          )}
        </div>
      </div>

      {/* Prośby — odpowiada im licencja, nie dziecko */}
      {opened && (
        <div className="mt-6 border-t pt-5">
          <p className="mb-3 text-sm text-muted-foreground">
            Trzy osoby zobaczyły twój rysunek. Ty nic nie klikasz — patrz, co im odpowiada twoja
            licencja.
          </p>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {REQUESTS.slice(0, shown).map((request) => {
                const verdict = answer(license, request);
                const Icon = request.icon;
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border p-3 sm:p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-muted">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{request.from}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                          „{request.text}”
                        </p>
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={verdict.text}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'mt-3 flex items-start gap-2 border-l-2 py-1 pl-2.5 text-sm font-medium leading-relaxed',
                          verdict.ok
                            ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                            : 'border-red-500 text-red-700 dark:text-red-400'
                        )}
                      >
                        {verdict.ok ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        )}
                        {verdict.text}
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
                style={{ borderColor: color }}
              >
                <p>
                  <strong>Przestaw teraz któryś przełącznik i spójrz w górę.</strong> Odpowiedzi
                  zmieniły się same — nikt nie pisze do ciebie drugi raz. Na tym polega licencja:
                  odpowiadasz raz, z góry, wszystkim naraz.
                </p>
                <p className="mt-3 flex items-start gap-2 text-muted-foreground">
                  <Ban className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    I odwrotnie: pod cudzym zdjęciem takie same trzy warunki odpowiadają{' '}
                    <strong>tobie</strong>. Jeśli nie ma tam nic — pytanie zostaje bez odpowiedzi,
                    a to znaczy „nie”.
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
