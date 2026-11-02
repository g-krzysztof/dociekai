'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Volume2 } from 'lucide-react';

interface QuizDisplayProps {
  // Card data
  displayText: string;
  language: string;
  placeholder: string;
  progressText: string;
  
  // Quiz state
  quizAnswer: string;
  quizResult: 'correct' | 'incorrect' | null;
  quizCompleted: boolean;
  correctAnswer?: string;
  
  // Callbacks
  onAnswerChange: (answer: string) => void;
  onCheckAnswer: () => void;
  onSpeakClick: (text: string, lang: 'pl-PL' | 'en-US') => void;
  
  // Speech language
  speechLang: 'pl-PL' | 'en-US';
  
  // Animation
  slideDirection: 'left' | 'right' | 'none';
  cardKey: string;
}

export const QuizDisplay: React.FC<QuizDisplayProps> = ({
  displayText,
  language,
  placeholder,
  progressText,
  quizAnswer,
  quizResult,
  quizCompleted,
  correctAnswer,
  onAnswerChange,
  onCheckAnswer,
  onSpeakClick,
  speechLang,
  slideDirection,
  cardKey,
}) => {
  const quizInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!quizCompleted && quizInputRef.current) {
      quizInputRef.current.focus();
    }
  }, [cardKey, quizResult, quizCompleted]);

  return (
    <motion.div
      key={cardKey}
      animate={{
        x: [
          slideDirection === 'right' ? 400 : slideDirection === 'left' ? -400 : 0,
          0
        ]
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className="absolute"
      style={{ width: '400px', height: '288px' }}
    >
      <Card className="w-full h-full relative">
        <CardContent className="p-0 h-full">
          <div className="h-full flex flex-col p-12">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="flex flex-col items-center mb-2">
                <p className="text-3xl font-bold mb-2" data-testid="quiz-display-text">{displayText}</p>
              </div>
              <div className="w-full">
                <input
                  ref={quizInputRef}
                  type="text"
                  value={quizAnswer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onCheckAnswer()}
                  placeholder={placeholder}
                  className="w-full p-3 border rounded-lg text-center text-lg"
                  disabled={quizResult !== null}
                  data-testid="quiz-input"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Enter: sprawdź odpowiedź
            </p>
          </div>
          
          {/* Badge z językiem w lewym górnym rogu */}
          <Badge variant="outline" className="absolute top-2 left-2">
            {language}
          </Badge>
          
          {/* Badge z postępem w prawym górnym rogu */}
          <Badge variant="secondary" className="absolute top-2 right-2" data-testid="quiz-progress-badge">
            {progressText}
          </Badge>
          
          {/* Button "Wymowa" w lewym dolnym rogu z tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeakClick(displayText, speechLang);
                }}
                className="absolute bottom-2 left-2 p-2"
                data-testid="quiz-speak-button"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Wymowa [klawisz 1]</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Button "Sprawdź" w prawym dolnym rogu */}
          {quizResult === null && (
            <Button 
              onClick={onCheckAnswer} 
              className="absolute bottom-2 right-2 w-[120px]"
              size="sm"
              data-testid="quiz-check-button"
            >
              Sprawdź
            </Button>
          )}
          
          {/* Komunikat wyniku w prawym dolnym rogu */}
          {quizResult && (
            <div
              className={`absolute bottom-2 right-2 min-w-[120px] p-2 rounded-lg text-center text-sm ${
                quizResult === 'correct'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
              data-testid="quiz-result"
            >
              {quizResult === 'correct' ? (
                <>✅ Dobrze!</>
              ) : (
                <div className="text-xs mt-1 whitespace-nowrap">❌ Źle {correctAnswer}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};