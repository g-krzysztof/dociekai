'use client';

import { UnitSorter, type SortableItem } from './unit-sorter';
import { LENGTH_UNITS } from '../../../lib/length';

const ITEMS: SortableItem[] = [
  {
    id: 'grubosc-monety',
    label: 'Grubość monety 5-groszowej',
    unitCode: 'mm',
    detail: '≈ 2 mm',
  },
  { id: 'mrowka', label: 'Długość mrówki', unitCode: 'mm', detail: '≈ 5 mm' },
  { id: 'olowek', label: 'Długość ołówka', unitCode: 'cm', detail: '≈ 18 cm' },
  { id: 'stopa', label: 'Długość stopy dziecka', unitCode: 'cm', detail: '≈ 20 cm' },
  { id: 'drzwi', label: 'Wysokość drzwi', unitCode: 'm', detail: '≈ 2 m' },
  { id: 'autobus', label: 'Długość autobusu szkolnego', unitCode: 'm', detail: '≈ 12 m' },
  { id: 'do-szkoly', label: 'Trasa z domu do szkoły', unitCode: 'km', detail: '≈ 2 km' },
  {
    id: 'miedzy-miastami',
    label: 'Odległość z Warszawy do Krakowa',
    unitCode: 'km',
    detail: '≈ 290 km',
  },
];

/**
 * Bez decymetra — żaden codzienny przedmiot się w nim naturalnie nie mieści
 * (nikt nie mówi „ołówek ma 1,8 dm”), więc pusty słupek tylko zapraszał do
 * pytania „czy 18 cm ołówka to może jednak dm?”. Decymetr zostaje pełnoprawnym
 * stopniem drabinki w kroku Przykłady, gdzie ma realne znaczenie matematyczne
 * (pośredni krok w zamianie m↔cm) — tu, w ćwiczeniu na wyczucie skali
 * prawdziwych przedmiotów, to nieuczciwe byłoby wymyślać dla niego sztuczny
 * przykład.
 */
const SORTER_UNITS = LENGTH_UNITS.filter((unit) => unit.code !== 'dm');

interface UnitSorterLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: rozłóż prawdziwe przedmioty na słupki drabinki jednostek —
 * samo wyczucie, do jakiej skali pasuje mm, cm, m i km, zanim w Przykładach
 * poznasz regułę ×10 (i piąty stopień, dm, którego tu celowo nie ma — patrz
 * `SORTER_UNITS`).
 */
export function UnitSorterLab({ color, onComplete }: UnitSorterLabProps) {
  return <UnitSorter units={SORTER_UNITS} items={ITEMS} color={color} onComplete={onComplete} />;
}
