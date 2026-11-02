import type { Material } from '../data/types';
import { rozlozArkusze, StronaFiszek } from './fiszki';
import { Sciaga } from './sciaga';

/**
 * Pierwsza strona materiału w pomniejszeniu — żywy render tej samej
 * komponenty co PDF, nie obrazek, więc nigdy się nie rozjedzie z plikiem.
 * Fiszki mogą pokazać stronę z rewersami (`strona={1}`).
 */
export function Miniatura({ material, strona = 0 }: { material: Material; strona?: number }) {
  return (
    <div inert aria-hidden className="pointer-events-none select-none">
      {material.rodzaj === 'sciaga' ? (
        <Sciaga sciaga={material} tryb="miniatura" />
      ) : (
        <StronaFiszek
          zestaw={material}
          wariant="dwustronne"
          strona={rozlozArkusze(material, 'dwustronne')[strona]}
        />
      )}
    </div>
  );
}
