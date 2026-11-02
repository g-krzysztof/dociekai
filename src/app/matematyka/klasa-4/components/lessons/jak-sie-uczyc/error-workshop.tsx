'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Lightbulb, MousePointerClick, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/** Typy błędów, które dziecko rozpoznaje w zadaniu — te same wracają w zeszycie błędów. */
const ERROR_TYPES = [
  { id: 'regula', label: 'Mylę regułę', hint: 'Wiem, co robić, ale robię to w złej kolejności albo złym sposobem.' },
  { id: 'rachunek', label: 'Błąd w rachunkach', hint: 'Reguła dobra, ale pomyliłem się w samym liczeniu.' },
  { id: 'nieuwaga', label: 'Nieuwaga, pośpiech', hint: 'Przepisałem złą cyfrę, zgubiłem znak, nie doczytałem.' },
  { id: 'pytanie', label: 'Odpowiedź nie na to pytanie', hint: 'Policzone dobrze, ale zadanie pytało o coś innego.' },
] as const;

type ErrorTypeId = (typeof ERROR_TYPES)[number]['id'];

interface SolutionLine {
  text: string;
  /**
   * Komentarz po kliknięciu tej linijki. Każda linijka ma własny — dzięki temu
   * także „pudło” czegoś uczy (np. że błąd zdarzył się wcześniej).
   */
  note: string;
}

interface ErrorTask {
  id: string;
  level: 'K' | 'P' | 'R';
  levelName: string;
  /** Autor rozwiązania — dziecko poprawia cudzą pracę, nie własną. */
  who: string;
  /** Dopełniacz imienia („zeszyt Kuby”, „wpis Ali”) — polska odmiana, nie da się jej sklecić z mianownika. */
  whoGenitive: string;
  avatar: string;
  /** Treść zadania. */
  prompt: string;
  /** Co się stało: jaki wynik dostał uczeń i że jest zły. */
  story: string;
  lines: SolutionLine[];
  wrongLine: number;
  correctType: ErrorTypeId;
  typeFeedback: string;
  /** Naprowadzenie po wybraniu złego typu błędu — inne dla każdego zadania. */
  typeMiss: string;
  question: string;
  answer: string;
  /** Wpis do zeszytu błędów. */
  entry: { wrong: string; right: string; why: string; rule: string };
}

