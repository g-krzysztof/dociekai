/**
 * Odmiana rzeczownika po liczebniku — implementacja przeniosła się do
 * `@/lib/plural`, gdy drugim konsumentem stała się seria nauki (obiekt ponad
 * kursami, więc nie mógł importować z wnętrza matematyki). Re-eksport zostaje,
 * bo importuje ją stąd kilkadziesiąt widżetów tego kursu.
 */
export { plural, type PluralForms } from '@/lib/plural';
