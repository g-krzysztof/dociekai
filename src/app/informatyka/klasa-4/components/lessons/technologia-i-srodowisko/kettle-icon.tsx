import type { SVGProps } from 'react';

/**
 * Czajnik w stylu ikon `lucide-react` (24 × 24, kreska 2) — lucide czajnika nie
 * ma, a w tej lekcji czajnik jest miarką, więc wraca w każdym bloku.
 */
export function KettleIcon({ className, style, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
      {...rest}
    >
      <path d="M6 20h11" />
      <path d="M7 20 8.2 9h6.6L16 20" />
      <path d="M8.2 9c.4-2 1.7-3 3.3-3s2.9 1 3.3 3" />
      <path d="M11.5 6V4.5" />
      <path d="M15.4 11.5h1.8a2 2 0 0 1 0 4h-1.3" />
      <path d="M8.3 11 5 8.5" />
    </svg>
  );
}
