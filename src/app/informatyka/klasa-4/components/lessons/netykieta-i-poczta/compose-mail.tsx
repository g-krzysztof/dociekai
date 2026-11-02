'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Paperclip, Save, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator lekcji i jej autorski akcent — **pierwsze w całym kursie miejsce,
 * w którym dziecko pisze własny tekst, a strona go czyta.**
 *
 * Wszystkie dotychczasowe „symulatory” obu kursów dawały klocki do wybrania.
 * Tutaj jest prawdziwe pole tematu i prawdziwe pole treści, a osiem kontroli
 * czyta to, co dziecko naprawdę napisało: czy temat mówi o sprawie, czy jest
 * powitanie, czy prośba padła wprost, czy nie ma krzyku, czy podpis zgadza się
 * z imieniem, czy zapowiedziany załącznik faktycznie jest.
 *
 * Reguły są **jawne i wypisane obok** (jak `verdict()` w `PasswordLab`), a nie
 * ukryte — chodzi o to, żeby dziecko wiedziało, czego brakuje, a nie zgadywało.
 * Sprawdzenia są celowo pobłażliwe: mierzą obecność części wiadomości, nie
 * ładność stylu. Przycisk „Wyślij” ożywa dopiero przy komplecie, a odpowiedź
 * nauczycielki jest nagrodą za skończoną robotę.
 *
 * Imię jest potrzebne wyłącznie do sprawdzenia podpisu — zostaje w przeglądarce,
 * nigdzie nie leci. To zresztą dobra okazja, żeby przypomnieć zasadę z lekcji o
 * danych osobowych: samo imię można podać spokojnie.
 */

type Attachment = 'idle' | 'saved' | 'attached';

interface Check {
  id: string;
  label: string;
  hint: string;
  ok: boolean;
}

/** Wyrazy pisane w całości wielkimi literami (co najmniej 4 znaki) = krzyk. */
function hasShouting(text: string): boolean {
  if (text.includes('!!!')) return true;
  return text
    .split(/\s+/)
    .some(
      (word) =>
        word.replace(/[^\p{L}]/gu, '').length >= 4 &&
        word === word.toUpperCase() &&
        word !== word.toLowerCase()
    );
}

function buildChecks(
  name: string,
  subject: string,
  body: string,
  attachment: Attachment
): Check[] {
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();
  const subjectWords = subject.trim().split(/\s+/).filter(Boolean).length;
  const firstLine = body.split('\n').find((line) => line.trim().length > 0) ?? '';
  const sentences = (body.match(/[.!?]/g) ?? []).length;
  const tail = lowerBody.slice(-70);
  const trimmedName = name.trim().toLowerCase();

  return [
    {
      id: 'temat',
      label: 'Temat mówi, o co chodzi',
      hint: 'Co najmniej trzy słowa i nazwa sprawy — chodzi o pracę z przyrody i przełożenie terminu.',
      ok:
        subjectWords >= 3 &&
        /przyrod|prac|projekt|termin|przełoż|przeloz/.test(lowerSubject),
    },
    {
      id: 'powitanie',
      label: 'Zaczynasz od powitania',
      hint: 'Pierwsza linijka to zwrot do odbiorcy, np. „Dzień dobry, Pani Aniu,”.',
      ok: /dzień dobry|dzien dobry|szanowna|witam|cześć|czesc|dobry wieczór/i.test(firstLine),
    },
    {
      id: 'powod',
      label: 'Piszesz, dlaczego prosisz',
      hint: 'Co najmniej dwa zdania: co się stało i o co prosisz. Nie samo „nie zdążę”.',
      ok: sentences >= 2 && body.trim().split(/\s+/).length >= 15,
    },
    {
      id: 'prosba',
      label: 'Prosisz wprost',
      hint: 'Napisz pytanie albo użyj słowa „proszę” — inaczej odbiorca nie wie, czego od niego chcesz.',
      ok: /\?|proszę|prosze|czy mog|czy mozna|czy można/.test(lowerBody),
    },
    {
      id: 'spokoj',
      label: 'Nie krzyczysz',
      hint: 'Bez WIELKICH LITER i bez „!!!”. W sieci to znaczy krzyk, nawet jeśli tak nie myślisz.',
      ok: !hasShouting(subject) && !hasShouting(body),
    },
    {
      id: 'podpis',
      label: 'Podpisujesz się imieniem',
      hint: trimmedName
        ? `Na końcu wiadomości musi pojawić się „${name.trim()}” — odbiorca ma wiedzieć, kto pisze.`
        : 'Najpierw wpisz swoje imię w polu obok, potem podpisz nim wiadomość na końcu.',
      ok: trimmedName.length > 1 && tail.includes(trimmedName),
    },
    {
      id: 'zapowiedz',
      label: 'Zapowiadasz załącznik w treści',
      hint: 'Napisz w wiadomości, że coś załączasz — inaczej odbiorca może tego nie zauważyć.',
      ok: /załącz|zalacz/.test(lowerBody),
    },
    {
      id: 'plik',
      label: 'Załącznik dodany po zapisaniu pliku',
      hint: 'Najpierw zapisz pracę jako plik, dopiero potem da się ją dołączyć.',
      ok: attachment === 'attached',
    },
  ];
}