const TASKS: ErrorTask[] = [
  {
    id: 'kolejnosc',
    level: 'K',
    levelName: 'Konieczne',
    who: 'Kuba',
    whoGenitive: 'Kuby',
    avatar: '🧒',
    prompt: 'Oblicz: 2 + 3 × 4',
    story: 'Kubie wyszło 20 i dostał czerwony minus. W jego rozwiązaniu jedna linijka jest błędna.',
    lines: [
      {
        text: '2 + 3 × 4 =',
        note: 'To jeszcze samo przepisane zadanie — tutaj nic nie zostało policzone, więc nie ma tu co popsuć.',
      },
      {
        text: '= 5 × 4 =',
        note: 'Dokładnie tutaj. Skąd wzięła się piątka? Kuba dodał 2 + 3, bo zaczął liczyć od lewej do prawej — tak, jak się czyta. A mnożenie ma pierwszeństwo przed dodawaniem.',
      },
      {
        text: '= 20',
        note: 'Samo 5 × 4 = 20 jest policzone dobrze. Tylko że ta piątka w ogóle nie powinna się tu pojawić — błąd zdarzył się linijkę wcześniej.',
      },
    ],
    wrongLine: 1,
    correctType: 'regula',
    typeFeedback:
      'To błąd reguły: mnożenie i dzielenie wykonujemy przed dodawaniem i odejmowaniem.',
    typeMiss:
      'Kuba nie przeliczył się — 2 + 3 to faktycznie 5, a 5 × 4 to 20. Pomylił się w tym, które działanie wykonać jako pierwsze.',
    question: 'Ile powinno wyjść?',
    answer: '14',
    entry: {
      wrong: '2 + 3 × 4 = 5 × 4 = 20',
      right: '2 + 3 × 4 = 2 + 12 = 14',
      why: 'Liczyłem od lewej do prawej, jak przy czytaniu. Ale × wykonuje się przed +.',
      rule: 'Zanim zacznę liczyć, zakreślam ołówkiem × i : — to robię najpierw.',
    },
  },
  {
    id: 'odejmowanie',
    level: 'P',
    levelName: 'Podstawowe',
    who: 'Ala',
    whoGenitive: 'Ali',
    avatar: '👧',
    prompt: 'Oblicz sposobem pisemnym: 74 − 28',
    story: 'Ali wyszło 54. Poniżej zapisała, jak liczyła kolejne kolumny. Znajdź pierwszy moment, w którym coś poszło nie tak.',
    lines: [
      {
        text: '74 − 28',
        note: 'To przepisane zadanie. Na razie bez błędu.',
      },
      {
        text: 'jedności: 4 − 8 się nie da, więc liczę 8 − 4 = 4',
        note: 'Tak jest. Odejmowania nie wolno odwracać, bo jest nam wygodniej. Gdy górna cyfra jest mniejsza, pożyczamy dziesiątkę i liczymy 14 − 8 = 6.',
      },
      {
        text: 'dziesiątki: 7 − 2 = 5',
        note: 'Samo 7 − 2 = 5 jest policzone dobrze. Gdyby Ala pożyczyła dziesiątkę, liczyłaby tu 6 − 2. Ale to skutek błędu, nie sam błąd — ten zdarzył się wyżej.',
      },
      {
        text: 'wynik: 54',
        note: 'To tylko przepisane cyfry z dwóch linijek wyżej. Zawsze szukaj pierwszego miejsca, w którym coś się popsuło.',
      },
    ],
    wrongLine: 1,
    correctType: 'regula',
    typeFeedback:
      'To także błąd reguły — zamiast pożyczyć dziesiątkę, Ala odwróciła odejmowanie w kolumnie.',
    typeMiss:
      'Ala policzyła 8 − 4 poprawnie, więc to nie pomyłka w rachunkach. Złamała samą zasadę odejmowania pisemnego.',
    question: 'Ile wynosi 74 − 28?',
    answer: '46',
    entry: {
      wrong: '74 − 28 = 54  (bo 8 − 4 = 4)',
      right: '74 − 28 = 46  (pożyczam: 14 − 8 = 6, potem 6 − 2 = 4)',
      why: 'Nie umiałem odjąć 8 od 4, więc odwróciłem odejmowanie zamiast pożyczyć dziesiątkę.',
      rule: 'Gdy górna cyfra jest mniejsza — pożyczam z sąsiedniej kolumny i skreślam tę cyfrę.',
    },
  },
  {
    id: 'wycieczka',
    level: 'R',
    levelName: 'Rozszerzające',
    who: 'Zosia',
    whoGenitive: 'Zosi',
    avatar: '👧',
    prompt:
      'W klasie jest 28 uczniów. Trzy czwarte klasy pojechało na wycieczkę. Ilu uczniów zostało w szkole?',
    story: 'Zosia napisała, że w szkole zostało 21 uczniów. To zła odpowiedź, a mimo to tylko jedna linijka jej rozwiązania jest błędna.',
    lines: [
      {
        text: '28 : 4 = 7',
        note: 'To dobry krok. Dzieląc przez 4, Zosia obliczyła, ilu uczniów to jedna czwarta klasy — czyli 7.',
      },
      {
        text: '7 × 3 = 21',
        note: 'To też jest poprawne: trzy czwarte klasy to 21 uczniów. Ale zapytaj sam siebie — czy zadanie pytało właśnie o tę liczbę?',
      },
      {
        text: 'Odp.: W szkole zostało 21 uczniów.',
        note: 'Właśnie tutaj. 21 to uczniowie, którzy POJECHALI na wycieczkę. Zadanie pytało o tych, którzy ZOSTALI w szkole.',
      },
    ],
    wrongLine: 2,
    correctType: 'pytanie',
    typeFeedback:
      'Klasyka: rachunki bez zarzutu, ale odpowiedź dotyczy innego pytania niż to w zadaniu.',
    typeMiss:
      'Wszystkie rachunki Zosi są poprawne: 28 : 4 = 7 i 7 × 3 = 21. Zastanów się, czy liczba, którą wpisała w odpowiedzi, dotyczy tych, o których pytano.',
    question: 'Ilu uczniów naprawdę zostało w szkole?',
    answer: '7',
    entry: {
      wrong: 'Odp.: W szkole zostało 21 uczniów.',
      right: 'Pojechało 21 uczniów, więc w szkole zostało 28 − 21 = 7 uczniów (czyli 1/4 klasy).',
      why: 'Policzyłem to, co było najłatwiejsze do policzenia, i nie wróciłem do pytania.',
      rule: 'Na końcu czytam pytanie jeszcze raz i sprawdzam, czy moja odpowiedź na nie odpowiada.',
    },
  },
];

