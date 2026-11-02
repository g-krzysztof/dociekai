'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AudioLines,
  Ban,
  Bird,
  Check,
  Flower2,
  Image as ImageIcon,
  Music4,
  Search,
  Sun,
  TreeDeciduous,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * „Gdzie szukać legalnych grafik i dźwięków” — jako **filtrowanie biblioteki**,
 * a nie kolejna lista pytań z odpowiedziami. Dziecko ma trzy puste miejsca w
 * prezentacji, dziewięć plików w banku i dwa filtry; wolno mu kliknąć wszystko,
 * ale plik bez licencji zostaje **odrzucony przy wstawianiu**, słowami samej
 * licencji.
 *
 * Dwie rzeczy, których nie da się przekazać opisem, a tu widać:
 * 1. najładniejszy plik w banku jest zastrzeżony — filtr zabiera go z listy,
 *    i to jest cała nauka o tym, po co ten filtr istnieje;
 * 2. **sekcja „Źródła” rośnie sama** z każdego wstawienia — dziecko nie pisze
 *    jej na końcu z pamięci, tylko widzi, że powstaje w chwili brania pliku.
 */

type Kind = 'obraz' | 'dzwiek';
type LicenseCode = 'cc0' | 'ccby' | 'ccbync' | 'zastrzezone' | 'nieznana';

const LICENSES: Record<LicenseCode, { label: string; means: string; ok: boolean }> = {
  cc0: {
    label: 'CC0',
    means: 'Autor zrzekł się wszystkiego. Wolno użyć, przerobić, nawet zarabiać. Podpisu nikt nie wymaga.',
    ok: true,
  },
  ccby: {
    label: 'CC BY',
    means: 'Wolno użyć i przerobić — pod warunkiem, że podpiszesz autora.',
    ok: true,
  },
  ccbync: {
    label: 'CC BY-NC',
    means: 'Wolno użyć, jeśli podpiszesz autora i nic na tym nie zarabiasz. Szkolna prezentacja jest w porządku.',
    ok: true,
  },
  zastrzezone: {
    label: '© zastrzeżone',
    means: 'Autor nie pozwolił nikomu. Żeby użyć, trzeba napisać do niego i dostać zgodę.',
    ok: false,
  },
  nieznana: {
    label: 'brak informacji',
    means: 'Nie wiadomo, kto to zrobił ani czy pozwolił. Brak informacji to nie jest zgoda.',
    ok: false,
  },
};

interface BankItem {
  id: string;
  kind: Kind;
  title: string;
  author: string;
  source: string;
  license: LicenseCode;
  icon: LucideIcon;
  tint: string;
  /** Zdanie, którym plik kusi — po to, żeby wybór coś kosztował. */
  lure?: string;
}

const BANK: BankItem[] = [
  {
    id: 'pszczola-kwiat',
    kind: 'obraz',
    title: 'Pszczoła na kwiacie koniczyny',
    author: 'Marta Wilk',
    source: 'openverse.org',
    license: 'ccby',
    icon: Flower2,
    tint: '#f59e0b',
  },
  {
    id: 'ul-pasieka',
    kind: 'obraz',
    title: 'Drewniane ule w pasiece',
    author: 'Jan Górski',
    source: 'commons.wikimedia.org',
    license: 'cc0',
    icon: TreeDeciduous,
    tint: '#16a34a',
  },
  {
    id: 'plaster-miodu',
    kind: 'obraz',
    title: 'Plaster miodu z bliska',
    author: 'studio Fotobank',
    source: 'sklep ze zdjęciami',
    license: 'zastrzezone',
    icon: Sun,
    tint: '#eab308',
    lure: 'Najładniejsze zdjęcie w całym banku.',
  },
  {
    id: 'pszczola-lot',
    kind: 'obraz',
    title: 'Pszczoła w locie',
    author: 'nie podano',
    source: 'znalezione w wyszukiwarce grafik',
    license: 'nieznana',
    icon: Bird,
    tint: '#0ea5e9',
    lure: 'Było na pierwszym miejscu w wynikach.',
  },
  {
    id: 'laka-kwiaty',
    kind: 'obraz',
    title: 'Łąka pełna kwiatów',
    author: 'Ola Zielińska',
    source: 'pixabay.com',
    license: 'ccbync',
    icon: Flower2,
    tint: '#84cc16',
  },
  {
    id: 'pylek',
    kind: 'obraz',
    title: 'Ziarna pyłku pod mikroskopem',
    author: 'Instytut Przyrodniczy',
    source: 'commons.wikimedia.org',
    license: 'ccby',
    icon: ImageIcon,
    tint: '#a855f7',
  },
  {
    id: 'brzeczenie',
    kind: 'dzwiek',
    title: 'Brzęczenie roju (12 s)',
    author: 'Tomasz Radke',
    source: 'freesound.org',
    license: 'ccby',
    icon: AudioLines,
    tint: '#f97316',
  },
  {
    id: 'piosenka',
    kind: 'dzwiek',
    title: 'Piosenka z listy przebojów',
    author: 'wytwórnia płytowa',
    source: 'serwis z muzyką',
    license: 'zastrzezone',
    icon: Music4,
    tint: '#ef4444',
    lure: 'Wszyscy jej teraz słuchają.',
  },
  {
    id: 'laka-szum',
    kind: 'dzwiek',
    title: 'Szum łąki w południe (30 s)',
    author: 'Archiwum Dźwięków Natury',
    source: 'freesound.org',
    license: 'cc0',
    icon: Waves,
    tint: '#06b6d4',
  },
];

