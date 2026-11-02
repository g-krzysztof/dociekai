'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, KeyRound, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dylemat lekcji: cztery sytuacje z życia o udostępnianiu i ustawieniach
 * prywatności. Wzorzec `LicenseCall` — przy każdej odpowiedzi, także złej,
 * dziecko widzi skutek. Pozycja zamyka się po wyborze bezpiecznej reakcji.
 *
 * Nad sytuacjami trzy karty: profil „tylko znajomi”, uprawnienia aplikacji,
 * hasło jak klucz. Bezpieczne odpowiedzi na pozycjach 3, 1, 2, 2 — rozrzucone.
 * Realizuje `[5.5]` — hasła i podstawowe ustawienia prywatności.
 */

interface Choice {
  text: string;
  ok: boolean;
  feedback: string;
}

interface Scenario {
  id: string;
  scene: string;
  choices: Choice[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'uprawnienia',
    scene:
      'Instalujesz nową grę. Przy pierwszym uruchomieniu prosi o dostęp do kontaktów w telefonie i do lokalizacji.',
    choices: [
      {
        text: 'Zgadzam się na wszystko, żeby gra ruszyła.',
        ok: false,
        feedback:
          'Gra do grania nie potrzebuje twoich kontaktów ani tego, gdzie jesteś. Zgoda „na wszystko” oddaje te dane firmie, która może je komuś przekazać albo sprzedać.',
      },
      {
        text: 'Odmawiam dostępu do kontaktów i lokalizacji i sprawdzam, czy gra i tak działa.',
        ok: true,
        feedback:
          'Dobrze. Prawie zawsze gra działa bez tych zgód — pytała „na wszelki wypadek”. Dawaj aplikacji tylko to, bez czego naprawdę nie da się jej używać.',
      },
      {
        text: 'Zgadzam się tylko na lokalizację, kontakty odrzucam.',
        ok: false,
        feedback:
          'Lokalizacja to informacja, gdzie jesteś w tej chwili — gra jej nie potrzebuje. Jeśli nie wiesz, po co aplikacji dana zgoda, domyślnie jej nie dawaj.',
      },
    ],
  },
  {
    id: 'profil',
    scene: 'W nowej aplikacji ustawiasz swój profil. Pyta: kto ma widzieć twoje zdjęcia i wpisy?',
    choices: [
      {
        text: 'Ustawiam „tylko znajomi” i dodaję jedynie osoby, które znam z życia.',
        ok: true,
        feedback:
          'Tak. „Tylko znajomi” plus krótka lista naprawdę znanych osób sprawia, że twoje zdjęcia nie krążą po całej sieci. Ustawienia prywatności to jedno kliknięcie, a zmieniają wszystko.',
      },
      {
        text: 'Ustawiam „publiczny”, żeby mieć więcej obserwujących.',
        ok: false,
        feedback:
          'Przy profilu publicznym twoje zdjęcia, miejsca i znajomych widzi każdy — też osoby, które nie powinny. Więcej obserwujących nie jest tego warte.',
      },
      {
        text: 'Ustawiam „publiczny”, ale bez zdjęcia profilowego.',
        ok: false,
        feedback:
          'Brak jednego zdjęcia niewiele daje, gdy reszta profilu i tak jest otwarta dla wszystkich. Zacznij od ustawienia „tylko znajomi”.',
      },
    ],
  },
  {
    id: 'haslo',
    scene: 'Kolega z klasy prosi, żebyś podał/podała mu swoje hasło do gry — „tylko na chwilę, obiecuje”.',
    choices: [
      {
        text: 'Podaję, przecież to kolega i mu ufam.',
        ok: false,
        feedback:
          'Hasło pożyczone przestaje być twoje. Kolega może je komuś pokazać, zapisać na wspólnym komputerze albo w złości coś zmienić na twoim koncie. Zaufanie tu nie wystarcza.',
      },
      {
        text: 'Nie podaję. Hasła nie daje się nikomu — nawet najlepszemu koledze.',
        ok: true,
        feedback:
          'Dokładnie. Hasło jest jak klucz do domu: raz pożyczony, przestaje chronić. Jeśli kolega chce pograć, może założyć własne konto albo zagrać, gdy jesteś obok i logujesz się sam/sama.',
      },
      {
        text: 'Podaję hasło zmienione o jedną literę.',
        ok: false,
        feedback:
          'To nie sztuczka, tylko podanie hasła z małą zagadką. Kolega i tak szybko trafi w prawdziwe. Odpowiedź brzmi po prostu „nie”.',
      },
    ],
  },
  {
    id: 'nieznajomy',
    scene:
      'W grze online ktoś, kogo nie znasz, pisze miło i po chwili pyta, do której chodzisz szkoły i o której wracasz do domu.',
    choices: [
      {
        text: 'Odpisuję — to zwykłe pytania, każdy o to pyta.',
        ok: false,
        feedback:
          'Szkoła plus godzina powrotu mówią obcej osobie, gdzie i kiedy cię spotkać, gdy jesteś sam/sama. Miła rozmowa nie znaczy, że po drugiej stronie jest ktoś, komu można ufać.',
      },
      {
        text: 'Nie odpowiadam na te pytania i mówię o rozmowie rodzicowi albo opiekunowi.',
        ok: true,
        feedback:
          'Właśnie tak. Pytania o szkołę, adres czy godziny to sygnał, żeby przerwać i powiedzieć dorosłemu. To nie jest skarżenie — to proszenie o pomoc w porę.',
      },
      {
        text: 'Podaję tylko miasto, bez nazwy szkoły.',
        ok: false,
        feedback:
          'Każdy kolejny szczegół zawęża krąg. Obcej osobie w grze nie podaje się ani miasta, ani szkoły, ani godzin — nawet „tylko trochę”.',
      },
    ],
  },
];

