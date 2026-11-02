import { CodingCourse } from './coding-course';

export const metadata = {
  title: 'Kurs Kodowania dla Dzieci | Dociekai.pl',
  description:
    'Kompletny kurs kodowania dla dzieci. Naucz się programowania od podstaw poprzez interaktywne lekcje i projekty.',
  openGraph: {
    title: 'Kurs Kodowania dla Dzieci | Dociekai.pl',
    description:
      'Kompletny kurs kodowania dla dzieci. Naucz się programowania od podstaw poprzez interaktywne lekcje i projekty.',
    url: 'https://dociekai.pl/coding-course',
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function CodingCoursePage() {
  return <CodingCourse />;
}
