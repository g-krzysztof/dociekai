/**
 * L11 blok 3 — rysunki rzeczy w scenie lustra (kod, nie generator): każda
 * w stanie z podpisu (`tak`) i w stanie przeciwnym (`przeciw`).
 */

const INK = '#52525b';

export function RzeczSvg({ id, przeciw, className }: { id: string; przeciw: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
      {id === 'kubek' && (
        <>
          <path d="M41 26 h5 a6 6 0 0 1 0 12 h-5" />
          {!przeciw && <rect x={16} y={21} width={25} height={30} fill="#a16207" stroke="none" opacity={0.75} />}
          <path d="M15 18 h27 v32 a3 3 0 0 1 -3 3 h-21 a3 3 0 0 1 -3 -3 z" />
          {!przeciw && <path d="M22 13 q2 -3 0 -6 M30 13 q2 -3 0 -6" strokeWidth={1.5} />}
        </>
      )}
      {id === 'okno' && (
        <>
          <rect x={12} y={8} width={36} height={44} fill="#e0f2fe" />
          {przeciw ? (
            <>
              <rect x={14} y={10} width={32} height={40} fill="#bae6fd" stroke="none" />
              <path d="M30 8 v44 M12 30 h36" />
            </>
          ) : (
            <>
              <path d="M12 8 l-8 6 v32 l8 6" fill="#bae6fd" />
              <path d="M48 8 l8 6 v32 l-8 6" fill="#bae6fd" />
              <path d="M22 40 q8 -10 16 0" stroke="#16a34a" strokeWidth={1.5} />
            </>
          )}
        </>
      )}
      {id === 'wieza' &&
        (przeciw ? (
          <path d="M20 54 v-14 h4 v-4 h4 v4 h4 v-4 h4 v4 h4 v14 z" fill="#e7e5e4" />
        ) : (
          <>
            <path d="M22 54 v-44 h3 v-4 h3 v4 h4 v-4 h3 v4 h3 v44 z" fill="#e7e5e4" />
            <rect x={28} y={20} width={4} height={6} />
          </>
        ))}
      {id === 'pora' &&
        (przeciw ? (
          <>
            <rect x={4} y={6} width={52} height={40} fill="#312e81" stroke="none" opacity={0.85} />
            <path d="M38 14 a9 9 0 1 0 6 15 a7 7 0 1 1 -6 -15 z" fill="#fde68a" stroke="none" />
            <path d="M14 14 l1 2 M22 24 l1 2 M12 32 l1 2" stroke="#fde68a" />
            <path d="M4 46 h52" />
          </>
        ) : (
          <>
            <rect x={4} y={6} width={52} height={40} fill="#fef3c7" stroke="none" />
            <path d="M14 46 a10 10 0 0 1 20 0" fill="#fbbf24" stroke="#d97706" />
            <path d="M24 30 v-6 M14 34 l-4 -4 M34 34 l4 -4" stroke="#d97706" />
            <path d="M4 46 h52" />
          </>
        ))}
      {id === 'herbata' && (
        <>
          <path d="M18 20 l4 30 h16 l4 -30 z" fill={przeciw ? '#fde68a' : '#d97706'} fillOpacity={przeciw ? 0.5 : 0.6} />
          <circle cx={30} cy={30} r={4} fill="#fef08a" stroke="#ca8a04" strokeWidth={1.2} />
          {przeciw ? (
            <>
              <rect x={23} y={36} width={6} height={6} fill="#e0f2fe" strokeWidth={1.2} />
              <rect x={31} y={40} width={6} height={6} fill="#e0f2fe" strokeWidth={1.2} />
              <path d="M48 8 v10 M43 13 h10 M44.5 9.5 l7 7 M51.5 9.5 l-7 7" stroke="#0284c7" strokeWidth={1.3} />
            </>
          ) : (
            <path d="M24 16 q2 -4 0 -8 M30 16 q2 -4 0 -8 M36 16 q2 -4 0 -8" strokeWidth={1.5} />
          )}
        </>
      )}
      {id === 'drzwi' && (
        <>
          <rect x={30} y={8} width={22} height={44} fill="#e7e5e4" />
          <circle cx={47} cy={31} r={1.5} fill={INK} />
          {przeciw ? <path d="M26 31 h-20 M12 25 l-6 6 l6 6" stroke="#16a34a" strokeWidth={2.5} /> : <path d="M4 31 h20 M18 25 l6 6 l-6 6" stroke="#16a34a" strokeWidth={2.5} />}
        </>
      )}
    </svg>
  );
}
