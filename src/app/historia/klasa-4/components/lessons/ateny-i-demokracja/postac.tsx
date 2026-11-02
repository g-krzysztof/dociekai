import type { Person } from './tlum';

/** Kolory strojów — legenda pod tłumem mówi, co znaczą. */
export const GROUP_LOOK = {
  obywatel: { fill: '#eef2fb', stroke: '#1e3a8a', label: 'rodzina obywatela' },
  przybysz: { fill: '#dcefd6', stroke: '#2f6b2f', label: 'przybysze z innych miast' },
  niewolnik: { fill: '#d6c4a6', stroke: '#6b5233', label: 'niewolnicy' },
} as const;

const HEIGHT = { dziecko: 22, mlody: 30, dorosly: 34 } as const;

/** Postać stojąca stopami na `y`, wyśrodkowana na `x`. `hand`: podniesiona ręka (za) albo opuszczona (przeciw). */
export function Postac({ p, x, y, dim = false, hand }: { p: Person; x: number; y: number; dim?: boolean; hand?: 'za' | 'przeciw' }) {
  const h = HEIGHT[p.age];
  const look = GROUP_LOOK[p.group];
  const head = h * 0.14;
  const top = y - h;
  const neck = top + head * 2;
  const w = h * 0.36;
  const body = p.male
    ? `M${x - w / 2},${neck} h${w} v${h * 0.48} h${-w} Z`
    : `M${x - w * 0.35},${neck} h${w * 0.7} L${x + w * 0.6},${y - 1} h${-w * 1.2} Z`;
  return (
    <g opacity={dim ? 0.18 : 1} style={{ transition: 'opacity .4s' }}>
      {p.male && (
        <path d={`M${x - w * 0.25},${neck + h * 0.48} V${y} M${x + w * 0.25},${neck + h * 0.48} V${y}`} stroke={look.stroke} strokeWidth="1.4" />
      )}
      <path d={body} fill={look.fill} stroke={look.stroke} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx={x} cy={top + head} r={head} fill="#e9c9a8" stroke={look.stroke} strokeWidth="1" />
      {hand === 'za' && <path d={`M${x + w / 2},${neck + 2} L${x + w},${top - 2}`} stroke="#15803d" strokeWidth="2" strokeLinecap="round" />}
      {hand === 'przeciw' && <path d={`M${x - w / 2},${neck + 2} L${x - w},${neck + h * 0.35}`} stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />}
    </g>
  );
}

export function GroupLegend() {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {Object.values(GROUP_LOOK).map((g) => (
        <span key={g.label} className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 border" style={{ background: g.fill, borderColor: g.stroke }} /> {g.label}
        </span>
      ))}
      <span>· suknia = kobieta, tunika = mężczyzna, mała postać = dziecko</span>
    </p>
  );
}