const NEEDED: Record<Kind, number> = { obraz: 2, dzwiek: 1 };

interface PictureBankProps {
  color: string;
  onComplete?: () => void;
}

export function PictureBank({ color, onComplete }: PictureBankProps) {
  const [type, setType] = useState<'wszystko' | Kind>('wszystko');
  const [onlyUsable, setOnlyUsable] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const visible = BANK.filter((item) => {
    if (type !== 'wszystko' && item.kind !== type) return false;
    if (onlyUsable && !LICENSES[item.license].ok) return false;
    if (onlyFree && item.license !== 'cc0') return false;
    return true;
  });

  const picked = chosen.map((id) => BANK.find((item) => item.id === id)!).filter(Boolean);
  const countOf = (kind: Kind) => picked.filter((item) => item.kind === kind).length;
  const open = BANK.find((item) => item.id === openId) ?? null;

  const insert = (item: BankItem) => {
    // Karta pliku wychodzi z animacją, więc szybkie klikanie potrafi trafić w
    // przycisk poprzedniego pliku — bez tej blokady ten sam obraz wpadłby w oba
    // miejsca na obraz.
    if (chosen.includes(item.id)) {
      setRefusal('Ten plik już jest w prezentacji — wybierz inny.');
      return;
    }
    const license = LICENSES[item.license];
    if (!license.ok) {
      setRefusal(
        item.license === 'nieznana'
          ? 'Nie wstawiam. Przy tym pliku nie ma nazwiska autora ani licencji — a „znalezione w wyszukiwarce” nie jest zgodą.'
          : 'Nie wstawiam. Ten plik jest zastrzeżony: żeby go użyć, trzeba napisać do autora i dostać zgodę.'
      );
      return;
    }
    if (countOf(item.kind) >= NEEDED[item.kind]) {
      setRefusal(
        item.kind === 'obraz'
          ? 'Masz już dwa obrazy — usuń jeden, jeśli chcesz zamienić.'
          : 'Masz już jeden dźwięk — usuń go, jeśli chcesz zamienić.'
      );
      return;
    }
    const next = [...chosen, item.id];
    setChosen(next);
    setRefusal(null);
    setOpenId(null);
    const complete =
      next.filter((id) => BANK.find((entry) => entry.id === id)?.kind === 'obraz').length ===
        NEEDED.obraz &&
      next.filter((id) => BANK.find((entry) => entry.id === id)?.kind === 'dzwiek').length ===
        NEEDED.dzwiek;
    if (complete && !done) {
      setDone(true);
      onComplete?.();
    }
  };

  const remove = (id: string) => {
    setChosen((prev) => prev.filter((item) => item !== id));
    setRefusal(null);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Robisz prezentację o pszczołach i potrzebujesz <strong>dwóch obrazów i jednego
        dźwięku</strong>. W banku jest dziewięć plików. Klikaj, sprawdzaj, wstawiaj — bank sam
        powie, czego wziąć nie wolno.
      </p>

      {/* Filtry */}
      <div className="mb-4 flex flex-wrap items-center gap-2 border p-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        {(['wszystko', 'obraz', 'dzwiek'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            aria-pressed={type === option}
            className={cn(
              'cursor-pointer border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/60',
              type === option && 'font-semibold'
            )}
            style={
              type === option
                ? { borderColor: color, backgroundColor: `${color}14`, color }
                : undefined
            }
          >
            {option === 'wszystko' ? 'Wszystko' : option === 'obraz' ? 'Obrazy' : 'Dźwięki'}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />
        <button
          type="button"
          onClick={() => setOnlyUsable((prev) => !prev)}
          aria-pressed={onlyUsable}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/60',
            onlyUsable && 'font-semibold'
          )}
          style={onlyUsable ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
        >
          {onlyUsable && <Check className="h-3 w-3" aria-hidden />}
          Tylko takie, których wolno użyć
        </button>
        <button
          type="button"
          onClick={() => setOnlyFree((prev) => !prev)}
          aria-pressed={onlyFree}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/60',
            onlyFree && 'font-semibold'
          )}
          style={onlyFree ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
        >
          {onlyFree && <Check className="h-3 w-3" aria-hidden />}
          Tylko takie, których nie trzeba podpisywać
        </button>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {visible.length} z {BANK.length}
        </span>
      </div>

      {/* Bank plików */}
      <div className="grid gap-2.5 sm:grid-cols-3">
        <AnimatePresence initial={false}>
          {visible.map((item) => {
            const Icon = item.icon;
            const inUse = chosen.includes(item.id);
            return (
              <motion.button
                layout
                key={item.id}
                type="button"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => {
                  setOpenId(item.id);
                  setRefusal(null);
                }}
                className={cn(
                  'cursor-pointer border p-2.5 text-left transition-colors hover:bg-muted/40',
                  openId === item.id && 'ring-2 ring-offset-1'
                )}
                style={openId === item.id ? { borderColor: color, boxShadow: `0 0 0 2px ${color}` } : undefined}
              >
                <span
                  className="mb-2 flex h-16 w-full items-center justify-center"
                  style={{ backgroundColor: `${item.tint}22` }}
                >
                  <Icon className="h-7 w-7" style={{ color: item.tint }} aria-hidden />
                </span>
                <span className="block text-xs font-semibold leading-snug">{item.title}</span>
                <span className="mt-1 flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-block border px-1.5 py-0.5 text-[10px] font-bold',
                      LICENSES[item.license].ok
                        ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                        : 'border-red-500 text-red-700 dark:text-red-400'
                    )}
                  >
                    {LICENSES[item.license].label}
                  </span>
                  {inUse && (
                    <span className="text-[10px] font-semibold" style={{ color }}>
                      w prezentacji
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <p className="border border-dashed p-4 text-center text-sm text-muted-foreground">
          Przy tych filtrach nie zostało nic. Odznacz jeden i spróbuj jeszcze raz.
        </p>
      )}

      {/* Karta pliku */}
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key={open.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-4 p-4"
            style={{ borderColor: color, backgroundColor: `${color}0a` }}
          >
            <p className="text-sm font-bold">{open.title}</p>
            <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Autor:</dt>
                <dd className="font-medium">{open.author}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Skąd:</dt>
                <dd className="font-medium">{open.source}</dd>
              </div>
            </dl>
            <p className="mt-2 text-sm leading-relaxed">
              <span
                className={cn(
                  'mr-1.5 inline-block border px-1.5 py-0.5 text-[11px] font-bold',
                  LICENSES[open.license].ok
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-red-500 text-red-700 dark:text-red-400'
                )}
              >
                {LICENSES[open.license].label}
              </span>
              {LICENSES[open.license].means}
            </p>
            {open.lure && (
              <p className="mt-1.5 text-xs italic text-muted-foreground">{open.lure}</p>
            )}
            <button
              type="button"
              onClick={() => insert(open)}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 border-2 px-3.5 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Check className="h-4 w-4" aria-hidden />
              Wstaw do prezentacji
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {refusal && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-start gap-2 border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400"
          >
            <Ban className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {refusal}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Prezentacja i rosnąca sekcja Źródła */}
      <div className="mt-6 grid gap-4 border-t pt-5 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Twoja prezentacja
          </p>
          <div className="space-y-2">
            {(['obraz', 'obraz', 'dzwiek'] as Kind[]).map((slot, index) => {
              const ofKind = picked.filter((item) => item.kind === slot);
              const item = slot === 'obraz' ? ofKind[index] : ofKind[0];
              return (
                <div
                  key={`${slot}-${index}`}
                  className={cn(
                    'flex items-center gap-2 border px-3 py-2 text-sm',
                    !item && 'border-dashed text-muted-foreground'
                  )}
                  style={item ? { borderColor: color } : undefined}
                >
                  {item ? (
                    <>
                      <item.icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Usuń: ${item.title}`}
                        className="cursor-pointer text-muted-foreground transition-colors hover:text-primary"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </>
                  ) : (
                    <>puste miejsce na {slot === 'obraz' ? 'obraz' : 'dźwięk'}</>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Slajd „Źródła” — pisze się sam
          </p>
          <div className="border bg-zinc-50 p-3 text-xs leading-relaxed dark:bg-zinc-800/60">
            {picked.length === 0 ? (
              <p className="text-muted-foreground">
                Pusto. Każdy wstawiony plik dopisze się tu sam — bo podpis powstaje w chwili
                brania, nie na końcu z pamięci.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {picked.map((item) => (
                  <li key={item.id}>
                    „{item.title}”, {item.author}, {item.source}, licencja{' '}
                    {LICENSES[item.license].label}
                    {item.license === 'cc0' && (
                      <span className="text-muted-foreground"> (podpis nie był wymagany — i tak wypada)</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
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
              <strong>Ten filtr istnieje naprawdę.</strong> W wyszukiwarce grafik nazywa się
              „prawa użytkowania”, a strony <strong>Openverse</strong>, <strong>Wikimedia
              Commons</strong>, <strong>Pixabay</strong> i <strong>Freesound</strong> (dźwięki)
              pokazują licencję przy każdym pliku — dokładnie tak jak ten bank.
            </p>
            <p className="mt-2 text-muted-foreground">
              Dwa pliki, które odpadły, były najbardziej kuszące w całym banku. Tak to zwykle
              wygląda: najładniejsze zdjęcie i najpopularniejsza piosenka są zastrzeżone, bo ktoś z
              nich żyje.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
