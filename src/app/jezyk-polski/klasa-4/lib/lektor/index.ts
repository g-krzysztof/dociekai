/** Lektor (E4a) — nagrania klip-na-zdanie. Lekcje importują stąd, pasek z `components/lektor/`. */
export * from './types';
export { useLektor } from './use-lektor';
export type { Lektor, LektorOptions, LektorStatus } from './use-lektor';
export { staleClips, formatMs } from './stale';
