'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Folder, HardDrive, Image as ImageIcon, Music, Terminal, FileText, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import type { DrillScore } from './mouse-keyboard-drill';

/**
 * Sprawdzian „zapisywanie pliku” w trzech rundach: makieta okna „Zapisz jako”
 * (wybór folderu + nazwa), rozpoznanie pliku po rozszerzeniu i pytanie o to,
 * gdzie zapisany plik potem jest.
 *
 * Okno dialogowe jest makietą systemu, więc — jak pulpit w `DesktopFinder` —
 * wygląda jak okno, a nie jak reszta strony. Cel folderu („Informatyka 4”) to
 * ten sam folder, który dziecko zakładało w lekcji 1.
 */

const FOLDERS = [
  { id: 'pulpit', label: 'Pulpit', icon: HardDrive },
  { id: 'pobrane', label: 'Pobrane', icon: Folder },
  { id: 'obrazy', label: 'Obrazy', icon: Folder },
  { id: 'informatyka', label: 'Informatyka 4', icon: Folder },
];

const TARGET_FOLDER = 'informatyka';
const TARGET_NAME = 'lekcja-2';

interface FileCandidate {
  name: string;
  icon: LucideIcon;
  isImage: boolean;
  what: string;
}

const FILES: FileCandidate[] = [
  { name: 'notatka.txt', icon: FileText, isImage: false, what: 'zwykły plik tekstowy' },
  { name: 'piosenka.mp3', icon: Music, isImage: false, what: 'plik z dźwiękiem' },
  { name: 'kotek.jpg', icon: ImageIcon, isImage: true, what: 'plik z obrazem' },
  { name: 'gra.exe', icon: Terminal, isImage: false, what: 'program do uruchomienia' },
];

const WHERE_OPTIONS = [
  { id: 'a', text: 'W koszu — plik trafia tam po zamknięciu programu.' },
  { id: 'b', text: 'Nigdzie. Po zamknięciu programu plik znika.' },
  { id: 'c', text: 'W folderze, który wybrałem/wybrałam w oknie „Zapisz jako”.' },
  { id: 'd', text: 'W przeglądarce internetowej.' },
];
const WHERE_CORRECT = 'c';

interface SaveDialogDrillProps {
  color: string;
  onFinish?: (result: DrillScore) => void;
}

