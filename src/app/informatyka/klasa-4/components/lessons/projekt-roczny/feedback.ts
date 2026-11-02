/**
 * Kategorie opinii testera — te same w bloku „Test u Zosi i taty” (rozpoznajesz
 * je na przykładzie kogoś innego) i w dzienniku testów w zadaniu (zapisujesz
 * je po swoich własnych testerach). Zamknięta lista zamiast wolnego tekstu —
 * dowolne słowa dziecka i tak nie dałyby się nigdzie sprawdzić, a te same
 * cztery kłopoty wracają w każdym niedopracowanym projekcie.
 */

export interface FeedbackCategory {
  id: string;
  label: string;
}

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  { id: 'start', label: 'Nie wiedział/a, co robić na starcie' },
  { id: 'utknal', label: 'Utknął/utknęła w jednym miejscu' },
  { id: 'wynik', label: 'Nie było jasne, czy wygrał/przegrał' },
  { id: 'zgadywal', label: 'Klikał/a na chybił trafił, nie czytając' },
  { id: 'ok', label: 'Wszystko jasne, zagrał/a bez problemu' },
];
