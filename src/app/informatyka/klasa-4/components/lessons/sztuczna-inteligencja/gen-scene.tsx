import { cn } from '@/lib/utils';
import { mulberry32, type Animal, type Picture, type Season } from './generator';

/**
 * Obrazek z małego generatora. Rysunek idzie kodem, bo ma się składać
 * z sześciu decyzji (zwierzę, ile, co robi, gdzie, pora roku, pora dnia)
 * i drobiazgów zależnych od ziarna — a w bloku 4 trzeba jeszcze wiedzieć,
 * gdzie dokładnie stoi każde zwierzę, żeby dało się w nie stuknąć.
 *
 * `layout()` jest wspólne dla rysunku i dla trafiania palcem: ta sama funkcja
 * mówi, gdzie narysować lisa i gdzie jest jego obrys do stuknięcia.
 */

export const GEN_W = 400;
export const GEN_H = 260;
const HORIZON = 168;

export interface Placed {
  x: number;
  y: number;
  scale: number;
  flip: boolean;
}

/** Gdzie stoi drzewo i gdzie leżą zwierzęta. Czysta funkcja obrazka. */
export function layout(picture: Picture) {
  const random = mulberry32(picture.seed + 11);
  const treeX = 70 + random() * 70;
  const pond = { cx: 250 + random() * 30, cy: 214, rx: 92, ry: 22 };
  const base =
    picture.place === 'drzewo' ? treeX + 70 : picture.place === 'staw' ? pond.cx - pond.rx - 10 : 190 + random() * 30;
  /* Zwierzę z ogonem ma ok. 95 jednostek szerokości — ciaśniej zwierzęta wchodzą na siebie i nie da się ich policzyć. */
  const spacing = 96 + random() * 12;
  const animals: Placed[] = Array.from({ length: picture.count }, (_, index) => {
    const x =
      picture.place === 'staw'
        ? base - index * spacing * 0.9 + 40
        : base + (index - (picture.count - 1) / 2) * spacing;
    return {
      x: Math.max(40, Math.min(GEN_W - 40, x)),
      y: 222 + (index % 2) * 10 + random() * 4,
      scale: 0.92 + random() * 0.12,
      flip: random() > 0.6,
    };
  });
  return { treeX, pond, animals };
}

/**
 * Obrys zwierzęcia do trafiania palcem — z zapasem, bo palec jest grubszy niż kreska.
 * `pad` poszerza go o ogon i uszy; obrysy sąsiadów mogą wtedy na siebie zachodzić,
 * więc wywołujący wybiera zwierzę najbliższe palcowi.
 */
export function hitBox(placed: Placed, pad = 0) {
  return { left: placed.x - 42 - pad, right: placed.x + 42 + pad, top: placed.y - 62 - pad, bottom: placed.y + 10 + pad };
}

const SKY = {
  dzien: { top: '#cfe5f5', bottom: '#f3f8fb' },
  noc: { top: '#1f2d4d', bottom: '#3a4a70' },
};

const GROUND: Record<Season, string> = {
  wiosna: '#cfe7b9',
  lato: '#b7da98',
  jesien: '#e6cb93',
  zima: '#f2f5f8',
};

