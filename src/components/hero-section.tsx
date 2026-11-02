'use client';

import { Typography } from '@/components/ui/typography';
import { HeroTitle } from '@/components/hero-title';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/animated-button';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import { RoundIconButton, RoundIconButtonIcon } from '@/components/ui/round-icon-button';

interface HeroIconButton {
  icon: RoundIconButtonIcon;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface HeroButton {
  label: string;
  href: string;
  variant?: 'default' | 'outline';
  icon?: React.ReactNode;
  /** Ikona przed napisem, np. znaczek Google na przyciskach logowania. */
  leadingIcon?: React.ReactNode;
  glowColor?: string;
  shimmerColor?: string;
}

interface HeroSectionProps {
  title?: React.ReactNode;
  description?: string;
  backgroundImage?: string;
  buttons?: HeroButton[];
  iconButtons?: HeroIconButton[];
  extraContent?: React.ReactNode;
  className?: string;
}

export function HeroSection({
  title = (<>Nie czekaj,<br />aż szkoła nadrobi zaległości.</>),
  description = 'Daj dziecku przewagę w świecie AI, technologii i cyfrowych kompetencji. Wybierz poniżej kurs, artykuły lub gry i zacznij rozwój już teraz.',
  backgroundImage = '/images/hero/kids-hero-background-with-dots.webp',
  buttons = [],
  iconButtons = [
    { icon: 'robot', label: 'Kurs kodowania', href: '/coding-course' },
    { icon: 'dice', label: 'Gry edukacyjne', href: '/gry-edukacyjne' },
    { icon: 'blog', label: 'Artykuły/Blog', href: '/blog' },
    { icon: 'email', label: 'Skontaktuj się', href: '/kontakt' },
  ],
  extraContent,
  className = '',
}: HeroSectionProps) {
  const router = useRouter();
  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0 opacity-30 lg:opacity-100 dark:opacity-70">
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover object-right-bottom lg:object-contain"
          priority={true}
          sizes="100vw"
          quality={100}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {/* Lewa kolumna - treść */}
        <div className="space-y-4 p-6 lg:p-10">
          <HeroTitle className="text-left">{title}</HeroTitle>
          <Typography variant="lead" className="text-md lg:text-xl text-left">
            {description}
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4">
            {buttons.map((button, index) => {
              const isFirstButton = index === 0;
              const isSecondButton = index === 1;
              
              if (button.variant === 'default' || isFirstButton) {
                return (
                  <AnimatedButton
                    key={index}
                    glowColor={button.glowColor || '#00ff00'}
                    shimmerColor={button.shimmerColor || '#00ff00'}
                    glowRadius={6}
                    animation="shimmer-border-glow"
                    className="min-w-48 px-6 py-4 text-md font-medium rounded-xl bg-white dark:bg-input/30 hover:bg-yellow/50 dark:hover:bg-input/50"
                    onClick={() => router.push(button.href)}
                  >
                    {button.leadingIcon}
                    {button.label}
                    {button.icon}
                  </AnimatedButton>
                );
              } else if (button.variant === 'outline' || isSecondButton) {
                return (
                  <AnimatedButton
                    key={index}
                    glowColor={button.glowColor || 'rgb(255, 102, 0)'}
                    shimmerColor={button.shimmerColor || 'rgb(255, 179, 1)'}
                    glowRadius={6}
                    animation="shimmer-border-glow"
                    className="min-w-48 px-6 py-4 text-md font-medium rounded-xl bg-white dark:bg-input/30 hover:bg-yellow/50 dark:hover:bg-input/50"
                    onClick={() => router.push(button.href)}
                  >
                    {button.leadingIcon}
                    {button.label}
                    {button.icon}
                  </AnimatedButton>
                );
              }
              
              return (
                <Link key={index} href={button.href}>
                  <Button 
                    size="lg" 
                    variant={button.variant}
                  >
                    {button.leadingIcon}
                    {button.label}
                    {button.icon}
                  </Button>
                </Link>
              );
            })}
          </div>
          {iconButtons.length > 0 && (
            <div className="flex flex-row flex-wrap gap-4 justify-center sm:justify-start">
              {iconButtons.map((btn) => (
                <RoundIconButton
                  key={btn.icon}
                  icon={btn.icon}
                  label={btn.label}
                  href={btn.href}
                  onClick={btn.onClick}
                />
              ))}
            </div>
          )}
          {extraContent}
        </div>

        {/* Prawa kolumna - obrazek hero */}
        <div className="hidden lg:flex lg:items-end lg:justify-center">
          <div className="relative overflow-hidden">
            {/* <Image
              src="/images/general-photos/hero-image-3.webp"
              alt="Dzieci uczące się i rozwijające kompetencje przyszłości"
              width={640}
              height={400}
              className="object-cover object-bottom"
              sizes="(max-width: 1024px) 0px, 640px"
              priority
              quality={70}
            /> */}
          </div>
        </div>

        {/* Mobile hero image - nad fold */}
        {/* <div className="lg:hidden mt-8">
          <div className="relative aspect-video overflow-hidden rounded-lg"> */}
            {/* <Image
              src="/images/general-photos/hero-image-3.webp"
              alt="Dzieci uczące się i rozwijające kompetencje przyszłości"
              fill
              className="object-cover"
              sizes="100vw"
              priority
              quality={60}
            /> */}
          {/* </div>
        </div> */}
      </div>
    </section>
  );
}
