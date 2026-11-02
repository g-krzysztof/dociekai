'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, GraduationCap, Home, Phone, PhoneCall, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ćwiczenie lekcji — i jedyny blok w kursie, który ćwiczy **pierwsze zdanie**.
 *
 * Dzieci zwykle wiedzą, że „trzeba powiedzieć dorosłemu”. Nie robią tego nie
 * dlatego, że nie wiedzą, tylko dlatego, że boją się reakcji: że zabiorą
 * komputer, że zrobi się afera, że trzeba będzie się przedstawić. Ten blok
 * pozwala tę rozmowę odbyć na sucho i usłyszeć, że żadna z tych rzeczy się nie
 * dzieje — od trzech różnych osób.
 *
 * Trzy rozmowy = trzy różne interfejsy: pokój (rodzic), korytarz (wychowawca) i
 * **ekran połączenia z licznikiem czasu** (116 111), żeby telefon zaufania
 * wyglądał na to, czym jest — na telefon, nie na kolejny kafelek.
 *
 * Blok kończy się po pierwszej przeprowadzonej rozmowie; licznik zachęca do
 * odbycia wszystkich trzech, ale niczego nie wymusza.
 */

type PersonId = 'rodzic' | 'wychowawca' | 'telefon';

interface Answer {
  text: string;
  reply: string;
}

interface Person {
  id: PersonId;
  name: string;
  role: string;
  icon: LucideIcon;
  /** Czego dziecko naprawdę się boi przy tej osobie. */
  fear: string;
  /** Pierwsze zdania do wyboru — wszystkie działają, różnią się trudnością. */
  openers: string[];
  /** Odpowiedź osoby, po dwóch „bańkach”. */
  says: string[];
  question: string;
  answers: Answer[];
  /** Plan działania podany słowami tej osoby. */
  plan: string[];
  closing: string;
}

