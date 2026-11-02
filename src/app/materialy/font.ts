import { Atkinson_Hyperlegible } from 'next/font/google';

// Krój kartek: wysoka czytelność dla dzieci (rozróżnia I/l/1 i O/0).
// Osobny moduł, bo kartki pokazują się też poza działem (strony modułów kursów).
export const kartkaFont = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-kartka',
  display: 'swap',
});
