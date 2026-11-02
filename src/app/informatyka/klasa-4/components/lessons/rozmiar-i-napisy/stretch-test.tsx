'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Move } from 'lucide-react';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PictureView } from '../../picture-view';
import { SCENE, SCENE_H, SCENE_W, pixelCount, resample, type Picture } from './scene';

/**
 * Haczyk lekcji — **uchwyt do przeciągania zamiast zdania o pikselach**.
 *
 * Dziecko łapie narożnik obrazka i ciągnie, dokładnie tak jak w prawdziwym
 * edytorze. Nikt mu nie mówi, co się stanie: samo widzi, że po powiększeniu
 * piksele robią się wielkimi kwadratami, a rysunek nie zyskuje ani jednego
 * nowego szczegółu — bo szczegółów jest tyle, ile ich zapisano, i ani jednego
 * więcej.
 *
 * Sedno mechaniki: **jedno przeciągnięcie to jedno przeliczenie obrazu**.
 * Przeliczamy zawsze od stanu z chwili złapania uchwytu (`fromPic`), więc
 * zjechanie w dół i powrót w tym samym ruchu niczego nie psuje — tak samo jak
 * suwak w oknie „Rozmiar obrazu”, dopóki nie klikniesz OK. Dopiero **puszczenie**
 * uchwytu zatwierdza wynik. Dlatego runda druga wprost każe puścić: strata
 * pikseli jest nieodwracalna i to jest cała jej treść.
 */

/** Ile pikseli ekranu przypada na jeden piksel obrazu — stąd wielkość pudełka. */
const K = 5;
const MIN_W = 8;
const MAX_W = 64;
/** Powiększenie zaliczone od tego progu (dwukrotność oryginału). */
const BIG_ENOUGH = 64;
/** Zmniejszenie zaliczone od tego progu (ćwiartka oryginału). */
const SMALL_ENOUGH = 8;

const heightFor = (w: number) => Math.max(1, Math.round((w * SCENE_H) / SCENE_W));

interface StretchTestProps {
  color: string;
  onComplete?: () => void;
}

type Phase = 'powieksz' | 'zmniejsz' | 'koniec';