const PEOPLE: Person[] = [
  {
    id: 'rodzic',
    name: 'Mama',
    role: 'rodzic albo opiekun',
    icon: Home,
    fear: 'Boisz się, że zabiorą ci komputer albo telefon.',
    openers: [
      'Mamo, mogę ci coś pokazać?',
      'Muszę ci powiedzieć o czymś głupim, co zrobiłem/zrobiłam.',
      'Nie wiem, czy to ważne, ale ktoś dziwnie do mnie pisze.',
    ],
    says: [
      'Jasne. Siadaj, pokaż.',
      'I od razu ci powiem: nie zabieram ci za to komputera. To nie ty zrobiłeś/zrobiłaś coś złego.',
    ],
    question: 'Masz jeszcze tę wiadomość?',
    answers: [
      { text: 'Mam zrzut ekranu.', reply: 'Świetnie. To nam w zupełności wystarczy.' },
      {
        text: 'Skasowałem/skasowałam ją od razu.',
        reply: 'Nic straconego, poradzimy sobie. Następnym razem zrób zrzut, zanim cokolwiek zrobisz.',
      },
      {
        text: 'Nie wiem, gdzie to teraz jest.',
        reply: 'To poszukamy razem. Tylko nic już nie kasuj i nie odpisuj.',
      },
    ],
    plan: [
      'Nic mu nie odpisujesz — od tej chwili to moja sprawa, nie twoja.',
      'Robimy zrzuty wszystkiego, co jeszcze jest.',
      'Zgłaszamy to razem w aplikacji i blokujemy tę osobę.',
      'Jak coś się jeszcze pojawi, przychodzisz do mnie tego samego dnia.',
    ],
    closing:
      'Najtrudniejsze było pierwsze zdanie — reszta rozmowy potoczyła się sama. Tak to zwykle wygląda naprawdę.',
  },
  {
    id: 'wychowawca',
    name: 'Pani Anna',
    role: 'wychowawczyni',
    icon: GraduationCap,
    fear: 'Boisz się, że zrobi się afera na całą klasę i wyjdzie, że to od ciebie.',
    openers: [
      'Czy mogę z panią chwilę porozmawiać na osobności?',
      'Dzieje się coś w naszej klasowej grupie.',
      'Nie chcę być skarżypytą, ale…',
    ],
    says: [
      'Możemy porozmawiać teraz, chodźmy na bok.',
      'I od razu: nie muszę nikomu mówić, że to od ciebie. Zajmę się tym tak, żeby na ciebie nie wyszło.',
    ],
    question: 'Kogo to dotyczy?',
    answers: [
      { text: 'Mnie.', reply: 'Dziękuję, że mi powiedziałeś/powiedziałaś. Zajmiemy się tym.' },
      {
        text: 'Kolegi z klasy.',
        reply: 'To bardzo dobrze, że reagujesz. On sam mógłby się nie odezwać.',
      },
      {
        text: 'Wolę na razie nie mówić.',
        reply: 'W porządku. Wystarczy mi, że wiem, że coś się dzieje — resztę sprawdzę sama.',
      },
    ],
    plan: [
      'Nie dopisujesz nic w tej grupie ani pod tymi komentarzami.',
      'Przyślij mi zrzuty ekranu, które masz — resztę zbiorę sama.',
      'Porozmawiam z tymi osobami i z ich rodzicami, bez twojego nazwiska.',
      'Jeśli po tym coś się jeszcze pojawi, mówisz mi od razu.',
    ],
    closing:
      'Mówienie o krzywdzie to nie skarżenie. Skarży się po to, żeby komuś dokopać — ty chciałeś/chciałaś, żeby ktoś przestał być krzywdzony. To dwie różne rzeczy.',
  },
  {
    id: 'telefon',
    name: '116 111',
    role: 'Telefon Zaufania dla Dzieci i Młodzieży',
    icon: Phone,
    fear: 'Boisz się, że trzeba się przedstawić albo że zadzwonią do twoich rodziców.',
    openers: [
      'Dzień dobry… nie wiem, jak zacząć.',
      'Chciałem/chciałam o coś zapytać.',
      '(nic nie mówisz przez chwilę)',
    ],
    says: [
      'Dzień dobry, jesteś w Telefonie Zaufania dla Dzieci i Młodzieży. Jestem tutaj i mamy tyle czasu, ile potrzebujesz.',
      'Nie musisz podawać imienia ani skąd dzwonisz. Rozmowa jest bezpłatna i nie pojawi się na żadnym rachunku.',
    ],
    question: 'Chcesz mi opowiedzieć, co się dzieje?',
    answers: [
      { text: 'Ktoś obcy pisze do mnie w grze.', reply: 'Dobrze, że dzwonisz. Opowiedz mi po kolei.' },
      { text: 'Wyśmiewają mnie w klasowej grupie.', reply: 'Przykro mi, że cię to spotkało. To nie jest twoja wina.' },
      { text: 'Jeszcze nie wiem, jak to nazwać.', reply: 'To nic. Zacznij od czegokolwiek, poukładamy to razem.' },
    ],
    plan: [
      'Nie odpisujesz tej osobie — nic nie musisz jej tłumaczyć.',
      'Jeśli możesz, zrób zdjęcie ekranu albo zapisz, co dokładnie napisała.',
      'Spróbuj powiedzieć o tym komuś dorosłemu, kogo znasz. Możemy się teraz zastanowić, komu.',
      'Możesz tu dzwonić albo pisać na 116111.pl, ile razy chcesz. Także wtedy, gdy tylko masz ochotę pogadać.',
    ],
    closing:
      'Naprawdę tak to działa: 116 111 jest bezpłatny, anonimowy i czynny cały czas, także w nocy i w weekend. Możesz zadzwonić, nawet jeśli nie wiesz, co powiedzieć.',
  },
];

type Stage = 'who' | 'opener' | 'talk' | 'answer' | 'plan';

interface AskForHelpProps {
  color: string;
  onComplete?: () => void;
}

