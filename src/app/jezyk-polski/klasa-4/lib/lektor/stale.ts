import type { Korpus } from '../korpus/types';
import type { LektorManifest, SpeechOverrides } from './types';

/**
 * Nagrania, które nie pasują już do tekstu lekcji: zdanie zmieniono po nagraniu,
 * dopisano nowe (brak klipu) albo usunięto (klip bez zdania). Pusty wynik =
 * nagrania aktualne. Selftest lekcji powinien to sprawdzać, a `LektorBar`
 * ostrzega w dev.
 */
export function staleClips(
  manifest: LektorManifest,
  korpus: Korpus,
  speech: SpeechOverrides = {},
): { id: string; reason: 'zmienione' | 'brak-nagrania' | 'brak-zdania' }[] {
  const out: { id: string; reason: 'zmienione' | 'brak-nagrania' | 'brak-zdania' }[] = [];
  const byId = new Map(manifest.clips.map((c) => [c.id, c]));
  for (const unit of korpus.units) {
    const clip = byId.get(unit.id);
    if (!clip) out.push({ id: unit.id, reason: 'brak-nagrania' });
    else if (clip.text !== (speech[unit.id] ?? unit.text)) out.push({ id: unit.id, reason: 'zmienione' });
  }
  for (const clip of manifest.clips) {
    if (!korpus.unitById[clip.id]) out.push({ id: clip.id, reason: 'brak-zdania' });
  }
  return out;
}

/** Czas w formacie „0:42” (dla paska i dla tekstu „nagranie trwa…”). */
export function formatMs(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
