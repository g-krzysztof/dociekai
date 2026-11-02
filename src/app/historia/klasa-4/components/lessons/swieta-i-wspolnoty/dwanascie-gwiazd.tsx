'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Music } from 'lucide-react';
import { plural } from '@/lib/plural';
import {
  EU_BLUE,
  EU_YELLOW,
  FINAL_MEMBERS,
  KROKI,
  ODA,
  PRED_MAX,
  PRED_MIN,
  STARS,
  noteFreq,
  starCenters,
  starPoints,
} from './gwiazdy';

const PANSTW = { one: 'państwo', few: 'państwa', many: 'państw' };
const GWIAZD = { one: 'gwiazda', few: 'gwiazdy', many: 'gwiazd' };

/** Flaga Unii według opisu urzędowego (2 : 3, koło 1/3 wysokości, gwiazda 1/18). */
export function FlagaUE({ className }: { className?: string }) {
  const H = 200;
  const centers = starCenters(150, 100, H / 3);
  return (
    <svg viewBox="0 0 300 200" className={className} role="img" aria-label="Flaga Unii Europejskiej: dwanaście złotych gwiazd w kręgu na niebieskim tle">
      <rect width={300} height={200} fill={EU_BLUE} />
      {centers.map((c, i) => (
        <polygon key={i} points={starPoints(c.x, c.y, H / 18)} fill={EU_YELLOW} />
      ))}
    </svg>
  );
}

/** Rząd kropek — jedna na państwo. */
function Panstwa({ n, color }: { n: number; color: string }) {
  return (
    <div className="flex flex-wrap gap-1" aria-label={`${n} ${plural(n, PANSTW)}`}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      ))}
    </div>
  );
}

let audioCtx: AudioContext | null = null;
/** „Oda do radości” z oscylatora — melodia z domeny publicznej, bez nagrania. */
function playOda() {
  if (typeof window === 'undefined') return;
  audioCtx ??= new AudioContext();
  const ctx = audioCtx;
  const beat = 0.45;
  let t = ctx.currentTime + 0.05;
  for (const [n, len] of ODA) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = noteFreq(n);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + len * beat - 0.02);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + len * beat);
    t += len * beat;
  }
}

/**
 * L11 blok 5 — dwanaście gwiazd. Dla pięciu lat z historii Unii dziecko
 * **przewiduje suwakiem liczbę gwiazd**, widząc liczbę państw, i odsłania
 * flagę: zawsze 12. Na koniec przewiduje dla trzydziestego państwa — przyjęte
 * tylko 12. Hymn Unii zagrany z oscylatora, bez słów (errata bazy).
 */
