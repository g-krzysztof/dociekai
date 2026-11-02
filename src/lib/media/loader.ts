import type { ImageLoaderProps } from 'next/image';

/**
 * Custom loader dla `next/image` (podpięty w next.config.ts przez `images.loaderFile`).
 *
 * Cel: całkowicie ominąć optymalizator Vercela, który rozlicza się per transformacja
 * (5 tys./mies. na Hobby) i re-transformuje obrazy lokalne co najwyżej co 31 dni.
 *
 * - URL z Cloudinary  -> wstawiamy transformację `f_auto,q_auto,c_limit,w_<width>`
 *   i obraz leci prosto z CDN-u Cloudinary; Vercel nie widzi go w ogóle.
 * - cokolwiek innego  -> zwracamy `src` bez zmian, czyli plik statyczny z `public/`
 *   serwowany jak zwykły asset (immutable cache z `headers()` w next.config.ts).
 *
 * Uwaga dev-only: dla ścieżek lokalnych Next loguje ostrzeżenie
 * „has a 'loader' property that does not implement width". Znika po dodaniu
 * `unoptimized` na danym `<Image>`; nie ma wpływu na produkcję.
 */

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\/(.+)$/;

/**
 * Czy pierwszy segment po `/upload/` to już gotowa transformacja Cloudinary
 * (np. `w_500,c_fill`), a nie wersja `v123…` ani sam public id z rozszerzeniem.
 * Jeśli tak — ktoś zbudował URL świadomie i nie doklejamy drugiej transformacji.
 */
function hasExplicitTransformation(segment: string): boolean {
  if (/^v\d+$/.test(segment)) return false;
  if (/\.[a-z0-9]{2,5}$/i.test(segment)) return false;
  return /(^|,)[a-z]{1,3}_[^,/]+/.test(segment);
}

export default function mediaLoader({ src, width, quality }: ImageLoaderProps): string {
  const match = CLOUDINARY_UPLOAD.exec(src);
  if (!match) return src;

  const [, base, rest] = match;
  if (hasExplicitTransformation(rest.split('/')[0])) return src;

  // `q_auto` gdy komponent nie podał jawnie `quality` — Cloudinary dobiera
  // kompresję per obraz lepiej niż sztywna liczba.
  const transformation = ['f_auto', `q_${quality ?? 'auto'}`, 'c_limit', `w_${width}`].join(',');
  return `${base}/${transformation}/${rest}`;
}
