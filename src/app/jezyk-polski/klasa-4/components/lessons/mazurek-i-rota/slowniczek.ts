/**
 * Słowniczek do hymnu i „Roty” (L9, blok 1) — jedyne „stuknij → przeczytaj”
 * w lekcji. Celowo **bez** dawnych form czasowników (`przejdziem`, `będziem`,
 * `złączym`): te dziecko odkrywa samo na takcie melodii.
 */
export const SLOWNICZEK: Record<string, { word: string; note: string }> = {
  'sl-przemoc': { word: 'przemoc', note: 'siła użyta wbrew komuś. „Co nam obca przemoc wzięła” — co zabrali nam obcy siłą.' },
  'sl-szabla': { word: 'szablą', note: 'szabla to dawna broń: długi, lekko wygięty miecz.' },
  'sl-dabrowski': {
    word: 'Dąbrowski',
    note: 'Jan Henryk Dąbrowski, generał. Dowodził polskimi legionami, które walczyły we Włoszech, gdy Polski nie było na mapie.',
  },
  'sl-wloskiej': { word: 'z ziemi włoskiej', note: 'z Włoch — tam stały legiony, kiedy powstała ta pieśń.' },
  'sl-przewodem': { word: 'za twoim przewodem', note: 'pod twoim dowództwem, idąc za tobą.' },
  'sl-bonaparte': {
    word: 'Bonaparte',
    note: 'Napoleon Bonaparte, wódz Francuzów. Legioniści uczyli się od niego, jak wygrywać bitwy.',
  },
  'sl-pogrzesc': { word: 'pogrześć', note: 'dawna forma słowa „pogrzebać”. „Nie damy pogrześć mowy” — nie pozwolimy, żeby nasz język zniknął.' },
  'sl-szczep': { word: 'szczep', note: 'ród, z którego ktoś pochodzi. Piastowie to pierwsi królowie Polski.' },
};
