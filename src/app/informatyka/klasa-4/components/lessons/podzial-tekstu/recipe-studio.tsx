'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, ListTree, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import { TaskShell } from '../../task-shell';
import { MiniWriter } from '../../mini-writer/mini-writer';
import { blocksFromText, toDoc, type WriterBlock } from '../../mini-writer/model';
import { DOC } from './recipe';
import {
  Z10_CRITERIA,
  analyseRecipe,
  judgeRecipeContent,
  type RecipeAnalysis,
} from './z10';

/**
 * Zadanie obowiązkowe **Z-10** — w całości w lekcji: dziecko formatuje surowy
 * przepis na koktajl truskawkowy w `MiniWriter` (style, akapity, zielony kolor),
 * a werdykt czyta ten sam `DocContent`, który czytał z plików.
 *
 * Materiał zaczyna się jako zwykły tekst: tytuł i tytuły etapów bez stylów
 * i z dwoma pustymi akapitami w środku — czyli dokładnie z tym, czego uczą
 * bloki 1 (`OutlineBuilder`: style, nie pogrubienie) i 4 (`GreenOnly`). Sędzia
 * nie wie, skąd dokument przyszedł.
 *
 * Nagrodą jest **panel nawigacji zbudowany z nagłówków dziecka** — to samo
 * okno, które w bloku 1 zostawało puste po pogrubieniu.
 */

const RAW_RECIPE = [
  'Przepis na koktajl truskawkowy',
  'Koktajl robi się w kwadrans, a wychodzą z niego dwie duże szklanki.',
  '',
  'Czego potrzebujesz',
  'Składniki: truskawki, banan, jogurt naturalny i łyżeczka miodu.',
  'Przedmioty: blender, nóż, deska do krojenia i dwie szklanki.',
  'Przygotowanie owoców',
  'Umyj truskawki pod zimną wodą i odetnij im szypułki.',
  'Obierz banana i pokrój go nożem na desce na grube plastry.',
  '',
  'Miksowanie i podanie',
  'Wrzuć owoce do blendera, dolej jogurt z miodem i miksuj pół minuty.',
  'Przelej koktajl do dwóch szklanek i wypij, zanim osiądzie piana.',
].join('\n');

const CRITERIA = Z10_CRITERIA.filter((item) => item.id !== 'dokument');

interface RecipeStudioProps {
  color: string;
  onComplete?: () => void;
}

