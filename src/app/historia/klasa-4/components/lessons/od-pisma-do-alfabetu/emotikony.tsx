'use client';

import { useState } from 'react';

/**
 * D (poza postępem): **piktogramy dziś.** Wiadomość z samych emotikonów i trzy
 * sposoby jej odczytania — ta sama wada, którą miało pismo obrazkowe
 * (obrazek słońca: słońce, dzień czy ciepło?). Znaki drogowe działają
 * odwrotnie: jeden znak, jedno znaczenie, ustalone przepisem.
 */
const MESSAGE = ['☀️', '⚽', '🕓', '❓'];
const READINGS = [
  '„Jutro słońce — gramy w piłkę o szesnastej?”',
  '„Było słonecznie, graliśmy do szesnastej. A ty gdzie byłeś?”',
  '„W słońcu mecz trwa do czwartej, nie wiem, czy zdążę.”',
];

export function Emotikony({ color }: { color: string }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        <strong className="text-foreground">Na koniec, dla ciekawych:</strong> piszemy obrazkami do dziś. Kuba
        wysłał ci taką wiadomość:
      </p>
      <p className="text-4xl tracking-widest" aria-label="Wiadomość: słońce, piłka, zegar, znak zapytania">
        {MESSAGE.join(' ')}
      </p>
      <div className="space-y-1.5">
        {READINGS.map((r, i) =>
          i < open ? (
            <p key={r} className="border-l-2 pl-3 text-sm" style={{ borderColor: color }}>
              {i + 1}. {r}
            </p>
          ) : null
        )}
      </div>
      {open < READINGS.length ? (
        <button type="button" onClick={() => setOpen(open + 1)} className="border px-3 py-1.5 text-sm" style={{ borderColor: color, color }}>
          {open === 0 ? 'Jak to przeczytać?' : 'A może inaczej?'}
        </button>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Trzy odczytania jednej wiadomości — tak samo jak z pismem obrazkowym Sumerów i Egipcjan. Dlatego
          obrazki dobrze sprawdzają się tam, gdzie znaczenie jest jedno i ustalone: na znakach drogowych czy
          tabliczce „wyjście ewakuacyjne”. Kierowca zrozumie je w każdym kraju, choć nie zna języka.
        </p>
      )}
    </div>
  );
}