export function SaveDialogDrill({ color, onFinish }: SaveDialogDrillProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${round}-${finished}`);

  const advance = (point: boolean) => {
    const next = score + (point ? 1 : 0);
    setScore(next);
    if (round + 1 < 3) {
      setRound(round + 1);
      return;
    }
    setFinished(true);
    onFinish?.({ score: next, total: 3 });
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Zapisywanie pliku — wynik
        </p>
        <p className="mb-4 text-2xl font-bold" style={{ color }}>
          {score} / 3
        </p>
        <p className="text-sm leading-relaxed">
          Zapisywanie to zawsze te same trzy decyzje: <strong>gdzie</strong> (folder),{' '}
          <strong>jak nazwać</strong> i <strong>w jakim formacie</strong>. Jeśli klikniesz „Zapisz”
          bez patrzenia, plik gdzieś wyląduje — po prostu nie będziesz wiedzieć gdzie.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs font-bold tracking-wide" style={{ color }}>
          ZADANIE {round + 1} Z 3
        </p>
        <p className="font-mono text-xs text-muted-foreground">punkty: {score}</p>
      </div>

      {round === 0 && <SaveRound color={color} onDone={advance} />}
      {round === 1 && <ExtensionRound color={color} onDone={advance} />}
      {round === 2 && <WhereRound color={color} onDone={advance} />}
    </div>
  );
}

function SaveRound({ color, onDone }: { color: string; onDone: (point: boolean) => void }) {
  const [folder, setFolder] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const trimmed = name.trim();
    if (folder !== TARGET_FOLDER) {
      setAttempts((prev) => prev + 1);
      setFeedback(
        folder === null
          ? 'Nie wybrałeś/wybrałaś folderu. Po lewej stronie okna kliknij ten, w którym plik ma wylądować.'
          : 'Plik ma trafić do folderu „Informatyka 4” — tego samego, który zakładałeś/zakładałaś w poprzedniej lekcji.'
      );
      return;
    }
    if (trimmed.toLowerCase() !== TARGET_NAME) {
      setAttempts((prev) => prev + 1);
      setFeedback(`Folder się zgadza, ale nazwa nie. W polu „Nazwa pliku” wpisz dokładnie: ${TARGET_NAME}`);
      return;
    }
    setSaved(true);
    setFeedback(null);
  };

  if (saved) {
    return (
      <div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4" aria-hidden />
            Zapisane w: Informatyka 4 / {TARGET_NAME}.txt
          </p>
          <p className="mb-4 text-sm leading-relaxed">
            Rozszerzenie <strong>.txt</strong> dopisał sam program — wynika z formatu wybranego pod
            polem z nazwą. Ty decydujesz o folderze i o nazwie; format zwykle zostaje domyślny.
          </p>
          <button
            type="button"
            onClick={() => onDone(attempts === 0)}
            className="cursor-pointer border-t-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/40"
            style={{ borderColor: color, color }}
          >
            Następne zadanie
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-base font-semibold leading-relaxed">
        Napisałeś/napisałaś notatkę i wybierasz „Zapisz jako”. Zapisz ją w folderze{' '}
        <span className="whitespace-nowrap">„Informatyka 4”</span> pod nazwą{' '}
        <span className="whitespace-nowrap font-mono">{TARGET_NAME}</span>.
      </p>

      {/* Makieta okna dialogowego */}
      <div className="border shadow-sm">
        <div className="flex items-center gap-2 border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-semibold">Zapisz jako</span>
        </div>

        <div className="grid gap-0 sm:grid-cols-[180px_minmax(0,1fr)]">
          <ul className="border-b p-2 sm:border-b-0 sm:border-r">
            {FOLDERS.map((item) => {
              const Icon = item.icon;
              const active = folder === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setFolder(item.id)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left text-sm transition-colors',
                      active ? 'font-semibold' : 'hover:bg-muted/50'
                    )}
                    style={active ? { backgroundColor: `${color}1f`, color } : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="p-4">
            <label htmlFor="save-name" className="mb-1 block text-xs font-semibold text-muted-foreground">
              Nazwa pliku
            </label>
            <input
              id="save-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
              className="mb-3 w-full border bg-transparent px-3 py-1.5 text-sm outline-none transition-colors focus:border-primary"
            />

            <label htmlFor="save-type" className="mb-1 block text-xs font-semibold text-muted-foreground">
              Zapisz jako typ
            </label>
            <select
              id="save-type"
              disabled
              className="mb-4 w-full cursor-not-allowed border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground"
            >
              <option>Dokument tekstowy (*.txt)</option>
            </select>

            <div className="flex justify-end gap-2">
              {/* „Anuluj” działa naprawdę — martwy przycisk w makiecie okna uczyłby,
                  że w oknach systemowych część rzeczy po prostu nic nie robi. */}
              <button
                type="button"
                onClick={() => {
                  setFolder(null);
                  setName('');
                  setFeedback(
                    'Anuluj zamyka okno i NIE zapisuje pliku — cała praca zostaje tylko w programie. Tutaj notatkę trzeba zapisać, więc spróbuj jeszcze raz.'
                  );
                }}
                className="cursor-pointer border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={save}
                className="cursor-pointer px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-[2.5rem]">
        <AnimatePresence>
          {feedback && (
            <motion.p
              key={feedback}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm leading-relaxed text-amber-700 dark:text-amber-500"
            >
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExtensionRound({ color, onDone }: { color: string; onDone: (point: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [missed, setMissed] = useState(false);
  const chosen = picked ? FILES.find((file) => file.name === picked) : null;
  const correct = chosen?.isImage ?? false;

  const choose = (file: FileCandidate) => {
    if (correct) return;
    setPicked(file.name);
    if (!file.isImage) setMissed(true);
  };

  return (
    <div>
      <p className="mb-1 text-base font-semibold leading-relaxed">
        W folderze leżą cztery pliki. Kliknij ten, w którym jest obrazek.
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        Podpowiedź jest w samej nazwie — po kropce.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {FILES.map((file) => {
          const Icon = file.icon;
          const isPicked = picked === file.name;
          return (
            <li key={file.name}>
              <motion.button
                type="button"
                onClick={() => choose(file)}
                animate={isPicked && !file.isImage ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 border p-3 text-left transition-colors',
                  !isPicked && 'hover:bg-muted/40',
                  isPicked && file.isImage && 'border-emerald-500 bg-emerald-500/10',
                  isPicked && !file.isImage && 'border-amber-500 bg-amber-500/10'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
                <span className="font-mono text-sm">{file.name}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          {chosen && !correct && (
            <motion.p
              key={`miss-${chosen.name}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm leading-relaxed text-amber-700 dark:text-amber-500"
            >
              <span className="font-mono">{chosen.name}</span> to {chosen.what}. Szukaj dalej.
            </motion.p>
          )}
          {correct && (
            <motion.div key="hit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mb-3 text-sm leading-relaxed">
                Końcówka po kropce to <strong>rozszerzenie</strong> — mówi, co jest w środku i który
                program to otworzy. <span className="font-mono">.jpg</span> i{' '}
                <span className="font-mono">.png</span> to obrazy,{' '}
                <span className="font-mono">.mp3</span> to dźwięk,{' '}
                <span className="font-mono">.txt</span> i <span className="font-mono">.docx</span> to
                tekst.
              </p>
              <button
                type="button"
                onClick={() => onDone(!missed)}
                className="cursor-pointer border-t-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/40"
                style={{ borderColor: color, color }}
              >
                Następne zadanie
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WhereRound({ color, onDone }: { color: string; onDone: (point: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;

  return (
    <div>
      <p className="mb-4 text-base font-semibold leading-relaxed">
        Zapisałeś/zapisałaś plik i zamknąłeś/zamknęłaś program. Gdzie ten plik teraz jest?
      </p>

      <ul className="space-y-2">
        {WHERE_OPTIONS.map((option) => {
          const isPicked = picked === option.id;
          const isCorrect = option.id === WHERE_CORRECT;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => !answered && setPicked(option.id)}
                disabled={answered}
                className={cn(
                  'flex w-full items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  !answered && 'cursor-pointer hover:bg-muted/40',
                  answered && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                  answered && isPicked && !isCorrect && 'border-amber-500 bg-amber-500/10',
                  answered && !isPicked && !isCorrect && 'opacity-60'
                )}
              >
                <span className="font-mono text-xs font-bold uppercase text-muted-foreground">
                  {option.id}
                </span>
                {option.text}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p className="mb-3 text-sm leading-relaxed">
            Plik zostaje tam, gdzie go zapisałeś/zapisałaś — na dysku, w wybranym folderze. Program
            jest tylko narzędziem: możesz go zamknąć, odinstalować albo otworzyć plik w innym, a plik
            i tak leży na swoim miejscu. Dlatego warto wiedzieć, który folder się wybrało.
          </p>
          <button
            type="button"
            onClick={() => onDone(picked === WHERE_CORRECT)}
            className="cursor-pointer border-t-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/40"
            style={{ borderColor: color, color }}
          >
            Pokaż wynik
          </button>
        </motion.div>
      )}
    </div>
  );
}
