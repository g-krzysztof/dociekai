'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  Flag,
  ImageIcon,
  MessageCircle,
  Play,
  RotateCcw,
  Send,
  Smile,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Blok centralny lekcji: **scena, która toczy się sama**.
 *
 * Pod klasowym zdjęciem zaczyna się nagonka na Kubę. Komentarze dochodzą co
 * ~2 sekundy niezależnie od tego, co dziecko zrobi — i to jest cała różnica
 * wobec zwykłego „wybierz odpowiedź”: tu czas płynie, a bierność też jest
 * decyzją. Dziecko ma tacę pięciu działań, każde do użycia raz.
 *
 * Najważniejsza mechanika: **„Powiedz dorosłemu” faktycznie przerywa scenę** —
 * wychowawczyni zamyka wątek i komentarze przestają dochodzić. To jedyne
 * działanie, które zatrzymuje nagonkę, i dziecko odkrywa to samo, przez
 * konsekwencję, a nie z podpisu pod obrazkiem.
 *
 * Nic tu nie jest punktowane. Podsumowanie mówi, co dziecko zrobiło i co to
 * zmieniło dla Kuby, a scenę można odegrać jeszcze raz, inaczej.
 */

interface Comment {
  author: string;
  text: string;
  /** Komentarz dopisany przez dziecko — inny kolor bańki. */
  mine?: boolean;
}

const STREAM: Comment[] = [
  { author: 'Zosia', text: 'ale fajna wycieczka była 😄' },
  { author: 'Bartek', text: 'zobaczcie na Kubę z lewej hahaha' },
  { author: 'Olek', text: 'normalnie ziemniak w kurtce 🥔' },
  { author: 'Bartek', text: 'kubaziemniak XD nowa ksywka' },
  { author: 'Zosia', text: 'ej no bez przesady' },
  { author: 'Olek', text: 'przerobiłem mu twarz, patrzcie na grupie' },
  { author: 'Franek', text: 'kubaziemniak 🥔🥔🥔' },
  { author: 'Bartek', text: 'kuba czemu nic nie piszesz, obraziłeś się? 😂' },
  { author: 'Olek', text: 'wysyłam to do równoległej klasy' },
];

type ActionId = 'dolacz' | 'zrzut' | 'kuba' | 'zglos' | 'doroslY';

interface Action {
  id: ActionId;
  label: string;
  icon: LucideIcon;
  /** Co dziecko widzi zaraz po kliknięciu. */
  note: string;
  /** Komentarz dopisany w wątku w imieniu dziecka, jeśli działanie coś dopisuje. */
  posts?: string;
}

const ACTIONS: Action[] = [
  {
    id: 'dolacz',
    label: 'Dopisz coś śmiesznego',
    icon: Smile,
    posts: 'ziemniak XD',
    note: 'Twój komentarz stoi teraz obok tamtych. Dla Kuby jesteś już jedną z osób, które go wyśmiewają — nawet jeśli „tylko żartowałeś/żartowałaś”.',
  },
  {
    id: 'zrzut',
    label: 'Zrób zrzut ekranu',
    icon: Camera,
    note: 'Zapisane. Za chwilę część tych komentarzy zniknie — ktoś je skasuje, żeby nie było śladu. Ty masz swój.',
  },
  {
    id: 'kuba',
    label: 'Napisz do Kuby na osobności',
    icon: Send,
    note: 'Napisałeś/napisałaś: „to jest głupie, co oni robią. jestem po twojej stronie”. Kuba czyta to sam, bez świadków — i wie, że nie jest sam.',
  },
  {
    id: 'zglos',
    label: 'Zgłoś komentarze w aplikacji',
    icon: Flag,
    note: 'Zgłoszenie poszło. Sprawdzi je ktoś obcy, za jakiś czas — to działa, ale wolno. Samo zgłoszenie nie zatrzymuje tego, co dzieje się teraz.',
  },
  {
    id: 'doroslY',
    label: 'Powiedz dorosłemu',
    icon: MessageCircle,
    note: 'Pokazałeś/pokazałaś wątek wychowawczyni. Wątek zniknął w kilka minut — a rozmowa z Bartkiem i Olkiem odbyła się bez twojego nazwiska.',
  },
];

interface PileOnProps {
  color: string;
  onComplete?: () => void;
}

