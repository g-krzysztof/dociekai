'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Volume2, Star, StarOff } from 'lucide-react';

interface FlashcardDisplayMobileProps {
  // Card data
  frontText: string;
  backText: string;
  frontLanguage: string;
  backLanguage: string;
  isLearned: boolean;
  
  // Progress data
  progressText: string;
  
  // State
  isFlipped: boolean;
  
  // Callbacks
  onCardClick: () => void;
  onSpeakClick: (text: string, lang: 'pl-PL' | 'en-US') => void;
  onToggleLearnedClick: () => void;
  
  // Speech language for current side
  speechLang: 'pl-PL' | 'en-US';
}

export const FlashcardDisplayMobile: React.FC<FlashcardDisplayMobileProps> = ({
  frontText,
  backText,
  frontLanguage,
  backLanguage,
  isLearned,
  progressText,
  isFlipped,
  onCardClick,
  onSpeakClick,
  onToggleLearnedClick,
  speechLang,
}) => {

  return (
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
      style={{ 
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      className="w-full h-full relative"
    >
      {/* Front side of card */}
      <motion.div
        style={{
          position: "absolute",
          backfaceVisibility: "hidden",
          width: "100%",
          height: "100%"
        }}
      >
        <Card data-testid="flashcard-card" className="w-full h-full cursor-pointer transition-transform hover:scale-105 relative">
          <CardContent className="p-0 h-full">
            <div className="h-full flex flex-col items-center justify-center p-4 text-center" onClick={onCardClick}>
              <div className="flex-1 flex items-center justify-center">
                <div>
                  <div className="flex flex-col items-center">
                    <p data-testid="flashcard-front-text" className="text-xl sm:text-2xl font-bold mb-3 break-words max-w-full">
                      {!isFlipped ? frontText : ''}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                spacja: obróć fiszkę
              </p>
            </div>
            
            {/* Badge z językiem w lewym górnym rogu */}
            <Badge variant="outline" className="absolute top-1 left-1 text-xs px-1.5 py-0.5">
              {!isFlipped ? frontLanguage : ''}
            </Badge>
            
            {/* Badge z postępem w prawym górnym rogu */}
            <Badge data-testid="flashcard-progress-badge" variant="secondary" className="absolute top-1 right-1 text-xs px-1.5 py-0.5">
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
                    if (!isFlipped) {
                      onSpeakClick(frontText, speechLang);
                    }
                  }}
                  className="absolute bottom-1 left-1 p-1.5 h-7 w-7"
                >
                  <Volume2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Wymowa [1]</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Button "Oznacz jako nauczone" w dolnym prawym rogu z tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLearnedClick();
                  }}
                  className="absolute bottom-1 right-1 p-1.5 h-7 w-7"
                  data-testid="flashcard-button-toggle-learned-front"
                >
                  {isLearned ? (
                    <Star className="w-3 h-3 fill-current text-yellow-500" />
                  ) : (
                    <StarOff className="w-3 h-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLearned ? 'Nauczone [0]' : 'Oznacz jako nauczone [0]'}</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </motion.div>

      {/* Back side of card */}
      <motion.div
        style={{
          position: "absolute",
          backfaceVisibility: "hidden",
          width: "100%",
          height: "100%",
          transform: "rotateY(180deg)"
        }}
      >
        <Card data-testid="flashcard-card" className="w-full h-full cursor-pointer transition-transform hover:scale-105 relative">
          <CardContent className="p-0 h-full">
            <div className="h-full flex flex-col items-center justify-center p-4 text-center" onClick={onCardClick}>
              <div className="flex-1 flex items-center justify-center">
                <div>
                  <div className="flex flex-col items-center">
                    <p data-testid="flashcard-back-text" className="text-xl sm:text-2xl font-bold mb-3 break-words max-w-full">
                      {isFlipped ? backText : ''}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                spacja: obróć fiszkę
              </p>
            </div>
            
            {/* Badge z językiem w lewym górnym rogu */}
            <Badge variant="outline" className="absolute top-1 left-1 text-xs px-1.5 py-0.5">
              {isFlipped ? backLanguage : ''}
            </Badge>
            
            {/* Badge z postępem w prawym górnym rogu */}
            <Badge data-testid="flashcard-progress-badge" variant="secondary" className="absolute top-1 right-1 text-xs px-1.5 py-0.5">
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
                    if (isFlipped) {
                      onSpeakClick(backText, speechLang);
                    }
                  }}
                  className="absolute bottom-1 left-1 p-1.5 h-7 w-7"
                >
                  <Volume2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Wymowa [1]</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Button "Oznacz jako nauczone" w dolnym prawym rogu z tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLearnedClick();
                  }}
                  className="absolute bottom-1 right-1 p-1.5 h-7 w-7"
                  data-testid="flashcard-button-toggle-learned-back"
                >
                  {isLearned ? (
                    <Star className="w-3 h-3 fill-current text-yellow-500" />
                  ) : (
                    <StarOff className="w-3 h-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLearned ? 'Nauczone [0]' : 'Oznacz jako nauczone [0]'}</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};