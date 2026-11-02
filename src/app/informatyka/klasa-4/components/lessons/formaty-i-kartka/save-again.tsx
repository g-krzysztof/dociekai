'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Save } from 'lucide-react';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PictureView } from '../../picture-view';
import { CARD, colorCount, diffPixels, saveAsJpg, type Picture } from './card';

/**
 * Haczyk lekcji — **dwie kopie, ten sam przycisk, tylko jedna niszczeje**.
 *
 * Dziecko wie, że „zapisz” to bezpieczna czynność: kliknięcie, które niczego nie
 * zmienia. Tutaj klika ten sam przycisk nad dwoma bliźniaczymi plikami i po
 * kilku razach jeden z nich wygląda już inaczej, a drugi jest co do piksela ten
 * sam. Nic nie jest oceniane i nic nie trzeba zgadywać — cała treść bloku
 * siedzi w **różnicy między dwiema kolumnami**, i to jest w tym widżecie nowe:
 * grupa kontrolna, która się nie zmienia, jest tu dowodem.
 *
 * Uczciwość modelu: `saveAsJpg` naprawdę wykonuje to, co robi stratny zapis —
 * uśrednia bloki i zaokrągla kolory — a licznik „widocznie różni się w N
 * pikselach” liczy się z porównania z oryginałem, nie z numeru rundy. Siatka
 * bloków przesuwa się co drugi zapis (`pass`), bo bez tego drugie zapisanie nic
 * już nie zmienia i blok pokazywałby nieprawdę: że stratny zapis psuje raz.
 */

/** Tyle zapisów wystarczy, żeby różnicę było widać bez wpatrywania się. */
const ENOUGH = 6;

interface SaveAgainProps {
  color: string;
  onComplete?: () => void;
}

export function SaveAgain({ color, onComplete }: SaveAgainProps) {
  const [saves, setSaves] = useState(0);
  const [jpg, setJpg] = useState<Picture>(CARD);
  const [done, setDone] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(done ? 'koniec' : 'praca');

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const saveOnce = () => {
    setJpg(saveAsJpg(jpg, saves));
    setSaves(saves + 1);
  };

  const damaged = diffPixels(CARD, jpg);
  const enough = saves >= ENOUGH;

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Ta sama kartka zapisana w dwóch plikach. Otwórz je i zapisz jeszcze raz — tyle razy, ile
        chcesz.
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Dokładnie to robisz, kiedy poprawiasz rysunek następnego dnia: otwierasz plik, zmieniasz
        drobiazg i zapisujesz.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FileCard
          color={color}
          name="kartka.png"
          pic={CARD}
          damaged={0}
          note="Zapis bezstratny — plik zawsze zawiera dokładnie to, co było na ekranie."
        />
        <FileCard
          color={color}
          name="kartka.jpg"
          pic={jpg}
          damaged={damaged}
          note="Zapis stratny — przy każdym zapisaniu program wyrzuca część szczegółów, żeby plik był lżejszy."
          alarm={damaged > 0}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveOnce}
          disabled={saves >= 12}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: color }}
        >
          <Save className="h-4 w-4" aria-hidden />
          Zapisz oba jeszcze raz
        </button>
        <span className="text-sm tabular-nums text-muted-foreground">
          zapisów: <strong className="text-foreground">{saves}</strong>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {enough && !done && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Lewy plik po {saves} zapisach jest co do piksela ten sam. Prawy różni się już w{' '}
                <strong>{damaged}</strong> miejscach na 768 — a przecież nic w nim nie rysowałeś/
                rysowałaś.
              </span>
            </p>
            <button
              type="button"
              onClick={() => setDone(true)}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Dlaczego tak jest?
            </button>
          </motion.div>
        )}

        {done && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 border-l-2 p-3"
            style={{ borderColor: color }}
          >
            <p className="text-sm leading-relaxed sm:text-base">
              Format pliku to <strong>sposób, w jaki obrazek zostaje zapisany</strong> — i nie każdy
              sposób zapisuje wszystko. <strong>PNG</strong> zapisuje każdy piksel wiernie.{' '}
              <strong>JPG</strong> umawia się z tobą inaczej: „będę lżejszy, ale część szczegółów
              wyrzucę”. Za pierwszym razem tego nie widać. Za szóstym — widać.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Stąd zasada, którą znają wszyscy graficy: <strong>oryginał trzymaj osobno</strong>, a
              JPG rób dopiero na sam koniec, kiedy plik ma gdzieś pojechać. Bo z JPG-a nie da się
              wrócić — tak samo jak nie dało się wrócić z małego obrazka w poprzedniej lekcji.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileCard({
  color,
  name,
  pic,
  damaged,
  note,
  alarm = false,
}: {
  color: string;
  name: string;
  pic: Picture;
  damaged: number;
  note: string;
  alarm?: boolean;
}) {
  return (
    <figure className="min-w-0">
      {/* Nazwa pliku z rozszerzeniem — to ona jest tu bohaterem, jak w lekcji o plikach. */}
      <figcaption className="mb-1.5 font-mono text-sm font-semibold">{name}</figcaption>
      <div className="border-2 p-1.5" style={{ borderColor: alarm ? '#d97706' : `${color}44` }}>
        <PictureView pic={pic} label={`Podgląd pliku ${name}`} />
      </div>
      {/* Świadomie BEZ wagi: po kilku stratnych zapisach plik zaczyna rosnąć
          (rozmyte przejścia to więcej różnych kolorów), a ten blok jest o
          zniszczeniu, nie o wadze — porównanie wag robi dopiero blok 2. */}
      <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
        kolorów {colorCount(pic)} ·{' '}
        {damaged === 0 ? (
          <span>bez zmian</span>
        ) : (
          <span className="font-semibold text-amber-700 dark:text-amber-500">
            widocznie zmienionych pikseli: {damaged}
          </span>
        )}
      </p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{note}</p>
    </figure>
  );
}
