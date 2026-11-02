'use client';

import { useState } from 'react';
import { ImagePlus, Mic, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskShell, type ProofOutcome } from '../../task-shell';
import { SlideContentView, SlidePicture, SlideStage } from './slide-view';
import { RehearsalRunner } from './dress-rehearsal';
import {
  MAX_WORDS,
  MIN_POINTS,
  SLIDES,
  SLIDE_ROLES,
  emptyDeck,
  judgeDeck,
  statsOf,
  talkSlides,
  type PictureKind,
  type StudioSlide,
} from './deck-judge';

/**
 * Blok 5 — zadanie praktyczne, **wykonywane w całości tutaj**.
 *
 * Wcześniejsza wersja tego bloku wysyłała dziecko do prawdziwego programu po
 * plik `.pptx`. To jest droga dla dorosłego: dziesięciolatek gubi się nie na
 * prezentacji, tylko na „Zapisz jako” i na wyborze formatu, a zadanie z lekcji
 * o slajdach zamienia się w zadanie o menu programu. Zostaje więc to samo
 * zamówienie, ten sam werdykt i ta sama nagroda — bez ani jednego kroku poza
 * stroną (ta sama decyzja co przy Z-1 i Z-2, 2026-09-16).
 *
 * Trzy etapy zostają, bo one akurat były dobre: **zlecenie** (opis wyniku plus
 * jawna lista tego, czego będę szukać), **warsztat** (pięć slajdów z podglądem
 * w prawdziwych proporcjach) i **odbiór** (werdykt punkt po punkcie, poprawki
 * za darmo). Szkielet niesie wspólny `TaskShell`; tu zostaje tylko to, co jest
 * o prezentacji.
 *
 * Dwie rzeczy robią z tego zadanie, a nie formularz:
 *
 * - **Odbiorcę dziecko wybiera pierwszym ruchem** i widzi go przy każdym slajdzie
 *   — to jest prosta kontynuacja bloku 4, w którym siedziało na widowni.
 * - **Nagrodą jest próba generalna na jego własnej prezentacji**, czyli zegar z
 *   bloku 3 wycelowany w jego pracę. Dziecko wychodzi z lekcji, wiedząc, ile
 *   jego wystąpienie trwa.
 */

interface Audience {
  id: string;
  name: string;
  hint: string;
}

const AUDIENCES: Audience[] = [
  { id: 'pierwszaki', name: 'Pierwsza klasa', hint: 'Zosia nie zna trudnych słów. Mów tak, jak w domu.' },
  { id: 'klasa', name: 'Twoja klasa', hint: 'Antek już sporo wie. Powiedz im to, czego jeszcze nie znają.' },
  { id: 'rodzice', name: 'Rodzice na zebraniu', hint: 'Zapytają, skąd to wiesz. Miej gotową odpowiedź.' },
];

const PICTURES: { kind: PictureKind; label: string }[] = [
  { kind: 'jez', label: 'zwierzę' },
  { kind: 'wiewiorka', label: 'zwierzę w ruchu' },
  { kind: 'ogrod', label: 'ogród' },
  { kind: 'dom', label: 'dom' },
  { kind: 'pilka', label: 'sport' },
];

/** Kryteria z góry — te same zdania, które potem dostają werdykt. Nie zależą od slajdów. */
const CRITERIA = judgeDeck(emptyDeck()).map(({ id, label }) => ({ id, label }));

