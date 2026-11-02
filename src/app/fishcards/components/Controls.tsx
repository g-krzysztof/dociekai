'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Shuffle, Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StudyMode, Language, FlashcardSet } from './types';
import { HeroTitle } from '@/components/hero-title';

interface ControlsProps {
  studyMode: StudyMode;
  primaryLanguage: Language;
  hasInteracted: boolean;
  quizCompleted: boolean;
  currentSet: FlashcardSet;
  onStudyModeChange: (mode: StudyMode) => void;
  onLanguageChange: (language: Language) => void;
  onShuffle: () => void;
  onResetProgress: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  studyMode,
  primaryLanguage,
  hasInteracted,
  currentSet,
  onStudyModeChange,
  onLanguageChange,
  onShuffle,
  onResetProgress,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);
  return (
    <>
      <div className="text-center mb-4">
        <div className="flex flex-col xl:flex-row xl:justify-between items-start xl:items-start mb-4 gap-4">
          <div className="flex items-center w-full xl:w-auto gap-2">
            <HeroTitle className="mb-2">Fiszki</HeroTitle>
            <span className="text-lg text-muted-foreground">{currentSet.name}</span>
            <Badge variant="secondary" className="mt-1">
              {currentSet.category} •{' '}
              {currentSet.difficulty === 'beginner'
                ? 'Początkujący'
                : currentSet.difficulty === 'intermediate'
                ? 'Średni'
                : 'Zaawansowany'}
            </Badge>
          </div>
        </div>

      <hr />
      </div>

      <TooltipProvider delayDuration={200}>
        <div className="flex items-start gap-4 mb-8" ref={settingsRef}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showSettings ? "success" : "outline"}
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {studyMode === 'flashcards' ? 'Fiszki' : 'Quiz'}
                </Badge>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {primaryLanguage === 'polish' ? 'Polski' : 'Angielski'}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showSettings ? `Kliknij, aby zamknąć ustawienia` : `Kliknij, aby otworzyć ustawienia`}</p>
            </TooltipContent>
          </Tooltip>

          {showSettings && (
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <Button
                  variant={studyMode === 'flashcards' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => onStudyModeChange('flashcards')}
                >
                  Fiszki
                </Button>
                <Button
                  variant={studyMode === 'quiz' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => onStudyModeChange('quiz')}
                >
                  Quiz
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={primaryLanguage === 'polish' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => onLanguageChange('polish')}
                >
                  PL → EN
                </Button>
                <Button
                  variant={primaryLanguage === 'english' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => onLanguageChange('english')}
                >
                  EN → PL
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={onShuffle} disabled={hasInteracted}>
                <Shuffle className="w-4 h-4 mr-2" />
                Tasuj
              </Button>

              <Button variant="outline" size="sm" onClick={onResetProgress}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset zestawu
              </Button>
            </div>
          )}
        </div>
      </TooltipProvider>
    </>
  );
};