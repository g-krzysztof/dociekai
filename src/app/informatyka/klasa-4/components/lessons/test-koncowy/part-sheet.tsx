'use client';

import { useMemo, useState } from 'react';
import { evaluateSheet, isFormula, formulaReferences, shiftFormula, type RawCells } from '../../../lib/formula';
import { SheetGrid, boxText, sameBox } from '../arkusz-pierwsze-kroki/sheet-grid';
import type { Box } from '../../../lib/formula';
import { CheckBar, type ItemProps, type PartItem } from './test-frame';

/**
 * Część B testu — **dane i arkusz**. Trzy zadania na jednej makiecie, która liczy
 * naprawdę (`lib/formula.ts`):
 *
 * 1. **Wpisz formułę sumy.** Werdykt nie porównuje tekstu z wzorcem — sprawdza
 *    **zachowanie**: podstawia inną liczbę w jednej komórce i patrzy, czy suma
 *    poszła za nią. To dokładnie ta różnica z lekcji o arkuszu, którą pokazywała
 *    „martwa suma”: `=4+6+3+7` i zwykłe `20` dają dziś tę samą liczbę co
 *    `=SUMA(B2:B5)`, ale tylko jedna z nich przeżywa zmianę danych.
 * 2. **Co jest w skopiowanej formule.** Wpisywana odpowiedź, sprawdzana
 *    przesunięciem adresów (`shiftFormula`), a nie pamięcią wzoru.
 * 3. **Zaznacz zakres do wykresu** — przeciągnięciem po siatce, jak w bloku o wykresie.
 */

const BOOKS: RawCells = {
  A1: 'Miesiąc',
  B1: 'Książki',
  A2: 'wrzesień',
  B2: '4',
  A3: 'październik',
  B3: '6',
  A4: 'listopad',
  B4: '3',
  A5: 'grudzień',
  B5: '7',
  A6: 'Razem',
};

const SHOP: RawCells = {
  A1: 'produkt',
  B1: 'cena',
  C1: 'sztuki',
  D1: 'razem',
  A2: 'zeszyt',
  B2: '4',
  C2: '3',
  D2: '=B2*C2',
  A3: 'ołówek',
  B3: '2',
  C3: '10',
  A4: 'gumka',
  B4: '1',
  C4: '5',
};

const normalize = (text: string) => text.replace(/\s+/g, '').toUpperCase();