export function AskForHelp({ color, onComplete }: AskForHelpProps) {
  const [personId, setPersonId] = useState<PersonId | null>(null);
  const [stage, setStage] = useState<Stage>('who');
  const [opener, setOpener] = useState<string | null>(null);
  const [saidCount, setSaidCount] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [finished, setFinished] = useState<PersonId[]>([]);
  const [callSeconds, setCallSeconds] = useState(0);

  const person = PEOPLE.find((entry) => entry.id === personId) ?? null;
  const isCall = person?.id === 'telefon';

  // Odpowiedź dorosłego dochodzi zdanie po zdaniu — rozmowa ma swój rytm.
  useEffect(() => {
    if (stage !== 'talk' || !person || saidCount >= person.says.length) return;
    const timer = window.setTimeout(() => setSaidCount((prev) => prev + 1), saidCount === 0 ? 700 : 1500);
    return () => window.clearTimeout(timer);
  }, [stage, saidCount, person]);

  useEffect(() => {
    if (stage !== 'talk' || !person || saidCount < person.says.length) return;
    const timer = window.setTimeout(() => setStage('answer'), 600);
    return () => window.clearTimeout(timer);
  }, [stage, saidCount, person]);

  // Licznik długości połączenia — tylko dla 116 111.
  useEffect(() => {
    if (!isCall || stage === 'who' || stage === 'plan') return;
    const timer = window.setTimeout(() => setCallSeconds((prev) => prev + 1), 1000);
    return () => window.clearTimeout(timer);
  }, [isCall, stage, callSeconds]);

  const pickPerson = (id: PersonId) => {
    setPersonId(id);
    setStage('opener');
    setOpener(null);
    setSaidCount(0);
    setAnswer(null);
    setCallSeconds(0);
  };

  const pickOpener = (line: string) => {
    setOpener(line);
    setStage('talk');
  };

  const pickAnswer = (picked: Answer) => {
    setAnswer(picked);
    setStage('plan');
    if (personId && !finished.includes(personId)) {
      setFinished((prev) => [...prev, personId]);
      onComplete?.();
    }
  };

  const backToPeople = () => {
    setPersonId(null);
    setStage('who');
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Najtrudniejsze w proszeniu o pomoc nie jest to, co powiesz później — tylko{' '}
          <strong>pierwsze zdanie</strong>. Przećwicz je tutaj, na sucho.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {finished.length}/3 rozmowy
        </p>
      </div>

      {/* Wybór osoby */}
      {stage === 'who' && (
        <div className="grid gap-3 sm:grid-cols-3">
          {PEOPLE.map((entry) => {
            const Icon = entry.icon;
            const done = finished.includes(entry.id);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => pickPerson(entry.id)}
                className="flex h-full cursor-pointer flex-col border p-3 text-left transition-colors hover:bg-muted/40"
                style={done ? { borderColor: color } : undefined}
              >
                <span className="flex items-center gap-2 font-bold" style={{ color }}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {entry.name}
                  {done && <Check className="ml-auto h-3.5 w-3.5 shrink-0" aria-hidden />}
                </span>
                <span className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {entry.role}
                </span>
                <span className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {entry.fear}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Rozmowa */}
      {person && stage !== 'who' && (
        <div className="mx-auto max-w-lg">
          <div
            className={cn(
              'border',
              isCall ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-50 dark:bg-zinc-800/60'
            )}
          >
            {/* Nagłówek: ekran połączenia albo zwykły pasek rozmowy */}
            {isCall ? (
              <div className="border-b border-zinc-700 px-4 py-4 text-center">
                <PhoneCall className="mx-auto mb-2 h-5 w-5 text-emerald-400" aria-hidden />
                <p className="font-mono text-lg font-bold tracking-wider">116 111</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  Telefon Zaufania dla Dzieci i Młodzieży
                </p>
                <p className="mt-1.5 font-mono text-xs tabular-nums text-emerald-400">
                  {Math.floor(callSeconds / 60)}:{String(callSeconds % 60).padStart(2, '0')}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 border-b bg-zinc-200 px-3 py-2 dark:bg-zinc-700">
                <person.icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="text-sm font-semibold">{person.name}</span>
                <span className="text-xs text-muted-foreground">· {person.role}</span>
              </div>
            )}

            <div className="space-y-2.5 p-4" aria-live="polite">
              {opener && (
                <p
                  className={cn(
                    'ml-auto w-fit max-w-[85%] px-3 py-2 text-sm leading-relaxed text-white',
                    !opener && 'hidden'
                  )}
                  style={{ backgroundColor: color }}
                >
                  {opener}
                </p>
              )}

              {person.says.slice(0, saidCount).map((line) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'w-fit max-w-[85%] px-3 py-2 text-sm leading-relaxed',
                    isCall ? 'bg-zinc-700' : 'bg-white dark:bg-zinc-900'
                  )}
                >
                  {line}
                </motion.p>
              ))}

              {stage === 'talk' && saidCount < person.says.length && (
                <p
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-2.5',
                    isCall ? 'bg-zinc-700' : 'bg-white dark:bg-zinc-900'
                  )}
                >
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="block h-1.5 w-1.5 rounded-full bg-zinc-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: dot * 0.18 }}
                    />
                  ))}
                  <span className="sr-only">{person.name} odpowiada</span>
                </p>
              )}

              {(stage === 'answer' || stage === 'plan') && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'w-fit max-w-[85%] px-3 py-2 text-sm font-medium leading-relaxed',
                    isCall ? 'bg-zinc-700' : 'bg-white dark:bg-zinc-900'
                  )}
                >
                  {person.question}
                </motion.p>
              )}

              {answer && (
                <>
                  <p
                    className="ml-auto w-fit max-w-[85%] px-3 py-2 text-sm leading-relaxed text-white"
                    style={{ backgroundColor: color }}
                  >
                    {answer.text}
                  </p>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'w-fit max-w-[85%] px-3 py-2 text-sm leading-relaxed',
                      isCall ? 'bg-zinc-700' : 'bg-white dark:bg-zinc-900'
                    )}
                  >
                    {answer.reply}
                  </motion.p>
                </>
              )}
            </div>

            {/* Twoja kolej */}
            {(stage === 'opener' || stage === 'answer') && (
              <div
                className={cn(
                  'flex flex-col gap-1.5 border-t p-2.5',
                  isCall ? 'border-zinc-700' : 'bg-zinc-100 dark:bg-zinc-800'
                )}
              >
                <p
                  className={cn(
                    'px-1 pb-0.5 text-[11px] font-semibold uppercase tracking-wide',
                    isCall ? 'text-zinc-400' : 'text-muted-foreground'
                  )}
                >
                  {stage === 'opener' ? 'Jak zaczniesz?' : 'Co odpowiadasz?'}
                </p>
                {(stage === 'opener'
                  ? person.openers.map((line) => ({ text: line, reply: '' }))
                  : person.answers
                ).map((option) => (
                  <button
                    key={option.text}
                    type="button"
                    onClick={() =>
                      stage === 'opener' ? pickOpener(option.text) : pickAnswer(option as Answer)
                    }
                    className={cn(
                      'cursor-pointer border px-3 py-2 text-left text-sm leading-snug transition-colors',
                      isCall
                        ? 'border-zinc-600 bg-zinc-900 hover:bg-zinc-700'
                        : 'bg-white hover:bg-muted/60 dark:bg-zinc-900'
                    )}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plan podany słowami tej osoby */}
          <AnimatePresence>
            {stage === 'plan' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 border-l-4 p-4"
                style={{ borderColor: color, backgroundColor: `${color}0c` }}
              >
                <p className="text-sm font-bold" style={{ color }}>
                  {person.name}: „Zrobimy tak, po kolei:”
                </p>
                <ol className="mt-2.5 space-y-1.5">
                  {person.plan.map((step, index) => (
                    <li key={step} className="flex gap-2.5 text-sm leading-relaxed">
                      <span className="font-mono font-bold" style={{ color }}>
                        {index + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 border-t pt-3 text-sm leading-relaxed text-muted-foreground">
                  {person.closing}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={backToPeople}
                    className="inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
                    style={{ borderColor: color, color }}
                  >
                    {finished.length < PEOPLE.length
                      ? 'Porozmawiaj jeszcze z kimś innym'
                      : 'Wróć do wyboru osoby'}
                  </button>
                </div>

                {finished.length === PEOPLE.length && (
                  <p className="mt-3 text-sm leading-relaxed">
                    <strong>Trzy różne osoby, trzy różne obawy — i za każdym razem to samo:</strong>{' '}
                    nikt cię nie ukarał, nikt nie zrobił afery, nikt nie kazał ci się tłumaczyć.
                    Plan też był ten sam: nie odpisuj, zachowaj dowód, powiedz komuś, zgłoś i
                    zablokuj.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
