'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { DecorativeFrame } from './decorative-frame';

export interface SwiperNavItem {
  id: string | number;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  icon?: React.ReactNode;
  showLabel?: boolean;
  bordered?: boolean;
}

interface SwiperNavProps {
  items: SwiperNavItem[];
  slidesPerView?: number;
  spaceBetween?: number;
  className?: string;
  onSlideChange?: (activeIndex: number) => void;
  breakpoints?: {
    [key: number]: {
      slidesPerView: number;
      spaceBetween?: number;
    };
  };
  showLabels?: boolean;
  slideBy?: number;
  slideByBreakpoints?: {
    [key: number]: number;
  };
  onClick?: () => void;
  bordered?: boolean;
  initialSlide?: number;
}

export default function SwiperNav({
  items,
  slidesPerView = 1,
  spaceBetween = 16,
  className = '',
  onSlideChange,
  breakpoints,
  showLabels = true,
  slideBy = 1,
  slideByBreakpoints,
  initialSlide = 0,
}: SwiperNavProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  const getCurrentSlideBy = () => {
    if (!slideByBreakpoints) return slideBy;

    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const sortedBreakpoints = Object.keys(slideByBreakpoints)
      .map(Number)
      .sort((a, b) => b - a);

    for (const breakpoint of sortedBreakpoints) {
      if (width >= breakpoint) {
        return slideByBreakpoints[breakpoint];
      }
    }

    return slideBy;
  };

  const defaultBreakpoints = breakpoints || {
    320: {
      slidesPerView: 2,
      spaceBetween: 8,
    },
    480: {
      slidesPerView: 3,
      spaceBetween: 12,
    },
    768: {
      slidesPerView: 4,
      spaceBetween: 16,
    },
    1024: {
      slidesPerView: slidesPerView,
      spaceBetween: spaceBetween,
    },
  };

  const handleSlideClick = (item: SwiperNavItem) => {
    item.onClick?.();
  };

  const handlePrevClick = () => {
    if (swiperRef.current) {
      const currentIndex = swiperRef.current.activeIndex;
      const currentSlideBy = getCurrentSlideBy();
      swiperRef.current.slideTo(Math.max(0, currentIndex - currentSlideBy));
    }
  };

  const handleNextClick = () => {
    if (swiperRef.current) {
      const currentIndex = swiperRef.current.activeIndex;
      const maxIndex = items.length - 1;
      const currentSlideBy = getCurrentSlideBy();
      swiperRef.current.slideTo(Math.min(maxIndex, currentIndex + currentSlideBy));
    }
  };

  return (
    <div className={`swiper-nav-container relative ${className}`}>
      <Swiper
        modules={[Navigation, A11y, Keyboard]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        navigation={false}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        breakpoints={defaultBreakpoints}
        initialSlide={initialSlide}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          onSlideChange?.(swiper.activeIndex);
        }}
        className="swiper-nav"
        watchSlidesProgress
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="h-auto">
            {() => (
              <DecorativeFrame glowingBorder glowColor='#00c950' glowRadius={150}>
                <button
                  onClick={() => handleSlideClick(item)}
                  className={`
                  cursor-pointer
                `}
                  type="button"
                  aria-label={item.label}
                >
                  {item.icon && <div className="w-full p-2">{item.icon}</div>}
                  {showLabels && (
                    <span className="text-sm font-medium text-center line-clamp-2">
                      {item.label}
                    </span>
                  )}
                </button>
              </DecorativeFrame>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevClick}
        className="swiper-nav-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 
          bg-background/80 backdrop-blur-sm border border-border rounded-full 
          w-10 h-10 flex items-center justify-center
          hover:bg-accent hover:border-accent-foreground
          transition-all duration-200
          cursor-pointer
          disabled:opacity-30 disabled:cursor-not-allowed
          shadow-lg
          -ml-2 md:-ml-5"
        aria-label="Previous slide"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        onClick={handleNextClick}
        className="swiper-nav-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 
          bg-background/80 backdrop-blur-sm border border-border rounded-full 
          w-10 h-10 flex items-center justify-center
          hover:bg-accent hover:border-accent-foreground
          transition-all duration-200
          cursor-pointer
          disabled:opacity-30 disabled:cursor-not-allowed
          shadow-lg
          -mr-2 md:-mr-5"
        aria-label="Next slide"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
