'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { QuizDisplayMobile } from './QuizDisplayMobile';
import { Flashcard, Language } from './types';

interface QuizViewMobileProps {
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  onNextCard: () => void;
  onPrevCard: () => void;
  primaryLanguage: Language;
}

export const QuizViewMobile: React.FC<QuizViewMobileProps> = ({
  currentCard,
  currentCardIndex,
  totalCards,
  onNextCard,
  onPrevCard,
  primaryLanguage,
}) => {
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const cardKey = `quiz-${currentCard.id}`;

  const correctAnswerLower = primaryLanguage === 'english' ? currentCard.english.toLowerCase() : currentCard.polish.toLowerCase();
  const userAnswerLower = quizAnswer.toLowerCase().trim();
  const displayText = primaryLanguage === 'english' ? currentCard.polish : currentCard.english;
  const placeholder = primaryLanguage === 'english' ? 'Wpisz tłumaczenie...' : 'Type translation...';
  const speechLang = primaryLanguage === 'english' ? 'pl-PL' as const : 'en-US' as const;
  const language = primaryLanguage === 'english' ? 'POL' : 'ENG';

  useEffect(() => {
    setQuizAnswer('');
    setQuizResult(null);
    setQuizCompleted(false);
  }, [currentCard.id]);

  const handleCheckAnswer = () => {
    if (userAnswerLower === correctAnswerLower) {
      setQuizResult('correct');
    } else {
      setQuizResult('incorrect');
    }
    setQuizCompleted(true);
  };

  const handleSpeech = (text: string, lang: 'pl-PL' | 'en-US') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (quizCompleted) {
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
          setSlideDirection('left');
          setTimeout(() => {
            onPrevCard();
            setSlideDirection('none');
          }, 50);
        } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
          setSlideDirection('right');
          setTimeout(() => {
            onNextCard();
            setSlideDirection('none');
          }, 50);
        }
      }
      
      if (event.key === '1') {
        event.preventDefault();
        handleSpeech(displayText, speechLang);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [displayText, speechLang, quizCompleted, onNextCard, onPrevCard]);

  const progressText = `${currentCardIndex + 1}/${totalCards}`;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col items-center justify-center gap-4 p-4">
        {/* Mobile navigation buttons - top */}
        <div className="flex items-center justify-center gap-4 w-full max-w-md">
          <Button 
            variant="outline" 
            onClick={onPrevCard}
            className="flex-1 h-12"
            disabled={!quizCompleted}
            data-testid="quiz-prev"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Poprzednia
          </Button>
          <Button 
            variant="outline" 
            onClick={onNextCard}
            className="flex-1 h-12"
            disabled={!quizCompleted}
            data-testid="quiz-next"
          >
            Następna
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        
        {/* Mobile card area */}
        <div className="relative w-full max-w-[350px] h-64 overflow-hidden flex items-center justify-center">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentCard?.id || 'empty'}
              initial={{
                x: slideDirection === 'right' ? 350 : slideDirection === 'left' ? -350 : 0,
                opacity: 1
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              exit={{
                x: slideDirection === 'right' ? -350 : slideDirection === 'left' ? 350 : 0,
                opacity: 1
              }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.3
              }}
              className="absolute w-full h-full"
            >
              <QuizDisplayMobile
                displayText={displayText}
                language={language}
                placeholder={placeholder}
                progressText={progressText}
                quizAnswer={quizAnswer}
                quizResult={quizResult}
                quizCompleted={quizCompleted}
                correctAnswer={correctAnswerLower}
                onAnswerChange={setQuizAnswer}
                onCheckAnswer={handleCheckAnswer}
                onSpeakClick={handleSpeech}
                speechLang={speechLang}
                cardKey={cardKey}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
};