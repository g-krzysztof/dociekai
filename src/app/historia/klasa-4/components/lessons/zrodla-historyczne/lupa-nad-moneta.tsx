'use client';

import { useState } from 'react';
import { ScanSearch } from 'lucide-react';
import { getCorePin } from '../../../lib/timeline/pins';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { MonetaSunburst } from './moneta';
import { SourcePassport } from '../../source-desk/source-passport';
import { LupaPlane } from '../../source-desk/lupa';
import { PASSPORT_BANK, PASSPORT_FIELDS, isOverHotspot, whereIsLupa } from './lupa';

/**
 * Blok 4 — **„Lupa nad monetą”** (źródło; pierwszy konsument silnika
 * `source-desk`).
 *
 * Gest nowy w kursie: **dziecko przesuwa lupę po wielkiej monecie
 * i szuka słowa POLONIE** — jednego z najstarszych zapisów nazwy naszego kraju.
 * Potem wypełnia trzy pytania „paszportu źródła” (kto ją kazał wybić, kiedy,
 * po co), dokładając karteczki do pól — odrzut nazywa powód z samego źródła.
 * Na końcu przypina pinezkę „moneta z nazwą Polski, ok. 1000 r.” na Osi
 * dziejów (F-I.2-05, F-I.2-08; filary 1 i 4).
 *
 * Moneta to kompozyt (ilustracja sunburst + dorysowany wektorowo napis
 * z fotografii denara) — podpis pod nią rozdziela obie warstwy.
 */
export function LupaNadMoneta({
  color,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'find' | 'passport' | 'pin'>(done ? 'pin' : 'find');

  return (
    <div className="space-y-6">
      {phase === 'find' && <FindWord color={color} onFound={() => setPhase('passport')} />}
      {(phase === 'passport' || phase === 'pin') && (
        <FoundNote color={color} onPassport={() => setPhase('passport')} showPassportLink={phase === 'pin'} />
      )}
      {(phase === 'passport' || phase === 'pin') && (
        <SourcePassport
          color={color}
          fields={PASSPORT_FIELDS}
          bank={PASSPORT_BANK}
          locked={phase === 'pin'}
          onDone={() => setPhase('pin')}
        />
      )}
      {phase === 'pin' && (
        <PinMoneta color={color} lesson={lesson} done={done} onComplete={onComplete} />
      )}
    </div>
  );
}

// ─── Szukanie słowa ───

function FindWord({ color, onFound }: { color: string; onFound: () => void }) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.32 });
  const [tries, setTries] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const over = isOverHotspot(pos.x, pos.y);

  const confirm = () => {
    if (isOverHotspot(pos.x, pos.y)) {
      onFound();
      return;
    }
    const next = tries + 1;
    setTries(next);
    const where = whereIsLupa(pos.x, pos.y);
    setMessage(
      where === 'princes'
        ? 'To słowo PRINCES — po łacinie „książę”. Dobry trop, ale szukasz drugiego słowa napisu.'
        : where === 'ptak'
          ? 'Tu jest ptak, nie napis. Litery biegną po obwódce, wokół ptaka.'
          : next >= 2
            ? 'Tu go nie ma. Podpowiedź: napis biegnie wokół monety — POLONIE jest na dole, tam gdzie litery układają się w łuk.'
            : 'Tu nie ma liter. Przesuń lupę na obwódkę monety, tam gdzie biegnie napis.'
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        Twoja srebrna moneta z dna wykopaliska — powiększona. Wokół ptaka biegnie napis.{' '}
        <strong>Przesuwaj lupę po monecie i znajdź słowo POLONIE</strong> — jeden z najstarszych zapisów nazwy
        naszego kraju.
        Gdy będziesz na nim, potwierdź przyciskiem.
      </p>
      <div className="mx-auto w-full max-w-[26rem]">
        <LupaPlane
          color={color}
          pos={pos}
          onPosChange={setPos}
          onConfirm={confirm}
          over={over}
          zoom={1.7}
          lupaPx={150}
          ariaLabel="Moneta z lupą. Przeciągnij palcem albo przesuwaj lupę strzałkami (z Shiftem szybciej), Enter potwierdza. Szukaj słowa POLONIE."
        >
          <MonetaSunburst />
        </LupaPlane>
        <p className="mt-1 text-xs text-muted-foreground">
          Moneta to ilustracja. Napis w otoku przerysowano z fotografii prawdziwej monety Bolesława Chrobrego
          sprzed ok. 1000 lat — to go szukasz lupą.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={confirm}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: over ? 'var(--success)' : color }}
        >
          <ScanSearch className="h-4 w-4" aria-hidden /> Tu jest napis POLONIE!
        </button>
        {over && (
          <span className="text-sm font-semibold text-success" aria-live="polite">
            Lupa stoi na literach — potwierdzaj!
          </span>
        )}
      </div>
      {message && !over && (
        <p className="text-sm font-medium text-destructive" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}

// ─── Znalezisko ───

function FoundNote({ color, onPassport, showPassportLink }: { color: string; onPassport: () => void; showPassportLink: boolean }) {
  return (
    <div className="space-y-2 border-2 p-4" style={{ borderColor: color }}>
      <p className="text-base leading-relaxed">
        <strong>Znalazłeś/łaś słowo POLONIE!</strong> Tak po łacinie, około tysiąca lat temu, zapisano nazwę naszego
        kraju. To <strong>jeden z najstarszych zachowanych zapisów nazwy Polski</strong>.
      </p>
      <p className="text-base leading-relaxed">
        Cały napis brzmi <strong>PRINCES POLONIE</strong>, czyli <strong>„książę Polski”</strong> (po łacinie{' '}
        <em>princeps Poloniae</em>). Moneta sama mówi, kto ją wybił — przyda się w paszporcie poniżej.
      </p>
      {showPassportLink && (
        <button type="button" onClick={onPassport} className="text-sm font-medium underline underline-offset-2">
          Wróć do paszportu źródła
        </button>
      )}
    </div>
  );
}

// ─── Pinezka ───

function PinMoneta({
  color,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-base leading-relaxed">
        Paszport kompletny: monetę kazał wybić <strong>władca Polski, około 1000 lat temu, żeby płacić i żeby
        wszyscy wiedzieli, czyja to ziemia</strong>. Takie wydarzenie zasługuje na pinezkę — przypnij ją na
        swojej Osi dziejów.
      </p>
      <PrzypnijPinezke
        pin={getCorePin('moneta-polska')}
        color={color}
        lesson={lesson}
        done={done}
        onPinned={onComplete}
      />
    </div>
  );
}