export function StretchTest({ color, onComplete }: StretchTestProps) {
  const [phase, setPhase] = useState<Phase>('powieksz');
  const [pic, setPic] = useState<Picture>(SCENE);
  const [width, setWidth] = useState(SCENE_W);
  const [dragging, setDragging] = useState(false);
  /** Czy w rundzie 2 dziecko puściło uchwyt przy naprawdę małym obrazku. */
  const [committedSmall, setCommittedSmall] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);

  const fromPic = useRef<Picture>(SCENE);
  const fromWidth = useRef(SCENE_W);
  const startX = useRef(0);
  const minInDrag = useRef(SCENE_W);
  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(phase);

  const height = heightFor(width);
  const enlarged = phase === 'powieksz' && width >= BIG_ENOUGH;
  const restored = phase === 'zmniejsz' && committedSmall && width >= SCENE_W;

  useEffect(() => {
    if (phase !== 'koniec' || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [phase, onComplete]);

  const grab = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    fromPic.current = pic;
    fromWidth.current = width;
    startX.current = event.clientX;
    minInDrag.current = width;
    setDragging(true);
    setNudge(null);
  };

  const drag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const delta = Math.round((event.clientX - startX.current) / K);
    const next = Math.min(MAX_W, Math.max(MIN_W, fromWidth.current + delta));
    if (next === width) return;
    minInDrag.current = Math.min(minInDrag.current, next);
    setWidth(next);
    setPic(resample(fromPic.current, next, heightFor(next)));
  };

  const release = () => {
    if (!dragging) return;
    setDragging(false);
    if (phase === 'zmniejsz') {
      if (width <= SMALL_ENOUGH) {
        setCommittedSmall(true);
        setNudge(null);
      } else if (minInDrag.current <= SMALL_ENOUGH && !committedSmall) {
        /* Zjechał w dół i wrócił jednym ruchem — w edytorze to jest okno, w
           którym jeszcze nic nie zatwierdzono. Trzeba to nazwać, bo inaczej
           dziecko utknie, nie rozumiejąc, czemu nic się nie zepsuło. */
        setNudge(
          'Zjechałeś/zjechałaś w dół i wróciłeś/wróciłaś jednym ruchem — obrazek nic na tym nie stracił, bo to wciąż było jedno przeliczenie. Puść uchwyt, kiedy obrazek jest mały. To jest ten moment, w którym w prawdziwym programie klikasz OK.'
        );
      }
    }
  };

  const startRoundTwo = () => {
    setPhase('zmniejsz');
    setPic(SCENE);
    setWidth(SCENE_W);
    setCommittedSmall(false);
    setNudge(null);
  };

  /** Ile razy większy jest teraz jeden piksel oryginału (przy powiększaniu). */
  const blockSize = width / SCENE_W;

  if (phase === 'koniec') {
    const left = pixelCount(pic);
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <div className="flex flex-wrap items-end justify-center gap-6">
          <Figure pic={SCENE} width={SCENE_W} caption="Oryginał · 32 × 24 px" />
          <Figure pic={pic} width={width} caption={`Po drodze tam i z powrotem · ${width} × ${height} px`} />
        </div>
        <p className="mt-5 text-sm font-semibold sm:text-base" style={{ color }}>
          Rozmiar wrócił: {width} × {height} px, czyli {left} pikseli. Obrazek — nie wrócił.
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Obraz to policzona liczba pikseli i nic więcej. Kiedy go zmniejszasz, część z nich zostaje
          <strong> wyrzucona</strong> — program nie ma ich gdzie schować. Kiedy potem powiększasz,
          nie ma z czego ich odtworzyć, więc powiela te, które zostały. Dlatego{' '}
          <strong>powiększanie nigdy nie dodaje szczegółów</strong>, a zmniejszanie i powrót nie
          wraca do punktu wyjścia.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Praktyczny wniosek na resztę życia z komputerem: rozmiar ustawia się{' '}
          <strong className="text-foreground">przed</strong> robotą, a oryginał trzyma się osobno.
          Z dużego obrazka zawsze zrobisz mały. Z małego dużego — nigdy.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          {phase === 'powieksz'
            ? 'Runda 1 z 2 — złap narożnik i powiększ obrazek co najmniej dwa razy.'
            : 'Runda 2 z 2 — zmniejsz obrazek do ćwiartki, PUŚĆ uchwyt, a potem złap go jeszcze raz i wróć do 32 pikseli szerokości.'}
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-fit items-end gap-6 px-1">
          <Figure pic={SCENE} width={SCENE_W} caption="Oryginał · 32 × 24 px" muted />

          <div className="shrink-0">
            <div
              className="relative"
              style={{ width: width * K, height: height * K, minWidth: MIN_W * K }}
            >
              <PictureView
                pic={pic}
                label={`Obrazek o rozmiarze ${width} na ${height} pikseli`}
                className="border-2"
                style={{ borderColor: `${color}66` }}
              />
              <button
                type="button"
                onPointerDown={grab}
                onPointerMove={drag}
                onPointerUp={release}
                onPointerCancel={release}
                aria-label="Uchwyt zmiany rozmiaru — przeciągnij w prawo lub w lewo"
                className="absolute -bottom-3 -right-3 flex h-9 w-9 cursor-nwse-resize touch-none items-center justify-center border-2 bg-white shadow-sm dark:bg-zinc-900"
                style={{ borderColor: color }}
              >
                <Move className="h-4 w-4" style={{ color }} aria-hidden />
              </button>
            </div>
            <p className="mt-5 text-center text-xs tabular-nums text-muted-foreground">
              <strong className="text-foreground">
                {width} × {height} px
              </strong>{' '}
              · {pixelCount(pic)} pikseli
            </p>
          </div>
        </div>
      </div>

      {/* Licznik, który mówi to, czego obrazek nie powie sam: przy powiększaniu
          rośnie liczba pikseli, ale nie liczba szczegółów. */}
      {phase === 'powieksz' && blockSize > 1.2 && (
        <p className="mt-3 border-l-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Jeden piksel oryginału zajmuje teraz kwadrat{' '}
          <strong>
            {blockSize.toFixed(1)} × {blockSize.toFixed(1)}
          </strong>
          . Pikseli jest {pixelCount(pic)}, ale prawdziwych szczegółów wciąż{' '}
          <strong>{pixelCount(SCENE)}</strong> — tyle, ile było na początku.
        </p>
      )}

      <AnimatePresence mode="wait">
        {nudge && (
          <motion.p
            key="nudge"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {nudge}
          </motion.p>
        )}

        {enlarged && (
          <motion.div
            key="big"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Obrazek jest dwa razy większy, a mewy dalej są dwiema kreskami — tyle że grubszymi.
                Powiększanie <strong>nie dorysowuje</strong> niczego, tylko rozdmuchuje to, co jest.
              </span>
            </p>
            <button
              type="button"
              onClick={startRoundTwo}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              A jak zmniejszyć i wrócić?
            </button>
          </motion.div>
        )}

        {committedSmall && !restored && (
          <motion.p
            key="small"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 border-l-2 p-3 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            Zatwierdzone. Z {pixelCount(SCENE)} pikseli zostało {pixelCount(pic)}. Teraz złap uchwyt jeszcze raz i
            wróć do 32 pikseli szerokości — zobaczysz, czy reszta wróci razem z rozmiarem.
          </motion.p>
        )}

        {restored && (
          <motion.div
            key="back"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>Rozmiar wrócił. Obrazek — nie.</span>
            </p>
            <button
              type="button"
              onClick={() => setPhase('koniec')}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Postaw je obok siebie
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Figure({
  pic,
  width,
  caption,
  muted = false,
}: {
  pic: Picture;
  width: number;
  caption: string;
  muted?: boolean;
}) {
  return (
    <figure className="shrink-0">
      <div style={{ width: width * K }}>
        <PictureView
          pic={pic}
          label={caption}
          className={muted ? 'border border-dashed opacity-70' : 'border'}
        />
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
