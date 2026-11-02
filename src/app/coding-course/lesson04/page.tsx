'use client';

import { LessonsSwiper } from "../components/lessons-swiper";
import { Typography } from "@/components/ui/typography";
import { SlidsNavigation } from '@/components/slids-navigation';
import { Slid01 } from './slid01';
import { Slid02 } from './slid02';
import { Slid03 } from "./slid03";
import { Slid04 } from './slid04';
import { Slid05 } from './slid05';

const slides = [Slid01, Slid02, Slid03, Slid04, Slid05];

export default function Lesson04Page() {
  return (
    <div className="max-w-[1336px] mx-auto p-4">
      <LessonsSwiper defaultActiveCard={4} />
      <Typography variant="h2" className="mb-2">Lekcja 4 — Zmienne i stałe</Typography>
      <SlidsNavigation slides={slides} className="mb-12" />
    </div>
  );
}