export function RecipeStudio({ color, onComplete }: RecipeStudioProps) {
  const [blocks, setBlocks] = useState<WriterBlock[]>(() => blocksFromText(RAW_RECIPE));
  /* Migawka dokumentu z chwili sprawdzenia: nagroda pokazuje to, co przeszło werdykt. */
  const [checked, setChecked] = useState<{ analysis: RecipeAnalysis; attempt: number } | null>(
    null
  );

  const judge = () => {
    const analysis = analyseRecipe(toDoc(blocks));
    setChecked((previous) => ({ analysis, attempt: (previous?.attempt ?? 0) + 1 }));
    return { verdicts: judgeRecipeContent(analysis), data: analysis };
  };

  const reset = () => {
    setBlocks(blocksFromText(RAW_RECIPE));
    setChecked(null);
  };

  return (
    <TaskShell<RecipeAnalysis>
      color={color}
      brief={
        <>
          <p>
            <strong>Zadanie Z-10.</strong> Utwórz nowy dokument i zapisz w nim tytuł:
            „Przepis na koktajl truskawkowy”. Następnie wykonaj polecenia:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Napisz przepis na koktajl truskawkowy. Wymień składniki i przedmioty potrzebne do
              jego przyrządzenia. Opisz kolejne etapy pracy.
            </li>
            <li>Zatytułuj poszczególne etapy pracy i podziel tekst na akapity.</li>
            <li>Sformatuj według własnego pomysłu tytuł główny i tytuły kolejnych etapów pracy.</li>
            <li>Wyróżnij na zielono nazwy przedmiotów potrzebnych do zrobienia koktajlu.</li>
          </ol>
          <p className="mt-3">
            Przepis masz niżej — <strong>surowy tekst na tej stronie</strong>. Treść już stoi
            (twoje składniki i twoje etapy przyjdą same, kiedy zaczniesz poprawiać), twoja robota
            to podział i format: style, akapity i zielone przedmioty.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      criteria={CRITERIA}
      workshop={
        <div>
          <p className="mb-2 text-sm leading-relaxed">
            Tytuł i tytuły etapów rób <strong>stylami</strong> z listy („Tytuł”, „Nagłówek 2”), nie
            pogrubieniem — panel nawigacji pokaże ci różnicę od razu. Puste linie między akapitami
            usuń przyciskiem kosza: odstęp robi się stylem, nie pustym akapitem.
          </p>
          <MiniWriter
            color={color}
            blocks={blocks}
            onChange={setBlocks}
            tools={['undo', 'style', 'emphasis', 'color', 'arrange']}
            label="Twój przepis"
          />
        </div>
      }
      judge={judge}
      renderReport={(analysis) => <RecipeContentReport report={analysis} color={color} />}
      acceptedText={
        <>
          Twój przepis ma tytuł, etapy i akapity — i <strong>program o tym wie</strong>, a nie tylko
          ty. Panel nawigacji niżej zbudował się sam z twoich nagłówków; dokładnie tak samo zrobi
          to każdy edytor, w którym kiedyś otworzysz taki dokument.
        </>
      }
      reward={
        checked && (
          <div key={checked.attempt}>
            <NavPanel outline={checked.analysis.outline} color={color} />
          </div>
        )
      }
      onReset={reset}
      onComplete={onComplete}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Mapa dokumentu — wspólna dla podglądu celu i raportu                */
/* ------------------------------------------------------------------ */

interface MapEntry {
  kind: 'title' | 'heading' | 'text' | 'fake';
  text?: string;
  /** Długość akapitu — belka rośnie razem z nią, ale nigdy nie zdradza treści. */
  length?: number;
}

function DocMap({ entries, color, label }: { entries: MapEntry[]; color: string; label: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="space-y-1.5 border bg-white p-3 dark:bg-zinc-900/60">
        {entries.length === 0 && (
          <p className="py-4 text-center text-xs italic text-muted-foreground">Pusto.</p>
        )}
        {entries.map((entry, index) => {
          if (entry.kind === 'text')
            return (
              <div
                key={index}
                className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700"
                style={{ width: `${Math.min(100, 45 + (entry.length ?? 60) / 4)}%` }}
                aria-hidden
              />
            );
          return (
            <p
              key={index}
              className={cn(
                'truncate leading-snug',
                entry.kind === 'title' && 'text-sm font-bold',
                entry.kind === 'heading' && 'pl-3 text-xs font-semibold',
                entry.kind === 'fake' && 'pl-3 text-xs font-semibold'
              )}
              style={{
                color: entry.kind === 'fake' ? '#b4542f' : color,
                textDecoration: entry.kind === 'fake' ? 'underline wavy' : undefined,
                textDecorationColor: entry.kind === 'fake' ? '#d4643a' : undefined,
              }}
            >
              {entry.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

/** Okno nawigacji — to samo, które w pierwszym bloku lekcji zapełniało się stylami. */
function NavPanel({ outline, color }: { outline: { text: string; level: number }[]; color: string }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <ListTree className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Panel nawigacji
      </p>
      <div className="min-h-[92px] border bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/60">
        {outline.length === 0 ? (
          <p className="px-1 py-4 text-center text-[11px] leading-snug text-muted-foreground">
            Pusto — program nie znalazł w dokumencie ani jednego nagłówka.
          </p>
        ) : (
          <ul className="space-y-1">
            {outline.map((entry, index) => (
              <li
                key={index}
                className="truncate text-xs"
                style={{ paddingLeft: `${(Math.min(entry.level, 4) - 1) * 12}px` }}
              >
                <span
                  className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                {entry.text || '(bez tytułu)'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Podgląd celu: modelowy przepis lekcji pokazany tą samą mapą, co praca dziecka. */
function GoalPreview({ color }: { color: string }) {
  const entries: MapEntry[] = DOC.map((block) =>
    block.role === 'tytul'
      ? { kind: 'title' as const, text: block.text }
      : block.role === 'naglowek'
        ? { kind: 'heading' as const, text: block.text }
        : { kind: 'text' as const, length: block.text.length }
  );
  const outline = DOC.filter((block) => block.role !== 'tekst').map((block) => ({
    text: block.text,
    level: block.role === 'tytul' ? 1 : 2,
  }));

  return (
    <div className="border bg-muted/20 p-3">
      <p className="mb-3 text-sm leading-relaxed">
        <strong>Tak ma to wyglądać</strong> — kształt, nie treść. Twój przepis ma te same części:
        tytuł, tytuły etapów, akapity.
      </p>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
        <DocMap entries={entries} color={color} label="Dokument" />
        <NavPanel outline={outline} color={color} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport z dokumentu na stronie                                       */
/* ------------------------------------------------------------------ */

const GREEN_LABEL: Record<string, string> = {
  przedmiot: 'przedmiot',
  skladnik: 'składnik',
  miara: 'miara',
  inne: 'nie wiem, co to',
};

function RecipeContentReport({ report, color }: { report: RecipeAnalysis; color: string }) {
  const entries = useMemo<MapEntry[]>(() => {
    const fake = new Set(report.fakeHeadings);
    return report.doc.paragraphs
      .filter((paragraph) => paragraph.text.trim() !== '')
      .map((paragraph) => {
        const text = paragraph.text.trim();
        if (paragraph.heading !== null)
          return { kind: paragraph.heading <= 1 ? 'title' : 'heading', text } as MapEntry;
        if (fake.has(text)) return { kind: 'fake', text } as MapEntry;
        return { kind: 'text', length: text.length } as MapEntry;
      });
  }, [report]);

  const wrong = report.green.filter((item) => item.kind === 'skladnik' || item.kind === 'miara');

  return (
    <div className="border bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        Co znalazłam w twoim dokumencie
      </p>
      <p className="mt-1 text-sm">
        {count(report.doc.words, 'wyraz', 'wyrazy', 'wyrazów')} ·{' '}
        {count(report.bodyParagraphs, 'akapit', 'akapity', 'akapitów')} z tekstem
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
        <DocMap entries={entries} color={color} label="Twój dokument" />
        <NavPanel outline={report.outline} color={color} />
      </div>

      {report.fakeHeadings.length > 0 && (
        <p className="mt-2 flex items-start gap-2 border-l-2 border-amber-500 bg-amber-50 p-2.5 text-xs leading-relaxed dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
          <span>
            Podkreślone falą akapity <strong>wyglądają jak tytuły</strong> — są krótkie i pogrubione
            — ale mają styl „Zwykły tekst”. Dlatego nie ma ich w panelu obok. Zaznacz każdy z nich
            i wybierz z listy stylów <strong>„Nagłówek 2”</strong>.
          </span>
        </p>
      )}

      {report.green.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Co wyróżniłeś/wyróżniłaś na zielono
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {report.green.map((item, index) => {
              const ok = item.kind === 'przedmiot';
              const neutral = item.kind === 'inne';
              return (
                <li
                  key={`${item.text}-${index}`}
                  className={cn(
                    'inline-flex items-center gap-1.5 border px-2 py-1 text-xs',
                    neutral && 'text-muted-foreground'
                  )}
                  style={{ borderColor: ok ? color : neutral ? undefined : '#d4643a' }}
                  title={item.why}
                >
                  {ok ? (
                    <Check className="h-3 w-3 shrink-0" style={{ color }} aria-hidden />
                  ) : neutral ? null : (
                    <X className="h-3 w-3 shrink-0 text-[#d4643a]" aria-hidden />
                  )}
                  {item.text}
                  <span className="text-[10px] text-muted-foreground">{GREEN_LABEL[item.kind]}</span>
                </li>
              );
            })}
          </ul>
          {wrong.length > 0 && wrong[0].why && (
            <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              {wrong[0].why}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
