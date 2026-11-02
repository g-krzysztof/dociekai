'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleIcon } from '@/components/ui/google-icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Volume2, Star, BarChart3, Users } from 'lucide-react';
import { useApp } from '@/components/app-context';
import { HeroSection } from '@/components/hero-section';
import { useAuth } from '@/components/auth-context';
import { DecorativeFrame } from '@/components/decorative-frame';
import { GradientCard } from '@/components/ui/gradient-card';
import { AnimatedButton } from '@/components/ui/animated-button';

export const FishcardsLanding = () => {
  const router = useRouter();
  const { sidebarHeight } = useApp();
  const { isAuthenticated } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);

  // Auto-flip demo card every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8"
      style={{ 
        minHeight: sidebarHeight.expandedSetsHeight > 0 
          ? `${sidebarHeight.expandedSetsHeight + 400}px` 
          : '100vh' 
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl mb-8">
          <HeroSection 
            title="Fishcards"
            description="Interaktywna nauka słówek polsko-angielskich"
            backgroundImage="/images/hero/fish-hero-background-with-dots.webp"
            buttons={!isAuthenticated ? [
              { label: 'Załóż darmowe konto', href: '/auth?mode=register&returnUrl=/fishcards', variant: 'default', leadingIcon: <GoogleIcon /> },
              { label: 'Zaloguj się', href: '/auth?returnUrl=/fishcards', variant: 'outline', leadingIcon: <GoogleIcon /> },
            ] : []}
          />
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {/* Tryb Fiszek */}
          <DecorativeFrame glowingBorder glowColor="#16a34a" glowRadius={150}>
            <div className="text-center">
              <BookOpen className="w-10 sm:w-11 h-10 sm:h-11 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-bold text-lg sm:text-xl mb-3">Tryb Fiszek</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Klasyczne fiszki do nauki słówek z możliwością przewracania i oznaczania jako nauczone.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Interaktywne przewracanie fiszek
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Śledzenie postępu nauki
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Oznaczanie nauczonych słówek
                  </div>
                </div>
              </div>
            </div>
          </DecorativeFrame>

          {/* Tryb Quiz */}
          <DecorativeFrame glowingBorder glowColor="#2563eb" glowRadius={150}>
            <div className="text-center">
              <Brain className="w-10 sm:w-11 h-10 sm:h-11 text-blue-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-bold text-lg sm:text-xl mb-3">Tryb Quiz</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Sprawdź swoją wiedzę w interaktywnym quizie ze sprawdzaniem.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Natychmiastowa weryfikacja
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Statystyki poprawności
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Podsumowanie wyników
                  </div>
                </div>
              </div>
            </div>
          </DecorativeFrame>

          {/* Wymowa Audio */}
          <DecorativeFrame glowingBorder glowColor="#ea580c" glowRadius={150}>
            <div className="text-center">
              <Volume2 className="w-10 sm:w-11 h-10 sm:h-11 text-orange-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-bold text-lg sm:text-xl mb-3">Wymowa Audio</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Naucz się poprawnej wymowy dzięki wbudowanej syntezie mowy.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Wymowa polskich słów
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Wymowa angielskich słów
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Przycisk audio na każdej fiszce
                  </div>
                </div>
              </div>
            </div>
          </DecorativeFrame>

          {/* Personalizacja */}
          <DecorativeFrame glowingBorder glowColor="#16a34a" glowRadius={150}>
            <div className="text-center">
              <Star className="w-10 sm:w-11 h-10 sm:h-11 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-bold text-lg sm:text-xl mb-3">Personalizacja</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Dostosuj naukę naszych fiszek do swoich potrzeb i preferencji językowych.
                </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Tłumaczenia: PL→EN / EN→PL
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Tasowanie kart
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Filtrowanie nauczonych słówek
                </div>
              </div>
              </div>
            </div>
          </DecorativeFrame>
        </div>

        {/* Statistics Preview + Sample Flashcard */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8 sm:mb-12 lg:mb-16">
          {/* Left Column - Statistics Preview + Keyboard Shortcuts */}
          <div className="space-y-8">
            <GradientCard variant="horizontal">
              <div className="text-center space-y-4">
                <div className="flex items-center gap-2 text-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Śledzenie Postępów</h3>
                </div>
                <p className="text-muted-foreground">
                  Monitoruj swój postęp nauki w czasie rzeczywistym
                </p>
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
                    <div className="text-sm text-muted-foreground">Postęp Fiszek</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">92%</div>
                    <div className="text-sm text-muted-foreground">Dokładność Quiz</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
            </GradientCard>

            {/* Keyboard Shortcuts */}
            <DecorativeFrame glowingBorder glowColor="#7c3aed" glowRadius={150}>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">⌨️ Skróty Klawiszowe</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Spacja</kbd>
                    <p className="mt-2">Obróć fiszkę</p>
                  </div>
                  <div className="text-center">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">← →</kbd>
                    <p className="mt-2">Poprzednia/Następna</p>
                  </div>
                  <div className="text-center">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
                    <p className="mt-2">Sprawdź odpowiedź (quiz)</p>
                  </div>
                </div>
              </div>
            </DecorativeFrame>
          </div>

          {/* Right Column - Sample Flashcard */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Przykład Fiszki</h3>
            <div className="max-w-sm mx-auto h-80">
              <div 
                className="w-full h-full relative cursor-pointer"
                style={{ 
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform 0.6s ease-in-out"
                }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front side of card */}
                <div
                  style={{
                    position: "absolute",
                    backfaceVisibility: "hidden",
                    width: "100%",
                    height: "100%"
                  }}
                >
                  <Card className="w-full h-full transition-transform hover:scale-105 relative border-2 border-primary/20">
                    <CardContent className="p-0 h-full">
                      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex-1 flex items-center justify-center">
                          <div>
                            <div className="flex flex-col items-center">
                              <p className="text-4xl font-bold mb-4 text-primary">poniedziałek</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          spacja: obróć fiszkę
                        </p>
                      </div>
                      
                      {/* Badge z językiem w lewym górnym rogu */}
                      <Badge variant="outline" className="absolute top-3 left-3">
                        Polski
                      </Badge>
                      
                      {/* Badge z postępem w prawym górnym rogu */}
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        1/25
                      </Badge>
                      
                      {/* Button "Wymowa" w lewym dolnym rogu */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="absolute bottom-3 left-3 p-2"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      
                      {/* Button "Oznacz jako nauczone" w dolnym prawym rogu */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="absolute bottom-3 right-3 p-2"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Back side of card */}
                <div
                  style={{
                    position: "absolute",
                    backfaceVisibility: "hidden",
                    width: "100%",
                    height: "100%",
                    transform: "rotateY(180deg)"
                  }}
                >
                  <Card className="w-full h-full transition-transform hover:scale-105 relative border-2 border-green-500/30">
                    <CardContent className="p-0 h-full">
                      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex-1 flex items-center justify-center">
                          <div>
                            <div className="flex flex-col items-center">
                              <p className="text-4xl font-bold mb-4 text-green-600">Monday</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          spacja: obróć fiszkę
                        </p>
                      </div>
                      
                      {/* Badge z językiem w lewym górnym rogu */}
                      <Badge variant="outline" className="absolute top-3 left-3">
                        English
                      </Badge>
                      
                      {/* Badge z postępem w prawym górnym rogu */}
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        1/25
                      </Badge>
                      
                      {/* Button "Wymowa" w lewym dolnym rogu */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="absolute bottom-3 left-3 p-2"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      
                      {/* Button "Oznacz jako nauczone" w dolnym prawym rogu */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="absolute bottom-3 right-3 p-2"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto"> 
              Karta posiada przyciski do wymowy, oznaczania jako nauczone oraz pokazuje postęp nauki. 
              Kliknij, aby zobaczyć tłumaczenie.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <GradientCard className="mb-[40px] text-center">
          <Users className="w-16 sm:w-18 lg:w-20 h-16 sm:h-18 lg:h-20 text-primary mx-auto mb-6 sm:mb-7 lg:mb-8" />
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 lg:mb-6">Dołącz do nas i uczmy się razem!</h3>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-7 lg:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
            Zaloguj się już dziś i zacznij naukę z interaktywnymi fiszkami. 
            Rozwój językowy nigdy nie był tak przyjemny!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-6 sm:mb-7 lg:mb-8">
            <AnimatedButton
              glowColor="#00ff00"
              shimmerColor="#00ff00"
              glowRadius={6}
              animation="shimmer-border-glow"
              className="min-w-48 px-6 py-4 text-md font-medium rounded-xl bg-white dark:bg-input/30 hover:bg-yellow/50 dark:hover:bg-input/50"
              onClick={() => router.push('/auth?returnUrl=/fishcards')}
            >
              <GoogleIcon />
              Zaloguj się
            </AnimatedButton>
            <AnimatedButton
              glowColor="rgb(255, 102, 0)"
              shimmerColor="rgb(255, 179, 1)"
              glowRadius={6}
              animation="shimmer-border-glow"
              className="min-w-48 px-6 py-4 text-md font-medium rounded-xl bg-white dark:bg-input/30 hover:bg-yellow/50 dark:hover:bg-input/50"
              onClick={() => router.push('/auth?mode=register&returnUrl=/fishcards')}
            >
              <GoogleIcon />
              Utwórz konto
            </AnimatedButton>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-base sm:text-lg font-medium">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">`</span>
              <span>Interaktywne fiszki</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">`</span>
              <span>Tryb Quiz</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">`</span>
              <span>Wymowa audio</span>
            </div>
          </div>
        </GradientCard>
      </div>
    </div>
  );
};
