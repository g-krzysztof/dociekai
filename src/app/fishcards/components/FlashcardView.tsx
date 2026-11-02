'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Flashcard, Language } from './types';
import { FlashcardDisplay } from './FlashcardDisplay';

interface FlashcardViewProps {
  currentCard: Flashcard | undefined;
  isFlipped: boolean;
  primaryLanguage: Language;
  slideDirection?: 'left' | 'right' | null;
  onFlip: () => void;
  onSpeak: (text: string, lang: 'pl-PL' | 'en-US') => void;
  onSwitchToQuiz: () => void;
  onPrevCard: () => void;
  onNextCard: () => void;
  onToggleLearned: (cardId: number) => void;
  currentIndex: number;
  filteredCards: Flashcard[];
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  currentCard,
  isFlipped,
  primaryLanguage,
  slideDirection,
  onFlip,
  onSpeak,
  onSwitchToQuiz,
  onPrevCard,
  onNextCard,
  onToggleLearned,
  currentIndex,
  filteredCards,
}) => {
  // No state needed - animation is controlled by isFlipped prop
  if (!currentCard) {
    return (
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={onPrevCard}
          className="p-3"
          data-testid="chevron-left"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Card className="w-[420px] h-80 cursor-pointer transition-transform hover:scale-105">
          <CardContent className="p-0 h-full">
            <div
              className="h-full flex flex-col items-center justify-center p-12 text-center"
              onClick={onSwitchToQuiz}
            >
              <div className="flex-1 flex items-center justify-center">
                <div>
                  <div className="text-4xl mb-4">🎉</div>
                  <p className="text-3xl font-bold mb-4 text-green-600">Znasz wszystkie słówka!</p>
                  <p className="text-lg mb-4">Sprawdź się w Quiz</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Kliknij aby przejść do Quiz</p>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          variant="outline" 
          onClick={onNextCard}
          className="p-3"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={onPrevCard}
          className="p-3"
          data-testid="chevron-left"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        {/* Card area */}
        <div className="relative w-[420px] h-80 overflow-hidden flex items-center justify-center">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentCard?.id || 'empty'}
              initial={{
                x: slideDirection === 'right' ? 400 : slideDirection === 'left' ? -400 : 0,
                opacity: 1
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              exit={{
                x: slideDirection === 'right' ? -400 : slideDirection === 'left' ? 400 : 0,
                opacity: 1
              }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.3
              }}
              className="absolute"
              style={{ width: '400px', height: '288px' }}
            >
              <FlashcardDisplay
                frontText={primaryLanguage === 'polish' ? currentCard.polish : currentCard.english}
                backText={primaryLanguage === 'polish' ? currentCard.english : currentCard.polish}
                frontLanguage={primaryLanguage === 'polish' ? 'Polski' : 'English'}
                backLanguage={primaryLanguage === 'polish' ? 'English' : 'Polski'}
                isLearned={currentCard.learned}
                progressText={`${currentIndex + 1} / ${filteredCards.length}`}
                isFlipped={isFlipped}
                onCardClick={onFlip}
                onSpeakClick={onSpeak}
                onToggleLearnedClick={() => onToggleLearned(currentCard.id)}
                speechLang={isFlipped 
                  ? (primaryLanguage === 'polish' ? 'en-US' : 'pl-PL')
                  : (primaryLanguage === 'polish' ? 'pl-PL' : 'en-US')
                }
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        <Button 
          variant="outline" 
          onClick={onNextCard}
          className="p-3"
          data-testid="chevron-right"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </TooltipProvider>
  );
};