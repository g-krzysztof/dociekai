'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderOpen, RotateCcw, ShieldAlert, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji — i pierwsza w kursie ROZMOWA, którą dziecko naprawdę prowadzi.
 *
 * Zamiast opisywać, jak działa obcy człowiek w sieci, dajemy dziecku odegrać z
 * nim rozmowę: wiadomości przychodzą z opóźnieniem, ze wskaźnikiem „pisze…”,
 * a każda odpowiedź prowadzi do innego węzła drzewa (`NODES`). Równolegle
 * zapełnia się panel **kartoteki** — tego, co obcy zdążył się dowiedzieć.
 *
 * Sens bloku: żadna pojedyncza odpowiedź nie wygląda groźnie. Kartoteka składa
 * się sama, z drobiazgów. Dlatego widżet niczego nie punktuje i nie blokuje —
 * mierzy tylko, ile wyciekło, i pokazuje to na końcu. Dziecko może odegrać
 * rozmowę jeszcze raz i wybierać inaczej; to jest właściwe „ćwiczenie”.
 */

/** Wycieki w kolejności, w jakiej mają się układać w kartotece. */
const LEAKS = {
  rytm: 'o której bywasz sam/sama w domu',
  wiek: 'ile masz lat',
  klasa: 'do której klasy chodzisz',
  miasto: 'w jakim mieście mieszkasz',
  dzielnica: 'w której dzielnicy',
  login: 'twój login w grze',
  zdjecie: 'jak wyglądasz',
} as const;

type LeakId = keyof typeof LEAKS;
const LEAK_ORDER = Object.keys(LEAKS) as LeakId[];

type Ending = 'sent' | 'told' | 'stay';

interface Reply {
  text: string;
  leaks?: LeakId[];
  next: string;
  ending?: Ending;
}

interface Node {
  /** Wiadomości obcego w tym węźle — po kolei, każda z osobną „bańką”. */
  says: string[];
  replies: Reply[];
}

/** Zestawy odpowiedzi współdzielone przez węzeł „miły” i jego wersję naciskającą. */
const AGE_REPLIES: Reply[] = [
  { text: '10', leaks: ['wiek'], next: 'miasto' },
  { text: 'Nie podaję takich rzeczy obcym', next: 'miastoPush' },
  { text: '10, jestem w 4b 😄', leaks: ['wiek', 'klasa'], next: 'miasto' },
];

const CITY_REPLIES: Reply[] = [
  { text: 'Wrocław', leaks: ['miasto'], next: 'skin' },
  { text: 'Wolę nie mówić', next: 'skinPush' },
  { text: 'Wrocław, Krzyki 😎', leaks: ['miasto', 'dzielnica'], next: 'skin' },
];

const SKIN_REPLIES: Reply[] = [
  { text: 'A skąd masz darmowe skiny?', next: 'zdjecie' },
  { text: 'Podaję login', leaks: ['login'], next: 'zdjecie' },
  { text: 'Nie podam loginu', next: 'zdjeciePush' },
];

const END_REPLIES: Reply[] = [
  { text: 'Nie wysyłam. Pokazuję tę rozmowę rodzicowi.', next: 'end', ending: 'told' },
  { text: 'Wysyłam 🙂', leaks: ['zdjecie'], next: 'end', ending: 'sent' },
  { text: 'Zdjęcia nie wyślę, ale możemy dalej gadać', next: 'end', ending: 'stay' },
];

