'use client';

import { useState } from 'react';
import { Check, Folder, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PictureView } from '../../picture-view';
import { CARD, PHOTO, formatBytes, weigh, type Format } from '../formaty-i-kartka/card';
import { CheckBar, type ItemProps, type PartItem } from './test-frame';

/**
 * Część C testu — **dokument, obraz i plik**. Trzy zadania, każde z innym
 * gestem:
 *
 * 1. **Format dla dwóch obrazów** — waga jest liczona naprawdę (`weigh` z lekcji o
 *    formatach), a werdykt bierze **lżejszy z dwóch formatów**, a nie regułę
 *    z pamięci. Dzięki temu poprawna odpowiedź wynika z obrazka, a nie z tego,
 *    że dziecko wykuło „rysunek to PNG”.
 * 2. **Styl, nie wygląd** — dwa tytuły wyglądają jak nagłówki, ale są tylko
 *    pogrubione; dopiero styl zapełnia panel nawigacji. Trzecia pogrubiona
 *    linia jest zwykłym wyróżnieniem i nagłówkiem stać się **nie powinna**.
 * 3. **Zapisz jako** — nazwa, folder i format naraz, sprawdzane po trzy warunki.
 */

/* ------------------------------------------------------------------ */
/* 1. Formaty                                                          */
/* ------------------------------------------------------------------ */

type Pick2 = 'png' | 'jpg';

const IMAGES = [
  { id: 'rysunek', label: 'Rysunek z kilkoma płaskimi kolorami', pic: CARD },
  { id: 'zdjecie', label: 'Zdjęcie z płynnymi przejściami barw', pic: PHOTO },
] as const;

