'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SwiperNav, { SwiperNavItem } from '@/components/swiper-nav';
import { useState } from 'react';

interface Lesson {
  id: number;
  title: string;
  description: string;
  detail: string;
  badge?: string;
  url?: string;
  icon?: string;
}

const lessons: Lesson[] = [
  // { id: 0, title: 'Wstęp', description: 'Wybierz lekcję!', detail: 'polecamy rozpocząć od pierwszego zagadnienia', badge: 'ruszaj! =>', url: '/coding-course/lesson01' },
  {
    id: 1,
    title: 'Lekcja 1',
    badge: '⭐',
    description: 'Wprowadzenie do programowania, zaczynamy!',
    detail: 'Poznaj podstawy kodowania i stwórz swój pierwszy program',
    url: '/coding-course/lesson01',
    icon: 'code',
  },
  {
    id: 2,
    title: 'Lekcja 2',
    badge: '⭐',
    description: 'Błędy czasem się zdarzają - jak je znaleźć i naprawić',
    detail: 'Naucz się znajdować i naprawiać błędy w programach',
    url: '/coding-course/lesson02',
    icon: 'bug',
  },
  {
    id: 3,
    title: 'Lekcja 3',
    badge: '⭐',
    description: 'Czym w programowaniu jest zmienna?',
    detail: 'Poznaj zmienne jako pudełka na dane',
    url: '/coding-course/lesson03',
    icon: 'variable',
  },
  {
    id: 4,
    title: 'Lekcja 4',
    badge: '⭐',
    description: 'Co to stała i czym się różni od zmiennej?',
    detail: 'Odkryj różnicę między zmiennymi a stałymi',
    url: '/coding-course/lesson04',
    icon: 'const',
  },
  // { id: 5, title: 'Lekcja 5', badge: '⭐', description: 'Funkcje', detail: 'Twórz wielokrotnie używalne bloki kodu' },
  // { id: 5, title: 'Lekcja 5', badge: '⭐⭐⭐', description: 'Listy i tablice', detail: 'Zarządzaj kolekcjami danych w programach' },
  // { id: 6, title: 'Lekcja 6', badge: '⭐', description: 'Obiekty i klasy', detail: 'Poznaj programowanie obiektowe' },
  // { id: 7, title: 'Lekcja 7', badge: '⭐⭐⭐', description: 'Obsługa błędów', detail: 'Naucz się radzić sobie z błędami w kodzie' },
  // { id: 8, title: 'Lekcja 8', badge: '⭐⭐', description: 'Praca z plikami', detail: 'Czytaj i zapisuj dane w plikach' },
  // { id: 9, title: 'Lekcja 9', badge: '⭐', description: 'Projekt końcowy - część 1', detail: 'Rozpocznij tworzenie własnej aplikacji' },
  // { id: 10, title: 'Lekcja 10', badge: '⭐⭐', description: 'Projekt końcowy - część 2', detail: 'Dokończ i zaprezentuj swój projekt' },
];

interface LessonsSwiperProps {
  className?: string;
  defaultActiveCard?: number;
  showDetails?: boolean;
}

export const LessonsSwiper = ({
  className = 'mb-12',
  defaultActiveCard = 1,
  showDetails = true,
}: LessonsSwiperProps) => {
  const [activeCard, setActiveCard] = useState<number>(defaultActiveCard);

  const swiperItems: SwiperNavItem[] = lessons.map((lesson) => ({
    id: lesson.id,
    label: lesson.title,
    isActive: activeCard === lesson.id,
    icon: (
      <Card
        bordered={false}
        className={`bg-none p-0 w-full h-full gap-2 flex flex-col ${showDetails ? 'min-h-[140px]' : ''}`}
      >
        <CardHeader className="p-0 bg-none flex flex-col gap-1 items-start">
          <CardTitle className="text-sm">{lesson.title}</CardTitle>
          <CardDescription className="mb-2 font-bold text-left">{lesson.description}</CardDescription>
        </CardHeader>
        {showDetails && (
          <CardContent className="p-0 mt-2 text-sm flex justify-between items-center gap-2">
            {/* plik z public/ — custom loader i tak go nie transformuje (src/lib/media/loader.ts) */}
            {lesson.icon && (
              <Image
                src={`/images/coding-course-icons/thumbnails/${lesson.icon}.png`}
                alt={lesson.title}
                width={80}
                height={80}
                className="object-contain rounded-lg"
                unoptimized
              />
            )}
            <p className="text-muted-foreground text-xs">{lesson.detail}</p>
          </CardContent>
        )}
      </Card>
    ),
    onClick: () => {
      setActiveCard(lesson.id);
      if (lesson.url) window.location.href = lesson.url;
      console.log(`Clicked ${lesson.title}`);
    },
  }));

  return (
    <SwiperNav
      items={swiperItems}
      spaceBetween={16}
      breakpoints={{
        320: { slidesPerView: 1, spaceBetween: 8 },
        640: { slidesPerView: 2, spaceBetween: 12 },
        1024: { slidesPerView: 4, spaceBetween: 16 },
      }}
      slideByBreakpoints={{
        320: 1,
        640: 2,
        1024: 4,
      }}
      initialSlide={defaultActiveCard - 1}
      className={className}
      showLabels={false}
    />
  );
};
