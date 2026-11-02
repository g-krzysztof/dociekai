import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMaterial, wariantyPdf } from '../../../data';
import type { WariantPdf } from '../../../data/types';
import { rozlozArkusze, StronaFiszek } from '../../../components/fiszki';
import { Sciaga } from '../../../components/sciaga';

/**
 * Wersja do druku — źródło PDF-ów (scripts/materialy-pdf.mjs). Strony A4
 * jedna pod drugą; generator wycina sam `[data-druk-root]` i drukuje.
 * Nie do indeksowania i nie do linkowania.
 */
export const metadata: Metadata = {
  title: 'Wersja do druku | DociekAI',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ przedmiot: string; slug: string }>;
  searchParams: Promise<{ wariant?: string }>;
};

export default async function DrukPage({ params, searchParams }: Props) {
  // Ta strona daje wydruk 1:1 z PDF-em, który wydajemy tylko z kontem, więc
  // poza `next dev` (z którego korzysta generator) jej nie ma.
  if (process.env.NODE_ENV === 'production') notFound();

  const { przedmiot, slug } = await params;
  const { wariant: w } = await searchParams;
  const material = getMaterial(przedmiot, slug);
  if (!material) notFound();
  const wariant: WariantPdf = w === 'skladane' ? 'skladane' : 'dwustronne';
  if (!wariantyPdf(material).includes(wariant)) notFound();

  const strony =
    material.rodzaj === 'sciaga'
      ? [<Sciaga key="s" sciaga={material} tryb="druk" />]
      : rozlozArkusze(material, wariant).map((s, i) => (
          <StronaFiszek key={i} zestaw={material} strona={s} wariant={wariant} />
        ));

  return (
    <div data-druk-root className="druk-podglad">
      {strony.map((s, i) => (
        <div key={i} className="druk-strona">
          {s}
        </div>
      ))}
      <style>{`
        @page { size: A4; margin: 0; }
        .druk-podglad { display: grid; gap: 24px; justify-content: center; padding: 32px 16px; background: #d9d6cf; }
        .druk-strona { width: 210mm; height: 297mm; overflow: hidden; box-shadow: 0 6px 24px rgb(0 0 0 / 0.2); }
        @media print {
          html, body { margin: 0; padding: 0; background: #fff; }
          .druk-podglad { display: block; padding: 0; background: none; }
          .druk-strona { box-shadow: none; break-after: page; }
          .druk-strona:last-child { break-after: auto; }
        }
      `}</style>
    </div>
  );
}
