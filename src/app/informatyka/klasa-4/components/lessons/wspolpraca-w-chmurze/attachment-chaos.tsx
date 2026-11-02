'use client';

import { useState } from 'react';
import { Mail, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk: trzy maile, trzy załączniki, jeden plan wycieczki — i żaden plik nie
 * ma kompletu aktualnych informacji, bo każda osoba poprawiała swoją kopię,
 * nie wiedząc o poprawkach pozostałych dwóch. Dziecko samo to odkrywa,
 * otwierając kolejne załączniki i porównując cztery fakty — dopiero potem
 * pada pytanie. Ten sam plan wraca naprawdę w zadaniu (blok 5), tym razem
 * jako jeden wspólny dokument w chmurze.
 */

interface Version {
  id: string;
  from: string;
  sentLabel: string;
  filename: string;
  note: string;
  facts: { label: string; value: string; missing?: boolean }[];
}

const VERSIONS: Version[] = [
  {
    id: 'kuba',
    from: 'Kuba',
    sentLabel: 'poniedziałek, 10:00',
    filename: 'plan_wycieczki.docx',
    note: 'Pierwsza wersja — wysłana do całej klasy.',
    facts: [
      { label: 'Godzina wyjazdu', value: '8:00' },
      { label: 'Miejsce zbiórki', value: '— nie napisano —', missing: true },
      { label: 'Godzina powrotu', value: '15:00' },
      { label: 'Co zabrać', value: 'kanapki, woda' },
    ],
  },
  {
    id: 'zosia',
    from: 'Zosia',
    sentLabel: 'poniedziałek, 14:00',
    filename: 'plan_wycieczki_v2.docx',
    note: 'Odpowiedź na maila Kuby — z poprawkami po rozmowie z panią.',
    facts: [
      { label: 'Godzina wyjazdu', value: '8:30 (autobus podjeżdża później)' },
      { label: 'Miejsce zbiórki', value: '— nie napisano —', missing: true },
      { label: 'Godzina powrotu', value: '15:00' },
      { label: 'Co zabrać', value: 'kanapki, woda, kurtka przeciwdeszczowa' },
    ],
  },
  {
    id: 'ty',
    from: 'Ty',
    sentLabel: 'wtorek, 9:00',
    filename: 'plan_wycieczki_OSTATECZNA.docx',
    note: 'Twoja wersja — zrobiona z maila Kuby, bo mail Zosi zaginął gdzieś w skrzynce.',
    facts: [
      { label: 'Godzina wyjazdu', value: '8:00' },
      { label: 'Miejsce zbiórki', value: 'przy głównym wejściu do szkoły' },
      { label: 'Godzina powrotu', value: '15:00' },
      { label: 'Co zabrać', value: 'kanapki, woda' },
    ],
  },
];

const OPTIONS = [
  { id: 'kuba', label: 'Plik od Kuby' },
  { id: 'zosia', label: 'Plik od Zosi' },
  { id: 'ty', label: 'Twój plik „OSTATECZNA”' },
  { id: 'none', label: 'Żaden z nich' },
] as const;

export function AttachmentChaos({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);

  const allOpened = VERSIONS.every((v) => opened.includes(v.id));
  const correct = answer === 'none';

  const openVersion = (id: string) => {
    setOpen(id);
    setOpened((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const pick = (id: string) => {
    setAnswer(id);
    if (id === 'none') onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Klasa szykuje wycieczkę. Plan krążył mailem — każdy poprawiał swoją kopię z osobna. Otwórz
        wszystkie trzy załączniki i porównaj cztery fakty.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {VERSIONS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => openVersion(v.id)}
            className="flex cursor-pointer items-start gap-2.5 border-2 p-3 text-left transition-colors hover:bg-muted/40"
            style={{ borderColor: opened.includes(v.id) ? color : 'var(--border)' }}
          >
            <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {v.from} <span className="font-normal text-muted-foreground">· {v.sentLabel}</span>
              </span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3 shrink-0" />
                {v.filename}
              </span>
            </span>
          </button>
        ))}
      </div>

      {open &&
        (() => {
          const v = VERSIONS.find((item) => item.id === open)!;
          return (
            <div className="relative mt-4 border-2 p-4 sm:p-5" style={{ borderColor: color }}>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Zamknij załącznik"
                className="absolute right-3 top-3 cursor-pointer text-muted-foreground hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="pr-6 text-sm font-bold">{v.filename}</p>
              <p className="mb-3 text-xs text-muted-foreground">{v.note}</p>
              <dl className="space-y-1.5 text-sm">
                {v.facts.map((fact) => (
                  <div key={fact.label} className="flex flex-wrap gap-x-2">
                    <dt className="font-medium text-muted-foreground">{fact.label}:</dt>
                    <dd className={cn(fact.missing && 'italic text-muted-foreground')}>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })()}

      {allOpened && (
        <div className="mt-5 border-t pt-5">
          <p className="mb-3 text-sm font-semibold">
            Który plik ma WSZYSTKIE aktualne i kompletne informacje?
          </p>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.map((option) => {
              const isAnswer = answer === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => pick(option.id)}
                  className="cursor-pointer border-2 px-3.5 py-2 text-sm font-medium transition-colors"
                  style={
                    isAnswer
                      ? {
                          borderColor: correct ? color : '#dc2626',
                          backgroundColor: correct ? color : '#dc262614',
                          color: correct ? 'white' : '#dc2626',
                        }
                      : { borderColor: 'var(--border)' }
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {answer && !correct && (
            <p className="mt-3 text-sm text-muted-foreground">
              Sprawdź jeszcze raz każdy plik po kolei — czy naprawdę ma wszystkie cztery fakty i
              najnowsze poprawki?
            </p>
          )}

          {correct && (
            <p className="mt-3 text-sm leading-relaxed">
              Dokładnie — <strong>żaden</strong>. Kuba nie wie o zmianie godziny, Zosia nie napisała
              miejsca zbiórki, a Ty nie widziałeś maila Zosi, więc Twój plik cofnął godzinę wyjazdu
              i zgubił kurtkę. Trzy osoby, trzy kopie, żadna nie ma kompletu. Po to właśnie istnieje
              <strong> jeden wspólny dokument w chmurze</strong> — zamiast trzech plików krążących
              mailem, jest tylko jedna kopia, którą wszyscy widzą naraz.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