export function GenArt({ picture, className }: { picture: Picture; className?: string }) {
  const { treeX, pond, animals } = layout(picture);
  const random = mulberry32(picture.seed + 23);
  const night = picture.daytime === 'noc';
  const sky = SKY[picture.daytime];
  const id = `g${picture.seed}`;

  const stars = Array.from({ length: 14 }, () => ({
    x: random() * GEN_W,
    y: random() * (HORIZON - 40),
    r: 0.8 + random() * 1.3,
  }));
  const flakes = Array.from({ length: 34 }, () => ({ x: random() * GEN_W, y: random() * GEN_H, r: 1 + random() * 1.6 }));
  const tufts = Array.from({ length: 16 }, () => ({ x: random() * GEN_W, y: HORIZON + 14 + random() * 80 }));

  return (
    <svg viewBox={`0 0 ${GEN_W} ${GEN_H}`} className={cn('block h-full w-full', className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
      </defs>

      <rect width={GEN_W} height={HORIZON + 4} fill={`url(#${id}-sky)`} />
      {night ? (
        <>
          {stars.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.r} fill="#f8f3d6" opacity={0.85} />
          ))}
          <circle cx={330} cy={46} r={20} fill="#f1ecc9" />
          <circle cx={340} cy={40} r={18} fill={sky.top} />
        </>
      ) : (
        <circle cx={330} cy={48} r={22} fill="#f7d774" opacity={picture.season === 'zima' ? 0.7 : 1} />
      )}

      {/* Wzgórza na horyzoncie */}
      <path
        d={`M0 ${HORIZON} Q 90 ${HORIZON - 26} 180 ${HORIZON - 6} T 400 ${HORIZON - 14} V ${GEN_H} H 0 Z`}
        fill={GROUND[picture.season]}
        opacity={0.75}
      />
      <rect y={HORIZON} width={GEN_W} height={GEN_H - HORIZON} fill={GROUND[picture.season]} />

      {picture.season !== 'zima' &&
        tufts.map((tuft, index) => (
          <path
            key={index}
            d={`M${tuft.x} ${tuft.y} l -3 -7 M${tuft.x} ${tuft.y} l 0 -9 M${tuft.x} ${tuft.y} l 3 -7`}
            stroke={picture.season === 'jesien' ? '#b9955a' : '#7fae63'}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
        ))}
      {picture.season === 'wiosna' &&
        tufts.slice(0, 9).map((tuft, index) => (
          <circle key={index} cx={tuft.x + 6} cy={tuft.y - 3} r={2.6} fill={index % 2 ? '#f0b6c8' : '#fff6b0'} />
        ))}
      {picture.season === 'jesien' &&
        tufts.slice(0, 10).map((tuft, index) => (
          <ellipse key={index} cx={tuft.x + 8} cy={tuft.y - 1} rx={3.5} ry={1.8} fill={index % 2 ? '#d9774a' : '#e4a257'} />
        ))}

      {picture.place === 'staw' && (
        <ellipse
          cx={pond.cx}
          cy={pond.cy}
          rx={pond.rx}
          ry={pond.ry}
          fill={picture.season === 'zima' ? '#dce9f2' : night ? '#5d7ba3' : '#9fcbe2'}
          stroke="#6f93ad"
          strokeWidth={1.2}
        />
      )}
      {picture.place === 'drzewo' && <Tree x={treeX} season={picture.season} />}

      {animals.map((placed, index) => (
        <g
          key={index}
          transform={`translate(${placed.x} ${placed.y}) scale(${placed.flip ? -placed.scale : placed.scale} ${placed.scale})`}
        >
          <AnimalArt animal={picture.animal} asleep={picture.action === 'spi' && picture.awake !== index} />
        </g>
      ))}

      {picture.season === 'zima' &&
        flakes.map((flake, index) => (
          <circle key={index} cx={flake.x} cy={flake.y} r={flake.r} fill="#ffffff" opacity={night ? 0.9 : 0.8} />
        ))}

      {night && <rect width={GEN_W} height={GEN_H} fill="#0f1a36" opacity={0.28} />}
    </svg>
  );
}

function Tree({ x, season }: { x: number; season: Season }) {
  const base = 206;
  if (season === 'zima') {
    return (
      <g stroke="#6b5040" strokeLinecap="round" fill="none">
        <path d={`M${x} ${base} L${x} ${base - 110}`} strokeWidth={9} />
        <path d={`M${x} ${base - 60} L${x - 34} ${base - 100} M${x} ${base - 78} L${x + 36} ${base - 118} M${x} ${base - 96} L${x - 22} ${base - 128} M${x - 18} ${base - 82} L${x - 40} ${base - 84} M${x + 20} ${base - 98} L${x + 44} ${base - 96}`} strokeWidth={4} />
        <path d={`M${x - 36} ${base - 102} q 8 -5 16 0 M${x + 24} ${base - 112} q 8 -5 14 0 M${x - 6} ${base - 112} q 7 -4 12 0`} stroke="#ffffff" strokeWidth={4} />
      </g>
    );
  }
  const crown =
    season === 'jesien'
      ? ['#e4a257', '#d9774a', '#efbf6e']
      : season === 'wiosna'
        ? ['#a9d58f', '#bfe0a3', '#9fcf86']
        : ['#86be70', '#9acd84', '#77b061'];
  return (
    <g>
      <path d={`M${x - 7} ${base} L${x - 5} ${base - 70} L${x + 5} ${base - 70} L${x + 7} ${base} Z`} fill="#8a6446" stroke="#6b5040" strokeWidth={1.2} />
      <circle cx={x - 26} cy={base - 92} r={30} fill={crown[0]} />
      <circle cx={x + 24} cy={base - 96} r={32} fill={crown[1]} />
      <circle cx={x} cy={base - 122} r={34} fill={crown[2]} />
      {season === 'wiosna' &&
        [
          [-30, -100],
          [-10, -128],
          [18, -110],
          [34, -90],
          [4, -94],
          [-20, -82],
        ].map(([dx, dy], index) => <circle key={index} cx={x + dx} cy={base + dy} r={3.2} fill="#f5c3d3" />)}
    </g>
  );
}

const INK = '#44403c';

/**
 * Zwierzę stojące „stopami” w punkcie (0, 0), zwrócone w prawo. Śpiące leży
 * niżej, bez nóg i z oczami w kreskę — to jedyna różnica, jakiej potrzebuje
 * blok 4, i musi być widoczna gołym okiem, bo dziecko ma ją wypatrzyć.
 */
