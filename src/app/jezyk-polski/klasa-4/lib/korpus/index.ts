/** Silnik `korpus` (E2) — tekst z adnotacją. Lekcje importują stąd, komponenty z `components/korpus/`. */
export * from './types';
export { buildKorpus } from './parse';
export { tokenize, sentenceBreaks, splitSentences, ABBREVIATIONS } from './split';
export { schoolPos, tagClass, tagHas, isFirstPersonPlural } from './pos';
export * from './judges';