function FormulaInput({
  value,
  onChange,
  disabled,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="mt-3 flex items-center gap-2 border bg-white px-3 py-2 dark:bg-zinc-950">
      <span className="w-8 shrink-0 text-xs font-bold italic text-muted-foreground">fx</span>
      <span className="shrink-0 text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none disabled:opacity-60"
        aria-label={`Formuła w komórce ${label}`}
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */

function SumItem({ color, onDone }: ItemProps) {
  const [formula, setFormula] = useState('');
  const [checked, setChecked] = useState(false);

  const cells = useMemo<RawCells>(() => (formula.trim() ? { ...BOOKS, B6: formula } : BOOKS), [formula]);
  const values = useMemo(() => evaluateSheet(cells, {}), [cells]);

  const verdict = useMemo(() => {
    const raw = formula.trim();
    const sumNow = 4 + 6 + 3 + 7;
    const sumLater = 4 + 10 + 3 + 7;
    const later = evaluateSheet({ ...BOOKS, B3: '10', B6: raw }, {}).B6;
    const now = evaluateSheet({ ...BOOKS, B6: raw }, {}).B6;
    if (!isFormula(raw)) {
      return { ok: false, why: 'To zwykła liczba, nie formuła — formuła zaczyna się od znaku =. Po zmianie B3 na 10 ta liczba zostałaby stara, a suma powinna być 24.' };
    }
    if (now?.t === 'err') {
      return { ok: false, why: `Arkusz nie rozumie tej formuły (${now.code}). Sprawdź nawiasy i dwukropek w zakresie, np. =SUMA(B2:B5).` };
    }
    if (formulaReferences(raw).length === 0) {
      return { ok: false, why: 'W tej formule są wpisane liczby, a nie adresy komórek. Po zmianie B3 nic by się nie przeliczyło — suma wciąż pokazywałaby 20.' };
    }
    if (now?.t === 'num' && now.v === sumNow && later?.t === 'num' && later.v === sumLater) {
      return { ok: true, why: 'Sprawdzam na zmienionych danych: gdy w B3 jest 10 zamiast 6, twoja suma pokazuje 24. Formuła patrzy na komórki, więc liczy się sama.' };
    }
    return { ok: false, why: `Twoja formuła daje ${now?.t === 'num' ? String(now.v).replace('.', ',') : '?'}, a suma czterech miesięcy to ${sumNow}. Sprawdź, czy obejmuje wszystkie cztery komórki od B2 do B5.` };
  }, [formula]);

  const check = () => {
    setChecked(true);
    onDone(verdict.ok);
  };

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        W komórce <strong>B6</strong> ma się policzyć, ile książek przeczytano <strong>razem</strong> od września do
        grudnia. Wpisz formułę.
      </p>
      <SheetGrid className="mt-3" cols={2} rows={6} cells={cells} values={values} color={color} widths={[110, 84]} mode="none" active={{ col: 1, row: 5 }} />
      <FormulaInput value={formula} onChange={setFormula} disabled={checked} label="B6" placeholder="=SUMA(...)" />
      <CheckBar
        color={color}
        ready={formula.trim().length > 1}
        checked={checked}
        ok={verdict.ok}
        onCheck={check}
        readyHint="Wpisz formułę w B6."
        explain={<p>{verdict.why}</p>}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CopyItem({ color, onDone }: ItemProps) {
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const values = useMemo(() => evaluateSheet(SHOP, {}), []);
  const expected = shiftFormula(SHOP.D2, 0, 2);
  const ok = normalize(answer) === normalize(expected);

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        W komórce <strong>D2</strong> stoi formuła <code className="bg-muted px-1 font-mono">=B2*C2</code>. Skopiowałeś/aś
        ją uchwytem w dół, aż do <strong>D4</strong>. Jak wygląda formuła w D4?
      </p>
      <SheetGrid className="mt-3" cols={4} rows={4} cells={SHOP} values={values} color={color} widths={[76, 56, 60, 64]} mode="none" active={{ col: 3, row: 1 }} selection={{ c1: 3, c2: 3, r1: 1, r2: 3 }} />
      <FormulaInput value={answer} onChange={setAnswer} disabled={checked} label="D4" placeholder="=..." />
      <CheckBar
        color={color}
        ready={answer.trim().length > 1}
        checked={checked}
        ok={ok}
        onCheck={check}
        readyHint="Wpisz, co będzie w D4."
        explain={
          <p>
            W D4 stoi <code className="bg-muted px-1 font-mono">{expected}</code>. Przy kopiowaniu w dół adresy przesuwają się o tyle wierszy, o ile
            przesunęła się formuła: z B2 i C2 robią się B4 i C4 — dlatego w D4 policzy się cena gumki razy jej sztuki.
          </p>
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RangeItem({ color, onDone }: ItemProps) {
  const [selection, setSelection] = useState<Box | null>(null);
  const [checked, setChecked] = useState(false);
  const cells = useMemo<RawCells>(() => ({ ...BOOKS, B6: '=SUMA(B2:B5)' }), []);
  const values = useMemo(() => evaluateSheet(cells, {}), [cells]);

  const good: Box[] = [
    { c1: 0, c2: 1, r1: 0, r2: 4 },
    { c1: 0, c2: 1, r1: 1, r2: 4 },
  ];
  const ok = good.some((box) => sameBox(box, selection));

  const why = (() => {
    if (ok) return 'Dobrze: nazwy miesięcy i liczby książek, bez wiersza „Razem”. Z takiego zakresu arkusz zrobi po jednym słupku na miesiąc.';
    if (!selection) return '';
    if (selection.c1 === selection.c2) return 'Bez nazw arkusz nie wie, który słupek jest którym miesiącem — zaznacz obie kolumny.';
    if (selection.r2 >= 5) return 'Zaznaczyłeś/aś też wiersz „Razem”. Wykres miał pokazać miesiące, a suma zrobiłaby z nich dodatkowy, najwyższy słupek.';
    return 'Do wykresu potrzebne są nazwy miesięcy (A) i liczby książek (B) — od pierwszego do ostatniego miesiąca.';
  })();

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        Chcesz zrobić <strong>wykres słupkowy</strong>: jeden słupek na każdy miesiąc, bez sumy. Zaznacz przeciągnięciem
        komórki, z których arkusz ma go narysować.
      </p>
      <SheetGrid
        className="mt-3"
        cols={2}
        rows={6}
        cells={cells}
        values={values}
        color={color}
        widths={[110, 84]}
        mode={checked ? 'none' : 'range'}
        selection={selection}
        onGesture={(box) => setSelection(box)}
        caption={selection ? `Zaznaczone: ${boxText(selection)}` : 'Przeciągnij od jednej komórki do drugiej.'}
      />
      <CheckBar
        color={color}
        ready={selection !== null}
        checked={checked}
        ok={ok}
        onCheck={check}
        readyHint="Najpierw zaznacz zakres."
        explain={<p>{why}</p>}
      />
    </div>
  );
}

export const SHEET_ITEMS: PartItem[] = [
  { id: 'suma', title: 'Formuła sumy, która przeżywa zmianę danych', Item: SumItem },
  { id: 'kopia', title: 'Formuła po skopiowaniu w dół', Item: CopyItem },
  { id: 'zakres', title: 'Zakres do wykresu', Item: RangeItem },
];

