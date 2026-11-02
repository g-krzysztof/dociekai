'use client';

import { useEffect, useRef, useState } from 'react';
import { CopyPlus, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SceneArt, SceneStage, sunAt, shadowTipX } from './scene';

/**
 * Blok 2 — **animacja robiona ręką dziecka, klatka po klatce.**
 *
 * W module 6 dziecko animowało duszka kostiumami: dostawało gotowe obrazki
 * i kazało programowi je przełączać. Tutaj jest odwrotnie i o to chodzi —
 * **obrazki powstają pod palcem**, a program tylko je pokazuje. Sposób pracy
 * jest dokładnie taki, jak w prawdziwych programach do animacji: *skopiuj
 * ostatnią klatkę i zmień w niej jedną rzecz*, z poprzednią klatką prześwitującą
 * pod spodem (kalka).
 *
 * Scena jest tak dobrana, żeby dziecko ruszało **jedną** rzeczą, a zmieniały się
 * **dwie**: przesuwa słońce, a cień patyka liczy się sam z podobieństwa
 * trójkątów (`shadowTipX` w `scene.tsx`). To jest dokładnie to, po co robi się
 * animację do przyrody — pokazać zależność, której na jednym obrazku nie widać.
 *
 * Tempo jest osobnym odkryciem i dlatego nie ma tu jednego „Odtwórz”, tylko
 * trzy. Te same pięć klatek raz jest pokazem slajdów, a raz ruchem; dziecko
 * niczego między jednym a drugim nie dorysowało.
 */

const TEMPOS = [
  { fps: 1, label: '1 klatka na sekundę' },
  { fps: 4, label: '4 klatki na sekundę' },
  { fps: 12, label: '12 klatek na sekundę' },
];

const TARGET_FRAMES = 5;
/** Wysokość patyka w scenie — w niej wyrażamy długość cienia, bo piksele dziecku nic nie mówią. */
const STICK = 60;

/** Długość cienia w „patykach”: 3,8 patyka rano, prawie zero w południe. */
function shadowInSticks(p: number): number {
  const sun = sunAt(p);
  return Math.abs(shadowTipX(sun.x, sun.y) - 320) / STICK;
}

