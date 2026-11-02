import { notFound } from 'next/navigation';
import { KorpusDemo } from './korpus-demo';

/**
 * Harness silnika `korpus` (tekst z adnotacją, E2 kursu polskiego): para
 * stuknięć „wypowiedź → dowód”, zakreślacz, luki z żetonami i wiersz z „my”
 * w końcówkach. Tylko w dev — do sprawdzania gestów w przeglądarce.
 */
export default function KorpusDevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <KorpusDemo />;
}