export function PileOn({ color, onComplete }: PileOnProps) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready');
  const [shown, setShown] = useState(0);
  const [used, setUsed] = useState<ActionId[]>([]);
  const [mine, setMine] = useState<Record<number, string>>({});
  const [lastNote, setLastNote] = useState<string | null>(null);
  const [stoppedByAdult, setStoppedByAdult] = useState(false);
  const [round, setRound] = useState(0);

  // Komentarze dochodzą same, dopóki scena trwa.
  useEffect(() => {
    if (phase !== 'playing' || shown >= STREAM.length) return;
    const timer = window.setTimeout(
      () => setShown((prev) => prev + 1),
      shown === 0 ? 500 : 2100
    );
    return () => window.clearTimeout(timer);
  }, [phase, shown]);

  // Koniec sceny: wyczerpany strumień albo interwencja dorosłego.
  useEffect(() => {
    if (phase !== 'playing' || shown < STREAM.length) return;
    setPhase('over');
    onComplete?.();
  }, [phase, shown, onComplete]);

  const act = (action: Action) => {
    if (phase !== 'playing' || used.includes(action.id)) return;
    setUsed((prev) => [...prev, action.id]);
    setLastNote(action.note);
    if (action.posts) setMine((prev) => ({ ...prev, [shown]: action.posts as string }));
    if (action.id === 'doroslY') {
      setStoppedByAdult(true);
      setPhase('over');
      onComplete?.();
    }
  };

  const replay = () => {
    setPhase('playing');
    setShown(0);
    setUsed([]);
    setMine({});
    setLastNote(null);
    setStoppedByAdult(false);
    setRound((prev) => prev + 1);
  };

  const joined = used.includes('dolacz');
  const hasProof = used.includes('zrzut');
  const supported = used.includes('kuba');
  const toldAdult = used.includes('doroslY');
  const reported = used.includes('zglos');

  /** Co widzi Kuba po drugiej stronie — zmienia się razem z tym, co robi dziecko. */
  const kubaLine = supported
    ? 'Kuba: „dzięki. myślałem, że wszyscy się śmieją”.'
    : shown >= 4
      ? 'Kuba przeczytał wszystko i nic nie odpisał. Jest w tej rozmowie sam.'
      : 'Kuba jest online.';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Nie chodzi o ciebie — chodzi o Kubę z twojej klasy. Ty tylko tu jesteś.{' '}
        <strong>Komentarze będą dochodzić same</strong>, niezależnie od tego, co zrobisz. Możesz
        użyć każdego działania raz.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Wpis ze zdjęciem i wątkiem komentarzy */}
        <div className="min-w-0 border bg-zinc-100 dark:bg-zinc-800">
          <div className="flex items-center gap-2.5 border-b bg-zinc-200 px-3 py-2 dark:bg-zinc-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-400/70 text-white">
              <UserRound className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="text-sm font-semibold">Klasa 4b · wycieczka</span>
          </div>

          {/* Miejsce na zdjęcie — celowo bez zdjęcia, liczy się wątek pod nim */}
          <div className="flex h-24 items-center justify-center gap-2 bg-zinc-200/70 text-xs text-muted-foreground dark:bg-zinc-700/50">
            <ImageIcon className="h-4 w-4" aria-hidden />
            wspólne zdjęcie całej klasy
          </div>

          <div
            aria-live="polite"
            className="h-64 space-y-2.5 overflow-y-auto bg-white p-3 dark:bg-zinc-900 sm:h-72"
          >
            {phase === 'ready' ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Komentarze są zwinięte.
              </p>
            ) : (
              STREAM.slice(0, shown).map((comment, index) => (
                <div key={`${round}-${index}`}>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm leading-relaxed"
                  >
                    <span className="font-semibold">{comment.author}: </span>
                    <span className="text-muted-foreground">{comment.text}</span>
                  </motion.p>
                  {mine[index + 1] && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 text-sm leading-relaxed"
                    >
                      <span className="font-semibold" style={{ color }}>
                        Ty:{' '}
                      </span>
                      <span>{mine[index + 1]}</span>
                    </motion.p>
                  )}
                </div>
              ))
            )}

            {phase === 'over' && stoppedByAdult && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 border-t pt-3 text-center text-xs font-medium text-muted-foreground"
              >
                Wątek został usunięty przez wychowawczynię.
              </motion.p>
            )}
          </div>

          <p className="border-t bg-zinc-50 px-3 py-2 text-xs text-muted-foreground dark:bg-zinc-800/60">
            {phase === 'ready' ? 'Kuba jest online.' : kubaLine}
          </p>
        </div>

        {/* Taca działań */}
        <div>
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            Co możesz zrobić
          </p>
          <div className="flex flex-col gap-1.5">
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              const spent = used.includes(action.id);
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => act(action)}
                  disabled={phase !== 'playing' || spent}
                  className={cn(
                    'flex items-start gap-2 border px-2.5 py-2 text-left text-xs font-medium leading-snug transition-colors sm:text-sm',
                    phase === 'playing' && !spent
                      ? 'cursor-pointer hover:bg-muted/60'
                      : 'cursor-default',
                    spent && 'opacity-45'
                  )}
                  style={spent ? { borderColor: color, color } : undefined}
                >
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {action.label}
                </button>
              );
            })}
          </div>

          {phase === 'ready' && (
            <button
              type="button"
              onClick={() => setPhase('playing')}
              className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 border-2 px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              <Play className="h-3.5 w-3.5" aria-hidden />
              Rozwiń komentarze
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {lastNote && phase === 'playing' && (
          <motion.p
            key={lastNote}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 pl-3 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            {lastNote}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'over' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p className="mb-3 font-bold">Co po tobie zostało w tej scenie:</p>
            <ul className="space-y-1.5">
              <Outcome ok={!joined} color={color}>
                {joined
                  ? 'Dołączyłeś/dołączyłaś do wyśmiewania — twój komentarz też tam był.'
                  : 'Nie dołączyłeś/dołączyłaś do wyśmiewania.'}
              </Outcome>
              <Outcome ok={supported} color={color}>
                {supported
                  ? 'Kuba wie, że ktoś był po jego stronie.'
                  : 'Kuba nie usłyszał od nikogo, że to nie w porządku. Został z tym sam.'}
              </Outcome>
              <Outcome ok={hasProof} color={color}>
                {hasProof
                  ? 'Został dowód — masz zrzut ekranu.'
                  : 'Nie ma dowodu. Komentarze da się skasować i zostaje słowo przeciwko słowu.'}
              </Outcome>
              <Outcome ok={toldAdult} color={color}>
                {toldAdult
                  ? 'Powiedziałeś/powiedziałaś dorosłemu — i tylko to zatrzymało nagonkę.'
                  : 'Żaden dorosły się nie dowiedział, więc nagonka toczyła się do końca.'}
              </Outcome>
              <Outcome ok={reported} color={color}>
                {reported
                  ? 'Zgłoszenie w aplikacji poszło — zadziała, ale później.'
                  : 'Nie zgłosiłeś/zgłosiłaś tego w aplikacji.'}
              </Outcome>
            </ul>

            <p className="mt-4">
              {toldAdult ? (
                <>
                  <strong>Zauważ, co się właśnie stało:</strong> komentarze przestały dochodzić
                  dopiero wtedy, gdy do sprawy wszedł dorosły. Zgłoszenie działa, ale wolno. Napisanie
                  do Kuby pomaga jemu, ale nie zatrzymuje tamtych. <strong>Nagonkę przerywa dorosły</strong> —
                  i po to się do niego idzie.
                </>
              ) : (
                <>
                  <strong>Scena skończyła się sama</strong> — bo nikt jej nie przerwał. Odegraj ją
                  jeszcze raz i sprawdź, co się stanie, jeśli powiesz o tym dorosłemu. To jedyne
                  działanie, które faktycznie zatrzymuje takie rzeczy.
                </>
              )}
            </p>

            <p className="mt-3 text-muted-foreground">
              Kolejność, która działa zawsze: <strong>nie dokładaj się → zrób zrzut → powiedz
              dorosłemu → zgłoś i zablokuj</strong>. Dowód robi się na początku, bo za chwilę może
              go już nie być.
            </p>

            <button
              type="button"
              onClick={replay}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Odegraj scenę jeszcze raz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Outcome({
  ok,
  color,
  children,
}: {
  ok: boolean;
  color: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className="mt-1.5 block h-1.5 w-1.5 shrink-0"
        style={{ backgroundColor: ok ? color : 'var(--muted-foreground)' }}
        aria-hidden
      />
      <span className={cn(!ok && 'text-muted-foreground')}>{children}</span>
    </li>
  );
}
