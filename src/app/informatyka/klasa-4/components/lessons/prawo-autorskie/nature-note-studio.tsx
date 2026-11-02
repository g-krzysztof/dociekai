'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Lock, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import { imgMap } from '@/lib/media';
import { TaskShell } from '../../task-shell';
import { MiniWriter, type WriterPaste } from '../../mini-writer/mini-writer';
import { textBlock, toDoc, type WriterBlock, type WriterPicture } from '../../mini-writer/model';
import { analyse, RUN_MIN, tokenize } from './copy-check';
import {
  NATURE_CRITERIA,
  analyseNatureNote,
  judgeNatureNoteContent,
  type NatureNoteAnalysis,
} from './source';

/**
 * Zadanie praktyczne lekcji o prawie autorskim — w całości w lekcji: dziecko
 * pisze notatkę o łące w `MiniWriter`, wstawia zdjęcie z banku, podpisuje je
 * (autor + licencja) i kończy sekcją „Źródła”, a werdykt czyta ten sam
 * `DocContent`, który czytał z plików.
 *
 * Materiał to tytuł i dwa zdania wstępu — resztę dziecko pisze samo, bo notatka
 * ma być o tym, co samo widzi. Zdjęcie bierze z banku niżej, razem z czterema
 * rzeczami do przepisania (tytuł, autor, adres, licencja). Wklejenie ze strony
 * widać od razu (`onPaste` edytora): wklejony fragment musi zniknąć albo zostać
 * napisany własnymi słowami, zanim praca przejdzie.
 *
 * Nagrodą jest **`OwnWords` puszczony na jego własnej notatce** — to samo
 * porównanie, co w bloku „Przepisz to własnymi słowami”, ale na tekście, który
 * dziecko naprawdę oddaje, i na źródle, które samo wkleja.
 */

const PICTURE_SOURCES = imgMap({
  laka: '/images/informatyka/lekcje/prawo-autorskie/bukiet-polny-v2.jpg',
});

const PICTURES: WriterPicture[] = [{ id: 'laka', src: PICTURE_SOURCES.laka, name: 'łąka w czerwcu' }];

/** Karta banku — te same cztery rzeczy, które dziecko przepisuje pod zdjęcie i do źródeł. */
const BANK_CARD = {
  title: 'Łąka w czerwcu',
  author: 'Marta Wilk',
  source: 'https://commons.wikimedia.org',
  license: 'CC BY',
};

/** Tytuł i dwa zdania wstępu — reszta notatki jest pracą dziecka. */
function initialBlocks(): WriterBlock[] {
  return [
    textBlock('Łąka w czerwcu', { style: 'title' }),
    textBlock('Za wsią, między lasem a rzeką, rozciąga się łąka. W czerwcu wygląda jak kolorowy dywan.'),
  ];
}

const CRITERIA = NATURE_CRITERIA.filter((item) => item.id !== 'dokument');

interface NatureNoteStudioProps {
  color: string;
  onComplete?: () => void;
}