function AnimalArt({ animal, asleep }: { animal: Animal; asleep: boolean }) {
  const lift = asleep ? 0 : -8;
  const eye = (cx: number, cy: number, r = 2.4) =>
    asleep ? (
      <path d={`M${cx - r - 1} ${cy} q ${r + 1} ${r + 1} ${(r + 1) * 2} 0`} fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
    ) : (
      <circle cx={cx} cy={cy} r={r} fill={INK} />
    );
  const legs = (color: string, xs: number[]) =>
    asleep ? null : xs.map((x) => <path key={x} d={`M${x} -8 L${x} 0`} stroke={color} strokeWidth={4} strokeLinecap="round" />);

  switch (animal) {
    case 'lis':
      return (
        <g>
          {legs('#b86a33', [-16, -6, 10, 18])}
          <g transform={`translate(0 ${lift})`}>
            <path d="M-26 -12 C -52 -14 -54 -40 -34 -40 C -26 -34 -26 -22 -18 -18 Z" fill="#e08a4a" stroke={INK} strokeWidth={1.3} />
            <path d="M-44 -36 C -40 -40 -34 -40 -34 -40 C -36 -34 -40 -32 -44 -36 Z" fill="#fff8ee" />
            <ellipse cx={0} cy={-14} rx={26} ry={13} fill="#e08a4a" stroke={INK} strokeWidth={1.3} />
            <circle cx={24} cy={-22} r={11} fill="#e08a4a" stroke={INK} strokeWidth={1.3} />
            <path d="M18 -30 L20 -44 L28 -32 Z" fill="#e08a4a" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M26 -31 L32 -43 L34 -28 Z" fill="#e08a4a" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M30 -20 L42 -17 L30 -14 Z" fill="#fff8ee" stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
            <circle cx={42} cy={-17} r={1.6} fill={INK} />
            {eye(26, -24)}
          </g>
        </g>
      );
    case 'kot':
      return (
        <g>
          {legs('#8b8580', [-16, -6, 10, 18])}
          <g transform={`translate(0 ${lift})`}>
            <path d="M-24 -14 C -44 -16 -44 -36 -36 -44" fill="none" stroke="#a8a29e" strokeWidth={5} strokeLinecap="round" />
            <ellipse cx={0} cy={-14} rx={25} ry={13} fill="#a8a29e" stroke={INK} strokeWidth={1.3} />
            <circle cx={24} cy={-24} r={12} fill="#a8a29e" stroke={INK} strokeWidth={1.3} />
            <path d="M15 -32 L16 -46 L25 -35 Z" fill="#a8a29e" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M26 -35 L34 -46 L34 -31 Z" fill="#a8a29e" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M30 -20 l 12 -2 M30 -18 l 12 2" stroke={INK} strokeWidth={0.8} />
            <circle cx={33} cy={-22} r={1.3} fill="#e8a0a8" />
            {eye(27, -27)}
          </g>
        </g>
      );
    case 'sowa':
      return (
        <g>
          {!asleep && (
            <>
              <ellipse cx={-17} cy={-30} rx={7} ry={15} transform="rotate(-28 -17 -30)" fill="#8f6640" stroke={INK} strokeWidth={1.2} />
              <ellipse cx={17} cy={-30} rx={7} ry={15} transform="rotate(28 17 -30)" fill="#8f6640" stroke={INK} strokeWidth={1.2} />
            </>
          )}
          <ellipse cx={0} cy={-24} rx={16} ry={23} fill="#a97c50" stroke={INK} strokeWidth={1.3} />
          <path d="M-12 -42 L-14 -54 L-5 -45 Z M12 -42 L14 -54 L5 -45 Z" fill="#a97c50" stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
          <ellipse cx={0} cy={-33} rx={12} ry={9} fill="#ead6b6" />
          <circle cx={-5.5} cy={-34} r={asleep ? 3 : 4.5} fill={asleep ? 'none' : '#ffffff'} stroke={asleep ? 'none' : INK} strokeWidth={1} />
          <circle cx={5.5} cy={-34} r={asleep ? 3 : 4.5} fill={asleep ? 'none' : '#ffffff'} stroke={asleep ? 'none' : INK} strokeWidth={1} />
          {eye(-5.5, -34, 2)}
          {eye(5.5, -34, 2)}
          <path d="M-2 -29 L2 -29 L0 -25 Z" fill="#e0a13c" />
          <path d="M-6 0 l 0 -3 M6 0 l 0 -3" stroke="#e0a13c" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case 'jez':
      return (
        <g>
          {legs('#6d5037', [-12, 12])}
          <g transform={`translate(0 ${lift})`}>
            <path
              d="M-30 -6 L-32 -14 L-26 -16 L-28 -24 L-20 -24 L-20 -32 L-12 -30 L-8 -38 L-2 -32 L4 -38 L8 -31 L15 -34 L16 -26 L22 -26 L20 -18 L26 -14 L22 -6 Z"
              fill="#7c5b3e"
              stroke={INK}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            <path d="M20 -18 C 28 -20 34 -14 40 -10 C 34 -6 26 -4 20 -6 Z" fill="#d9b98f" stroke={INK} strokeWidth={1.2} />
            <circle cx={40} cy={-10} r={1.8} fill={INK} />
            {eye(28, -13, 1.8)}
          </g>
        </g>
      );
  }
}
