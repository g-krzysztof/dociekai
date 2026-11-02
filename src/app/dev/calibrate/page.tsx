import { notFound } from 'next/navigation';
import { CoordinateCalibrator } from '@/components/dev/coordinate-calibrator';
import { img } from '@/lib/media';

/**
 * Harness dla `<CoordinateCalibrator>` — obrazek i punkty poniżej to
 * bieżące zadanie (14 miejsc na zdjęciu dwóch pięści w przewodniku
 * „Kalendarz"). Żeby skalibrować coś innego w przyszłości: podmień
 * `imageSrc`, `aspectRatio` i `points` na własne — sam kalibrator jest
 * całkowicie generyczny, patrz jego komentarz w
 * `src/components/dev/coordinate-calibrator.tsx`.
 */
export default function CalibratePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <CoordinateCalibrator
      imageSrc={img('/images/matematyka/przewodniki/kalendarz/dwie-piesci-kostki.jpg')}
      imageAlt="Dwie zaciśnięte pięści złączone kostkami wskazujących palców, widziane z góry"
      aspectRatio="4 / 3"
      markerColor="#0891b2"
      initialPoints={[
        { id: '0', label: 'I', x: 18, y: 44 },
        { id: '1', label: 'II', x: 22.8, y: 49 },
        { id: '2', label: 'III', x: 27.7, y: 43 },
        { id: '3', label: 'IV', x: 32.5, y: 49 },
        { id: '4', label: 'V', x: 37.3, y: 43 },
        { id: '5', label: 'VI', x: 42.2, y: 48 },
        { id: '6', label: 'VII', x: 47, y: 44 },
        { id: '7', label: 'VIII', x: 53, y: 44 },
        { id: '8', label: 'IX', x: 57.8, y: 48 },
        { id: '9', label: 'X', x: 62.7, y: 43 },
        { id: '10', label: 'XI', x: 67.5, y: 49 },
        { id: '11', label: 'XII', x: 72.3, y: 43 },
        { id: '12', label: '–', x: 77.2, y: 49 },
        { id: '13', label: '–', x: 82, y: 44 },
      ]}
    />
  );
}
