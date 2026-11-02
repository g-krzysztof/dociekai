/**
 * Jedna czysta funkcja karmi walidację `ConstructionBoard` — tak samo jak
 * `geo-shape.ts` karmi wizual. `validateFigure()` sprawdza, czy narysowana
 * figura (typ + para kliknięć) zgadza się z celem rundy, z czytelnym
 * komunikatem błędu (zły typ, zła para, zły kierunek półprostej).
 */

export type FigureType = 'odcinek' | 'polprosta' | 'prosta';

export interface DrawnFigure {
  type: FigureType;
  /** Etykieta pierwszego klikniętego punktu (dla półprostej: początek). */
  from: string;
  /** Etykieta drugiego klikniętego punktu (dla półprostej: punkt, przez który przechodzi). */
  through: string;
}

export interface FigureTarget {
  type: FigureType;
  start: string;
  through: string;
}

export function figureTypeName(type: FigureType): string {
  switch (type) {
    case 'odcinek':
      return 'odcinek';
    case 'polprosta':
      return 'półprosta';
    case 'prosta':
      return 'prosta';
  }
}

/** Narzędnik ("To X, a miało być [narzędnik]"). */
export function figureTypeInstrumental(type: FigureType): string {
  switch (type) {
    case 'odcinek':
      return 'odcinkiem';
    case 'polprosta':
      return 'półprostą';
    case 'prosta':
      return 'prostą';
  }
}

/**
 * Walidacja narysowanej figury względem celu rundy. Dla odcinka i prostej
 * kolejność punktów jest obojętna; dla półprostej kluczowy jest początek
 * (`from` musi być `target.start`) — stąd pułapka "półprosta AB ≠ BA".
 */
export function validateFigure(
  target: FigureTarget,
  drawn: DrawnFigure
): { correct: boolean; message: string } {
  const samePair =
    (drawn.from === target.start && drawn.through === target.through) ||
    (drawn.from === target.through && drawn.through === target.start);

  if (drawn.type !== target.type) {
    return {
      correct: false,
      message: `To ${figureTypeName(drawn.type)}, a miało być ${figureTypeInstrumental(target.type)}.`,
    };
  }

  if (drawn.type === 'polprosta') {
    if (drawn.from === target.start && drawn.through === target.through) {
      return { correct: true, message: '' };
    }
    return {
      correct: false,
      message: `Ta półprosta zaczyna się w punkcie ${drawn.from}, a miała zaczynać się w punkcie ${target.start}.`,
    };
  }

  if (!samePair) {
    if (drawn.type === 'odcinek') {
      return {
        correct: false,
        message: `To odcinek łączący punkty ${drawn.from} i ${drawn.through}, a miał łączyć punkty ${target.start} i ${target.through}.`,
      };
    }
    return {
      correct: false,
      message: `To prosta przez punkty ${drawn.from} i ${drawn.through}, a miała przechodzić przez punkty ${target.start} i ${target.through}.`,
    };
  }

  return { correct: true, message: '' };
}
