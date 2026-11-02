/** Pisarnia (E3) — analizator tekstu dziecka. Lekcje importują stąd, pole tekstowe z `components/pisarnia/`. */
export * from './types';
export { analyze, buildMarks, findConnector, issuesOf, wordSimilarity, ISSUE_TEXT, REPEAT_STOPWORDS } from './analyze';
export type { MarkOptions } from './analyze';
export { compilePalette, findPaletteHits, usedEntries, usedGroups } from './palette';
export { segment, splitChildSentences, ALWAYS_GLUED } from './segment';
