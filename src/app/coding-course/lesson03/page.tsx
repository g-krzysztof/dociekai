'use client';

import { LessonsSwiper } from "../components/lessons-swiper";
import { Typography } from "@/components/ui/typography";
import { SlidsNavigation } from '@/components/slids-navigation';
import { Slid01 } from './slid01';
import { Slid02 } from './slid02';
import { Slid03 } from './slid03';
import { Slid04 } from './slid04';
import { Slid05 } from './slid05';
import { Slid06 } from './slid06';

const slides = [Slid01, Slid02, Slid03, Slid04, Slid05, Slid06];

export default function Lesson3() {

  return (
    <div className="max-w-[1336px] mx-auto p-4">
      <LessonsSwiper defaultActiveCard={3} />
        <Typography variant="h2" className="mb-2">Lekcja 3 — Co to jest zmienna?</Typography>
        <SlidsNavigation slides={slides} className="mb-12"  />
      
    </div>
  );
}
