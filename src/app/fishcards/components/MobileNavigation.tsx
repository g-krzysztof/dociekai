'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { 
  Settings, 
  BookOpen
} from 'lucide-react';
import { MobileControls } from './MobileControls';
import { MobileSets } from './MobileSets';
import { StudyMode, Language, FlashcardSet, Flashcard } from './types';

type MobileSheetType = 'controls' | 'sets' | null;

interface MobileNavigationProps {
  // Controls props
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
  
  // Sets props
  sets: FlashcardSet[];
  searchTerm: string;
  selectedCategory: string;
  selectedDifficulty: string;
  viewMode: 'grid' | 'list';
  userProgress: Record<string, { flashcards: number; quiz: number }>;
  onSetChange: (set: FlashcardSet) => void;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = (props) => {
  const [activeSheet, setActiveSheet] = useState<MobileSheetType>(null);

  const openSheet = (type: MobileSheetType) => {
    setActiveSheet(type);
  };

  const closeSheet = () => {
    setActiveSheet(null);
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Info Bar - thin bar above bottom navigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-40">
        <div className="flex items-center justify-center py-1.5 px-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-hidden">
            <span className="font-medium truncate max-w-32">{props.currentSet.name}</span>
            <span>•</span>
            <span className="capitalize whitespace-nowrap">
              {props.studyMode === 'flashcards' ? 'Fiszki' : 'Quiz'}
            </span>
            <span>•</span>
            <span className="whitespace-nowrap">
              {props.primaryLanguage === 'polish' ? 'PL → EN' : 'EN → PL'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex items-center justify-around py-2 px-2 lg:px-4">
          <Drawer open={activeSheet === 'sets'} onOpenChange={(open: boolean) => !open && closeSheet()}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openSheet('sets')}
                className="flex flex-col items-center gap-1 h-auto py-2 px-2 lg:px-3"
              >
                <BookOpen className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-xs">Zestawy</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh] flex flex-col">
              <DrawerHeader className="flex-shrink-0">
                <DrawerTitle>Zestawy fiszek</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto">
                <MobileSets
                  sets={props.sets}
                  currentSet={props.currentSet}
                  userProgress={props.userProgress}
                  onSetChange={(set) => {
                    props.onSetChange(set);
                    closeSheet();
                  }}
                />
              </div>
            </DrawerContent>
          </Drawer>

          <Drawer open={activeSheet === 'controls'} onOpenChange={(open: boolean) => !open && closeSheet()}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openSheet('controls')}
                className="flex flex-col items-center gap-1 h-auto py-2 px-2 lg:px-3"
              >
                <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-xs">Ustawienia</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh] flex flex-col">
              <DrawerHeader className="flex-shrink-0">
                <DrawerTitle>Ustawienia nauki</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto">
                <MobileControls
                  studyMode={props.studyMode}
                  primaryLanguage={props.primaryLanguage}
                  currentSet={props.currentSet}
                  hasInteracted={props.hasInteracted}
                  flashcardsProgress={props.flashcardsProgress}
                  quizProgress={props.quizProgress}
                  flashcardsLearned={props.flashcardsLearned}
                  quizLearned={props.quizLearned}
                  cards={props.cards}
                  onStudyModeChange={props.onStudyModeChange}
                  onLanguageChange={props.onLanguageChange}
                  onShuffle={props.onShuffle}
                  onResetProgress={props.onResetProgress}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Content Spacer */}
      <div className="pb-20" /> {/* Space for info bar + bottom navigation */}
    </div>
  );
};