const NODES: Record<string, Node> = {
  start: {
    says: ['hej! widziałem, jak grasz', 'nieźle ci szło 😄'],
    replies: [
      { text: 'Dzięki! Ty też nieźle', next: 'wiek' },
      { text: 'Dzięki 😄 gram codziennie po szkole, jak nikogo nie ma w domu', leaks: ['rytm'], next: 'wiek' },
      { text: 'A kto to?', next: 'wiekPush' },
    ],
  },
  wiek: {
    says: ['jestem Max, gram tu od roku', 'mam 11 lat, a ty ile?'],
    replies: AGE_REPLIES,
  },
  wiekPush: {
    says: ['Max 😄 gram tu od roku, mam 11 lat', 'a ty ile masz? bo grasz jak ktoś starszy'],
    replies: AGE_REPLIES,
  },
  miasto: {
    says: ['o, prawie równolatki 😄', 'a z jakiego miasta? może gramy na tym samym serwerze'],
    replies: CITY_REPLIES,
  },
  miastoPush: {
    says: ['no coo, ja swój wiek podałem 😅', 'to chociaż powiedz, z jakiego jesteś miasta'],
    replies: CITY_REPLIES,
  },
  skin: {
    says: ['ekstra, to blisko', 'słuchaj, mam dla ciebie darmowego skina. podaj login, to ci wrzucę'],
    replies: SKIN_REPLIES,
  },
  skinPush: {
    says: ['ej, jesteś jakiś nieufny 😄', 'mam dla ciebie darmowego skina, podaj login to ci wrzucę'],
    replies: SKIN_REPLIES,
  },
  zdjecie: {
    says: [
      'ok 😄',
      'wyślij jeszcze swoje zdjęcie, chcę wiedzieć, z kim gram',
      'tylko nikomu o tym nie mów, bo mi zablokują konto',
    ],
    replies: END_REPLIES,
  },
  zdjeciePush: {
    says: [
      'no dobra, trudno',
      'to wyślij chociaż swoje zdjęcie, chcę wiedzieć, z kim gram',
      'tylko nikomu o tym nie mów, bo mi zablokują konto',
    ],
    replies: END_REPLIES,
  },
};

const ENDING_COPY: Record<Ending, string> = {
  sent: 'Zdjęcie poszło. Od tej chwili nie wiesz już, gdzie trafi ani komu Max je pokaże — a razem z resztą tej rozmowy tworzy komplet.',
  told: 'Dobrze. „Nie mów o tym nikomu” to zdanie, po którym idzie się do dorosłego — zawsze. Nikt uczciwy nie prosi dziecka o tajemnicę przed rodzicami.',
  stay: 'Zdjęcia nie ma, ale rozmowa trwa dalej — a Max poprosi jeszcze raz, tylko inaczej. Tak to działa: po pierwszym „nie” się nie odpuszcza.',
};

interface ChatSimProps {
  color: string;
  onComplete?: () => void;
}

