/**
 * Karta „ilustracja + wprowadzenie w krok" została wypromowana do
 * `src/components/ui/lesson-image-card.tsx`, gdy kurs `/informatyka` stał się jej
 * drugim konsumentem („promote on second use"). Ten plik zostaje jako re-eksport,
 * żeby 60+ lekcji matematyki importujących ją przez `'../../lesson-image-card'`
 * działało bez zmiany — dokładnie tak jak `useSectionScrollAnchor` w powłoce.
 */
export {
  LessonImageCard,
  type LessonImageCardProps,
} from '@/components/ui/lesson-image-card';
