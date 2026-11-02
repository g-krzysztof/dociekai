'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Volume2 } from 'lucide-react';

interface QuizDisplayMobileProps {
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
  cardKey: string;
}

export const QuizDisplayMobile: React.FC<QuizDisplayMobileProps> = ({
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
  cardKey,
}) => {
  const quizInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!quizCompleted && quizInputRef.current) {
      quizInputRef.current.focus();
    }
  }, [cardKey, quizResult, quizCompleted]);

  return (
    <Card className="w-full h-full transition-transform hover:scale-105 relative">
      <CardContent className="p-0 h-full">
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="flex-1 flex items-center justify-center">
              <div>
                <div className="flex flex-col items-center">
                  <p className="text-xl sm:text-2xl font-bold mb-3 break-words max-w-full" data-testid="quiz-display-text">
                    {displayText}
                  </p>
                  <div className="w-full mt-2">
                    <input
                      ref={quizInputRef}
                      type="text"
                      value={quizAnswer}
                      onChange={(e) => onAnswerChange(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && onCheckAnswer()}
                      placeholder={placeholder}
                      className="w-full p-3 border rounded-lg text-center text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={quizResult !== null}
                      data-testid="quiz-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter: sprawdź odpowiedź
            </p>
          </div>
          
          {/* Badge z językiem w lewym górnym rogu */}
          <Badge variant="outline" className="absolute top-1 left-1 text-xs px-1.5 py-0.5">
            {language}
          </Badge>
          
          {/* Badge z postępem w prawym górnym rogu */}
          <Badge variant="secondary" className="absolute top-1 right-1 text-xs px-1.5 py-0.5" data-testid="quiz-progress-badge">
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
                className="absolute bottom-1 left-1 p-1.5 h-7 w-7"
                data-testid="quiz-speak-button"
              >
                <Volume2 className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Wymowa [1]</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Button "Sprawdź" w prawym dolnym rogu */}
          {quizResult === null && (
            <Button 
              onClick={onCheckAnswer} 
              className="absolute bottom-1 right-1 h-7 px-3 text-xs"
              size="sm"
              variant="outline"
              data-testid="quiz-check-button"
            >
              Sprawdź
            </Button>
          )}
          
          {/* Komunikat wyniku w prawym dolnym rogu */}
          {quizResult && (
            <div
              className={`absolute bottom-1 right-1 px-3 py-1.5 rounded-lg text-center text-xs font-medium shadow-sm ${
                quizResult === 'correct'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
              data-testid="quiz-result"
            >
              {quizResult === 'correct' ? (
                '✅ Dobrze!'
              ) : (
                <div className="text-xs">❌ Błąd: {correctAnswer}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
  );
};