const CARDS = [
  {
    icon: Users,
    title: 'Profil „tylko znajomi”',
    body: 'Domyślnie ustaw konto tak, żeby twoje wpisy i zdjęcia widzieli wyłącznie ludzie, których znasz z życia. To jedno przełączenie.',
  },
  {
    icon: Eye,
    title: 'Uprawnienia aplikacji',
    body: 'Aparat, mikrofon, lokalizacja, kontakty — dawaj tylko to, bez czego aplikacja naprawdę nie działa. Reszcie mów „nie”.',
  },
  {
    icon: KeyRound,
    title: 'Hasło to klucz',
    body: 'Nie podaje się go nikomu: ani koledze, ani „pomocy technicznej”. Prawdziwa firma nigdy nie prosi o twoje hasło.',
  },
];

interface PrivacyCallProps {
  color: string;
  onComplete?: () => void;
}

export function PrivacyCall({ color, onComplete }: PrivacyCallProps) {
  const [picks, setPicks] = useState<Record<string, number>>({});

  const isSettled = (scenario: Scenario) => {
    const i = picks[scenario.id];
    return i !== undefined && scenario.choices[i].ok;
  };
  const solved = SCENARIOS.filter(isSettled).length;
  const finished = solved === SCENARIOS.length;

  const choose = (scenario: Scenario, choiceIndex: number) => {
    if (isSettled(scenario)) return;
    const next = { ...picks, [scenario.id]: choiceIndex };
    setPicks(next);
    const allOk = SCENARIOS.every((item) => {
      const i = next[item.id];
      return i !== undefined && item.choices[i].ok;
    });
    if (allOk) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {CARDS.map((card) => {
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
          Cztery sytuacje. Wybierz, <strong>co robisz</strong> — przy każdej odpowiedzi zobaczysz,
          co z niej wynika.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{SCENARIOS.length}
        </p>
      </div>

      <ol className="space-y-5">
        {SCENARIOS.map((scenario, index) => {
          const pickedIndex = picks[scenario.id];
          const settled = isSettled(scenario);

          return (
            <li key={scenario.id} className="border p-3 sm:p-4">
              <p className="mb-3 flex gap-2 text-sm leading-relaxed sm:text-base">
                <span className="font-mono font-bold" style={{ color }}>
                  {index + 1}.
                </span>
                <span>{scenario.scene}</span>
              </p>

              <div className="space-y-2">
                {scenario.choices.map((choice, choiceIndex) => {
                  const isPicked = pickedIndex === choiceIndex;
                  const showOk = isPicked && choice.ok;
                  const showWrong = isPicked && !choice.ok;
                  return (
                    <div key={choice.text}>
                      <button
                        type="button"
                        onClick={() => choose(scenario, choiceIndex)}
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
            <strong>Dane i hasła działają jak klucze do domu.</strong> Pożyczone przestają chronić,
            a raz podane w sieci zostają tam na zawsze. Ustaw profil na „tylko znajomi”, dawaj
            aplikacjom jak najmniej, a hasła nie podawaj nikomu.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