export function FlipFrames({ color, onComplete }: { color: string; onComplete?: () => void }) {
  /* Pierwsza klatka jest dana — animacja zaczyna się od czegoś, nie od pustki. */
  const [frames, setFrames] = useState<number[]>([0.08]);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const [played, setPlayed] = useState<number[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const reported = useRef(false);

  const complete = frames.length === TARGET_FRAMES;
  const enough = complete && played.length >= 2;

  useEffect(() => {
    if (enough && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [enough, onComplete]);

  /* Odtwarzanie jest naprawdę klatkowe: przeskakujemy po klatkach zegarem, a nie
     płynnie po czasie. Inaczej „1 klatka na sekundę” wyglądałoby jak powolny ruch. */
  useEffect(() => {
    if (playing === null) return;
    setShown(0);
    const id = window.setInterval(() => {
      setShown((value) => (value + 1) % frames.length);
    }, 1000 / playing);
    return () => window.clearInterval(id);
  }, [playing, frames.length]);

  const dragSun = (clientX: number) => {
    if (playing !== null) return;
    const box = stage.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const p = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    setFrames((current) => current.map((value, index) => (index === active ? p : value)));
  };

  const addFrame = () => {
    setFrames((current) => [...current, current[current.length - 1]]);
    setActive(frames.length);
  };

  const play = (fps: number) => {
    setPlaying(fps);
    setPlayed((current) => (current.includes(fps) ? current : [...current, fps]));
  };

  const visible = playing !== null ? frames[shown] : frames[active];
  const onion = playing === null && active > 0 ? frames[active - 1] : null;
  /* Klatka, która niczego nie zmieniła względem poprzedniej — animacja stoi w tym miejscu. */
  const twins = frames
    .map((value, index) => (index > 0 && Math.abs(value - frames[index - 1]) < 0.02 ? index + 1 : 0))
    .filter(Boolean);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Animacja nie jest jednym ruchomym obrazkiem — to <strong>kilka zwykłych obrazków pokazanych po kolei</strong>.
        Zrobisz teraz taką animację do przyrody: pięć klatek pokazujących, co dzieje się z cieniem w ciągu dnia. Ty
        przesuwasz <strong>tylko słońce</strong>. Cień policzy się sam — i to właśnie jego ma zobaczyć widz.
      </p>

      {/* Powierzchnia ciągnięcia musi mieć DOKŁADNIE szerokość sceny. Kiedy obejmowała całą
          kolumnę, `p` liczyło się z szerszego pudełka niż rysunek i słońce nie szło za palcem:
          przy krawędzi sceny dziecko dostawało środek nieba. */}
      <div
        ref={stage}
        className="mx-auto mt-4 w-full max-w-[480px] touch-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragSun(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 0) return;
          dragSun(event.clientX);
        }}
      >
        <SceneStage className={cn(playing === null && 'cursor-grab active:cursor-grabbing')}>
          {/* Kalka: poprzednia klatka prześwituje pod spodem, tak jak na stole animatora. */}
          {onion !== null && (
            <div className="absolute inset-0 opacity-25">
              <SceneArt scene="cien" t={onion} />
            </div>
          )}
          <div className={cn('absolute inset-0', onion !== null && 'mix-blend-multiply')}>
            <SceneArt scene="cien" t={visible} />
          </div>
          <span
            className="pointer-events-none absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {playing !== null ? `odtwarzanie · klatka ${shown + 1}` : `klatka ${active + 1} z ${frames.length}`}
          </span>
        </SceneStage>
      </div>

      {playing === null && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Chwyć słońce i przeciągnij je po niebie. Blady rysunek pod spodem to poprzednia klatka.
        </p>
      )}

      {/* Pasek klatek — sterowanie tuż pod sceną, żeby zmiana i jej skutek były widoczne razem. */}
      <div className="mx-auto mt-3 flex w-full max-w-[480px] flex-wrap items-center justify-center gap-1.5">
        {frames.map((value, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setPlaying(null);
              setActive(index);
            }}
            className={cn(
              'relative h-12 w-16 cursor-pointer overflow-hidden border bg-white transition-colors',
              (playing !== null ? shown : active) === index ? 'border-2' : 'opacity-70 hover:opacity-100'
            )}
            style={(playing !== null ? shown : active) === index ? { borderColor: color } : undefined}
            aria-label={`Klatka ${index + 1}`}
          >
            <SceneArt scene="cien" t={value} />
          </button>
        ))}
        {frames.length < TARGET_FRAMES && (
          <button
            type="button"
            onClick={addFrame}
            className="flex h-12 cursor-pointer items-center gap-1.5 border border-dashed px-3 text-xs font-semibold transition-colors hover:bg-muted"
            style={{ borderColor: color, color }}
          >
            <CopyPlus className="h-4 w-4" aria-hidden />
            Skopiuj klatkę
          </button>
        )}
      </div>

      {!complete && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Zrób {TARGET_FRAMES} klatek. Każdą nową kopiujesz z poprzedniej i <strong>zmieniasz w niej jedną rzecz</strong>
          {' '}— dokładnie tak powstaje każda animacja.
        </p>
      )}

      {complete && (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {TEMPOS.map((tempo) => (
              <button
                key={tempo.fps}
                type="button"
                onClick={() => play(tempo.fps)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 border px-3 py-2 text-sm transition-colors hover:bg-muted',
                  playing === tempo.fps && 'font-semibold'
                )}
                style={playing === tempo.fps ? { borderColor: color, color } : undefined}
              >
                <Play className="h-3.5 w-3.5" aria-hidden />
                {tempo.label}
              </button>
            ))}
            {playing !== null && (
              <button
                type="button"
                onClick={() => setPlaying(null)}
                className="inline-flex cursor-pointer items-center gap-1.5 border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <Square className="h-3.5 w-3.5" aria-hidden />
                Zatrzymaj
              </button>
            )}
          </div>

          <div className="mt-4 p-4" style={{ backgroundColor: `${color}12` }}>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ color }}>
                  <th className="pb-2 font-semibold">twoja klatka</th>
                  <th className="pb-2 font-semibold">wysokość słońca</th>
                  <th className="pb-2 font-semibold">długość cienia</th>
                </tr>
              </thead>
              <tbody>
                {frames.map((value, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-1.5 pr-3 tabular-nums">{index + 1}</td>
                    <td className="py-1.5 pr-3 tabular-nums">{Math.round((300 - sunAt(value).y) / 2.1)}%</td>
                    <td className="py-1.5 tabular-nums">
                      {shadowInSticks(value).toFixed(1).replace('.', ',')} patyka
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {twins.length > 0 && (
              <p className="mt-3 text-sm leading-relaxed">
                Klatka {twins.join(' i ')} jest <strong>kopią poprzedniej</strong> — w tym miejscu twoja animacja stoi
                w miejscu. Przesuń w niej słońce, a ruch ruszy dalej.
              </p>
            )}

            {played.length >= 2 && (
              <p className="mt-3 text-sm leading-relaxed">
                To są cały czas <strong>te same pięć obrazków</strong>. Przy jednej klatce na sekundę widać je osobno —
                to pokaz slajdów. Przy dwunastu oko skleja je w ruch i nagle widać coś, czego nie ma na żadnym z nich
                z osobna: <strong>że im wyżej słońce, tym krótszy cień</strong>. Nic nie dorysowałeś/dorysowałaś —
                zmieniło się tylko tempo.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
