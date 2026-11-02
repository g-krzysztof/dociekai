/**
 * Geometria wirtualnego cyrkla: w odróżnieniu od `AngleBuilder` (kąt 0–180°,
 * pojedynczy odczyt pozycji kursora) ten widżet musi śledzić PEŁNY obrót
 * (0–360°, bez granic) i wiedzieć, ile stopni dziecko już naprawdę obeszło —
 * sama pozycja kursora w danej klatce (`pointerAngle`) nie wystarczy, bo przy
 * przejściu przez 0°/360° się zawija. Dlatego postęp liczy się przyrostowo:
 * każdy ruch dokłada najkrótszy możliwy krok (`shortestDelta`) do sumy, więc
 * cofnięcie kursora naprawdę cofa narysowany łuk („żaden
 * klik nie jest złym kliknięciem" — tu to „żaden ruch nie jest złym ruchem").
 */

import { round, type GeoPoint } from '../../../lib/lines';

/** Kąt kursora względem środka, 0–360°, rosnący zgodnie z ruchem wskazówek zegara (ta sama konwencja co `pointOnCircle`). */
export function pointerAngle(center: GeoPoint, pointer: GeoPoint): number {
  const dx = pointer.x - center.x;
  const dy = pointer.y - center.y;
  const raw = (Math.atan2(dy, dx) * 180) / Math.PI;
  return raw < 0 ? raw + 360 : raw;
}

/** Najkrótsza droga (w stopniach, ze znakiem) z `from` do `to` — nigdy dłuższa niż pół obrotu, więc przejście przez 0°/360° liczy się jako mały krok, nie skok o ~360°. */
export function shortestDelta(from: number, to: number): number {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

export interface CompassArc {
  path: string;
  /** Punkt aktualnej pozycji grota ołówka na okręgu. */
  tip: GeoPoint;
}

/**
 * Ścieżka SVG dla narysowanego już łuku, od 0° do `sweptDeg`. Pełny obrót
 * (>=359.5°) nie da się narysować jako jeden łuk `A` (start = koniec), więc
 * przy niemal zamkniętym okręgu wywołujący renderuje zamiast tego zwykły
 * `<circle>` — patrz `CompassDraw`.
 */
export function buildSweptArc(center: GeoPoint, radius: number, sweptDeg: number): CompassArc {
  const clamped = Math.max(0, Math.min(359.5, sweptDeg));
  const startRad = 0;
  const endRad = (clamped * Math.PI) / 180;
  const start: GeoPoint = { x: round(center.x + Math.cos(startRad) * radius), y: round(center.y + Math.sin(startRad) * radius) };
  const tip: GeoPoint = { x: round(center.x + Math.cos(endRad) * radius), y: round(center.y + Math.sin(endRad) * radius) };
  const largeArc = clamped > 180 ? 1 : 0;
  return {
    path: `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${tip.x} ${tip.y}`,
    tip,
  };
}