export function ChatSim({ color, onComplete }: ChatSimProps) {
  const [nodeId, setNodeId] = useState('start');
  /** Wiadomości już wyświetlone: `them` = Max, `me` = dziecko. */
  const [messages, setMessages] = useState<{ from: 'them' | 'me'; text: string }[]>([]);
  /** Ile zdań z bieżącego węzła Max już napisał. */
  const [saidCount, setSaidCount] = useState(0);
  const [typing, setTyping] = useState(true);
  const [leaks, setLeaks] = useState<LeakId[]>([]);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [round, setRound] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const node = NODES[nodeId];
  const allSaid = node ? saidCount >= node.says.length : true;
  const showReplies = !ending && allSaid && !typing;

  // Max „pisze”, a po chwili dochodzi kolejne zdanie z węzła.
  useEffect(() => {
    if (ending || !node || saidCount >= node.says.length) {
      setTyping(false);
      return;
    }
    setTyping(true);
    const delay = 700 + node.says[saidCount].length * 12;
    const timer = window.setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'them', text: node.says[saidCount] }]);
      setSaidCount((prev) => prev + 1);
    }, Math.min(delay, 1600));
    return () => window.clearTimeout(timer);
  }, [node, saidCount, ending]);

  // Okno rozmowy samo zjeżdża do najnowszej wiadomości.
  useEffect(() => {
    const box = listRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, typing, showReplies]);

  const answer = (reply: Reply) => {
    const nextLeaks = reply.leaks
      ? Array.from(new Set([...leaks, ...reply.leaks]))
      : leaks;
    setMessages((prev) => [...prev, { from: 'me', text: reply.text }]);
    setLeaks(nextLeaks);
    if (reply.ending) {
      setEnding(reply.ending);
      onComplete?.();
      return;
    }
    setNodeId(reply.next);
    setSaidCount(0);
  };

  const replay = () => {
    setNodeId('start');
    setMessages([]);
    setSaidCount(0);
    setTyping(true);
    setLeaks([]);
    setEnding(null);
    setRound((prev) => prev + 1);
  };

  const dossier = LEAK_ORDER.filter((id) => leaks.includes(id));

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Ktoś zaczepia cię po meczu w grze. <strong>Odpisuj tak, jak odpisałbyś/odpisałabyś
        naprawdę</strong> — nikt tu nie stawia ocen. Z boku rośnie kartoteka: to, czego ta osoba
        zdążyła się o tobie dowiedzieć.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
        {/* Komunikator — świadomie poza językiem wizualnym kursu, ma wyglądać jak aplikacja */}
        <div className="min-w-0 border bg-zinc-100 dark:bg-zinc-800">
          <div className="flex items-center gap-2.5 border-b bg-zinc-200 px-3 py-2 dark:bg-zinc-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-400/70 text-white">
              <UserRound className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">Max_2015</span>
              <span className="block text-[11px] text-muted-foreground">
                gracz z twojego serwera · nie znasz go
              </span>
            </span>
          </div>

          <div
            ref={listRef}
            aria-live="polite"
            className="h-72 space-y-2 overflow-y-auto bg-white p-3 dark:bg-zinc-900 sm:h-80"
          >
            {messages.map((message, index) => (
              <motion.p
                key={`${round}-${index}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'w-fit max-w-[85%] px-3 py-2 text-sm leading-relaxed',
                  message.from === 'them'
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : 'ml-auto text-white'
                )}
                style={message.from === 'me' ? { backgroundColor: color } : undefined}
              >
                {message.text}
              </motion.p>
            ))}

            {typing && !ending && (
              <p className="inline-flex items-center gap-1 bg-zinc-100 px-3 py-2.5 dark:bg-zinc-800">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="block h-1.5 w-1.5 rounded-full bg-zinc-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: dot * 0.18 }}
                  />
                ))}
                <span className="sr-only">Max pisze</span>
              </p>
            )}
          </div>

          {/* Twoje odpowiedzi */}
          <div className="border-t bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
            {showReplies ? (
              <div className="flex flex-col gap-1.5">
                {node.replies.map((reply) => (
                  <button
                    key={reply.text}
                    type="button"
                    onClick={() => answer(reply)}
                    className="cursor-pointer border bg-white px-3 py-2 text-left text-sm leading-snug transition-colors hover:bg-muted/60 dark:bg-zinc-900"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-1 py-2 text-xs text-muted-foreground">
                {ending ? 'Rozmowa zakończona.' : 'Poczekaj, aż skończy pisać…'}
              </p>
            )}
          </div>
        </div>

        {/* Kartoteka — rośnie w trakcie rozmowy */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <p
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
            style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Co Max już wie
          </p>
          <div className="border p-3" style={{ borderColor: `${color}55` }}>
            {dossier.length === 0 ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Na razie nic. Tak trzymaj.
              </p>
            ) : (
              <ul className="space-y-1.5" aria-live="polite">
                <AnimatePresence initial={false}>
                  {dossier.map((id) => (
                    <motion.li
                      key={id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-1.5 text-xs leading-snug"
                    >
                      <span style={{ color }} aria-hidden>
                        •
                      </span>
                      {LEAKS[id]}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
            <p className="mt-3 border-t pt-2 font-mono text-xs font-bold" style={{ color }}>
              {dossier.length} z {LEAK_ORDER.length}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {ending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>{ENDING_COPY[ending]}</span>
            </p>

            <p className="mt-3">
              {dossier.length === 0 ? (
                <>
                  <strong>Kartoteka pusta — udało ci się.</strong> Zauważ jednak, że Max ani razu
                  nie zapytał wprost o adres. Pytał o drobiazgi: wiek, miasto, dzielnicę. Adres
                  składa się z takich drobiazgów sam.
                </>
              ) : (
                <>
                  <strong>Nie podałeś/podałaś nic „ważnego”</strong> — żadnego adresu ani hasła. A
                  jednak z {dossier.length === 1 ? 'jednego drobiazgu' : `${dossier.length} drobiazgów`}{' '}
                  obca osoba złożyła kartotekę. Właśnie na tym to polega: nikt nie pyta wprost.
                </>
              )}
            </p>
            <p className="mt-2 text-muted-foreground">
              I jeszcze jedno: zdanie <em>„tylko nikomu o tym nie mów”</em> jest w tej rozmowie
              najgłośniejszym sygnałem alarmowym. Nikt, kto ma wobec ciebie dobre zamiary, nie prosi
              cię o tajemnicę przed rodzicami.
            </p>

            <button
              type="button"
              onClick={replay}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Odegraj jeszcze raz i odpowiadaj inaczej
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
