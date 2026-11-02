'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSection,
  useSidebar,
} from '@/components/ui/sidebar';
import { Kbd } from '@/components/ui/kbd';
import {
  Settings,
  RotateCcw,
  Shuffle,
  BookOpen,
  Brain,
  Globe,
  ChevronDown,
  ChevronUp,
  PanelLeft,
  Maximize2,
  X,
} from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from '@/components/ui/drawer';
import { StudyMode, Language, FlashcardSet, Flashcard } from './types';

interface FishcardsSidebarProps {
  studyMode: StudyMode;
  primaryLanguage: Language;
  hasInteracted: boolean;
  quizCompleted: boolean;
  currentSet: FlashcardSet;
  onStudyModeChange: (mode: StudyMode) => void;
  onLanguageChange: (language: Language) => void;
  onShuffle: () => void;
  onResetProgress: () => void;
  fullscreenContent?: React.ReactNode;
  flashcardsProgress: number;
  quizProgress: number;
  flashcardsLearned: Set<number>;
  quizLearned: Set<number>;
  cards: Flashcard[];
}

export const FishcardsSidebar: React.FC<FishcardsSidebarProps> = ({
  studyMode,
  primaryLanguage,
  hasInteracted,
  currentSet,
  onStudyModeChange,
  onLanguageChange,
  onShuffle,
  onResetProgress,
  fullscreenContent,
  flashcardsProgress,
  quizProgress,
  flashcardsLearned,
  quizLearned,
  cards,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <Sidebar 
      variant="default" 
      collapsible="icon" 
      side="left"
    >
      <SidebarHeader className={cn(!isOpen && "px-3")}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "p-2 rounded-lg transition-colors cursor-pointer",
              !isOpen && "mx-auto"
            )}
            title="Przełącz sidebar"
          >
            <PanelLeft
              className={cn(
                "h-5 w-5 text-secondary-foreground transition-transform duration-200",
                !isOpen && "transform rotate-180"
              )}
            />
          </button>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-base truncate">Zestaw: {currentSet.name}</h2>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isOpen ? (
          <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            {/* Study Mode Section */}
            <SidebarSection title="Tryb nauki">
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
                  data-testid="sidebar-quiz-button"
                >
                  <Brain className="h-4 w-4" />
                  <span className="text-xs">Quiz</span>
                </Button>
              </div>
            </SidebarSection>

            {/* Language Section */}
            <SidebarSection title="Kierunek tłumaczenia">
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
            </SidebarSection>

            {/* Progress Section */}
            <SidebarSection title="Postęp nauki">
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
            </SidebarSection>

            {/* Actions Section */}
            <SidebarSection title="Akcje">
              <div className="space-y-2">
                {/* Fullscreen Button */}
                {fullscreenContent && (
                  <Drawer direction="top">
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <Maximize2 className="h-4 w-4" />
                        Tryb pełnoekranowy
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="!fixed !inset-0 !h-screen !max-h-screen !w-screen !max-w-screen !rounded-none !border-none !m-0 !p-0 [&>.bg-muted]:!hidden">
                      <div className="flex h-full bg-background">
                        <div className="flex flex-col h-full w-full">
                          <div className="flex items-center justify-between p-4 border-b bg-background">
                            <DrawerTitle className="text-lg font-semibold">
                              {currentSet.name} - Tryb pełnoekranowy
                            </DrawerTitle>
                            <DrawerClose asChild>
                              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="h-5 w-5" />
                              </button>
                            </DrawerClose>
                          </div>
                          <div className="flex-1 overflow-auto p-4">
                            {fullscreenContent}
                          </div>
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}

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
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Zaawansowane
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {showAdvanced && (
                  <div className="pl-4 space-y-2">
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
                )}
              </div>
            </SidebarSection>

            {/* Keyboard Shortcuts */}
            <SidebarSection title="Skróty klawiszowe">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <Kbd>Spacja</Kbd>
                  <span className="text-muted-foreground">Obróć fiszkę</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <Kbd>←</Kbd>
                    <Kbd>→</Kbd>
                  </div>
                  <span className="text-muted-foreground">Nawigacja</span>
                </div>
                <div className="flex justify-between items-center">
                  <Kbd>1</Kbd>
                  <span className="text-muted-foreground">Wymowa</span>
                </div>
                <div className="flex justify-between items-center">
                  <Kbd>0</Kbd>
                  <span className="text-muted-foreground">Oznacz nauczone</span>
                </div>
                <div className="flex justify-between items-center">
                  <Kbd>Enter</Kbd>
                  <span className="text-muted-foreground">Sprawdź (quiz)</span>
                </div>
              </div>
            </SidebarSection>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <Button
              variant={studyMode === 'flashcards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onStudyModeChange('flashcards')}
              className="w-10 h-10 p-0"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button
              variant={studyMode === 'quiz' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onStudyModeChange('quiz')}
              className="w-10 h-10 p-0"
              data-testid="sidebar-quiz-button"
            >
              <Brain className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onResetProgress} className="w-10 h-10 p-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onShuffle} className="w-10 h-10 p-0">
              <Shuffle className="h-4 w-4" />
            </Button>
            
            {/* Fullscreen Button for collapsed state */}
            {fullscreenContent && (
              <Drawer direction="top">
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0"
                    title="Tryb pełnoekranowy"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="!fixed !inset-0 !h-screen !max-h-screen !w-screen !max-w-screen !rounded-none !border-none !m-0 !p-0 [&>.bg-muted]:!hidden">
                  <div className="flex h-full bg-background">
                    <div className="flex flex-col h-full w-full">
                      <div className="flex items-center justify-between p-4 border-b bg-background">
                        <DrawerTitle className="text-lg font-semibold">
                          {currentSet.name} - Tryb pełnoekranowy
                        </DrawerTitle>
                        <DrawerClose asChild>
                          <button className="p-2 hover:bg-muted rounded-full transition-colors">
                            <X className="h-5 w-5" />
                          </button>
                        </DrawerClose>
                      </div>
                      <div className="flex-1 overflow-auto p-4">
                        {fullscreenContent}
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
