'use client';

import { useEffect, useState } from 'react';
import { Check, HelpCircle, Type, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskShell } from '../../task-shell';
import { MiniWriter } from '../../mini-writer/mini-writer';
import { blocksFromText, toDoc, type WriterBlock } from '../../mini-writer/model';
import type { WriterFont } from '../../mini-writer/toolbar';
import {
  POLISH_LETTERS,
  Z9_CRITERIA,
  analyseSampler,
  judgeSamplerContent,
  type FontSample,
  type Z9Analysis,
} from './z9';

/**
 * Zadanie obowiązkowe **Z-9** — w całości w lekcji: dziecko składa próbnik
 * dziesięciu krojów w `MiniWriter` (lista „Krój czcionki” zamiast listy Worda),
 * a werdykt czyta ten sam `DocContent`, który czytał z plików.
 *
 * Materiał to dziesięć nazw krojów domyślnym krojem. Każdy wiersz musi dostać
 * **swój** krój z listy i dopisane polskie litery — inaczej próbka nie powstaje
 * (`namesOwnFont` porównuje treść wiersza z krojem, którym jest zapisany).
 * Kroje z listy zna też przeglądarka, więc nagroda mierzy ogonki wprost na
 * pracy dziecka — ta sama pułapka, którą `SamplerBench` pokazywał na krojach
 * kursu.
 */

const SAMPLER_FONTS: WriterFont[] = [
  { name: 'Georgia', css: 'Georgia, serif' },
  { name: 'Times New Roman', css: '"Times New Roman", Times, serif' },
  { name: 'Arial', css: 'Arial, Helvetica, sans-serif' },
  { name: 'Verdana', css: 'Verdana, Geneva, sans-serif' },
  { name: 'Courier New', css: '"Courier New", Courier, monospace' },
  { name: 'Comic Sans MS', css: '"Comic Sans MS", "Chalkboard SE", cursive' },
  { name: 'Brush Script MT', css: '"Brush Script MT", "Segoe Script", cursive' },
  { name: 'Trebuchet MS', css: '"Trebuchet MS", Verdana, sans-serif' },
  { name: 'Tahoma', css: 'Tahoma, Geneva, sans-serif' },
  { name: 'Impact', css: 'Impact, sans-serif' },
];

const RAW_SAMPLER = SAMPLER_FONTS.map((font) => font.name).join('\n');

const CRITERIA = Z9_CRITERIA.filter((item) => item.id !== 'dokument');

interface SamplerStudioProps {
  color: string;
  onComplete?: () => void;
}

