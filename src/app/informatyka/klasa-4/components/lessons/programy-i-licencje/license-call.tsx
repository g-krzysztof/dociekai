'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleDollarSign, Gift, Unlock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dylemat lekcji: cztery sytuacje z życia, w których trzeba rozstrzygnąć, czy
 * wolno skorzystać z programu. Realizuje wprost `[5.7]` — przestrzeganie zasad
 * licencji. Nad sytuacjami stoją trzy karty z rodzajami licencji.
 *
 * Każda sytuacja ma odpowiedź zgodną z zasadami — ale to nie jest quiz z jedną
 * „poprawną" liczbą: przy każdym wyborze dziecko dostaje wyjaśnienie skutków,
 * także przy złym. Pozycja się nie zamyka, dopóki nie padnie odpowiedź zgodna
 * z licencją. Odpowiedzi zgodne są na pozycjach 2, 1, 2, 3 — rozrzucone.
 */

interface Choice {
  text: string;
  ok: boolean;
  feedback: string;
}

interface Dilemma {
  id: string;
  scene: string;
  choices: Choice[];
}

const DILEMMAS: Dilemma[] = [
  {
    id: 'kopia-gry',
    scene:
      'Kolega kupił jedną grę i przez pendrive’a przegrał ci jej kopię, żebyś też mógł/mogła zagrać.',
    choices: [
      {
        text: 'Instaluję — skoro on zapłacił, to jest legalnie.',
        ok: false,
        feedback:
          'Jedna licencja to zwykle jedno stanowisko. To, że kolega zapłacił za swoją kopię, nie daje prawa do drugiej — dla ciebie.',
      },
      {
        text: 'Nie instaluję. Kupuję własną albo szukam darmowej gry w tym stylu.',
        ok: true,
        feedback:
          'Zgodnie z zasadami. Albo masz własną licencję, albo grasz w coś, co jest darmowe. Kopia „od kolegi” to złamanie licencji, nawet jeśli nikt tego nie sprawdzi.',
      },
      {
        text: 'Instaluję, ale skasuję po tygodniu.',
        ok: false,
        feedback:
          'Czas nie ma tu znaczenia. Liczy się to, że nie masz własnej licencji — tydzień czy godzina, zasada jest złamana tak samo.',
      },
    ],
  },
  {
    id: 'oficjalna-strona',
    scene:
      'Na oficjalnej stronie programu (np. gimp.org, libreoffice.org) jest duży przycisk „Pobierz za darmo”.',
    choices: [
      {
        text: 'Pobieram — darmowy program z oficjalnej strony wolno używać.',
        ok: true,
        feedback:
          'Tak. Darmowy program z oficjalnej strony twórcy to najbezpieczniejszy przypadek: wiadomo, skąd pochodzi, i licencja pozwala z niego korzystać bez płacenia.',
      },
      {
        text: 'Nie pobieram — darmowe programy to zawsze jakaś podpucha.',
        ok: false,
        feedback:
          '„Darmowy” nie znaczy „podejrzany”. GIMP, LibreOffice czy Firefox są darmowe, bo taki jest pomysł ich twórców. Ważne jest źródło, a nie cena.',
      },
      {
        text: 'Pobieram, ale z innej strony, bo tam idzie szybciej.',
        ok: false,
        feedback:
          'Kopie z nieoficjalnych stron często mają doklejone dodatki, których nikt nie chce — paski w przeglądarce, reklamy, czasem wirusa. Pobieraj tylko ze strony twórcy.',
      },
    ],
  },
  {
    id: 'za-darmo',
    scene:
      'Wpisujesz w wyszukiwarkę „Photoshop za darmo”, a pierwszy wynik obiecuje pełną wersję bez płacenia.',
    choices: [
      {
        text: 'Klikam i instaluję — skoro ktoś to udostępnia.',
        ok: false,
        feedback:
          'Płatny program „za darmo” z przypadkowej strony to prawie zawsze nielegalna kopia albo program z ukrytym wirusem. To najczęstszy sposób, w jaki komputer łapie złośliwe oprogramowanie.',
      },
      {
        text: 'Odpuszczam Photoshopa i biorę darmowy GIMP albo Photopeę.',
        ok: true,
        feedback:
          'Najlepsze wyjście. Do prawie każdego płatnego programu jest darmowy odpowiednik, który zrobi to samo — bez łamania licencji i bez ryzyka.',
      },
      {
        text: 'Proszę rodzica, żeby kliknął za mnie.',
        ok: false,
        feedback:
          'To nie kwestia wieku. Plik jest tak samo nielegalny i tak samo niebezpieczny niezależnie od tego, kto go pobiera.',
      },
    ],
  },
  {
    id: 'open-source',
    scene:
      'Program jest na licencji open source. Chcesz zmienić w nim jeden przycisk i wysłać poprawioną wersję koledze.',
    choices: [
      {
        text: 'Nie wolno — każdy program to czyjaś własność.',
        ok: false,
        feedback:
          'Przy open source jest inaczej. Autor z góry zgodził się, żeby każdy oglądał kod, zmieniał go i rozpowszechniał dalej — na tym polega ta licencja.',
      },
      {
        text: 'Wolno, ale najpierw muszę zapłacić autorowi.',
        ok: false,
        feedback:
          'Open source jest darmowy. Płacić nie trzeba — wystarczy, że przestrzegasz warunków licencji (np. nie ukrywasz, skąd wziąłeś/wzięłaś kod).',
      },
      {
        text: 'Wolno — na tym właśnie polega open source.',
        ok: true,
        feedback:
          'Dokładnie. Otwarty kod można oglądać, poprawiać i przekazywać dalej. Tak powstało mnóstwo programów — jeden zmienia, drugi poprawia, i wszyscy korzystają.',
      },
    ],
  },
];

