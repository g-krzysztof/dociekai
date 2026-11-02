import { notFound } from 'next/navigation';
import { PisarniaDemo } from './pisarnia-demo';

/**
 * Harness Pisarni (pole tekstowe z analizatorem pisania, E3 kursu polskiego):
 * swobodne pisanie z diagnostyką, paleta uczuć, słowa-oskarżenia i zadanie
 * z werdyktem. Tylko w dev — do ręcznego i Playwrightowego sprawdzania.
 */
export default function PisarniaDevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <PisarniaDemo />;
}
