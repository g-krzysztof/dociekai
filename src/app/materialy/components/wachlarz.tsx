import Link from 'next/link';
import type { Material } from '../data/types';
import { materialHref } from '../data';
import { Miniatura } from './miniatura';

/**
 * Hero huba: kartki rozłożone jak talia, obrócone wokół wspólnego punktu
 * pod spodem. Fiszki wchodzą dwiema stronami (awers i rewers), żeby było
 * widać, że to karty do wycięcia. Najechanie unosi kartkę.
 */
export function Wachlarz({ materialy }: { materialy: Material[] }) {
  const kartki = materialy
    .flatMap((m): { m: Material; strona: number }[] =>
      m.rodzaj === 'fiszki' ? [{ m, strona: 1 }, { m, strona: 0 }] : [{ m, strona: 0 }],
    )
    .slice(0, 5);
  const n = kartki.length;
  const rozpietosc = Math.min(30, 9 * (n - 1));

  return (
    <div className="wachlarz" aria-label="Przykładowe materiały">
      {kartki.map(({ m, strona }, i) => {
        const obrot = n === 1 ? 0 : -rozpietosc / 2 + (rozpietosc / (n - 1)) * i;
        return (
          <Link
            key={`${m.slug}-${strona}`}
            href={materialHref(m)}
            className="wachlarz-kartka cien-kartki block"
            style={
              {
                '--obrot': `${Math.round(obrot * 10) / 10}deg`,
                '--opoznienie': `${120 + i * 70}ms`,
                zIndex: i + 1,
              } as React.CSSProperties
            }
            aria-label={m.tytul}
            tabIndex={strona === 1 ? -1 : undefined}
          >
            <Miniatura material={m} strona={strona} />
          </Link>
        );
      })}
    </div>
  );
}
