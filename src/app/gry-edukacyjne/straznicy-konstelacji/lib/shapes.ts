export type ShapeId =
  | 'kolo'
  | 'trojkat'
  | 'kwadrat'
  | 'prostokat'
  | 'pieciokat'
  | 'szesciokat'
  | 'nieregularny-a'
  | 'nieregularny-b'
  | 'nieregularny-c'
  | 'nieregularny-d';

/** Liczba boków — tylko dla figur o prostych bokach (koło jest celowo pominięte). */
export const SHAPE_SIDES: Partial<Record<ShapeId, number>> = {
  trojkat: 3,
  kwadrat: 4,
  prostokat: 4,
  pieciokat: 5,
  szesciokat: 6,
  'nieregularny-a': 4,
  'nieregularny-b': 5,
  'nieregularny-c': 6,
  'nieregularny-d': 4,
};

const IRREGULAR_POINTS: Record<string, string> = {
  'nieregularny-a': '30,18 80,28 68,82 18,58',
  'nieregularny-b': '50,10 84,34 72,84 34,86 14,42',
  'nieregularny-c': '34,8 72,14 90,46 70,90 32,82 10,44',
  'nieregularny-d': '18,26 76,14 86,68 42,90 22,62',
};

/** Figury foremne — punkty liczone raz, przy starcie modułu (stałe kąty wejściowe, brak losowości). */
function regularPolygonPoints(sides: number, radius: number, rotationDeg: number): string {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angleRad = ((rotationDeg + (360 / sides) * i) * Math.PI) / 180;
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

export type ShapeGeometry = { type: 'circle' } | { type: 'polygon'; points: string };

/** Geometria w viewBox 0 0 100 100, wyśrodkowana na (50,50). */
export function shapeGeometry(id: ShapeId): ShapeGeometry {
  switch (id) {
    case 'kolo':
      return { type: 'circle' };
    case 'trojkat':
      return { type: 'polygon', points: regularPolygonPoints(3, 36, -90) };
    case 'kwadrat':
      return { type: 'polygon', points: regularPolygonPoints(4, 32, -45) };
    case 'prostokat':
      return { type: 'polygon', points: '18,32 82,32 82,68 18,68' };
    case 'pieciokat':
      return { type: 'polygon', points: regularPolygonPoints(5, 34, -90) };
    case 'szesciokat':
      return { type: 'polygon', points: regularPolygonPoints(6, 34, -90) };
    default:
      return { type: 'polygon', points: IRREGULAR_POINTS[id] };
  }
}

/** Cztery kategorie kształtów rundy "typ" — każda ma jednoznaczny, nieprzecinający się dok. */
export const TYP_SHAPES: ShapeId[] = ['kolo', 'trojkat', 'kwadrat', 'prostokat'];
/** Koło celowo wykluczone — nie ma "boków" do policzenia. */
export const BOKI_SHAPES: ShapeId[] = ['trojkat', 'kwadrat', 'prostokat', 'pieciokat', 'szesciokat'];
export const SYMMETRIC_SHAPES: ShapeId[] = ['kolo', 'trojkat', 'kwadrat', 'prostokat', 'pieciokat', 'szesciokat'];
export const ASYMMETRIC_SHAPES: ShapeId[] = ['nieregularny-a', 'nieregularny-b', 'nieregularny-c', 'nieregularny-d'];

export type CrystalVisual = { kind: 'shape'; shapeId: ShapeId } | { kind: 'angle'; degrees: number; mirrored: boolean };
