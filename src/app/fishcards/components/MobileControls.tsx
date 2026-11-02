'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Brain, 
  Globe, 
  Shuffle,
  RotateCcw
} from 'lucide-react';
import { StudyMode, Language, FlashcardSet, Flashcard } from './types';

interface MobileControlsProps {
  studyMode: StudyMode;
  primaryLanguage: Language;
  currentSet: FlashcardSet;
  hasInteracted: boolean;
  flashcardsProgress: number;
  quizProgress: number;
  flashcardsLearned: Set<number>;
  quizLearned: Set<number>;
  cards: Flashcard[];
  onStudyModeChange: (mode: StudyMode) => void;
  onLanguageChange: (language: Language) => void;
  onShuffle: () => void;
  onResetProgress: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  studyMode,
  primaryLanguage,
  currentSet,
  hasInteracted,
  flashcardsProgress,
  quizProgress,
  flashcardsLearned,
  quizLearned,
  cards,
  onStudyModeChange,
  onLanguageChange,
  onShuffle,
  onResetProgress,
}) => {
  return (
    <div className="lg:hidden">
      {/* Mobile Controls Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base truncate">{currentSet.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {currentSet.category}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentSet.difficulty === 'beginner'
                ? 'Początkujący'
                : currentSet.difficulty === 'intermediate'
                ? 'Średni'
                : 'Zaawansowany'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Study Mode Toggle */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={studyMode === 'flashcards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStudyModeChange('flashcards')}
            className="h-auto p-3 flex flex-col items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">Fiszki</span>
          </Button>
          <Button
            variant={studyMode === 'quiz' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStudyModeChange('quiz')}
            className="h-auto p-3 flex flex-col items-center gap-1"
            data-testid="mobile-quiz-button"
          >
            <Brain className="h-4 w-4" />
            <span className="text-xs">Quiz</span>
          </Button>
        </div>
      </div>

      {/* Language Direction */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium mb-2">Kierunek tłumaczenia</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={primaryLanguage === 'polish' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLanguageChange('polish')}
            className="justify-between"
          >
            <span>Polski → Angielski</span>
            <Globe className="h-4 w-4" />
          </Button>
          <Button
            variant={primaryLanguage === 'english' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLanguageChange('english')}
            className="justify-between"
          >
            <span>Angielski → Polski</span>
            <Globe className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium mb-3">Postęp nauki</h3>
        <div className="space-y-3">
          {/* Flashcards Progress */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Fiszki</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {flashcardsLearned.size}/{cards.length}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${flashcardsProgress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(flashcardsProgress)}% ukończone
              </div>
            </CardContent>
          </Card>

          {/* Quiz Progress */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Quiz</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {quizLearned.size}/{cards.length}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${quizProgress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(quizProgress)}% ukończone
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShuffle}
            disabled={hasInteracted}
            className="w-full justify-start gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Tasuj karty
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResetProgress}
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4" />
            Reset zestawu
          </Button>
        </div>
      </div>
    </div>
  );
};