export function NatureNoteStudio({ color, onComplete }: NatureNoteStudioProps) {
  const [blocks, setBlocks] = useState<WriterBlock[]>(initialBlocks);
  /* Zapisane wklejki — sędzia sprawdza, czy któraś stoi w notatce dalej słowo w słowo. */
  const [pastes, setPastes] = useState<string[]>([]);
  /* Migawka notatki z chwili sprawdzenia: nagroda porównuje to, co przeszło werdykt. */
  const [checked, setChecked] = useState<{ analysis: NatureNoteAnalysis; attempt: number } | null>(
    null
  );

  const judge = () => {
    const analysis = analyseNatureNote(toDoc(blocks, PICTURES), pastes);
    setChecked((previous) => ({ analysis, attempt: (previous?.attempt ?? 0) + 1 }));
    return { verdicts: judgeNatureNoteContent(analysis), data: analysis };
  };

  const reset = () => {
    setBlocks(initialBlocks());
    setPastes([]);
    setChecked(null);
  };

  return (
    <TaskShell<NatureNoteAnalysis>
      color={color}
      brief={
        <>
          <p>
            <strong>Napisz niżej krótką notatkę</strong> o łące — taką, którą można oddać
            na przyrodzie. Skorzystaj z internetu, ale tak, żeby wszystko w tej notatce było
            wzięte uczciwie.
          </p>
          <p className="mt-3">
            Wstaw <strong>jedno zdjęcie z banku niżej</strong> i podpisz je: autor i nazwa
            licencji. Na dole zrób nagłówek <strong>„Źródła”</strong>, a pod nim wypisz adresy
            stron, z których korzystałeś/korzystałaś.
          </p>
          <p className="mt-3">
            Tekst pisz <strong>z zasłoniętym źródłem</strong>. Przeczytaj, zasłoń, napisz z głowy.
            Wklejenie widzę od razu — wklejony fragment musi zniknąć albo zostać napisany twoimi
            słowami, zanim praca przejdzie.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      criteria={CRITERIA}
      workshop={
        <div>
          <BankCard color={color} />
          <p className="mb-2 mt-3 text-sm leading-relaxed">
            Zdjęcie wstawisz przyciskiem <strong>„Wstaw obraz”</strong> — stanie tam, gdzie stoi
            kursor. Podpis pod zdjęciem dopisz sam/sama, przepisując cztery rzeczy z karty.
            Notatka ma mieć <strong>co najmniej dwa akapity i trzydzieści wyrazów</strong>
            : napisz o wyglądzie łąki, o tym, kto na niej żyje, i o czymś, co cię zaskoczyło.
          </p>
          <MiniWriter
            color={color}
            blocks={blocks}
            onChange={setBlocks}
            tools={['undo', 'insert', 'arrange']}
            pictures={PICTURES}
            onPaste={(paste: WriterPaste) => setPastes((current) => [...current, paste.text])}
            label="Twoja notatka"
          />
        </div>
      }
      judge={judge}
      renderReport={(analysis) => <NatureContentReport report={analysis} color={color} />}
      acceptedText={
        <>
          Twoja notatka ma zdjęcie z podanym autorem i licencją oraz źródła z prawdziwymi adresami —
          czyli <strong>wszystko, co w niej cudze, jest podpisane</strong>. Pod spodem masz
          narzędzie z bloku „Przepisz to własnymi słowami”, tym razem wycelowane w twój tekst.
        </>
      }
      reward={
        checked && (
          <CopyCheck key={checked.attempt} bodyText={checked.analysis.bodyText} color={color} />
        )
      }
      onReset={reset}
      onComplete={onComplete}
    />
  );
}

/** Bank jednego zdjęcia — tytuł, autor, adres i licencja do przepisania. */
function BankCard({ color }: { color: string }) {
  return (
    <div className="border bg-muted/20 p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Bank zdjęć — jedno zdjęcie, wolna licencja
      </p>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PICTURES[0].src}
          alt=""
          draggable={false}
          className="h-20 w-auto border"
        />
        <dl className="min-w-0 text-sm leading-relaxed">
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted-foreground">Tytuł:</dt>
            <dd className="font-medium">{BANK_CARD.title}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted-foreground">Autor:</dt>
            <dd className="font-medium">{BANK_CARD.author}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted-foreground">Skąd:</dt>
            <dd className="break-all font-medium">{BANK_CARD.source}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted-foreground">Licencja:</dt>
            <dd className="font-medium" style={{ color }}>
              {BANK_CARD.license}
            </dd>
          </div>
        </dl>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Drugi adres do źródeł dopisz z własnej głowy — na przykład Wikipedię.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Podgląd celu                                                        */
/* ------------------------------------------------------------------ */

function GoalPreview({ color }: { color: string }) {
  return (
    <div className="grid gap-3 border bg-muted/20 p-3 sm:grid-cols-[minmax(0,250px)_minmax(0,1fr)] sm:items-center">
      <div className="space-y-2 border bg-white p-3 dark:bg-zinc-900/60" aria-hidden>
        <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: color }} />
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-1.5 w-11/12 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div
          className="flex h-12 items-center justify-center border border-dashed text-[10px] uppercase tracking-wide text-muted-foreground"
          style={{ borderColor: `${color}66` }}
        >
          zdjęcie
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-1.5 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="border-t pt-2">
          <div className="h-1.5 w-1/4 rounded-full" style={{ backgroundColor: `${color}99` }} />
          <div className="mt-1 h-1 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-1 h-1 w-4/6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
      <div className="text-sm leading-relaxed">
        <p className="font-semibold" style={{ color }}>
          Tak ma wyglądać twoja notatka.
        </p>
        <p className="mt-2 text-muted-foreground">
          Kilka akapitów twoimi słowami, jedno wstawione zdjęcie i{' '}
          <strong className="text-foreground">sekcja „Źródła” na dole</strong> — z adresami stron i
          z podpisem zdjęcia: kto je zrobił i na jakiej licencji je udostępnił.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport                                                              */
/* ------------------------------------------------------------------ */

function NatureContentReport({ report, color }: { report: NatureNoteAnalysis; color: string }) {
  return (
    <div className="border bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        Co znalazłam w twojej notatce
      </p>
      <p className="mt-1 text-sm">
        {count(report.words, 'wyraz', 'wyrazy', 'wyrazów')} ·{' '}
        {count(report.links.length, 'adres', 'adresy', 'adresów')} ·{' '}
        {count(report.images.length, 'obraz', 'obrazy', 'obrazów')}
      </p>

      {report.pasted.length > 0 && (
        <div className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/30">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Fragmenty po wklejeniu ze strony
          </p>
          <ul className="mt-2 space-y-2">
            {report.pasted.map((item, index) => (
              <li key={index} className="text-xs leading-relaxed">
                <span className="mt-0.5 block">
                  „{item.text.slice(0, 150)}
                  {item.text.length > 150 ? '…' : ''}”
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed">
            To <strong>nie jest dowód</strong>, że coś zostało przepisane — to ślad po wklejeniu,
            bo wklejka stoi tu dalej słowo w słowo. Ale jest to dobry powód, żeby te zdania
            przeczytać jeszcze raz i sprawdzić, czy to naprawdę twoje słowa.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Narzędzie z bloku `OwnWords`, tym razem na notatce dziecka. Źródło wkleja ono
 * samo — do internetu nie wchodzimy i mówimy o tym wprost.
 */
function CopyCheck({ bodyText, color }: { bodyText: string; color: string }) {
  const [source, setSource] = useState('');
  const analysis = useMemo(
    () => (source.trim().length > 40 ? analyse(bodyText, source) : null),
    [bodyText, source]
  );

  const tokens = useMemo(() => tokenize(bodyText), [bodyText]);
  let wordIndex = -1;

  return (
    <div className="mt-4">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Quote className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Porównaj swoją notatkę ze źródłem
      </p>
      <p className="mt-1 text-sm leading-relaxed">
        Wklej tutaj <strong>akapit ze strony</strong>, z której korzystałeś/korzystałaś, a
        podkreślę w twojej notatce ciągi <strong>{RUN_MIN} słów i dłuższe</strong>, które są takie
        same — tak jak w bloku „Przepisz to własnymi słowami”.
      </p>
      <textarea
        value={source}
        onChange={(event) => setSource(event.target.value)}
        rows={4}
        spellCheck={false}
        aria-label="Akapit ze strony, z której korzystałeś"
        placeholder="Wklej tu akapit ze strony…"
        className="mt-2 w-full border bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900/60"
      />
      <p className="mt-1 inline-flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        <span>
          Do internetu nie wchodzę — dlatego proszę cię o ten akapit. Ani on, ani twoja notatka nie
          idą nigdzie dalej.
        </span>
      </p>

      {analysis && (
        <div className="mt-3">
          <p
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: analysis.longest >= RUN_MIN ? '#b4542f' : color }}
          >
            {analysis.longest < RUN_MIN && <Check className="h-4 w-4 shrink-0" aria-hidden />}
            {analysis.longest < RUN_MIN
              ? `Nic nie jest przepisane — najdłuższy wspólny ciąg ma ${count(analysis.longest, 'słowo', 'słowa', 'słów')}.`
              : `Najdłuższy wspólny ciąg: ${count(analysis.longest, 'słowo', 'słowa', 'słów')}. Podkreślone fragmenty są takie same jak w źródle.`}
          </p>
          <p className="mt-2 whitespace-pre-line border bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900/60">
            {tokens.map((token, index) => {
              if (!token.isWord) return <span key={index}>{token.value}</span>;
              wordIndex += 1;
              const copied = analysis.flags[wordIndex];
              return (
                <span
                  key={index}
                  className={cn(copied && 'font-medium')}
                  style={
                    copied
                      ? {
                          color: '#b4542f',
                          textDecoration: 'underline wavy',
                          textDecorationColor: '#d4643a',
                        }
                      : undefined
                  }
                >
                  {token.value}
                </span>
              );
            })}
          </p>
          {analysis.longest >= RUN_MIN && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Zasłoń źródło i napisz te zdania jeszcze raz z głowy. Liczby, nazwy i daty zostaw
              takie, jakie są — ich nie da się powiedzieć inaczej i nikt tego nie wymaga.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
