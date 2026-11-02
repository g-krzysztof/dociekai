import type { CSSProperties, ReactNode } from 'react';
import type { Schemat } from '../data/types';

/**
 * Rysunki geometryczne na kartkach. SVG w jednostkach `viewBox`, podpisy jako
 * HTML nad rysunkiem (pozycja w % — font kartki, nie font SVG). Współrzędne
 * z trygonometrii zaokrąglone, żeby SSR i klient dały ten sam atrybut.
 */
export type SchematGeo = Extract<
  Schemat,
  { typ: 'linie' | 'proste' | 'kat' | 'okrag' | 'figura' | 'kratki' | 'prostopadloscian' }
>;

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const LINIA = 'var(--druk)';
const TUSZ = 'var(--tusz)';
const GRUBOSC = 2.2;

type Punkt = [number, number];
interface Podpis {
  x: number;
  y: number;
  tekst: string;
  /** Domyślnie podpis jest wyśrodkowany na punkcie; `lewo` = zaczyna się w punkcie, `prawo` = kończy. */
  kotwica?: 'lewo' | 'prawo';
}
interface Rysunek {
  w: number;
  h: number;
  tresc: ReactNode;
  podpisy: Podpis[];
}

const odcinek = (a: Punkt, b: Punkt, key: string | number, kolor = LINIA, przerywany = false) => (
  <line
    key={key}
    x1={r3(a[0])}
    y1={r3(a[1])}
    x2={r3(b[0])}
    y2={r3(b[1])}
    stroke={kolor}
    strokeWidth={GRUBOSC}
    strokeLinecap="round"
    strokeDasharray={przerywany ? '5 4' : undefined}
  />
);

/** Wypełnienie tuszem zawsze z obrysem — czytelne także w czerni. */
const kropka = ([x, y]: Punkt, key: string | number) => (
  <circle key={key} cx={r3(x)} cy={r3(y)} r={2.8} fill={TUSZ} stroke={LINIA} strokeWidth={1.2} />
);

