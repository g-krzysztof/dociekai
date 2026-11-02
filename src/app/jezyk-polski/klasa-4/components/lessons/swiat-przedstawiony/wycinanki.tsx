import type { Ikona, Rola } from './makieta';

/**
 * Papierowe wycinanki teatru (L18): proste sylwetki w polu 40 × 40, bez
 * zaokrągleń liczonych sin/cos (hydracja). Kolor papieru z `fill`, cień pod
 * papierem robi `drop-shadow` w CSS wołającego.
 */

const KSZTALTY: Record<Ikona, string> = {
  // tło
  wies: 'M3 36V24l7-7 7 7v12zM8 36v-6h4v6zM19 36V28l5-5 5 5v8zM30 36V22h7v14z',
  pole: 'M1 36c6-6 12-8 19-8s13 2 19 8zM6 30l2-8 2 8zM14 27l2-9 2 9zM24 27l2-9 2 9zM32 30l2-8 2 8z',
  stog: 'M6 36c0-12 5-20 10-20s10 8 10 20zM24 36c0-9 4-15 8-15s7 6 7 15z',
  las: 'M8 36V30H3l6-9H5l6-9 6 9h-4l6 9h-5v6zM24 36v-6h-6l7-10h-4l7-10 7 10h-4l7 10h-6v6z',
  woda: 'M1 26c5-3 8-3 13 0s8 3 13 0 8-3 12 0v10H1zM4 22c3-2 5-2 8 0M20 21c3-2 5-2 8 0',
  zamek: 'M4 36V18h4v-4h3v4h3V12h3v-3h6v3h3v6h3v-4h3v4h4v18H23v-8h-6v8z',
  lisc: 'M20 36V20M20 22C8 22 4 12 6 4c8 0 16 6 14 18zM20 26c10 0 15-6 14-14-7-1-14 4-14 14z',
  miasto: 'M2 36V20h6V14h5v22zM15 36V8h8v28zM25 36V18l5-6 5 6v18z',
  dom: 'M6 36V20L20 8l14 12v16H24v-9h-8v9z',
  grota: 'M1 36C3 18 11 8 20 8s17 10 19 28H28c-1-8-4-13-8-13s-7 5-8 13z',
  gory: 'M1 36l12-22 7 10 6-8 13 20z',
  pokoj: 'M3 36V6h34v30zM7 10v10h10V10zM24 36V22h9v14z',
  // postacie
  kaczka: 'M8 30c0-6 6-9 13-8l1-6c0-4 3-6 6-6s5 2 5 4l4 1-4 2c0 3-2 5-4 6 3 2 5 4 5 7 0 4-5 6-13 6S8 34 8 30z',
  bocian: 'M18 36V24M22 36V24M12 22c0-5 4-8 10-8l2-6c1-3 3-4 5-3l9 1-9 2-2 7c2 2 3 4 1 6-2 3-8 4-12 4s-6-1-6-3z',
  czlowiek: 'M20 4a5 5 0 1 1 0 10a5 5 0 1 1 0-10zM12 36V22c0-4 3-6 8-6s8 2 8 6v14h-5V26h-1v10h-4V26h-1v10z',
  krol: 'M14 3l2 4 4-4 4 4 2-4v7H14zM20 10a5 5 0 1 1 0 10a5 5 0 1 1 0-10zM10 36l3-13c1-3 4-4 7-4s6 1 7 4l3 13z',
  dziecko: 'M20 10a4 4 0 1 1 0 8a4 4 0 1 1 0-8zM14 36V25c0-3 2-5 6-5s6 2 6 5v11h-4v-7h-4v7z',
  wilk: 'M4 34l4-12 6-2 6-8 2 4 4-2 2 6 8 4-4 2v8h-4v-6h-14l-2 6z',
  zwierze: 'M4 34V24c0-4 4-6 10-6h12l4-4 5 2-3 4v14h-4v-8H12v8z',
  kon: 'M6 36V24c0-3 3-5 8-5h10l3-9 4-2 2 3-2 2 5 4-3 2-4-1v8h-3v14h-3V28H13v8z',
  ptak: 'M6 22c6-6 14-6 18-2l8-6 2 2-6 8c-2 6-8 9-14 8l-2 4h-3l2-5c-3-2-5-5-5-9z',
  // zdarzenia
  jajo: 'M20 4c7 0 12 12 12 20s-5 12-12 12-12-4-12-12S13 4 20 4zM10 22l4-3 3 4 3-4 3 4 3-4 4 3',
  piskle: 'M10 30c0-6 4-10 10-10l1-4c0-3 2-5 5-5s4 2 4 4l4 1-4 2c0 2-1 4-3 5 3 2 4 4 4 7H10zM6 34c4-3 10-4 14-4s10 1 14 4z',
  iskra: 'M20 2l4 12 12 2-10 6 4 14-10-8-10 8 4-14L4 16l12-2z',
};

/** Ogólna wycinanka dla roli (fraza bez ikony). */
const OGOLNE: Record<Rola, Ikona> = { tlo: 'dom', lampa: 'iskra', deski: 'czlowiek', tasma: 'iskra', narrator: 'iskra' };

export function Wycinanka({
  ikona,
  rola,
  className,
  fill = '#f5efe3',
}: {
  ikona?: Ikona;
  rola: Rola;
  className?: string;
  fill?: string;
}) {
  const d = KSZTALTY[ikona ?? OGOLNE[rola]];
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d={d} fill={fill} stroke="#5b4636" strokeWidth={1.1} strokeLinejoin="miter" fillRule="evenodd" />
    </svg>
  );
}

/** Ręka wystająca zza kulis (zwrócona w prawo; lustro przez `scale-x-[-1]`). */
export function RekaZaKulis({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden>
      <path
        d="M0 14h22l6-6c2-2 5-1 5 2l-3 5h22c3 0 3 4 0 4H36v2h16c3 0 3 4 0 4H36v2h13c3 0 3 4 0 4H35v2h10c3 0 3 4 0 4H24c-6 0-10-3-12-6H0z"
        fill="#f2d3b8"
        stroke="#5b4636"
        strokeWidth={1.1}
      />
      <path d="M0 12h14v24H0z" fill="#7c2d12" stroke="#5b4636" strokeWidth={1.1} />
    </svg>
  );
}

/** Lampa na sznurku: zgaszona szara, zapalona ciepła z poświatą. */
export function Lampa({ zapalona, className }: { zapalona: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 40 60" className={className} aria-hidden>
      <path d="M20 0v18" stroke="#5b4636" strokeWidth={1.2} />
      {zapalona && <circle cx={20} cy={36} r={16} fill="#fde68a" opacity={0.55} />}
      <path d="M10 30l4-12h12l4 12z" fill={zapalona ? '#f59e0b' : '#9ca3af'} stroke="#5b4636" strokeWidth={1.1} />
      <circle cx={20} cy={33} r={4} fill={zapalona ? '#fef3c7' : '#d1d5db'} stroke="#5b4636" strokeWidth={1} />
    </svg>
  );
}
