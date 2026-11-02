'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FloatingCtaProps {
  /** Link do kursu lub innej strony */
  href?: string;
  /** Tytuł zachęty */
  title?: string;
  /** Opis */
  description?: string;
  /** Badge text (np. "Darmowe") */
  badgeText?: string;
  /** URL grafiki do wyświetlenia */
  image?: string;
  /** Alt text dla grafiki */
  imageAlt?: string;
  /** Czy pokazać przy pierwszym załadowaniu */
  showOnLoad?: boolean;
  /** Opóźnienie przed pokazaniem (ms) */
  delay?: number;
  /** Klucz do localStorage (żeby nie pokazywać po zamknięciu) */
  storageKey?: string;
  /** URL ikony do wyświetlenia */
  icon?: string;
}

export function FloatingCta({
  href = '/coding-course',
  title = 'Darmowy Kurs Kodowania!',
  description,
  badgeText = 'Darmowe',
  image,
  imageAlt = 'Ilustracja',
  showOnLoad = true,
  delay = 3000,
  storageKey = 'floatingCtaDismissed',
  icon,
}: FloatingCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Sprawdź czy użytkownik zamknął wcześniej
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    if (showOnLoad) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [showOnLoad, delay, storageKey]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm md:bottom-8 md:left-auto md:right-8"
        >
          <Card className="relative overflow-hidden border-2 shadow-2xl">
            {/* Solid gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 pointer-events-none" />

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 h-6 w-6 rounded-full opacity-70 hover:opacity-100 cursor-pointer"
              onClick={handleDismiss}
              aria-label="Zamknij"
            >
              <X className="h-4 w-4" />
            </Button>

            <Link href={href} onClick={() => setIsVisible(false)} className="block">
              <CardContent className="relative p-6 pb-2 cursor-pointer">
                <div className="flex justify-between">
                  {/* Icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600"
                  >
                    <Code2 className="h-6 w-6 text-white" />
                  </motion.div>
                  {/* Badge with animation */}
                  <motion.div
                    animate={{
                      y: [0, -2, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="mb-3"
                  >
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <Sparkles className="mr-1 h-3 w-3" />
                      {badgeText}
                    </Badge>
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-bold leading-tight">{title}</h3>
                {description && (
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {description}
                  </p>
                )}

                {/* Optional Image */}
                {image && (
                  <div className="relative mb-4 flex w-full items-center gap-3 rounded-lg overflow-hidden h-32">
                    {/* Background Image */}
                    <Image
                      src={image}
                      alt={imageAlt}
                      width={400}
                      height={128}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                      sizes="(max-width: 448px) 100vw, 400px"
                    />
                    
                    {/* Icon on the left */}
                    <div className="relative z-10 flex items-center justify-center">
                      {icon ? (
                        <Image
                          src={icon}
                          alt="Icon"
                          width={120}
                          height={120}
                          className="h-[120px] w-[120px] object-contain rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 p-3">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Button className="group w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Rozpocznij Teraz
                  <motion.div
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </Button>
              </CardContent>
            </Link>
            {/* Decorative pulse effect */}
            <motion.div
              className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/20 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