interface ComposeMailProps {
  color: string;
  onComplete?: () => void;
}

export function ComposeMail({ color, onComplete }: ComposeMailProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<Attachment>('idle');
  const [wrongAttach, setWrongAttach] = useState(false);
  const [sent, setSent] = useState(false);
  const [reply, setReply] = useState(false);

  const checks = buildChecks(name, subject, body, attachment);
  const passed = checks.filter((check) => check.ok).length;
  const ready = passed === checks.length;

  // Odpowiedź nauczycielki dochodzi z opóźnieniem — jak w prawdziwej poczcie.
  useEffect(() => {
    if (!sent) return;
    const timer = window.setTimeout(() => setReply(true), 1400);
    return () => window.clearTimeout(timer);
  }, [sent]);

  const attach = () => {
    if (attachment === 'idle') {
      setWrongAttach(true);
      window.setTimeout(() => setWrongAttach(false), 500);
      return;
    }
    if (attachment === 'saved') setAttachment('attached');
  };

  const send = () => {
    if (!ready || sent) return;
    setSent(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4">
        <p className="text-sm leading-relaxed sm:text-base">
          <strong>Teraz piszesz naprawdę — własnymi słowami.</strong> Twoja sytuacja: chorowałeś/
          chorowałaś trzy dni i nie zdążysz oddać pracy z przyrody na jutro. Poproś panią Annę
          Kowalską o przełożenie terminu i dołącz to, co już masz zrobione.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Osiem kontroli po prawej czyta to, co napiszesz. Nie oceniają stylu — sprawdzają tylko,
          czy wiadomość ma wszystkie części. Nic stąd nigdzie nie jest wysyłane.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
        {/* Okno pisania */}
        <div className="min-w-0 border bg-zinc-100 dark:bg-zinc-800">
          <div className="flex items-center gap-1.5 border-b bg-zinc-200 px-3 py-2 dark:bg-zinc-700">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
            <span className="ml-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {sent ? 'Wysłane' : 'Nowa wiadomość'}
            </span>
          </div>

          <div className="bg-white p-3 dark:bg-zinc-900">
            <label className="mb-2 flex items-center gap-2 text-sm">
              <span className="w-16 shrink-0 text-muted-foreground">Do:</span>
              <span className="font-mono text-xs sm:text-sm">a.kowalska@sp7.edu.pl</span>
            </label>

            <label className="mb-2 flex items-center gap-2 border-t pt-2 text-sm">
              <span className="w-16 shrink-0 text-muted-foreground">Imię:</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={sent}
                placeholder="jak masz na imię?"
                aria-label="Twoje imię — potrzebne tylko do sprawdzenia podpisu"
                className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </label>

            <label className="mb-2 flex items-center gap-2 border-t pt-2 text-sm">
              <span className="w-16 shrink-0 text-muted-foreground">Temat:</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                disabled={sent}
                placeholder="o co chodzi w tej wiadomości?"
                aria-label="Temat wiadomości"
                className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </label>

            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              disabled={sent}
              rows={8}
              placeholder={'Dzień dobry, Pani Aniu,\n\n…\n\nPozdrawiam,\n(twoje imię)'}
              aria-label="Treść wiadomości"
              className="mt-1 w-full resize-y border-t bg-transparent pt-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70"
            />

            {/* Załącznik */}
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => attachment === 'idle' && setAttachment('saved')}
                disabled={sent || attachment !== 'idle'}
                className={cn(
                  'inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  attachment === 'idle' && !sent
                    ? 'cursor-pointer hover:bg-muted/60'
                    : 'cursor-default'
                )}
                style={attachment !== 'idle' ? { borderColor: color, color } : undefined}
              >
                {attachment !== 'idle' ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Save className="h-3.5 w-3.5" aria-hidden />
                )}
                {attachment === 'idle' ? 'Zapisz pracę jako plik' : 'praca-przyroda.odt'}
              </button>

              <motion.button
                type="button"
                onClick={attach}
                disabled={sent || attachment === 'attached'}
                animate={wrongAttach ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  sent || attachment === 'attached'
                    ? 'cursor-default'
                    : 'cursor-pointer hover:bg-muted/60',
                  wrongAttach && 'border-red-600 text-red-700 dark:text-red-400'
                )}
                style={
                  attachment === 'attached'
                    ? { borderColor: color, backgroundColor: `${color}14`, color }
                    : undefined
                }
              >
                {attachment === 'attached' ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Paperclip className="h-3.5 w-3.5" aria-hidden />
                )}
                Dołącz do wiadomości
              </motion.button>

              {wrongAttach && (
                <span className="text-xs text-red-700 dark:text-red-400">
                  Nie ma czego dołączyć — najpierw zapisz plik.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={send}
              disabled={!ready || sent}
              className={cn(
                'mt-3 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white transition-opacity',
                ready && !sent ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-35'
              )}
              style={{ backgroundColor: color }}
            >
              <Send className="h-4 w-4" aria-hidden />
              {sent ? 'Wysłane' : ready ? 'Wyślij' : `Wyślij (${passed}/${checks.length})`}
            </button>
          </div>
        </div>

        {/* Kontrole — jawne reguły, nie zgadywanka */}
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              Czy da się to przeczytać
            </p>
            <p className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
              {passed}/{checks.length}
            </p>
          </div>

          <ul className="space-y-2">
            {checks.map((check) => (
              <li key={check.id} className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border"
                  style={
                    check.ok
                      ? { backgroundColor: color, borderColor: color }
                      : { borderColor: 'var(--border)' }
                  }
                >
                  {check.ok && <Check className="h-3 w-3 text-white" aria-hidden />}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block text-xs leading-snug sm:text-sm',
                      check.ok && 'text-muted-foreground line-through'
                    )}
                  >
                    {check.label}
                  </span>
                  {!check.ok && (
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                      {check.hint}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Odpowiedź — nagroda za skończoną robotę */}
      <AnimatePresence>
        {reply && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4"
            style={{ borderColor: color }}
          >
            <div className="border bg-zinc-50 p-3 dark:bg-zinc-800/60 sm:p-4">
              <p className="text-xs text-muted-foreground">
                od: a.kowalska@sp7.edu.pl · temat: Re: {subject.trim() || '(twój temat)'}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Dzień dobry{name.trim() ? `, ${name.trim()}` : ''},
                <br />
                <br />
                dziękuję za wiadomość i za to, że napisałeś/napisałaś od razu, a nie w dniu oddania.
                Zgadzam się na poniedziałek. Załącznik doszedł, zerknęłam — dobry początek.
                <br />
                <br />
                Pozdrawiam,
                <br />
                A. Kowalska
              </p>
            </div>

            <p className="mt-4 text-sm leading-relaxed">
              <strong>To wszystko zajęło ci kilka minut, a odbiorczyni kilkanaście sekund.</strong>{' '}
              O to chodzi w tych ośmiu punktach: nie o grzeczność dla samej grzeczności, tylko o to,
              żeby druga osoba mogła ci odpowiedzieć od razu, bez dopytywania, kto pisze i o co
              prosi.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Napisz dziś jeden taki e-mail naprawdę — do rodzica, babci albo nauczyciela. Ta sama
              lista sprawdza się za każdym razem.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
