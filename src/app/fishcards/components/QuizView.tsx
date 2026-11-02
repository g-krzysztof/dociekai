'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Flashcard, Language } from './types';
import { QuizDisplay } from './QuizDisplay';

interface QuizViewProps {
  currentCard: Flashcard;
  primaryLanguage: Language;
  currentIndex: number;
  previousIndex?: number;
  totalCards: number;
  quizAnswer: string;
  quizResult: 'correct' | 'incorrect' | null;
  quizCompleted: boolean;
  onAnswerChange: (answer: string) => void;
  onCheckAnswer: () => void;
  onSpeak: (text: string, lang: 'pl-PL' | 'en-US') => void;
  onPrevCard: () => void;
  onNextCard: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  currentCard,
  primaryLanguage,
  currentIndex,
  previousIndex,
  totalCards,
  quizAnswer,
  quizResult,
  quizCompleted,
  onAnswerChange,
  onCheckAnswer,
  onSpeak,
  onPrevCard,
  onNextCard,
}) => {
  // Determine slide direction based on index change
  const getSlideDirection = () => {
    if (previousIndex === undefined) return 'none';
    
    // Normal sequential movement
    if (currentIndex === previousIndex + 1) return 'right'; // Next card
    if (currentIndex === previousIndex - 1) return 'left';  // Previous card
    
    // Wrap-around cases
    if (previousIndex === totalCards - 1 && currentIndex === 0) return 'right'; // Last to first (next)
    if (previousIndex === 0 && currentIndex === totalCards - 1) return 'left';  // First to last (prev)
    
    // For any other jumps, determine based on direction
    if (currentIndex > previousIndex) return 'right';
    if (currentIndex < previousIndex) return 'left';
    
    return 'none';
  };

  const slideDirection = getSlideDirection();

  const displayText = primaryLanguage === 'polish' ? currentCard.polish : currentCard.english;
  const language = primaryLanguage === 'polish' ? 'Polski' : 'English';
  const speechLang = primaryLanguage === 'polish' ? 'pl-PL' : 'en-US';
  const correctAnswer = primaryLanguage === 'polish' ? currentCard.english : currentCard.polish;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={onPrevCard}
          className="p-3"
          disabled={quizResult !== null}
          data-testid="quiz-prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        {/* Card area */}
        <div className="relative w-[420px] h-80 overflow-hidden flex items-center justify-center">
          <QuizDisplay
            displayText={displayText}
            language={language}
            placeholder={`Tłumaczenie na ${primaryLanguage === 'polish' ? 'angielski' : 'polski'}`}
            progressText={`${currentIndex + 1} / ${totalCards}`}
            quizAnswer={quizAnswer}
            quizResult={quizResult}
            quizCompleted={quizCompleted}
            correctAnswer={correctAnswer}
            onAnswerChange={onAnswerChange}
            onCheckAnswer={onCheckAnswer}
            onSpeakClick={onSpeak}
            speechLang={speechLang}
            slideDirection={slideDirection}
            cardKey={`quiz-card-${currentCard.id}`}
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={onNextCard}
          className="p-3"
          disabled={quizResult !== null}
          data-testid="quiz-next"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </TooltipProvider>
  );
};