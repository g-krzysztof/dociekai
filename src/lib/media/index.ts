import map from './map.json';

/**
 * Mapowanie „ścieżka w repo" -> hostowany obraz (Cloudinary, wgrany przez Strapi).
 *
 * Dlaczego mapa, a nie wklejony URL w JSX:
 * - podmiana obrazka (skill `/replace`) to jedna linia w `map.json`, nie edycja komponentów,
 * - kluczem zostaje dotychczasowa ścieżka `/images/...`, więc migracja to codemod
 *   `src="…"` -> `src={img('…')}`, a brakujące klucze same wracają do pliku lokalnego,
 * - w bundlu ląduje tylko `public id` (~40 znaków), nie pełny URL z wersją.
 *
 * `map.json` jest generowany przez `scripts/media/upload-image.mjs` razem z
 * `manifest.json` (wymiary, sha256, id w Strapi) — manifestu NIE importuj w kodzie
 * aplikacji, to metadane narzędziowe i niepotrzebnie urosłyby bundle.
 */

type MediaMap = {
  /** Prefiks URL-a Cloudinary, np. `https://res.cloudinary.com/<cloud>/image/upload`. */
  base: string;
  /** `/images/matematyka/lekcje/skala/atlas.jpg` -> `matematyka_lekcje_skala_atlas_ab12cd.jpg` */
  images: Record<string, string>;
};

const media = map as MediaMap;

/**
 * Zwraca URL obrazu do `<Image src={…}>`. Dla klucza spoza mapy oddaje ścieżkę
 * bez zmian — dzięki temu migrację można prowadzić partiami, a nieprzeniesiony
 * jeszcze obrazek dalej działa z `public/`.
 */
export function img(path: string): string {
  const publicId = media.images[path];
  return publicId ? `${media.base}/${publicId}` : path;
}

/** Czy dany obraz jest już hostowany poza repo (przydatne w testach migracji). */
export function isHosted(path: string): boolean {
  return Boolean(media.images[path]);
}

/** Wszystkie klucze w mapie — używane przez skrypty sprawdzające spójność. */
export function hostedKeys(): string[] {
  return Object.keys(media.images);
}

/**
 * Przepuszcza przez `img()` wszystkie wartości mapy obrazów lekcji — lekcje trzymają
 * ścieżki w obiekcie `IMAGES`, więc migracja to owinięcie go jednym wywołaniem
 * zamiast edycji każdego `<Image src>` z osobna.
 */
export function imgMap<T extends Record<string, string>>(paths: T): T {
  return Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, img(value)])) as T;
}