export function DwanascieGwiazd({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [pred, setPred] = useState(PRED_MIN);
  const [shown, setShown] = useState<number[]>([]);
  const [finalMsg, setFinalMsg] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const reported = useRef(false);

  useEffect(() => {
    if (solved && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [solved, onComplete]);

  const inFinal = step >= KROKI.length;
  const krok = KROKI[step];
  const revealed = !inFinal && shown.length > step;

  const reveal = () => setShown((s) => [...s, pred]);
  const next = () => {
    setStep((s) => s + 1);
    setPred(PRED_MIN);
  };
  const checkFinal = () => {
    if (pred === STARS) {
      setSolved(true);
      setFinalMsg(null);
    } else {
      setFinalMsg(
        `${pred} ${plural(pred, GWIAZD)}? Spójrz na swoje przewidywania: przy 12, 15, 25, 28 i 27 państwach flaga miała zawsze tyle samo gwiazd.`
      );
    }
  };

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Polska należy też do większej wspólnoty — <strong>Unii Europejskiej</strong>. Jej flaga ma
        złote gwiazdy w kręgu. Ile? Przewiduj rok po roku: zobaczysz, ile państw było wtedy w Unii.
      </p>

      {/* Dotychczasowe przewidywania */}
      {shown.length > 0 && (
        <ol className="grid grid-cols-5 gap-1 text-center text-[11px]">
          {shown.map((p, i) => (
            <li key={KROKI[i].year} className="border p-1">
              <span className="block font-mono font-semibold">{KROKI[i].year}</span>
              <span className="block text-muted-foreground">{KROKI[i].members} p.</span>
              <span className="block">ty: {p}</span>
              <span className="block font-semibold" style={{ color: EU_BLUE }}>
                flaga: {STARS}
              </span>
            </li>
          ))}
        </ol>
      )}

      {!inFinal && (
        <div className="space-y-3 border bg-white p-3 dark:bg-zinc-900/80">
          <p className="font-mono text-lg font-bold">{krok.year}</p>
          <p>
            W Unii jest <strong>{krok.members} {plural(krok.members, PANSTW)}</strong>.
          </p>
          <Panstwa n={krok.members} color={EU_BLUE} />
          {!revealed ? (
            <>
              <label className="block">
                <span className="mb-1 block">
                  Ile gwiazd jest na fladze w {krok.year} roku? <strong className="font-mono">{pred}</strong>
                </span>
                <input
                  type="range"
                  min={PRED_MIN}
                  max={PRED_MAX}
                  value={pred}
                  onChange={(e) => setPred(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: EU_BLUE }}
                />
              </label>
              <button type="button" onClick={reveal} className="cursor-pointer border px-4 py-2 font-semibold" style={{ borderColor: color, color }}>
                Pokaż flagę
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <FlagaUE className="mx-auto block w-full max-w-[240px]" />
              <p>
                Przewidziałeś/łaś {shown[step]}, na fladze {STARS === shown[step] ? 'też ' : ''}jest <strong>{STARS}</strong>. {krok.note}
              </p>
              <button type="button" onClick={next} className="cursor-pointer border px-4 py-2 font-semibold" style={{ borderColor: color, color }}>
                {step + 1 < KROKI.length ? 'Następny rok' : 'Ostatnie pytanie'}
              </button>
            </div>
          )}
        </div>
      )}

      {inFinal && (
        <div className="space-y-3 border bg-white p-3 dark:bg-zinc-900/80">
          <p>
            Kiedyś do Unii może wejść <strong>{FINAL_MEMBERS}. państwo</strong>. Ile gwiazd będzie wtedy na fladze?
          </p>
          <Panstwa n={FINAL_MEMBERS} color={EU_BLUE} />
          <label className="block">
            <span className="mb-1 block">
              Moje przewidywanie: <strong className="font-mono">{pred}</strong>
            </span>
            <input
              type="range"
              min={PRED_MIN}
              max={PRED_MAX}
              value={pred}
              disabled={solved}
              onChange={(e) => setPred(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: EU_BLUE }}
            />
          </label>
          {!solved && (
            <button type="button" onClick={checkFinal} className="cursor-pointer border px-4 py-2 font-semibold" style={{ borderColor: color, color }}>
              Sprawdź
            </button>
          )}
          {finalMsg && (
            <p className="text-destructive" aria-live="polite">
              {finalMsg}
            </p>
          )}
        </div>
      )}

      {solved && (
        <div className="space-y-2 p-3" style={{ backgroundColor: `${color}14` }} aria-live="polite">
          <p className="flex items-center gap-2 font-semibold" style={{ color }}>
            <Check className="h-4 w-4" aria-hidden /> Zawsze dwanaście.
          </p>
          <p>
            Gwiazdy na fladze Unii nie liczą państw. Dwanaście to znak pełni i jedności — stoją w
            kręgu jak godziny na tarczy zegara, żadna nie jest ważniejsza od innej. Dlatego flaga nie
            zmienia się, gdy ktoś do Unii wchodzi albo z niej wychodzi.
          </p>
          <p>
            Unia ma też swój hymn: melodię „Ody do radości” Ludwiga van Beethovena. Hymn Unii{' '}
            <strong>nie ma oficjalnych słów</strong> — każdy naród rozumie muzykę bez tłumaczenia.
          </p>
          <button
            type="button"
            onClick={playOda}
            className="inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 font-semibold"
            style={{ borderColor: EU_BLUE, color: EU_BLUE }}
          >
            <Music className="h-4 w-4" aria-hidden /> Zagraj początek melodii
          </button>
        </div>
      )}
    </div>
  );
}
