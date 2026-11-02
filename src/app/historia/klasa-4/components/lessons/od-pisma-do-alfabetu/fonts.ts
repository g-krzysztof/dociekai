import { Noto_Sans_Egyptian_Hieroglyphs, Noto_Sans_Phoenician } from 'next/font/google';

/** Prawdziwe znaki dawnych pism z fontów Noto (licencja OFL) — nigdy z generatora obrazów. */
export const phoenicianFont = Noto_Sans_Phoenician({
  weight: '400',
  subsets: ['phoenician'],
  display: 'swap',
});

export const hieroglyphFont = Noto_Sans_Egyptian_Hieroglyphs({
  weight: '400',
  subsets: ['egyptian-hieroglyphs'],
  display: 'swap',
});
