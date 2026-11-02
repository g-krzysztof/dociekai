/**
 * Z pinezek (rdzeń + osobiste) do punktów na osi w danym trybie — czysta funkcja.
 */

import { anchorAstro, formatDating, toAstro, type Dating } from './dating';
import { PERSONAL_ROLES, type PersonalPins, type PersonalRole } from './personal-storage';
import type { TimelinePin } from './pins';
import { astroToU, gapU, isBeforeRange, type TimelineMode } from './scale';
import type { PlacedPin } from './judge';

export type AxisPinVariant = 'core' | 'personal' | 'uncertain' | 'legend';

export interface AxisPin {
  id: string;
  label: string;
  /** Datowanie po polsku, np. „ok. 2500 p.n.e.”. */
  when: string;
  astro: number;
  u: number;
  afterGap: boolean;
  /** Wcześniej niż lewy koniec trybu — rysowane przy krawędzi ze strzałką. */
  beforeRange: boolean;
  variant: AxisPinVariant;
  /** Pinezka „bez daty” — pas mgły na osi (`u` obu końców, jak `u` pinezki). */
  mist?: { fromU: number; toU: number; fromAfterGap: boolean; toAfterGap: boolean };
}

export function toAxisPin(
  pin: { id: string; label: string; dating: Dating; uncertain?: boolean; mist?: { from: number; to: number; when: string } },
  mode: TimelineMode,
  now: number,
  variant?: AxisPinVariant
): AxisPin {
  const astro = anchorAstro(pin.dating, now);
  const u = astroToU(astro, mode, now);
  return {
    id: pin.id,
    label: pin.uncertain ? `${pin.label}?` : pin.label,
    when: pin.mist ? pin.mist.when : formatDating(pin.dating),
    astro,
    u,
    afterGap: u > gapU(mode, now),
    beforeRange: isBeforeRange(astro, mode, now),
    variant: variant ?? (pin.mist ? 'legend' : pin.uncertain ? 'uncertain' : 'core'),
    mist: pin.mist
      ? (() => {
          const fromU = astroToU(toAstro(pin.mist.from), mode, now);
          const toU = astroToU(toAstro(pin.mist.to), mode, now);
          const g = gapU(mode, now);
          return { fromU, toU, fromAfterGap: fromU > g, toAfterGap: toU > g };
        })()
      : undefined,
  };
}

/** Id pinezki osobistej na osi — stały prefiks, żeby nie zderzył się z rdzeniem. */
export const personalPinId = (role: PersonalRole) => `osobista-${role}`;

export function personalAxisPins(personal: PersonalPins, mode: TimelineMode, now: number): AxisPin[] {
  return (Object.keys(personal) as PersonalRole[]).map((role) => {
    const year = personal[role]!;
    return toAxisPin(
      {
        id: personalPinId(role),
        label: role === 'ja' ? 'rok moich urodzin' : `rok urodzin: ${PERSONAL_ROLES[role]}`,
        dating: { kind: 'year', year },
      },
      mode,
      now,
      'personal'
    );
  });
}

/** Rdzeń + osobiste, posortowane w czasie. */
export function buildAxisPins(
  core: TimelinePin[],
  personal: PersonalPins,
  mode: TimelineMode,
  now: number
): AxisPin[] {
  return [...core.map((pin) => toAxisPin(pin, mode, now)), ...personalAxisPins(personal, mode, now)].sort(
    (a, b) => a.astro - b.astro
  );
}

export function toPlaced(pin: AxisPin): PlacedPin {
  return { id: pin.id, label: pin.label, when: pin.when, astro: pin.astro, u: pin.u };
}
