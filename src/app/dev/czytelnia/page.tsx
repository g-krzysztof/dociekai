import { notFound } from 'next/navigation';
import { CzytelniaDemo } from './czytelnia-demo';

/**
 * Harness Czytelni, Półki i Teczki (E5a–E5b kursu polskiego): czytnik odcinka
 * z narzędziami czytania i zakładką, podgląd zapisu Półki i próbna kartka w Teczce.
 * Tylko w dev.
 */
export default function CzytelniaDevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <CzytelniaDemo />;
}
