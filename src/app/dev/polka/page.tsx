import { notFound } from 'next/navigation';
import { PolkaDemo } from './polka-demo';

/**
 * Harness widoków Półki, Teczki i książeczki (E5c kursu polskiego). Tylko w dev.
 */
export default function PolkaDevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <PolkaDemo />;
}