type Stage = 'line' | 'type' | 'answer' | 'done';

interface ErrorWorkshopProps {
  color: string;
  onComplete?: () => void;
}

/** Warsztat poprawy błędów: znajdź błąd → nazwij go → popraw → zapisz w zeszycie błędów. */
export function ErrorWorkshop({ color, onComplete }: ErrorWorkshopProps) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('line');
  const [pickedLine, setPickedLine] = useState<number | null>(null);
  const [pickedType, setPickedType] = useState<ErrorTypeId | null>(null);
  const [answerValue, setAnswerValue] = useState('');
  const [answerState, setAnswerState] = useState<'idle' | 'wrong' | 'ok'>('idle');
  const [attempts, setAttempts] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const containerRef = useSectionScrollAnchor(`${taskIndex}-${allDone}`);

  const task = TASKS[taskIndex];

  const chooseLine = (index: number) => {
    if (stage !== 'line') return;
    setPickedLine(index);
    if (index === task.wrongLine) setStage('type');
  };

  const chooseType = (id: ErrorTypeId) => {
    if (stage !== 'type') return;
    setPickedType(id);
    if (id === task.correctType) setStage('answer');
  };

  const checkAnswer = (event: FormEvent) => {
    event.preventDefault();
    const normalized = answerValue.trim().replace(',', '.');
    if (normalized === task.answer) {
      setAnswerState('ok');
      setStage('done');
      return;
    }
    setAnswerState('wrong');
    setAttempts((prev) => prev + 1);
  };

  const nextTask = () => {
    if (taskIndex + 1 < TASKS.length) {
      setTaskIndex(taskIndex + 1);
      setStage('line');
      setPickedLine(null);
      setPickedType(null);
      setAnswerValue('');
      setAnswerState('idle');
      setAttempts(0);
      return;
    }
    setAllDone(true);
    onComplete?.();
  };

  if (allDone) {
    return (
      <div ref={containerRef} className="border bg-white p-6 dark:bg-zinc-900/80 sm:p-8">
        <h3 className="mb-2 text-xl font-bold">Zeszyt błędów — twoja tajna broń</h3>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Załóż w zeszycie (albo w osobnym małym notesie) miejsce na błędy. Po każdej klasówce i po
          każdej pracy domowej wpisujesz tam <strong>tylko te zadania, w których się pomyliłeś</strong>.
          Trzy linijki na jeden błąd — tyle wystarczy.
        </p>

        <ol className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            { n: 1, title: 'Jak zrobiłem', desc: 'Przepisz swój błędny zapis. Bez wstydu — to materiał dowodowy.' },
            { n: 2, title: 'Jak jest dobrze', desc: 'Rozpisz poprawne rozwiązanie krok po kroku.' },
            { n: 3, title: 'Dlaczego się pomyliłem', desc: 'Jedno zdanie + zasada, która ochroni cię następnym razem.' },
          ].map((item) => (
            <li key={item.n} className="border p-4">
              <span className="mb-2 block font-mono text-2xl font-bold" style={{ color }}>
                {item.n}
              </span>
              <p className="mb-1 font-semibold">{item.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </li>
          ))}
        </ol>

        <p className="p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
          Dzień przed sprawdzianem <strong>nie powtarzasz całego działu</strong> — przeglądasz swój
          zeszyt błędów. To dokładnie te miejsca, w których możesz stracić punkty.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Pasek zadań */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TASKS.map((item, i) => (
          <span
            key={item.id}
            className={cn(
              'flex h-7 w-7 items-center justify-center text-xs font-bold transition-colors',
              i < taskIndex && 'bg-emerald-500 text-white'
            )}
            style={
              i === taskIndex
                ? { backgroundColor: color, color: '#fff' }
                : i > taskIndex
                  ? { backgroundColor: `${color}1a`, color }
                  : undefined
            }
          >
            {i < taskIndex ? <Check className="h-3.5 w-3.5" /> : item.level}
          </span>
        ))}
        <span className="text-xs text-muted-foreground">
          zadanie {taskIndex + 1} z {TASKS.length} · poziom: <strong>{task.levelName}</strong>
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.22 }}
        >
          {/* Treść zadania */}
          <div className="mb-3 border-l-2 bg-muted/50 p-4" style={{ borderColor: color }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Treść zadania
            </p>
            <p className="text-sm font-semibold sm:text-base">{task.prompt}</p>
          </div>

          {/* Co się stało */}
          <div className="mb-4 flex items-start gap-3 bg-rose-50 p-4 dark:bg-rose-950/30">
            <span className="text-2xl leading-none" aria-hidden>
              {task.avatar}
            </span>
            <p className="text-sm leading-relaxed text-rose-900 dark:text-rose-100">{task.story}</p>
          </div>

          {/* Rozwiązanie ucznia */}
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <MousePointerClick className="h-3.5 w-3.5" />
              {stage === 'line'
                ? `Zeszyt ${task.whoGenitive} — kliknij linijkę z błędem`
                : `Zeszyt ${task.whoGenitive} — błąd zaznaczony`}
            </p>

            <ul className="grid gap-1.5">
              {task.lines.map((line, i) => {
                const isWrong = i === task.wrongLine;
                const revealed = stage !== 'line' || pickedLine === i;
                const showAsError = revealed && isWrong;
                const showAsMiss = stage === 'line' && pickedLine === i && !isWrong;

                return (
                  <li key={line.text}>
                    <button
                      type="button"
                      onClick={() => chooseLine(i)}
                      disabled={stage !== 'line'}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-3 border px-4 py-2.5 text-left font-mono text-sm transition-all disabled:cursor-not-allowed sm:text-base',
                        stage === 'line' && 'hover:border-primary/60 hover:bg-muted/60',
                        showAsError && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                        showAsMiss && 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
                        stage !== 'line' && !isWrong && 'opacity-60'
                      )}
                    >
                      <span className="w-4 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
                      <span className="flex-1">{line.text}</span>
                      {showAsError && <X className="h-4 w-4 shrink-0 text-rose-500" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Komentarz do klikniętej linijki — każda ma własny */}
            {stage === 'line' && pickedLine !== null && pickedLine !== task.wrongLine && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
              >
                <strong>Nie ta linijka. </strong>
                {task.lines[pickedLine].note}
              </motion.p>
            )}
            {stage !== 'line' && (
              <p className="mt-2 bg-muted/60 p-3 text-sm leading-relaxed">
                {task.lines[task.wrongLine].note}
              </p>
            )}
          </div>

          {/* Nazwanie błędu */}
          {stage !== 'line' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stage === 'type' ? 'Jaki to typ błędu?' : 'Typ błędu'}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ERROR_TYPES.map((type) => {
                  const isCorrect = type.id === task.correctType;
                  const isPicked = pickedType === type.id;
                  const revealed = stage !== 'type';

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => chooseType(type.id)}
                      disabled={revealed}
                      className={cn(
                        'cursor-pointer border px-4 py-3 text-left text-sm transition-all disabled:cursor-not-allowed',
                        !revealed && 'hover:-translate-y-0.5 hover:shadow-md',
                        revealed && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                        !revealed && isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                        revealed && !isCorrect && 'opacity-50'
                      )}
                    >
                      <span className="block font-semibold">{type.label}</span>
                      <span className="block text-xs text-muted-foreground">{type.hint}</span>
                    </button>
                  );
                })}
              </div>

              {stage === 'type' && pickedType !== null && pickedType !== task.correctType && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                >
                  <strong>Jeszcze nie to. </strong>
                  {task.typeMiss}
                </motion.p>
              )}
              {stage !== 'type' && (
                <p className="mt-2 bg-muted/60 p-3 text-sm leading-relaxed">
                  {task.typeFeedback}
                </p>
              )}
            </motion.div>
          )}

          {/* Poprawny wynik */}
          {(stage === 'answer' || stage === 'done') && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={checkAnswer}
              className="mb-4"
            >
              <label
                htmlFor={`answer-${task.id}`}
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {task.question}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id={`answer-${task.id}`}
                  value={answerValue}
                  onChange={(event) => {
                    setAnswerValue(event.target.value);
                    setAnswerState('idle');
                  }}
                  disabled={stage === 'done'}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="wpisz wynik"
                  className={cn(
                    'w-40 font-mono text-base',
                    answerState === 'wrong' && 'border-rose-400',
                    answerState === 'ok' && 'border-emerald-500'
                  )}
                />
                {stage !== 'done' && <Button type="submit">Sprawdź</Button>}
                {stage === 'done' && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <Check className="h-4 w-4" /> Dobrze!
                  </span>
                )}
              </div>

              {answerState === 'wrong' && (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                  Jeszcze nie to.{' '}
                  {attempts >= 2 && (
                    <>
                      Podpowiedź: poprawny zapis to <strong>{task.entry.right}</strong>
                    </>
                  )}
                </p>
              )}
            </motion.form>
          )}

          {/* Wpis do zeszytu błędów */}
          {stage === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-dashed p-4 sm:p-5"
              style={{ borderColor: `${color}59`, backgroundColor: `${color}0a` }}
            >
              <p className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Lightbulb className="h-4 w-4" style={{ color }} />
                Tak wyglądałby wpis {task.whoGenitive} w zeszycie błędów
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="bg-rose-50 p-3 dark:bg-rose-950/30">
                  <p className="mb-1 text-xs font-bold uppercase text-rose-600 dark:text-rose-300">
                    ❌ Jak zrobiłem
                  </p>
                  <p className="font-mono text-sm leading-relaxed">{task.entry.wrong}</p>
                </div>
                <div className="bg-emerald-50 p-3 dark:bg-emerald-950/30">
                  <p className="mb-1 text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                    ✅ Jak jest dobrze
                  </p>
                  <p className="font-mono text-sm leading-relaxed">{task.entry.right}</p>
                </div>
                <div className="bg-amber-50 p-3 dark:bg-amber-950/30">
                  <p className="mb-1 text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
                    💡 Dlaczego
                  </p>
                  <p className="text-sm leading-relaxed">{task.entry.why}</p>
                </div>
              </div>

              <p className="mt-3 bg-background/70 p-3 text-sm">
                <strong>Zasada na przyszłość:</strong> {task.entry.rule}
              </p>

              <div className="mt-4 flex justify-end">
                <Button onClick={nextTask}>
                  {taskIndex + 1 < TASKS.length ? 'Następne zadanie' : 'Podsumuj warsztat'}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
