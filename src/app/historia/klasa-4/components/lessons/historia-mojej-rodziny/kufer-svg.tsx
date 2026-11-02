import type { ChestId } from './kufer';

/**
 * Przedmioty z kufra jako rysunek SVG (viewBox 200 × 150). Napisy są celowo
 * drobne (3 jednostki ≈ 5 px na telefonie) — czyta się je lupą. Rodzina jest
 * wymyślona, przedmioty też.
 */

const ENGRAVING = { fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' } as const;
const HAND = { fontFamily: '"Segoe Script", "Brush Script MT", "Comic Sans MS", cursive' } as const;

function Watch() {
  const lines = ['Wincentemu', 'Lisieckiemu', 'za 25 lat pracy', 'w Zakładzie', 'Zegarmistrzowskim', '14 czerwca 1971'];
  return (
    <g>
      <rect x="92" y="4" width="16" height="12" fill="#b99a4a" />
      <circle cx="100" cy="6" r="6" fill="none" stroke="#b99a4a" strokeWidth="2.4" />
      <circle cx="100" cy="82" r="64" fill="#d9c47e" stroke="#a88a3c" strokeWidth="2" />
      <circle cx="100" cy="82" r="55" fill="#e3d194" stroke="#b99a4a" strokeWidth="0.8" />
      {lines.map((line, i) => (
        <text
          key={line}
          x="100"
          y={56 + i * 8.4 + (i === 5 ? 3 : 0)}
          textAnchor="middle"
          fontSize="3.1"
          fill="#6b5a2a"
          style={ENGRAVING}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Legitymacja() {
  const rows: [string, number][] = [
    ['Imię i nazwisko:', 66],
    ['Wincenty Lisiecki', 73],
    ['Rok urodzenia: 1924', 81],
    ['Zawód: zegarmistrz', 89],
    ['Legitymacja nr 118', 100],
    ['Wydana w roku 1948', 109],
  ];
  return (
    <g>
      <rect x="14" y="20" width="172" height="112" fill="#d8d0b8" stroke="#8a7f62" strokeWidth="1.2" />
      <rect x="14" y="20" width="172" height="20" fill="#7a6a4a" />
      <text x="100" y="33.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#f1ead2" letterSpacing="0.6">
        LEGITYMACJA CECHU
      </text>
      <rect x="22" y="50" width="30" height="40" fill="#c4bba0" stroke="#8a7f62" strokeWidth="0.8" />
      <circle cx="37" cy="64" r="7" fill="#b3a98a" />
      <path d="M26 88 q11 -18 22 0 z" fill="#b3a98a" />
      {rows.map(([text, y]) => (
        <text key={text} x="62" y={y - 8} fontSize="3.1" fill="#4a4030">
          {text}
        </text>
      ))}
    </g>
  );
}

function Medal() {
  return (
    <g>
      <polygon points="76,4 100,52 88,52 66,4" fill="#b7414a" />
      <polygon points="124,4 100,52 112,52 134,4" fill="#f1ead2" stroke="#cfc6a6" strokeWidth="0.6" />
      <circle cx="100" cy="92" r="46" fill="#d9c47e" stroke="#a88a3c" strokeWidth="2" />
      <circle cx="100" cy="92" r="38" fill="none" stroke="#b99a4a" strokeWidth="0.8" />
      {['I MIEJSCE', 'BIEG NA 5 KM', '1949', 'W. Lisiecki'].map((line, i) => (
        <text
          key={line}
          x="100"
          y={78 + i * 9}
          textAnchor="middle"
          fontSize={i === 2 ? 3.6 : 3.1}
          fontWeight={i === 2 ? 700 : 400}
          fill="#6b5a2a"
          style={ENGRAVING}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Letter() {
  const rows = ['3 maja 1952', 'Kochana Stasiu!', 'Pamiętam, że dziś', 'Józek kończy dwa lata.', 'Ucałuj go ode mnie.', 'W sobotę wracam.', 'Twój Wincenty'];
  return (
    <g>
      <rect x="22" y="10" width="156" height="132" fill="#f4ecd4" stroke="#c9bd98" strokeWidth="1" />
      {rows.map((line, i) => (
        <text
          key={line}
          x={i === 0 ? 168 : i === 6 ? 150 : 34}
          y={i === 0 ? 26 : 44 + (i - 1) * 11}
          textAnchor={i === 0 ? 'end' : i === 6 ? 'end' : 'start'}
          fontSize="3.2"
          fill="#3d4a6b"
          style={HAND}
        >
          {line}
        </text>
      ))}
      <line x1="34" y1="124" x2="166" y2="124" stroke="#c9bd98" strokeWidth="0.5" />
    </g>
  );
}

export function ChestSvg({ id, className }: { id: ChestId; className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect width="200" height="150" fill="#f4f1ea" />
      {id === 'zegarek' && <Watch />}
      {id === 'legitymacja' && <Legitymacja />}
      {id === 'medal' && <Medal />}
      {id === 'list' && <Letter />}
    </svg>
  );
}
