interface TallyMarksProps {
  count: number;
  color: string;
  className?: string;
}

const GROUP_WIDTH = 44;
const STROKE_GAP = 9;
const TOP = 8;
const HEIGHT = 56;

/**
 * Kreski liczydła w grupach po 5 (4 pionowe + 1 przekreślająca) — dokładnie
 * ten problem („trudno to szybko ocenić") skłonił Rzymian do wymyślenia
 * osobnych symboli dla grup zamiast rysowania kreski za kreską.
 */
export function TallyMarks({ count, color, className }: TallyMarksProps) {
  const safeCount = Math.max(0, Math.round(count));
  const groupCount = Math.max(1, Math.ceil(safeCount / 5));
  const width = groupCount * GROUP_WIDTH;

  const strokes: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (let i = 0; i < safeCount; i++) {
    const group = Math.floor(i / 5);
    const posInGroup = i % 5;
    const groupX = group * GROUP_WIDTH + 8;
    if (posInGroup < 4) {
      const x = groupX + posInGroup * STROKE_GAP;
      strokes.push({ x1: x, y1: TOP, x2: x, y2: TOP + HEIGHT, key: `v-${i}` });
    } else {
      strokes.push({
        x1: groupX - 2,
        y1: TOP + HEIGHT,
        x2: groupX + 3 * STROKE_GAP + 2,
        y2: TOP,
        key: `d-${i}`,
      });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${TOP * 2 + HEIGHT}`}
      width={width}
      height={TOP * 2 + HEIGHT}
      className={className ?? 'mx-auto block h-auto max-w-full'}
      role="img"
      aria-label={`${safeCount} kresek liczydła`}
    >
      {strokes.map((s) => (
        <line
          key={s.key}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
