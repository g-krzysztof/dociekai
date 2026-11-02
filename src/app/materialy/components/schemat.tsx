import type { Schemat as SchematData } from '../data/types';
import { SchematGeometria } from './schemat-geo';
import { Tresc } from './tresc';

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Rysunek na kartce. Wymiary w cqw kartki albo karty — patrz materialy.css. */
export function Schemat({ schemat }: { schemat: SchematData }) {
  if (
    schemat.typ === 'linie' ||
    schemat.typ === 'proste' ||
    schemat.typ === 'kat' ||
    schemat.typ === 'okrag' ||
    schemat.typ === 'figura' ||
    schemat.typ === 'kratki' ||
    schemat.typ === 'prostopadloscian'
  ) {
    return <SchematGeometria schemat={schemat} />;
  }

  if (schemat.typ === 'drabinka') {
    return (
      <div className="schemat-drabinka" aria-hidden>
        {schemat.szczeble.map((s, i) => (
          <span key={s} className="schemat-drabinka-szczebel">
            {i > 0 && <span className="schemat-drabinka-krok">{schemat.krok}</span>}
            <b>{s}</b>
          </span>
        ))}
      </div>
    );
  }

  if (schemat.typ === 'pasek') {
    return (
      <div className="schemat-pasek" aria-hidden>
        {Array.from({ length: schemat.mianownik }, (_, i) => (
          <i key={i} data-pelny={i < schemat.licznik} />
        ))}
      </div>
    );
  }

  if (schemat.typ === 'kolo') {
    const { licznik, mianownik } = schemat;
    const kat = (2 * Math.PI) / mianownik;
    const punkt = (i: number) => {
      const a = i * kat - Math.PI / 2;
      return `${r2(50 + 46 * Math.cos(a))} ${r2(50 + 46 * Math.sin(a))}`;
    };
    return (
      <svg className="schemat-kolo" viewBox="0 0 100 100" aria-hidden>
        {Array.from({ length: mianownik }, (_, i) => (
          <path
            key={i}
            d={`M50 50 L${punkt(i)} A46 46 0 0 1 ${punkt(i + 1)} Z`}
            fill={i < licznik ? 'var(--tusz)' : 'var(--papier)'}
            stroke="var(--druk)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    );
  }

  if (schemat.typ === 'slupek') {
    const wiersze = schemat.wiersze.map((w) => {
      const kratki: string[] = [];
      const przecinki = new Set<number>();
      for (const z of typeof w.kratki === 'string' ? [...w.kratki] : w.kratki) {
        if (z === ',') przecinki.add(kratki.length - 1);
        else kratki.push(z.trim());
      }
      return { ...w, kratki, przecinki };
    });
    const kolumny = Math.max(...wiersze.map((w) => w.kratki.length));
    return (
      <div
        className="schemat-slupek"
        style={{ gridTemplateColumns: `repeat(${kolumny + 1}, var(--kratka))` }}
        aria-hidden
      >
        {wiersze.map((w, r) => {
          const odstep = kolumny - w.kratki.length;
          return (
            <span key={r} className="schemat-slupek-wiersz" data-male={w.male} data-kreska={w.kreska}>
              <span className="schemat-slupek-znak" data-znak={w.znak}>
                {w.znak}
              </span>
              {Array.from({ length: kolumny }, (_, k) => {
                const i = k - odstep;
                const tekst = i >= 0 ? w.kratki[i] : '';
                return (
                  <span
                    key={k}
                    data-skreslona={w.skreslone?.includes(i) || undefined}
                    data-dlugi={tekst.length > 1 || undefined}
                    data-przecinek={(i >= 0 && w.przecinki.has(i)) || undefined}
                  >
                    {w.pozyczone?.includes(i) && <sup>1</sup>}
                    {tekst}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  }

  const wszystkie = schemat.do * schemat.podzial;
  const lewo = (k: number) => `${r2((k / wszystkie) * 100)}%`;

  return (
    <div className="schemat-os" aria-hidden>
      <div className="schemat-os-linia" />
      {Array.from({ length: wszystkie + 1 }, (_, k) => {
        const calosc = k % schemat.podzial === 0;
        return (
          <span key={k}>
            <span className="schemat-os-kreska" data-calosc={calosc} style={{ left: lewo(k) }} />
            {calosc && (
              <span className="schemat-os-liczba" style={{ left: lewo(k) }}>
                {k / schemat.podzial}
              </span>
            )}
          </span>
        );
      })}
      {schemat.punkty.map((p) => (
        <span key={p.kreska}>
          <span className="schemat-os-punkt" style={{ left: lewo(p.kreska) }} />
          <span className="schemat-os-podpis" style={{ left: lewo(p.kreska) }}>
            <Tresc tekst={p.podpis} />
          </span>
        </span>
      ))}
    </div>
  );
}
