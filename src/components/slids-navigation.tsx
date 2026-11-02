'use client';

import { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Separator } from './ui/separator';

interface SlidsNavigationProps {
  slides: React.ComponentType<{ onNext?: () => void }>[];
  className?: string;
}

export const SlidsNavigation = ({ slides, className }: SlidsNavigationProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = slides.length;
  const CurrentSlideComponent = slides[currentSlide];

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalSlides <= maxVisiblePages) {
      // Show all pages if total is less than or equal to max visible
      for (let i = 0; i < totalSlides; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentSlide === i}
              onClick={(e) => {
                e.preventDefault();
                handleSlideClick(i);
              }}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={0}>
          <PaginationLink
            href="#"
            isActive={currentSlide === 0}
            onClick={(e) => {
              e.preventDefault();
              handleSlideClick(0);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current is far from start
      if (currentSlide > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current
      const start = Math.max(1, currentSlide - 1);
      const end = Math.min(totalSlides - 2, currentSlide + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentSlide === i}
              onClick={(e) => {
                e.preventDefault();
                handleSlideClick(i);
              }}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current is far from end
      if (currentSlide < totalSlides - 3) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show last page
      items.push(
        <PaginationItem key={totalSlides - 1}>
          <PaginationLink
            href="#"
            isActive={currentSlide === totalSlides - 1}
            onClick={(e) => {
              e.preventDefault();
              handleSlideClick(totalSlides - 1);
            }}
          >
            {totalSlides}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className={`${className}`}>
      {/* Pagination */}
    <Pagination className='justify-start'>
      <PaginationContent>
        <PaginationItem>
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePrevious();
          }}
          className={currentSlide === 0 ? 'pointer-events-none opacity-50' : ''}
        />
        </PaginationItem>

        {renderPaginationItems()}

        <PaginationItem>
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className={currentSlide === totalSlides - 1 ? 'pointer-events-none opacity-50' : ''}
        />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
        <Separator className="my-2" />
      {/* Slide Content */}
      <div className="mb-8">
        <CurrentSlideComponent onNext={handleNext} />
      </div>
    </div>
  );
};