export function DeckStudio({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [audience, setAudience] = useState<Audience | null>(null);
  const [deck, setDeck] = useState<StudioSlide[]>(emptyDeck);
  const [active, setActive] = useState(0);
  const [rehearse, setRehearse] = useState(false);

  const stats = statsOf(deck);
  const slide = deck[active];
  const stat = stats[active];

  const edit = (patch: Partial<StudioSlide>) =>
    setDeck((current) => current.map((item, index) => (index === active ? { ...item, ...patch } : item)));

  const judge = (): ProofOutcome<null> => ({
    verdicts: Object.fromEntries(judgeDeck(deck).map(({ id, ok, note }) => [id, { ok, note }])),
    data: null,
  });

  return (
    <TaskShell
      color={color}
      brief={
        <>
          <p>
            Zrób prezentację na <strong>pięć slajdów</strong> o czymś, co znasz — twoje zwierzę, hobby, gra, miejsce, w
            którym byłeś/byłaś. Najpierw jednak jedna decyzja, ta sama, którą oglądałeś/oglądałaś z widowni:{' '}
            <strong>dla kogo</strong> to jest.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {AUDIENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAudience(item)}
                className={cn(
                  'cursor-pointer border px-3 py-1.5 text-sm transition-colors',
                  audience?.id === item.id ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
                style={audience?.id === item.id ? { borderColor: color, color } : undefined}
              >
                {item.name}
              </button>
            ))}
          </div>

          {audience && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color }}>
              {audience.hint}
            </p>
          )}
        </>
      }
      criteria={CRITERIA}
      criteriaHeading="Czego będę szukać w twoich slajdach"
      workshopLabel="Twoje pięć slajdów"
      workshop={
        !audience ? (
          <p className="text-sm text-muted-foreground">Najpierw wybierz odbiorcę — od tego zależy każdy slajd.</p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {deck.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    'cursor-pointer border px-2.5 py-1 text-xs tabular-nums transition-colors',
                    index === active ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
                  )}
                  style={index === active ? { borderColor: color, color } : undefined}
                >
                  {String(index + 1).padStart(2, '0')}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                Dla: <strong className="text-foreground">{audience.name}</strong>
              </span>
            </div>

            <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-5 lg:space-y-0">
              <div className="contents lg:block">
                {/* Podgląd przyklejony na każdej szerokości — dziecko pisze w polach pod nim i musi widzieć, co się zmienia. */}
                <div className="sticky top-9 z-10 -mx-5 bg-white px-5 pb-3 pt-1 dark:bg-zinc-900 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
                  <SlideStage maxWidth={520}>
                    <SlideContentView
                      title={slide.title || SLIDE_ROLES[active].placeholder}
                      lines={stat.lines}
                      picture={slide.picture}
                      accent={color}
                    />
                  </SlideStage>
                  <div className="mx-auto mt-2 flex max-w-[520px] flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
                    <p className="font-semibold uppercase tracking-wide" style={{ color }}>
                      {SLIDE_ROLES[active].hint}
                    </p>
                    <p className="tabular-nums">
                      <span className={cn(stat.words > MAX_WORDS && 'font-semibold text-orange-700 dark:text-orange-400')}>
                        {stat.words} wyrazów
                      </span>
                      <span className="text-muted-foreground"> · litery </span>
                      <strong style={{ color: stat.points >= MIN_POINTS ? color : '#c2410c' }}>{stat.points} pt</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 lg:mt-3">
                  <input
                    value={slide.title}
                    onChange={(event) => edit({ title: event.target.value })}
                    placeholder={SLIDE_ROLES[active].placeholder}
                    className="w-full border bg-transparent px-3 py-2 text-sm outline-none focus:border-current"
                  />
                  {slide.lines.map((line, index) => (
                    <input
                      key={index}
                      value={line}
                      onChange={(event) =>
                        edit({
                          lines: slide.lines.map((item, position) => (position === index ? event.target.value : item)),
                        })
                      }
                      placeholder={SLIDE_ROLES[active].linePlaceholder}
                      className="w-full border bg-transparent px-3 py-2 text-sm outline-none focus:border-current"
                    />
                  ))}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => edit({ lines: [...slide.lines, ''] })}
                      className="inline-flex cursor-pointer items-center gap-1 border px-2 py-1 transition-colors hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                      wiersz
                    </button>
                    <button
                      type="button"
                      onClick={() => edit({ lines: slide.lines.slice(0, -1) })}
                      disabled={slide.lines.length <= 1}
                      className="inline-flex cursor-pointer items-center gap-1 border px-2 py-1 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-3 w-3" aria-hidden />
                      wiersz
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:sticky lg:top-9">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                    <Mic className="h-3.5 w-3.5" aria-hidden />
                    Notatki mówcy — to powiesz na głos
                  </p>
                  <textarea
                    value={slide.notes}
                    onChange={(event) => edit({ notes: event.target.value })}
                    rows={5}
                    placeholder="Zdania, które powiesz przy tym slajdzie. Widz ich nie zobaczy."
                    className="mt-1 w-full border bg-transparent px-3 py-2 text-sm outline-none focus:border-current"
                  />
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{stat.notesWords} wyrazów do powiedzenia</p>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                    <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                    Obraz na tym slajdzie
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PICTURES.map((picture) => (
                      <button
                        key={picture.kind}
                        type="button"
                        onClick={() => edit({ picture: slide.picture === picture.kind ? null : picture.kind })}
                        aria-label={picture.label}
                        aria-pressed={slide.picture === picture.kind}
                        className="cursor-pointer border p-0.5 transition-colors"
                        style={{ borderColor: slide.picture === picture.kind ? color : undefined }}
                      >
                        <span className="block h-11 w-14 overflow-hidden">
                          <span className="block origin-top-left scale-[0.24]">
                            <SlidePicture kind={picture.kind} />
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Tutaj masz pięć gotowych rysunków. W prawdziwym programie wstawisz w to miejsce własne zdjęcie —
                    <strong> Wstawianie → Obraz</strong>.
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      }
      judge={judge}
      checkLabel="Sprawdź moją prezentację"
      canCheck={audience !== null}
      onReset={() => {
        setDeck(emptyDeck());
        setActive(0);
      }}
      resetLabel="Zacznij od pustych slajdów"
      acceptedText={
        <>
          Pięć slajdów, przy których <strong>masz co mówić</strong> — i to jest cała różnica między prezentacją a kartką
          wyświetloną na ścianie. Zostało ostatnie: sprawdzić, ile to trwa.
        </>
      }
      reward={
        <>
          {rehearse ? (
            <RehearsalRunner
              color={color}
              slides={talkSlides(deck)}
              startLabel="Zaczynam"
              note="Tyle trwa twoje wystąpienie. Teraz już wiesz, ile czasu poprosić — i przy którym slajdzie stoisz najdłużej."
            />
          ) : (
            <button
              type="button"
              onClick={() => setRehearse(true)}
              className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              Zrób próbę generalną na swojej prezentacji
            </button>
          )}

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Chcesz mieć tę prezentację naprawdę? Przepisz ją do programu, który masz na komputerze — PowerPoint,
            LibreOffice Impress albo Prezentacje Google. Masz już wszystko: {SLIDES} tytułów, hasła i notatki mówcy.
          </p>
        </>
      }
      onComplete={onComplete}
    />
  );
}