/** Grot w punkcie `p`, skierowany zgodnie z wektorem `[dx, dy]`. */
const grot = (p: Punkt, [dx, dy]: Punkt, key: string | number) => {
  const d = Math.hypot(dx, dy);
  const [ux, uy] = [dx / d, dy / d];
  const ramie = (znak: number): Punkt => {
    const c = Math.cos(Math.PI / 6);
    const s = Math.sin(Math.PI / 6) * znak;
    return [p[0] - 6 * (ux * c - uy * s), p[1] - 6 * (uy * c + ux * s)];
  };
  const [a, b] = [ramie(1), ramie(-1)];
  return (
    <polyline
      key={key}
      points={`${r3(a[0])},${r3(a[1])} ${r3(p[0])},${r3(p[1])} ${r3(b[0])},${r3(b[1])}`}
      fill="none"
      stroke={LINIA}
      strokeWidth={GRUBOSC}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

function linie(): Rysunek {
  return {
    w: 100,
    h: 60,
    podpisy: [],
    tresc: (
      <>
        {odcinek([6, 10], [94, 10], 'prosta')}
        {grot([6, 10], [-1, 0], 'p-lewo')}
        {grot([94, 10], [1, 0], 'p-prawo')}
        {odcinek([6, 30], [94, 30], 'polprosta')}
        {grot([94, 30], [1, 0], 'pp-prawo')}
        {kropka([6, 30], 'pp-poczatek')}
        {odcinek([16, 50], [84, 50], 'odcinek')}
        {kropka([16, 50], 'o-a')}
        {kropka([84, 50], 'o-b')}
      </>
    ),
  };
}

function proste(): Rysunek {
  return {
    w: 100,
    h: 56,
    podpisy: [],
    tresc: (
      <>
        {odcinek([6, 40], [46, 40], 'pozioma')}
        {odcinek([22, 4], [22, 52], 'pionowa')}
        <path d="M22 33 H29 V40" fill="none" stroke={TUSZ} strokeWidth={GRUBOSC} strokeLinejoin="round" />
        {odcinek([56, 48], [96, 28], 'rownolegla-1')}
        {odcinek([56, 30], [96, 10], 'rownolegla-2')}
      </>
    ),
  };
}

function katy(stopnie: number[], podpisy: boolean): Rysunek {
  const RAMIE = 40;
  const PODSTAWA = 44;
  const Y = 44;
  const elementy: ReactNode[] = [];
  const napisy: Podpis[] = [];
  let x0 = 0;
  stopnie.forEach((st, i) => {
    const t = (st * Math.PI) / 180;
    const [c, s] = [Math.cos(t), Math.sin(t)];
    const vx = x0 + 6 + Math.max(0, -RAMIE * c);
    const w: Punkt = [vx, Y];
    elementy.push(odcinek(w, [vx + PODSTAWA, Y], `k${i}-podstawa`));
    elementy.push(odcinek(w, [vx + RAMIE * c, Y - RAMIE * s], `k${i}-ramie`));
    if (st === 90) {
      elementy.push(
        <path key={`k${i}-luk`} d={`M${r3(vx + 9)} ${Y} V${Y - 9} H${r3(vx)}`} fill="none" stroke={TUSZ} strokeWidth={GRUBOSC} />,
      );
    } else {
      const R = 12;
      elementy.push(
        <path
          key={`k${i}-luk`}
          d={`M${r3(vx + R)} ${Y} A${R} ${R} 0 0 0 ${r3(vx + R * c)} ${r3(Y - R * s)}`}
          fill="none"
          stroke={TUSZ}
          strokeWidth={GRUBOSC}
        />,
      );
    }
    elementy.push(kropka(w, `k${i}-wierzcholek`));
    if (podpisy) {
      const pol = t / 2;
      // W wąskim kącie ostrym podpis odsuwa się dalej, żeby nie wejść na ramię.
      const r = st < 60 ? 36 : 27;
      napisy.push({ x: vx + r * Math.cos(pol), y: Y - r * Math.sin(pol), tekst: `${st}°` });
    }
    x0 = vx + Math.max(PODSTAWA, RAMIE * c) + 6 + (i < stopnie.length - 1 ? 8 : 0);
  });
  return { w: r3(x0), h: 50, tresc: elementy, podpisy: napisy };
}

function okrag(odcinki: Extract<SchematGeo, { typ: 'okrag' }>['odcinki']): Rysunek {
  const S: Punkt = [50, 50];
  const R = 44;
  const na = (st: number): Punkt => [S[0] + R * Math.cos((st * Math.PI) / 180), S[1] - R * Math.sin((st * Math.PI) / 180)];
  const elementy: ReactNode[] = [<circle key="okrag" cx={50} cy={50} r={R} fill="none" stroke={LINIA} strokeWidth={GRUBOSC} />];
  const napisy: Podpis[] = [];
  odcinki.forEach(({ rodzaj, podpis }, i) => {
    if (rodzaj === 'promien') {
      elementy.push(odcinek(S, na(90), `o${i}`, TUSZ), kropka(na(90), `o${i}-k`));
      napisy.push({ x: 57, y: 28, tekst: podpis });
    } else if (rodzaj === 'srednica') {
      const [a, b] = [na(160), na(340)];
      elementy.push(odcinek(a, b, `o${i}`), kropka(a, `o${i}-a`), kropka(b, `o${i}-b`));
      napisy.push({ x: 31, y: 36, tekst: podpis });
    } else {
      const [a, b] = [na(215), na(305)];
      elementy.push(odcinek(a, b, `o${i}`), kropka(a, `o${i}-a`), kropka(b, `o${i}-b`));
      napisy.push({ x: 46, y: 74, tekst: podpis });
    }
  });
  elementy.push(kropka(S, 'srodek'));
  return { w: 100, h: 100, tresc: elementy, podpisy: napisy };
}

function figura({ ksztalt, osie, boki }: Extract<SchematGeo, { typ: 'figura' }>): Rysunek {
  const H = 64;
  const napisy: Podpis[] = [];
  let wierzcholki: Punkt[];
  let linieOsi: [Punkt, Punkt][] = [];

  if (ksztalt === 'prostokat' || ksztalt === 'kwadrat') {
    // Z podpisami boków figura robi miejsce na podpis z prawej i pod spodem.
    const [x1, y1, y2] = boki ? [6, 6, 48] : [8, 9, 55];
    const szer = ksztalt === 'kwadrat' ? y2 - y1 : boki ? 60 : 84;
    const x = ksztalt === 'kwadrat' && !boki ? 50 - szer / 2 : x1;
    const [x2, xs, ys] = [x + szer, x + szer / 2, (y1 + y2) / 2];
    wierzcholki = [[x, y1], [x2, y1], [x2, y2], [x, y2]];
    linieOsi = [
      [[xs, y1 - 5], [xs, y2 + 5]],
      [[x - 5, ys], [x2 + 5, ys]],
    ];
    if (ksztalt === 'kwadrat') {
      const e = 5 / Math.SQRT2;
      linieOsi.push([[x - e, y1 - e], [x2 + e, y2 + e]], [[x2 + e, y1 - e], [x - e, y2 + e]]);
    }
    if (boki) {
      napisy.push({ x: xs, y: y2 + 8, tekst: boki[0] }, { x: x2 + 3, y: ys, tekst: boki[1], kotwica: 'lewo' });
    }
  } else if (ksztalt === 'latawiec') {
    wierzcholki = [[50, 3], [70, 22], [50, 61], [30, 22]];
    linieOsi = [[[50, 0.5], [50, 63.5]]];
  } else if (ksztalt === 'trojkat') {
    const bok = 56;
    const A: Punkt = [50 - bok / 2, 57];
    const B: Punkt = [50 + bok / 2, 57];
    const C: Punkt = [50, 57 - (bok * Math.sqrt(3)) / 2];
    wierzcholki = [A, B, C];
    // Każda oś: wierzchołek → środek boku naprzeciwko, przedłużona o 5 w obie strony.
    linieOsi = (
      [
        [A, B, C],
        [B, C, A],
        [C, A, B],
      ] as const
    ).map(([p, q, w]) => {
      const m: Punkt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      const d = Math.hypot(m[0] - w[0], m[1] - w[1]);
      const [ux, uy] = [(m[0] - w[0]) / d, (m[1] - w[1]) / d];
      return [
        [w[0] - 5 * ux, w[1] - 5 * uy],
        [m[0] + 5 * ux, m[1] + 5 * uy],
      ];
    });
  } else {
    wierzcholki = [[8, 55], [70, 55], [92, 9], [30, 9]];
  }

  const punkty = wierzcholki.map(([x, y]) => `${r3(x)},${r3(y)}`).join(' ');
  return {
    w: 100,
    h: H,
    podpisy: napisy,
    tresc: (
      <>
        <polygon points={punkty} fill="var(--tusz-jasny)" stroke={LINIA} strokeWidth={GRUBOSC} strokeLinejoin="round" />
        {osie && linieOsi.map(([a, b], i) => odcinek(a, b, `os${i}`, TUSZ, true))}
      </>
    ),
  };
}

/** Które boki kratki zakrywa jej kształt: góra, prawo, dół, lewo. Połówka zakrywa dwa. */
const ZAKRYTE_BOKI: Record<string, [boolean, boolean, boolean, boolean]> = {
  '#': [true, true, true, true],
  '◣': [false, false, true, true],
  '◢': [false, true, true, false],
  '◤': [true, false, false, true],
  '◥': [true, true, false, false],
};

function kratki({ wiersze, ciecia, boki }: Extract<SchematGeo, { typ: 'kratki' }>): Rysunek {
  const K = 10;
  const M = 2;
  const kolumny = Math.max(...wiersze.map((w) => [...w].length));
  const siatka = wiersze.map((w) => {
    const znaki = [...w];
    return Array.from({ length: kolumny }, (_, i) => znaki[i] ?? '.');
  });
  const znak = (x: number, y: number) => siatka[y]?.[x] ?? '.';
  const zakryty = (x: number, y: number, bok: number) => ZAKRYTE_BOKI[znak(x, y)]?.[bok] ?? false;
  const brak = (x: number, y: number) => znak(x, y) === 'x';
  const px = (n: number) => M + n * K;

  const tlo: ReactNode[] = [];
  const kreski: ReactNode[] = [];
  const obrys: ReactNode[] = [];
  let [minX, maxX, maxY] = [kolumny, 0, 0];

  siatka.forEach((wiersz, y) =>
    wiersz.forEach((z, x) => {
      const [x0, y0, x1, y1] = [px(x), px(y), px(x + 1), px(y + 1)];
      if (z !== '.') [minX, maxX, maxY] = [Math.min(minX, x), Math.max(maxX, x + 1), Math.max(maxY, y + 1)];
      if (z === '#') {
        tlo.push(<rect key={`k${x}-${y}`} x={x0} y={y0} width={K} height={K} fill="var(--tusz-jasny)" />);
      } else if (z in ZAKRYTE_BOKI) {
        // Połówka: trójkąt z kątem prostym w zamalowanym rogu i gruba przekątna.
        const [g, , d, l] = ZAKRYTE_BOKI[z];
        const rog: Punkt = [l ? x0 : x1, g ? y0 : y1];
        const pion: Punkt = [rog[0], d ? y0 : y1];
        const poziom: Punkt = [l ? x1 : x0, rog[1]];
        tlo.push(
          <polygon
            key={`p${x}-${y}`}
            points={[rog, pion, poziom].map(([a, b]) => `${a},${b}`).join(' ')}
            fill="var(--tusz-jasny)"
          />,
        );
        obrys.push(odcinek(pion, poziom, `d${x}-${y}`));
      } else if (z === 'x') {
        // Brak: ukośne kreski — kratka „do odjęcia”.
        kreski.push(
          <path
            key={`h${x}-${y}`}
            d={`M${x0 + K / 2} ${y0}L${x0} ${y0 + K / 2}M${x1} ${y0}L${x0} ${y1}M${x1} ${y0 + K / 2}L${x0 + K / 2} ${y1}`}
          />,
        );
      }
    }),
  );

  // Siatka cienko, na niej brzeg figury grubo, a brzeg braków — przerywany.
  const siatkaLinie: ReactNode[] = [];
  for (let x = 0; x <= kolumny; x++) {
    siatkaLinie.push(<line key={`sx${x}`} x1={px(x)} y1={px(0)} x2={px(x)} y2={px(siatka.length)} />);
  }
  for (let y = 0; y <= siatka.length; y++) {
    siatkaLinie.push(<line key={`sy${y}`} x1={px(0)} y1={px(y)} x2={px(kolumny)} y2={px(y)} />);
  }
  for (let y = 0; y <= siatka.length; y++) {
    for (let x = 0; x <= kolumny; x++) {
      // Krawędź pozioma nad kratką (x, y) i pionowa na lewo od niej.
      if (x < kolumny) {
        const [a, b]: Punkt[] = [[px(x), px(y)], [px(x + 1), px(y)]];
        if (zakryty(x, y - 1, 2) !== zakryty(x, y, 0)) obrys.push(odcinek(a, b, `eh${x}-${y}`));
        else if (brak(x, y - 1) !== brak(x, y)) obrys.push(odcinek(a, b, `bh${x}-${y}`, TUSZ, true));
      }
      if (y < siatka.length) {
        const [a, b]: Punkt[] = [[px(x), px(y)], [px(x), px(y + 1)]];
        if (zakryty(x - 1, y, 1) !== zakryty(x, y, 3)) obrys.push(odcinek(a, b, `ev${x}-${y}`));
        else if (brak(x - 1, y) !== brak(x, y)) obrys.push(odcinek(a, b, `bv${x}-${y}`, TUSZ, true));
      }
    }
  }

  const podpisy: Podpis[] = boki
    ? [
        { x: (px(minX) + px(maxX)) / 2, y: px(maxY) + 6, tekst: boki[0] },
        { x: px(kolumny) + 2.5, y: px(siatka.length) / 2 + M / 2, tekst: boki[1], kotwica: 'lewo' },
      ]
    : [];

  return {
    w: px(kolumny) + M + (boki ? 18 : 0),
    h: px(siatka.length) + M + (boki ? 10 : 0),
    podpisy,
    tresc: (
      <>
        {tlo}
        <g stroke="var(--druk-cichy)" strokeWidth={0.6} opacity={0.6}>
          {siatkaLinie}
        </g>
        <g stroke={TUSZ} strokeWidth={0.9} strokeLinecap="round">
          {kreski}
        </g>
        {obrys}
        {ciecia?.map(([x1, y1, x2, y2], i) => odcinek([px(x1), px(y1)], [px(x2), px(y2)], `c${i}`, TUSZ, true))}
      </>
    ),
  };
}

/**
 * Prostopadłościan w rzucie ukośnym: ściana przednia a × c bez zniekształceń,
 * głębokość b skrócona o połowę pod kątem 45°. Trzy krawędzie zasłonięte
 * (z tylnego dolnego lewego wierzchołka) są przerywane — umowa z lekcji.
 */
function prostopadloscian({ wymiary, podpisy, kostki }: Extract<SchematGeo, { typ: 'prostopadloscian' }>): Rysunek {
  const [a, b, c] = wymiary;
  const SKROT = 0.5 * Math.SQRT1_2;
  const U = 64 / Math.max(a + b * SKROT, c + b * SKROT);
  const [A, C, d] = [a * U, c * U, b * U * SKROT];
  const [L, P, D, M] = podpisy ? [18, 20, 10, 3] : [0, 0, 0, 3];
  const [x0, y0] = [M + L, M + d];

  const przod: Punkt[] = [[x0, y0], [x0 + A, y0], [x0 + A, y0 + C], [x0, y0 + C]];
  const tyl = (p: Punkt): Punkt => [p[0] + d, p[1] - d];
  const [pLG, pPG, pPD, pLD] = przod;
  const [tLG, tPG, tPD, tLD] = przod.map(tyl);
  const wielokat = (pkt: Punkt[], wypelnienie: string, key: string) => (
    <polygon key={key} points={pkt.map(([x, y]) => `${r3(x)},${r3(y)}`).join(' ')} fill={wypelnienie} />
  );

  // Kostki jednostkowe na trzech widocznych ścianach — cienkie linie podziału.
  const podzial: ReactNode[] = [];
  if (kostki) {
    const krok = (p: Punkt, q: Punkt, t: number): Punkt => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    const linie = (n: number, p0: Punkt, p1: Punkt, wzdluz: Punkt, klucz: string) => {
      for (let i = 1; i < n; i++) {
        const s = krok(p0, p1, i / n);
        podzial.push(odcinek(s, [s[0] + wzdluz[0], s[1] + wzdluz[1]], `${klucz}${i}`, 'var(--druk-cichy)'));
      }
    };
    linie(a, pLG, pPG, [0, C], 'pa');
    linie(c, pLG, pLD, [A, 0], 'pc');
    linie(a, pLG, pPG, [d, -d], 'ga');
    linie(b, pLG, tLG, [A, 0], 'gb');
    linie(c, pPG, pPD, [d, -d], 'bc');
    linie(b, pPG, tPG, [0, C], 'bb');
  }

  const napisy: Podpis[] = podpisy
    ? [
        { x: x0 + A / 2, y: y0 + C + 6, tekst: podpisy[0] },
        { x: x0 + A + d / 2 + 3, y: y0 + C - d / 2, tekst: podpisy[1], kotwica: 'lewo' },
        { x: x0 - 3, y: y0 + C / 2, tekst: podpisy[2], kotwica: 'prawo' },
      ]
    : [];

  return {
    w: r3(x0 + A + d + M + P),
    h: r3(y0 + C + M + D),
    podpisy: napisy,
    tresc: (
      <>
        {wielokat([pLG, pPG, tPG, tLG], 'var(--tusz-jasny)', 'gora')}
        {wielokat([pPG, tPG, tPD, pPD], 'var(--tusz-jasny)', 'bok')}
        {wielokat(przod, 'var(--tusz-jasny)', 'przod')}
        <g opacity={0.55}>{podzial}</g>
        {odcinek(tLD, tLG, 'z1', LINIA, true)}
        {odcinek(tLD, tPD, 'z2', LINIA, true)}
        {odcinek(tLD, pLD, 'z3', LINIA, true)}
        <polygon
          points={przod.map(([x, y]) => `${r3(x)},${r3(y)}`).join(' ')}
          fill="none"
          stroke={LINIA}
          strokeWidth={GRUBOSC}
          strokeLinejoin="round"
        />
        <polyline
          points={[pLG, tLG, tPG, tPD, pPD].map(([x, y]) => `${r3(x)},${r3(y)}`).join(' ')}
          fill="none"
          stroke={LINIA}
          strokeWidth={GRUBOSC}
          strokeLinejoin="round"
        />
        {odcinek(pPG, tPG, 'w')}
      </>
    ),
  };
}

export function SchematGeometria({ schemat }: { schemat: SchematGeo }) {
  const rysunek =
    schemat.typ === 'linie'
      ? linie()
      : schemat.typ === 'proste'
        ? proste()
        : schemat.typ === 'kat'
          ? katy(schemat.stopnie, schemat.podpisy ?? false)
          : schemat.typ === 'okrag'
            ? okrag(schemat.odcinki)
            : schemat.typ === 'kratki'
              ? kratki(schemat)
              : schemat.typ === 'prostopadloscian'
                ? prostopadloscian(schemat)
                : figura(schemat);
  const { w, h, tresc, podpisy } = rysunek;
  return (
    <div className="schemat-geo" style={{ '--geo-r': r3(w / h) } as CSSProperties} aria-hidden>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        {tresc}
      </svg>
      {podpisy.map((p) => (
        <span
          key={`${p.tekst}-${r3(p.x)}`}
          className="schemat-geo-podpis"
          data-kotwica={p.kotwica}
          style={{ left: `${r3((p.x / w) * 100)}%`, top: `${r3((p.y / h) * 100)}%` }}
        >
          {p.tekst}
        </span>
      ))}
    </div>
  );
}