const LICENSE_CARDS = [
  {
    icon: CircleDollarSign,
    title: 'Płatny',
    body: 'Żeby korzystać legalnie, trzeba kupić licencję (np. Microsoft 365, Photoshop, większość gier). Jedna licencja to zwykle jedno stanowisko.',
  },
  {
    icon: Gift,
    title: 'Darmowy',
    body: 'Pobierasz i używasz bez płacenia, ale twórca zwykle nie pozwala go zmieniać ani sprzedawać (np. przeglądarka, komunikatory, część gier).',
  },
  {
    icon: Unlock,
    title: 'Open source',
    body: 'Darmowy i dodatkowo z otwartym kodem: każdy może zobaczyć, jak działa, poprawić go i rozpowszechniać dalej (np. LibreOffice, GIMP, Firefox, Linux).',
  },
];

interface LicenseCallProps {
  color: string;
  onComplete?: () => void;
}

export function LicenseCall({ color, onComplete }: LicenseCallProps) {
  /** id sytuacji → indeks ostatnio wybranej opcji. */
  const [picks, setPicks] = useState<Record<string, number>>({});

  const isSettled = (d: Dilemma) => {
    const i = picks[d.id];
    return i !== undefined && d.choices[i].ok;
  };
  const solved = DILEMMAS.filter(isSettled).length;
  const finished = solved === DILEMMAS.length;

  const choose = (d: Dilemma, choiceIndex: number) => {
    if (isSettled(d)) return;
    const next = { ...picks, [d.id]: choiceIndex };
    setPicks(next);
    const allOk = DILEMMAS.every((item) => {
      const i = next[item.id];
      return i !== undefined && item.choices[i].ok;
    });
    if (allOk) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      {/* Trzy rodzaje licencji */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {LICENSE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="border p-3" style={{ borderColor: `${color}55` }}>
              <p className="mb-1.5 flex items-center gap-2 font-bold" style={{ color }}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {card.title}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{card.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Cztery sytuacje. W każdej wybierz, <strong>co byś zrobił/zrobiła</strong> — przy każdej
          odpowiedzi zobaczysz, co z niej wynika.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{DILEMMAS.length}
        </p>
      </div>

      <ol className="space-y-5">
        {DILEMMAS.map((dilemma, index) => {
          const pickedIndex = picks[dilemma.id];
          const settled = isSettled(dilemma);

          return (
            <li key={dilemma.id} className="border p-3 sm:p-4">
              <p className="mb-3 flex gap-2 text-sm leading-relaxed sm:text-base">
                <span className="font-mono font-bold" style={{ color }}>
                  {index + 1}.
                </span>
                <span>{dilemma.scene}</span>
              </p>

              <div className="space-y-2">
                {dilemma.choices.map((choice, choiceIndex) => {
                  const isPicked = pickedIndex === choiceIndex;
                  const showOk = isPicked && choice.ok;
                  const showWrong = isPicked && !choice.ok;
                  return (
                    <div key={choice.text}>
                      <button
                        type="button"
                        onClick={() => choose(dilemma, choiceIndex)}
                        disabled={settled}
                        aria-pressed={isPicked}
                        className={cn(
                          'flex w-full items-start gap-2.5 border px-3 py-2 text-left text-sm leading-relaxed transition-colors',
                          settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50',
                          showWrong && 'border-red-600 text-red-700 dark:text-red-400'
                        )}
                        style={
                          showOk
                            ? { borderColor: color, backgroundColor: `${color}14`, color }
                            : undefined
                        }
                      >
                        <span className="mt-0.5 shrink-0">
                          {showOk ? (
                            <Check className="h-4 w-4" aria-hidden />
                          ) : showWrong ? (
                            <X className="h-4 w-4" aria-hidden />
                          ) : (
                            <span
                              className="block h-4 w-4 border"
                              style={{ borderColor: 'var(--border)' }}
                            />
                          )}
                        </span>
                        {choice.text}
                      </button>

                      <AnimatePresence>
                        {isPicked && (
                          <motion.p
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-1.5 border-l-2 pl-3 text-sm leading-relaxed text-muted-foreground"
                            style={{ borderColor: choice.ok ? color : '#dc2626' }}
                          >
                            {choice.feedback}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Trzy pytania wystarczą, żeby nie wpaść.</strong> Skąd biorę program — z
            oficjalnej strony czy z przypadkowej? Jest darmowy czy płatny? I czy licencja pozwala mi
            na to, co chcę zrobić? „Za darmo” z losowej strony to prawie zawsze pułapka.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
