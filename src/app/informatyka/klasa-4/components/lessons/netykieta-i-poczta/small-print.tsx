'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileText, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Blok z palety `zrodla`: dziecko ma **znaleźć odpowiedź w prawdziwie
 * wyglądającym regulaminie**, a nie przeczytać, że „regulaminów należy
 * przestrzegać”.
 *
 * Interakcja jest inna niż we wszystkich pozostałych blokach kursu: nie ma
 * wariantów odpowiedzi do wybrania. Jest przewijane pudełko z drobnym drukiem
 * i pytanie — trzeba znaleźć właściwy paragraf i w niego kliknąć. Pudło:
 * paragraf drży i pada podpowiedź, o czym jest naprawdę.
 *
 * Odpowiedź na drugie pytanie leży poniżej krawędzi pudełka — trzeba przewinąć.
 * To celowe: cała umiejętność polega na tym, żeby nie poddać się po pierwszym
 * ekranie.
 */

interface Paragraph {
  id: string;
  head: string;
  text: string;
}

const REGULAMIN: Paragraph[] = [
  {
    id: 'p1',
    head: '§ 1. Postanowienia ogólne',
    text: 'Serwis „Świat Zwierzaków” umożliwia użytkownikom prowadzenie wirtualnego schroniska, opiekę nad zwierzakami oraz udział w rozgrywkach z innymi użytkownikami. Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu.',
  },
  {
    id: 'p2',
    head: '§ 2. Zakładanie konta',
    text: 'Konto może założyć samodzielnie osoba, która ukończyła 13 lat. Osoba młodsza może korzystać z Serwisu wyłącznie na koncie założonym i nadzorowanym przez rodzica lub opiekuna prawnego, który akceptuje Regulamin w jej imieniu.',
  },
  {
    id: 'p3',
    head: '§ 3. Prawdziwość danych',
    text: 'Użytkownik zobowiązuje się podawać dane zgodne z prawdą. Podanie nieprawdziwych danych, w szczególności daty urodzenia, może skutkować usunięciem konta bez możliwości jego odzyskania oraz bez zwrotu środków wydanych na przedmioty w grze.',
  },
  {
    id: 'p4',
    head: '§ 4. Płatności',
    text: 'Zakup kryształów oraz przedmiotów ozdobnych możliwy jest wyłącznie za zgodą właściciela karty płatniczej. Serwis nie prowadzi sprzedaży poza aplikacją i nigdy nie prosi o dane karty w wiadomościach prywatnych.',
  },
  {
    id: 'p5',
    head: '§ 5. Treści publikowane przez użytkowników',
    text: 'Zabrania się publikowania wizerunku innych osób bez ich zgody, w tym zdjęć i nagrań wykonanych w szkole. Zgłoszona treść naruszająca ten zakaz zostaje usunięta, a konto użytkownika może zostać czasowo zablokowane.',
  },
  {
    id: 'p6',
    head: '§ 6. Zgłaszanie naruszeń',
    text: 'Każdy użytkownik może zgłosić naruszenie Regulaminu przyciskiem „Zgłoś” dostępnym przy treści oraz przy profilu użytkownika. Zgłoszenia rozpatrywane są w terminie do 14 dni roboczych.',
  },
  {
    id: 'p7',
    head: '§ 7. Przerwy techniczne',
    text: 'Administrator zastrzega sobie prawo do przerw technicznych w działaniu Serwisu, w miarę możliwości zapowiadanych z wyprzedzeniem na stronie startowej.',
  },
  {
    id: 'p8',
    head: '§ 8. Zmiany Regulaminu',
    text: 'O zmianie Regulaminu użytkownicy informowani są z wyprzedzeniem 14 dni. Dalsze korzystanie z Serwisu po tym terminie oznacza akceptację zmian.',
  },
];

interface Question {
  id: string;
  ask: string;
  answerId: string;
  takeaway: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'wiek',
    ask: 'Od ilu lat można tu samodzielnie założyć konto?',
    answerId: 'p2',
    takeaway:
      'Od 13 lat. Ty masz 10 — więc konto zakłada rodzic, na siebie, i to on zgadza się na regulamin w twoim imieniu. To nie jest „czepianie się”: tak brzmi umowa.',
  },
  {
    id: 'klamstwo',
    ask: 'Co grozi za wpisanie nieprawdziwej daty urodzenia?',
    answerId: 'p3',
    takeaway:
      'Usunięcie konta bez odzyskania — razem ze wszystkim, co się na nim kupiło, bez zwrotu pieniędzy. „Nikt nie sprawdza” działa dokładnie do dnia, w którym ktoś sprawdzi.',
  },
  {
    id: 'zdjecie',
    ask: 'Czy wolno wrzucić tu zdjęcie kolegi ze szkoły bez pytania go o zgodę?',
    answerId: 'p5',
    takeaway:
      'Nie wolno — i to jest zapisane wprost, razem ze zdjęciami robionymi w szkole. Zgłoszone zdjęcie znika, a konto może zostać zablokowane.',
  },
];