export function SamplerStudio({ color, onComplete }: SamplerStudioProps) {
  const [blocks, setBlocks] = useState<WriterBlock[]>(() => blocksFromText(RAW_SAMPLER));
  /* Migawka próbki z chwili sprawdzenia: nagroda mierzy to, co przeszło werdykt. */
  const [checked, setChecked] = useState<{ analysis: Z9Analysis; attempt: number } | null>(null);

  const judge = () => {
    const analysis = analyseSampler(toDoc(blocks));
    setChecked((previous) => ({ analysis, attempt: (previous?.attempt ?? 0) + 1 }));
    return { verdicts: judgeSamplerContent(analysis), data: analysis };
  };

  const reset = () => {
    setBlocks(blocksFromText(RAW_SAMPLER));
    setChecked(null);
  };

  return (
    <TaskShell<Z9Analysis>
      color={color}
      brief={
        <>
          <p>
            <strong>Zadanie Z-9.</strong> Stwórz dokument z próbkami 10 krojów czcionki, które są
            dostępne w twoim edytorze tekstu. Wybierz krój czcionki i zastosuj go do zapisania
            jego nazwy. Sprawdź, czy w wybranym kroju są polskie znaki. Jeśli tak, napisz te
            litery obok nazwy kroju.
          </p>
          <p className="mt-3">
            Edytorem jest lista niżej — <strong>na tej stronie</strong>. Dziesięć nazw już stoi,
            każda w osobnym wierszu: kliknij wiersz, wybierz z listy krój o tej nazwie i dopisz
            obok polskie litery ą ć ę ł ń ó ś ź ż.
          </p>
        </>
      }
      goal={<GoalPreview />}
      criteria={CRITERIA}
      workshop={
        <div>
          <p className="mb-2 text-sm leading-relaxed">
            Najpierw kliknij wiersz, potem wybierz krój z listy „Krój czcionki” — nazwa ma być
            zapisana <strong>tym właśnie krojem</strong>. Potem dopisz obok polskie litery i od
            razu zobacz, czy ogonki wyglądają jak reszta wiersza. Jeśli wyglądają inaczej, ten
            krój ich nie ma — napisz to obok nazwy, bo to też jest odpowiedź.
          </p>
          <MiniWriter
            color={color}
            blocks={blocks}
            onChange={setBlocks}
            tools={['undo', 'font']}
            fonts={SAMPLER_FONTS}
            label="Twój próbnik"
          />
        </div>
      }
      judge={judge}
      renderReport={(analysis) => <SamplerContentReport report={analysis} color={color} />}
      acceptedText={
        <>
          Masz próbnik, w którym <strong>każda nazwa nosi swój krój</strong> — a to znaczy, że
          umiesz już zrobić z tekstem coś, czego nie widać na pierwszy rzut oka. Pod spodem
          przepytałam o twoje kroje przeglądarkę; zobacz, czy zgodziła się z tobą co do ogonków.
        </>
      }
      reward={checked && <ProbeReward key={checked.attempt} report={checked.analysis} color={color} />}
      onReset={reset}
      onComplete={onComplete}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Podgląd celu                                                        */
/* ------------------------------------------------------------------ */

function GoalPreview() {
  return (
    <div className="border bg-muted/20 p-3">
      <p className="mb-3 text-sm leading-relaxed">
        <strong>Tak ma wyglądać jeden wiersz próbnika</strong> — nazwa kroju zapisana tym krojem, a
        obok polskie litery. Twoich dziesięć wierszy będzie w innych krojach; liczy się, żeby
        każdy naprawdę niósł swój.
      </p>
      <ul className="space-y-1.5 border bg-white p-3 dark:bg-zinc-900/60">
        {SAMPLER_FONTS.slice(0, 3).map((font) => (
          <li key={font.name} className="text-sm" style={{ fontFamily: font.css }}>
            {font.name} {POLISH_LETTERS.join(' ')}
          </li>
        ))}
        <li className="pt-1 text-xs text-muted-foreground">…i tak dziesięć razy</li>
      </ul>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Sprawdzę dwie rzeczy, których nie widać: czy <strong>każdy</strong> wiersz jest zapisany
        innym krojem i czy przy każdym stoją polskie litery. Plus podwójne spacje i ręczne złamania
        wiersza — te z pierwszego bloku lekcji.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport z dokumentu na stronie                                       */
/* ------------------------------------------------------------------ */

const CSS_BY_FONT = new Map(SAMPLER_FONTS.map((font) => [font.name, font.css]));

function SamplerContentReport({ report, color }: { report: Z9Analysis; color: string }) {
  return (
    <div className="border bg-muted/20 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        <Type className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Twój próbnik, przeczytany ze strony
      </p>

      {report.samples.length > 0 && (
        <ul className="mt-3 space-y-1.5 border bg-white p-3 dark:bg-zinc-900/60">
          {report.samples.map((sample) => (
            <li
              key={sample.font}
              className="text-base leading-snug"
              style={{ fontFamily: CSS_BY_FONT.get(sample.font) ?? 'inherit' }}
            >
              {sample.line}
            </li>
          ))}
        </ul>
      )}

      {report.samples.some((sample) => !sample.polishInFont && sample.polish.length > 0) && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Przy {report.samples
            .filter((sample) => !sample.polishInFont && sample.polish.length > 0)
            .map((sample) => sample.font)
            .join(', ')}{' '}
          polskie litery są zapisane <strong>innym krojem niż nazwa</strong> (albo dopisane po
          zmianie kroju). Nic wtedy o tym kroju nie mówią — zaznacz cały wiersz jeszcze raz i
          nadaj mu ten sam krój, co nazwie.
        </p>
      )}

      {report.flaws.length > 0 && <FlawList report={report} />}
    </div>
  );
}

/**
 * Wiersze z usterkami pokazane **znakami niedrukowanymi** — tymi samymi `·` i
 * `↵`, którymi dziecko pracowało w `MarksOn`. Tam uczyło się je włączać; tutaj
 * widzi, co by zobaczyło po włączeniu ich we własnym dokumencie.
 */
function FlawList({ report }: { report: Z9Analysis }) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Twoje wiersze ze znakami niedrukowanymi
      </p>
      <ul className="space-y-1.5 border bg-white p-3 font-mono text-sm dark:bg-zinc-900/60">
        {report.flaws.map((flaw, index) => (
          <li key={index} className="leading-relaxed">
            {flaw.line.split(/( {2,})/).map((part, partIndex) =>
              / {2,}/.test(part) ? (
                <span key={partIndex} className="text-sky-600">
                  {'·'.repeat(part.length)}
                </span>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
            {flaw.breaks > 0 && <span className="text-rose-600">{'↵'.repeat(flaw.breaks)}</span>}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        <span className="text-sky-600">·</span> to spacja — dwie obok siebie to jedna za dużo.{' '}
        <span className="text-rose-600">↵</span> to złamanie wiersza zrobione Shift+Enter: wygląda
        jak nowy akapit, a akapitem nie jest, więc przy zmianie czcionki wszystko się rozjedzie.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nagroda: pomiar ogonków w przeglądarce                              */
/* ------------------------------------------------------------------ */

type ProbeResult = 'ma' | 'czesc' | 'nie-ma' | 'nieznany';

/** Trzy rodziny zapasowe o różnych metrykach — jedna potrafi trafić szerokością przypadkiem. */
const FALLBACKS = ['monospace', 'serif', 'sans-serif'];
const SHAPE_PROBE = 'mmmlliiwwWW';

/**
 * Czy przeglądarka rysuje ten znak **tym** krojem.
 *
 * Sztuczka jest stara i prosta: jeśli krój znaku nie ma, przeglądarka po cichu
 * bierze go z rodziny zapasowej — a wtedy napis ma dokładnie tę samą szerokość
 * co w samej rodzinie zapasowej. Mierzymy więc oba warianty i patrzymy, czy
 * różnią się szerokością. Jedna rodzina zapasowa mogłaby trafić w tę samą
 * szerokość przypadkiem, więc pytamy trzy i wierzymy większości.
 */
function drawnWith(ctx: CanvasRenderingContext2D, text: string, name: string): number {
  let votes = 0;
  for (const fallback of FALLBACKS) {
    ctx.font = `48px "${name}", ${fallback}`;
    const withFont = ctx.measureText(text).width;
    ctx.font = `48px ${fallback}`;
    if (Math.abs(withFont - ctx.measureText(text).width) > 0.5) votes += 1;
  }
  return votes;
}

function probeFonts(names: string[]): Record<string, ProbeResult> {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return {};
  const result: Record<string, ProbeResult> = {};
  for (const name of names) {
    if (drawnWith(ctx, SHAPE_PROBE, name) < 2) {
      result[name] = 'nieznany';
      continue;
    }
    const found = POLISH_LETTERS.filter((letter) => drawnWith(ctx, letter, name) >= 2).length;
    result[name] = found >= 7 ? 'ma' : found <= 1 ? 'nie-ma' : 'czesc';
  }
  return result;
}

const PROBE_LABEL: Record<ProbeResult, string> = {
  ma: 'ma ogonki',
  czesc: 'ma tylko część',
  'nie-ma': 'nie ma ogonków',
  nieznany: 'nie znam tego kroju',
};

function ProbeReward({ report, color }: { report: Z9Analysis; color: string }) {
  const [probe, setProbe] = useState<Record<string, ProbeResult>>({});

  useEffect(() => {
    let alive = true;
    const names = report.samples.map((sample) => sample.font);
    /* Kroje systemowe bywają gotowe dopiero po `fonts.ready` — mierzone wcześniej kłamią. */
    void document.fonts.ready.then(() => {
      if (alive) setProbe(probeFonts(names));
    });
    return () => {
      alive = false;
    };
  }, [report]);

  const surprises = report.samples.filter((sample) => {
    const found = probe[sample.font];
    if (!found || found === 'nieznany') return false;
    const saidHas = sample.polish.length >= 5;
    return saidHas ? found === 'nie-ma' : found === 'ma';
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-1.5 pr-3 font-semibold">Krój z twojego próbnika</th>
              <th className="py-1.5 pr-3 font-semibold">Ogonki według ciebie</th>
              <th className="py-1.5 font-semibold">Ogonki według przeglądarki</th>
            </tr>
          </thead>
          <tbody>
            {report.samples.map((sample) => (
              <SampleRow
                key={sample.font}
                sample={sample}
                probe={probe[sample.font]}
                color={color}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Ostatnią kolumnę zmierzyłam tu, w przeglądarce: rysuję literę twoim krojem i sprawdzam, czy
        wyszła inna niż zapasowa. <strong>To nie jest Word</strong> — kroje bierze z tego samego
        komputera, ale mierzy je po swojemu, więc traktuj to jako drugie zdanie, nie jako wyrok.
        Kroju, którego nie zna, nie ogłaszam brakiem ogonków.
      </p>

      {surprises.length > 0 && (
        <p className="mt-2 border-l-2 border-amber-500 bg-amber-50 p-2.5 text-xs leading-relaxed dark:bg-amber-950/30">
          Nie zgodziliśmy się co do {surprises.map((sample) => sample.font).join(', ')}. Wróć do
          tego wiersza w swoim próbniku i przyjrzyj się ogonkom z bliska. Jeden z nas się myli i
          warto wiedzieć który.
        </p>
      )}
    </div>
  );
}

function SampleRow({
  sample,
  probe,
  color,
}: {
  sample: FontSample;
  probe?: ProbeResult;
  color: string;
}) {
  const saidHas = sample.polish.length >= 5;
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-3">
        <span className="text-base" style={{ fontFamily: CSS_BY_FONT.get(sample.font) ?? 'inherit' }}>
          {sample.font}
        </span>
      </td>
      <td className="py-2 pr-3">
        {saidHas ? (
          <span
            className="text-base"
            style={{ fontFamily: CSS_BY_FONT.get(sample.font) ?? 'inherit' }}
            aria-label={`napisałeś litery ${sample.polish.join(' ')}`}
          >
            {sample.polish.join(' ')}
          </span>
        ) : sample.saidMissing ? (
          <span className="text-xs text-muted-foreground">napisałeś/napisałaś, że ich nie ma</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-2">
        {probe === undefined ? (
          <span className="text-xs text-muted-foreground">mierzę…</span>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium',
              probe === 'nieznany' && 'text-muted-foreground'
            )}
            style={probe === 'ma' ? { color } : probe === 'nie-ma' ? { color: '#b4542f' } : undefined}
          >
            {probe === 'ma' && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            {probe === 'nie-ma' && <X className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            {probe === 'nieznany' && <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            {PROBE_LABEL[probe]}
          </span>
        )}
      </td>
    </tr>
  );
}
