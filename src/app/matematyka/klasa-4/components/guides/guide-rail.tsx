'use client';

import { useGuide } from './guide-shell';

/**
 * Szyna rozdziałów przewodnika — pionowy rząd kropek przy prawej krawędzi,
 * spięty cienką pionową kreską (ten sam "spine" co na osi modułów huba) —
 * bez niej same 8px kropki na szerokim ekranie gubiły się w pustym
 * marginesie poza kolumną treści. Etykieta aktywnego rozdziału jest zawsze
 * widoczna (nie tylko na hover jak pozostałe) — to ona, nie sama kropka, ma
 * być pierwszą rzeczą, którą kątem oka złapie użytkownik.
 *
 * Tylko od `xl` w górę — niżej rolę orientacji pełni licznik „Rozdział N z M”
 * w przyklejonym pasku.
 */
export function GuideRail() {
  const { acts, visited, activeId, color } = useGuide();
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <nav
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex"
      aria-label="Rozdziały przewodnika"
    >
      <span
        aria-hidden
        className="absolute right-[3px] top-1 bottom-1 w-px"
        style={{ backgroundColor: `${color}26` }}
      />
      {acts.map((act) => {
        const isActive = act.id === activeId;
        const seen = visited.includes(act.id);
        return (
          <a
            key={act.id}
            href={`#${act.id}`}
            className="group relative flex items-center justify-end gap-2"
            aria-current={isActive ? 'true' : undefined}
          >
            <span
              className={
                'pointer-events-none whitespace-nowrap text-xs font-semibold transition-opacity group-focus-visible:opacity-100' +
                (isActive ? '' : ' opacity-0 group-hover:opacity-100')
              }
              style={{ color: textColor }}
            >
              {act.label}
            </span>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full border-2 bg-background transition-transform"
              style={{
                borderColor: isActive ? color : seen ? `${color}80` : `${color}40`,
                backgroundColor: isActive ? color : undefined,
                transform: isActive ? 'scale(1.5)' : undefined,
              }}
            />
            <span className="sr-only">{act.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