interface SmallPrintProps {
  color: string;
  onComplete?: () => void;
}

export function SmallPrint({ color, onComplete }: SmallPrintProps) {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);

  const question = QUESTIONS[step] ?? null;
  const finished = step >= QUESTIONS.length;

  const pick = (paragraph: Paragraph) => {
    if (!question) return;
    if (paragraph.id === question.answerId) {
      const nextStep = step + 1;
      setFound((prev) => [...prev, paragraph.id]);
      setWrongId(null);
      setStep(nextStep);
      if (nextStep >= QUESTIONS.length) onComplete?.();
      return;
    }
    setWrongId(paragraph.id);
    window.setTimeout(() => setWrongId((prev) => (prev === paragraph.id ? null : prev)), 500);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Zakładając konto w grze, klikasz „akceptuję regulamin”. Poniżej jest prawdziwy taki
          regulamin. <strong>Znajdź w nim odpowiedź i kliknij paragraf</strong>, w którym ona stoi —
          nie ma tu wariantów do wybrania, trzeba poszukać.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {found.length}/{QUESTIONS.length}
        </p>
      </div>

      {/* Pytanie */}
      <AnimatePresence mode="wait">
        {question ? (
          <motion.p
            key={question.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 flex items-start gap-2 border-l-4 py-2 pl-3 text-sm font-semibold leading-relaxed sm:text-base"
            style={{ borderColor: color }}
          >
            <Search className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            {question.ask}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {/* Drobny druk */}
      <div className="border bg-zinc-50 dark:bg-zinc-800/60">
        <p className="flex items-center gap-2 border-b bg-zinc-100 px-3 py-2 text-xs font-semibold dark:bg-zinc-800">
          <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Regulamin serwisu „Świat Zwierzaków”
        </p>
        <div className="max-h-72 overflow-y-auto p-1">
          {REGULAMIN.map((paragraph) => {
            const isFound = found.includes(paragraph.id);
            const isWrong = wrongId === paragraph.id;
            return (
              <motion.button
                key={paragraph.id}
                type="button"
                onClick={() => pick(paragraph)}
                disabled={finished || isFound}
                animate={isWrong ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'block w-full px-2.5 py-2 text-left transition-colors',
                  finished || isFound ? 'cursor-default' : 'cursor-pointer hover:bg-white dark:hover:bg-zinc-900/60',
                  isWrong && 'bg-red-50 dark:bg-red-950/30'
                )}
                style={isFound ? { backgroundColor: `${color}14` } : undefined}
              >
                <span
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide"
                  style={{ color: isFound ? color : undefined }}
                >
                  {paragraph.head}
                  {isFound && <Check className="h-3 w-3 shrink-0" aria-hidden />}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                  {paragraph.text}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {wrongId && !finished && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 border-l-2 border-red-500 pl-3 text-sm leading-relaxed text-muted-foreground"
          >
            Ten paragraf jest o czymś innym. Przeczytaj pierwsze zdanie każdego — nagłówki mówią
            całkiem sporo. I pamiętaj, że pudełko da się przewinąć w dół.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Znalezione odpowiedzi zostają na widoku */}
      {found.length > 0 && (
        <ul className="mt-4 space-y-2">
          {QUESTIONS.slice(0, found.length).map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-l-2 pl-3 text-sm leading-relaxed"
              style={{ borderColor: color }}
            >
              <strong>{item.ask}</strong>
              <br />
              <span className="text-muted-foreground">{item.takeaway}</span>
            </motion.li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Nikt nie czyta regulaminów w całości — łącznie z dorosłymi.</strong> Ale trzy
            rzeczy warto w nim sprawdzić zawsze, i zajmuje to minutę: <strong>od ilu lat</strong>,{' '}
            <strong>co wolno wrzucać</strong> i <strong>jak zgłosić</strong>, gdy ktoś łamie zasady.
            Klikając „akceptuję”, podpisujesz umowę — dobrze wiedzieć, na co.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