function FormatItem({ color, onDone }: ItemProps) {
  const [picked, setPicked] = useState<Record<string, Pick2 | undefined>>({});
  const [checked, setChecked] = useState(false);

  const best = (id: (typeof IMAGES)[number]['id']): Pick2 => {
    const pic = IMAGES.find((item) => item.id === id)!.pic;
    return weigh(pic, 'png') <= weigh(pic, 'jpg') ? 'png' : 'jpg';
  };
  const ok = IMAGES.every((item) => picked[item.id] === best(item.id));
  const ready = IMAGES.every((item) => picked[item.id]);

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        Musisz wysłać oba obrazy e-mailem. Dla każdego wybierz format, w którym plik będzie <strong>lżejszy</strong> i nie
        zepsuje się bez potrzeby.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {IMAGES.map((item) => (
          <div key={item.id} className="border p-3">
            <div className="mx-auto w-40 border">
              <PictureView pic={item.pic} label={item.label} />
            </div>
            <p className="mt-2 text-center text-xs leading-snug text-muted-foreground">{item.label}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['png', 'jpg'] as Format[]).map((format) => {
                const active = picked[item.id] === format;
                const chosenBest = checked && format === best(item.id);
                return (
                  <button
                    key={format}
                    type="button"
                    disabled={checked}
                    aria-pressed={active}
                    onClick={() => setPicked((prev) => ({ ...prev, [item.id]: format as Pick2 }))}
                    className={cn(
                      'min-h-11 cursor-pointer border-2 px-2 text-sm font-bold uppercase disabled:cursor-default',
                      active ? 'bg-muted' : 'hover:bg-muted/40',
                      chosenBest && 'border-emerald-500 bg-emerald-500/15'
                    )}
                    style={{ borderColor: chosenBest ? undefined : active ? color : 'var(--border)' }}
                  >
                    {format}
                    {checked && (
                      <span className="block text-[11px] font-medium normal-case text-muted-foreground">{formatBytes(weigh(item.pic, format))}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <CheckBar
        color={color}
        ready={ready}
        checked={checked}
        ok={ok}
        onCheck={check}
        readyHint="Wybierz format dla obu obrazów."
        explain={
          <p>
            Rysunek waży {formatBytes(weigh(CARD, 'png'))} w PNG i {formatBytes(weigh(CARD, 'jpg'))} w JPG — a JPG dodatkowo psuje ostre krawędzie. Zdjęcie waży{' '}
            {formatBytes(weigh(PHOTO, 'png'))} w PNG i {formatBytes(weigh(PHOTO, 'jpg'))} w JPG: płynne przejścia barw źle się ściskają bez straty, a
            w zdjęciu drobna strata jest niewidoczna. Rysunek: PNG, zdjęcie: JPG.
          </p>
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Style                                                            */
/* ------------------------------------------------------------------ */

interface Line {
  id: string;
  text: string;
  /** Wygląda jak nagłówek (ręcznie pogrubiony i powiększony). */
  looksLikeHeading?: boolean;
  /** Zwykłe wyróżnienie w środku tekstu. */
  emphasis?: boolean;
  wantsHeading?: boolean;
}

const LINES: Line[] = [
  { id: 'l1', text: 'Wycieczka klasowa', looksLikeHeading: true, wantsHeading: true },
  { id: 'l2', text: 'W piątek jedziemy do zoo. Zbiórka o ósmej rano przed szkołą.' },
  { id: 'l3', text: 'Plan dnia', looksLikeHeading: true, wantsHeading: true },
  { id: 'l4', text: 'Najpierw zwiedzamy słoniarnię, potem jemy drugie śniadanie i wracamy autobusem.' },
  { id: 'l5', text: 'Uwaga: zabierz kanapki i wodę!', emphasis: true },
];

function StyleItem({ color, onDone }: ItemProps) {
  const [styled, setStyled] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const ok = LINES.every((line) => Boolean(styled[line.id]) === Boolean(line.wantsHeading));
  const headings = LINES.filter((line) => styled[line.id]);

  const apply = (value: boolean) => {
    if (!selected || checked) return;
    setStyled((prev) => ({ ...prev, [selected]: value }));
  };

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        Panel <strong>Nawigacja</strong> po prawej jest pusty, choć dokument ma dwa tytuły. Zrób tak, żeby oba trafiły do
        panelu — zaznacz linię i nadaj jej styl.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => apply(true)}
              disabled={!selected || checked}
              className="min-h-10 cursor-pointer border-2 px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: color, color }}
            >
              Styl: Nagłówek 1
            </button>
            <button
              type="button"
              onClick={() => apply(false)}
              disabled={!selected || checked}
              className="min-h-10 cursor-pointer border-2 px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Styl: Zwykły tekst
            </button>
          </div>
          <div className="border bg-white p-4 text-zinc-900 dark:bg-zinc-100">
            {LINES.map((line) => {
              const isHeading = Boolean(styled[line.id]);
              const isSelected = selected === line.id;
              return (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => !checked && setSelected(line.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'block w-full cursor-pointer border-2 px-2 py-1.5 text-left leading-snug',
                    isSelected ? 'border-sky-500 bg-sky-50' : 'border-transparent hover:bg-zinc-100',
                    isHeading ? 'border-b-zinc-300 text-[22px] font-bold text-sky-800' : line.looksLikeHeading ? 'text-[20px] font-bold' : line.emphasis ? 'text-[15px] font-bold' : 'text-[15px]'
                  )}
                >
                  {line.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nawigacja</p>
          {headings.length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {headings.map((line) => (
                <li key={line.id} className="border-l-2 pl-2" style={{ borderColor: color }}>
                  {line.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">(pusto)</p>
          )}
        </div>
      </div>

      <CheckBar
        color={color}
        ready={headings.length > 0}
        checked={checked}
        ok={ok}
        onCheck={check}
        readyHint="Zaznacz linię i nadaj jej styl."
        explain={
          <p>
            Tytuły „Wycieczka klasowa” i „Plan dnia” mają być nagłówkami — tylko styl trafia do panelu nawigacji i do spisu treści. Linia „Uwaga: zabierz
            kanapki i wodę!” jest zwykłym wyróżnieniem w tekście: pogrubiona, ale nie jest tytułem, więc stylu nagłówka dostać nie powinna. Wygląd da się
            podrobić pogrubieniem; strukturę tworzą tylko style.
          </p>
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Zapisz jako                                                      */
/* ------------------------------------------------------------------ */

const FOLDERS = [
  { id: 'pulpit', label: 'Pulpit' },
  { id: 'matematyka', label: 'Dokumenty › Szkoła › Matematyka' },
  { id: 'informatyka', label: 'Dokumenty › Szkoła › Informatyka' },
  { id: 'zdjecia', label: 'Zdjęcia' },
  { id: 'pobrane', label: 'Pobrane' },
];

const EXTENSIONS = [
  { id: 'docx', label: '.docx — dokument tekstowy', text: true },
  { id: 'pdf', label: '.pdf — dokument do czytania', text: false },
  { id: 'jpg', label: '.jpg — obraz', text: false },
  { id: 'mp3', label: '.mp3 — dźwięk', text: false },
];

const stripDiacritics = (text: string) =>
  text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function SaveItem({ color, onDone }: ItemProps) {
  const [name, setName] = useState('Bez tytułu');
  const [folder, setFolder] = useState<string | null>(null);
  const [ext, setExt] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const plain = stripDiacritics(name).trim();
  const nameOk = plain.length >= 6 && !/^(bez tytulu|dokument\d*|nowy|new|untitled)/.test(plain) && plain.includes('wycieczk') && !/[\\/:*?"<>|]/.test(name);
  const folderOk = folder === 'informatyka';
  const extOk = ext === 'docx';
  const ok = nameOk && folderOk && extOk;

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  const rows: { ok: boolean; text: string }[] = [
    {
      ok: nameOk,
      text: nameOk
        ? 'Nazwa mówi, o czym jest plik — nauczyciel znajdzie go bez otwierania.'
        : 'Nazwa ma powiedzieć, że to referat o wycieczce (np. „referat-wycieczka”) — „Bez tytułu” nikomu nic nie mówi i bez znaków / \\ : * ? " < > |.',
    },
    {
      ok: folderOk,
      text: folderOk ? 'Folder się zgadza: praca z informatyki leży w folderze Informatyka.' : 'Referat na informatykę ma leżeć w folderze Informatyka, a nie na pulpicie czy w cudzym folderze.',
    },
    {
      ok: extOk,
      text: extOk ? 'Format się zgadza: dokument tekstowy.' : 'Referat to dokument tekstowy — .docx. Obraz i dźwięk to inne rodzaje plików.',
    },
  ];

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        Skończyłeś/skończyłaś <strong>referat o wycieczce klasowej</strong> na informatykę. Zapisz go tak, żeby nauczyciel
        znalazł go od razu: nazwa mówi, o czym jest plik, leży w folderze przedmiotu i jest dokumentem tekstowym.
      </p>

      <div className="mt-4 border bg-muted/20 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zapisz jako</p>
        <label className="mt-2 block text-sm">
          <span className="text-xs font-semibold text-muted-foreground">Nazwa pliku</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={checked}
            spellCheck={false}
            className="mt-1 w-full border bg-white px-3 py-2 text-sm dark:bg-zinc-950"
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Folder</p>
            <div className="mt-1 space-y-1">
              {FOLDERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={checked}
                  aria-pressed={folder === item.id}
                  onClick={() => setFolder(item.id)}
                  className={cn('flex min-h-10 w-full cursor-pointer items-center gap-2 border px-2.5 text-left text-xs', folder === item.id ? 'bg-muted font-semibold' : 'hover:bg-muted/40')}
                  style={folder === item.id ? { borderColor: color } : undefined}
                >
                  <Folder className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Zapisz jako typ</p>
            <div className="mt-1 space-y-1">
              {EXTENSIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={checked}
                  aria-pressed={ext === item.id}
                  onClick={() => setExt(item.id)}
                  className={cn('flex min-h-10 w-full cursor-pointer items-center border px-2.5 text-left text-xs', ext === item.id ? 'bg-muted font-semibold' : 'hover:bg-muted/40')}
                  style={ext === item.id ? { borderColor: color } : undefined}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CheckBar
        color={color}
        ready={folder !== null && ext !== null && name.trim().length > 0}
        checked={checked}
        ok={ok}
        onCheck={check}
        readyHint="Wybierz folder i typ pliku."
        explain={
          <ul className="space-y-1.5">
            {rows.map((row, index) => (
              <li key={index} className="flex items-start gap-2">
                {row.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />}
                <span>{row.text}</span>
              </li>
            ))}
          </ul>
        }
      />
    </div>
  );
}

export const DOC_ITEMS: PartItem[] = [
  { id: 'formaty', title: 'Format pliku dla rysunku i zdjęcia', Item: FormatItem },
  { id: 'style', title: 'Nagłówki jako styl', Item: StyleItem },
  { id: 'zapis', title: 'Nazwa, folder i typ pliku', Item: SaveItem },
];
