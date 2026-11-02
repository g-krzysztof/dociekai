'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { FlashcardSet } from './components/types';
import { QuizComplete } from './components/QuizComplete';
import { FlashcardView } from './components/FlashcardView';
import { FlashcardViewMobile } from './components/FlashcardViewMobile';
import { QuizView } from './components/QuizView';
import { QuizViewMobile } from './components/QuizViewMobile';
import { FishcardsSidebar } from './components/FishcardsSidebar';
import { SetsSidebar } from './components/SetsSidebar';
import { MobileNavigation } from './components/MobileNavigation';
import { SetsSidebarProvider } from './components/SetsSidebarProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarRoot } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/components/ui/use-media-query';
import { useApp } from '@/components/app-context';
import { speakText } from './utils/speechUtils';
import { useFishcardsState } from './hooks/useFishcardsState';
import { useFishcardsClientUI } from './hooks/useFishcardsClientUI';
import { useQuizHandlers } from './hooks/useQuizHandlers';
import { useFishcardsKeyboard } from './hooks/useFishcardsKeyboard';
import { PrivateFishcardsForm } from './components/PrivateFishcardsForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getAuthToken } from '@/lib/auth-token';

interface FishcardsClientProps {
  flashcardSets: FlashcardSet[];
  onReload?: (preserveSetId?: string) => void;
}

// Helper: extract unique categories from flashcard sets
function extractCategoriesFromSets(flashcardSets: FlashcardSet[]): string[] {
  const categories = new Set<string>();

  for (const set of flashcardSets) {
    // set-level category (FlashcardSet.category is typed as string)
    const setCategory = set.category;
    // Exclude 'private' category as it has its own dedicated button
    if (setCategory && typeof setCategory === 'string' && setCategory !== 'private') {
      categories.add(setCategory);
    }

    // card-level categories: the typed Flashcard doesn't include tags,
    // but handle possible runtime extra fields safely using unknown -> Record
    for (const card of set.cards) {
      const rec = card as unknown as Record<string, unknown>;
      const candidateKeys = ['category', 'categories', 'tags', 'tag', 'topic', 'topics'];
      for (const key of candidateKeys) {
        const value = rec[key];
        if (value == null) continue;
        if (typeof value === 'string' && value !== 'private') {
          categories.add(value);
        } else if (Array.isArray(value)) {
          for (const v of value) {
            if (typeof v === 'string' && v !== 'private') categories.add(v);
          }
        }
      }
    }
  }

  return Array.from(categories).sort();
}

export const FishcardsClient: React.FC<FishcardsClientProps> = ({ flashcardSets, onReload }) => {
  const { sidebarHeight } = useApp();
  const [showPrivateForm, setShowPrivateForm] = React.useState(false);
  const [editSetId, setEditSetId] = React.useState<string | undefined>(undefined);
  const [deleteSetId, setDeleteSetId] = React.useState<string | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const handleEditPrivateSet = (setId: string) => {
    setEditSetId(setId);
    setShowPrivateForm(true);
  };
  
  const handleAddPrivateSet = () => {
    setEditSetId(undefined);
    setShowPrivateForm(true);
  };
  
  const handleDeletePrivateSet = (setId: string) => {
    setDeleteSetId(setId);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!deleteSetId) return;
    
    setIsDeleting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Brak tokenu autoryzacji');
      }

      const setToDelete = flashcardSets.find(s => s.id === deleteSetId);
      const apiId = setToDelete?.numericId || deleteSetId;

      const response = await fetch(`/api/private-fishcards/${apiId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć zestawu fiszek');
      }

      setShowDeleteDialog(false);
      setDeleteSetId(undefined);
      // Reload data without preserving deleted set
      onReload?.();
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const [selectedCategory, setSelectedCategory] = React.useState<string>(() => {
    if (typeof window === 'undefined') return 'all';
    try {
      const stored = window.localStorage.getItem('fishcards:selectedCategory');
      return stored ? stored.trim() : 'all';
    } catch {
      return 'all';
    }
  });

  // Persist selected category to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('fishcards:selectedCategory', selectedCategory.trim());
    } catch {
      // ignore storage errors (e.g., quota)
    }
  }, [selectedCategory]);
  
  // Use fishcards state hook
  const {
    userProgress,
    currentSetId,
    cards,
    studyMode,
    primaryLanguage,
    showOnlyUnlearned,
    completedSets,
    currentSet,
    flashcardsLearned,
    quizLearned,
    quizCorrect,
    quizIncorrect,
    quizCompleted,
    setCards,
    setStudyMode,
    setPrimaryLanguage,
    setShowOnlyUnlearned,
    setFlashcardsLearned,
    setQuizLearned,
    setQuizCorrect,
    setQuizIncorrect,
    setQuizCompleted,
    setCompletedSets,
    saveProgress,
    changeFlashcardSet,
    resetProgress,
    resetAllProgress,
  } = useFishcardsState(flashcardSets);

  // Listen for preserve set selection events (after data reload)
  React.useEffect(() => {
    const handlePreserveSelection = (event: CustomEvent) => {
      const { setId } = event.detail;
      if (setId) {
        changeFlashcardSet(setId);
      }
    };

    window.addEventListener('preserveSetSelection', handlePreserveSelection as EventListener);
    return () => {
      window.removeEventListener('preserveSetSelection', handlePreserveSelection as EventListener);
    };
  }, [currentSetId, changeFlashcardSet]);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isWideScreen = useMediaQuery('(min-width: 1400px)');
  
  // Use extracted UI hook for local UI state and handlers
  const {
    currentIndex,
    previousIndex,
    isFlipped,
    slideDirection,
    quizAnswer,
    quizResult,
    hasInteracted,
    filteredCards,
    currentCard,
    nextCard,
    prevCard,
    shuffleCards,
    toggleLearned,
    handleChangeFlashcardSet,
    changeStudyMode,
    handleFlipCard,
    handleStudyModeChange,
    handleSwitchToFlashcards,
  setPreviousIndex,
  setCurrentIndex,
  setIsFlipped,
  setQuizAnswer,
  setQuizResult,
  setHasInteracted,
  } = useFishcardsClientUI({
    flashcardSets,
    cards,
    studyMode,
    showOnlyUnlearned,
    flashcardsLearned,
    quizLearned,
    setCards,
    setFlashcardsLearned,
    setQuizLearned,
    setStudyMode,
    saveProgress,
    changeFlashcardSet,
  });

  // Quiz handlers hook
  const { checkQuizAnswer, restartQuiz } = useQuizHandlers({
    currentCard,
    primaryLanguage,
    quizAnswer,
    currentIndex,
    filteredCardsLength: filteredCards.length,
    quizCorrect,
    quizIncorrect,
    currentSetId,

    saveProgress,
    setCards,
    setCompletedSets,
    setFlashcardsLearned,
    setQuizLearned,
    setQuizCorrect,
    setQuizIncorrect,
    setQuizCompleted,

    setPreviousIndex: setPreviousIndex,
    setCurrentIndex: setCurrentIndex,
    setIsFlipped: setIsFlipped,
    setQuizAnswer: setQuizAnswer,
    setQuizResult: setQuizResult,
    setHasInteracted: setHasInteracted,
  });

  // Keyboard shortcuts hook (replaces the window.addEventListener effect)
  useFishcardsKeyboard({
    onFlip: handleFlipCard,
    onPrev: prevCard,
    onNext: nextCard,
    onSpeak: (text: string, lang?: string) => speakText(text, lang as 'pl-PL' | 'en-US'),
  onToggleLearned: () => currentCard && toggleLearned(currentCard.id),
    studyMode,
    isFlipped,
    currentCard,
    primaryLanguage,
  });

  

  if (studyMode === 'quiz' && quizCompleted) {
    return (
      <QuizComplete
        quizCorrect={quizCorrect}
        quizIncorrect={quizIncorrect}
        onRestart={restartQuiz}
        onSwitchToFlashcards={handleSwitchToFlashcards}
      />
    );
  }

  if (!currentCard && studyMode !== 'flashcards') {
    return (
      <div 
        className="container mx-auto px-4 py-8"
        style={{ 
          minHeight: sidebarHeight.expandedSetsHeight > 0 
            ? `${sidebarHeight.expandedSetsHeight + 400}px` 
            : '100vh' 
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">🐟 Fishcards - Nauka słówek</h1>
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg mb-4">Gratulacje! Nauczyłeś się wszystkich słówek!</p>
              <Button onClick={() => setShowOnlyUnlearned(false)}>Pokaż wszystkie karty</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const flashcardsProgress = (flashcardsLearned.size / cards.length) * 100;
  const quizProgress = (quizLearned.size / cards.length) * 100;

  // Check whether a set matches the selected category.
  const setMatchesCategory = (set: FlashcardSet, category: string): boolean => {
    if (category === 'all') return true;
    if (set.category === category) return true;

    // check card-level possible tags/categories safely
    for (const card of set.cards) {
      const rec = card as unknown as Record<string, unknown>;
      const candidateKeys = ['category', 'categories', 'tags', 'tag', 'topic', 'topics'];
      for (const key of candidateKeys) {
        const value = rec[key];
        if (value == null) continue;
        if (typeof value === 'string' && value === category) return true;
        if (Array.isArray(value) && value.includes(category)) return true;
      }
    }

    return false;
  };

  const filteredFlashcardSets = selectedCategory === 'all'
    ? flashcardSets
    : flashcardSets.filter((s) => setMatchesCategory(s, selectedCategory));

  // Create fullscreen content
  const fullscreenContent = (
    <>
      {studyMode === 'flashcards' ? (
        isDesktop ? (
          <FlashcardView
            currentCard={currentCard}
            isFlipped={isFlipped}
            primaryLanguage={primaryLanguage}
            slideDirection={slideDirection}
            onFlip={handleFlipCard}
            onSpeak={speakText}
            onSwitchToQuiz={() => changeStudyMode('quiz')}
            onPrevCard={prevCard}
            onNextCard={nextCard}
            onToggleLearned={toggleLearned}
            currentIndex={currentIndex}
            filteredCards={filteredCards}
          />
        ) : (
          <FlashcardViewMobile
            currentCard={currentCard}
            isFlipped={isFlipped}
            primaryLanguage={primaryLanguage}
            slideDirection={slideDirection}
            onFlip={handleFlipCard}
            onSpeak={speakText}
            onSwitchToQuiz={() => changeStudyMode('quiz')}
            onPrevCard={prevCard}
            onNextCard={nextCard}
            onToggleLearned={toggleLearned}
            currentIndex={currentIndex}
            filteredCards={filteredCards}
          />
        )
      ) : (
        currentCard && (
          isDesktop ? (
            <QuizView
              currentCard={currentCard}
              primaryLanguage={primaryLanguage}
              currentIndex={currentIndex}
              previousIndex={previousIndex}
              totalCards={filteredCards.length}
              quizAnswer={quizAnswer}
              quizResult={quizResult}
              quizCompleted={quizCompleted}
              onAnswerChange={setQuizAnswer}
              onCheckAnswer={checkQuizAnswer}
              onSpeak={speakText}
              onPrevCard={prevCard}
              onNextCard={nextCard}
            />
          ) : (
            <QuizViewMobile
              currentCard={currentCard}
              currentCardIndex={currentIndex}
              totalCards={filteredCards.length}
              onNextCard={nextCard}
              onPrevCard={prevCard}
              primaryLanguage={primaryLanguage}
            />
          )
        )
      )}
      
      {/* Progress indicators in fullscreen */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {/* Postęp Fiszek */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>🃏 Postęp Fiszek</span>
            <span>
              {flashcardsLearned.size}/{cards.length} ({Math.round(flashcardsProgress)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${flashcardsProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Postęp Quiz */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>🧠 Postęp Quiz</span>
            <span>
              {quizLearned.size}/{cards.length} ({Math.round(quizProgress)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${quizProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen relative flex">
        {/* Mobile Navigation */}
        <MobileNavigation
          // Controls props
          studyMode={studyMode}
          primaryLanguage={primaryLanguage}
          currentSet={currentSet}
          hasInteracted={hasInteracted}
          flashcardsProgress={flashcardsProgress}
          quizProgress={quizProgress}
          flashcardsLearned={flashcardsLearned}
          quizLearned={quizLearned}
          cards={cards}
          onStudyModeChange={handleStudyModeChange}
          onLanguageChange={setPrimaryLanguage}
          onShuffle={shuffleCards}
          onResetProgress={resetProgress}
          
          // Sets props
          sets={filteredFlashcardSets}
          searchTerm=""
          selectedCategory={selectedCategory}
          selectedDifficulty="all"
          viewMode="list"
          userProgress={{}} // TODO: Implement proper mobile progress tracking
          onSetChange={(set) => changeFlashcardSet(set.id)}
          onSearchChange={() => {}} // TODO: Implement mobile search
          onCategoryChange={(cat: string) => setSelectedCategory(cat)}
          onDifficultyChange={() => {}} // TODO: Implement mobile filtering
          onViewModeChange={() => {}} // TODO: Implement mobile view mode
        />

        {/* Sidebars - hidden on mobile, visible on desktop */}
        <div 
          className="hidden lg:block sticky top-16 left-0 z-20 pointer-events-none self-start"
          style={{ height: 'calc(100vh - 4rem)' }}
        >
          <div className="pointer-events-auto h-full">
            <SidebarRoot defaultOpen={false}>
              <FishcardsSidebar
                studyMode={studyMode}
                primaryLanguage={primaryLanguage}
                hasInteracted={hasInteracted}
                quizCompleted={quizCompleted}
                currentSet={currentSet}
                onStudyModeChange={handleStudyModeChange}
                onLanguageChange={setPrimaryLanguage}
                onShuffle={shuffleCards}
                onResetProgress={resetProgress}
                fullscreenContent={fullscreenContent}
                flashcardsProgress={flashcardsProgress}
                quizProgress={quizProgress}
                flashcardsLearned={flashcardsLearned}
                quizLearned={quizLearned}
                cards={cards}
              />
              
              <SetsSidebarProvider 
                key={`sidebar-${isWideScreen}`} 
                defaultOpen={isWideScreen ?? false}
              >
                <SetsSidebar
                  flashcardSets={filteredFlashcardSets}
                  currentSetId={currentSetId}
                  userProgress={userProgress}
                  completedSets={completedSets}
                  onSetChange={handleChangeFlashcardSet}
                  onResetAllProgress={resetAllProgress}
                  onAddPrivateSet={handleAddPrivateSet}
                  onEditPrivateSet={handleEditPrivateSet}
                  onDeletePrivateSet={handleDeletePrivateSet}
                />
              </SetsSidebarProvider>
            </SidebarRoot>
          </div>
        </div>

        {/* Main content - takes full available width, centered like header/footer */}
        <main className="flex-1 w-full">

          <div className="flex justify-center gap-2 flex-wrap mt-4 lg:mt-6">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              onClick={() => setSelectedCategory('all')}
            >
              Wszystkie
            </Button>
            {extractCategoriesFromSets(flashcardSets).map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory((prev) => (prev === cat ? 'all' : cat))}
              >
                {cat}
              </Button>
            ))}
            <Button
              size="sm"
              variant={selectedCategory === 'private' ? 'default' : 'ghost'}
              onClick={() => setSelectedCategory('private')}
            >
              Twoje własne
            </Button>
          </div>

          <div className="flex flex-col px-6 py-8 max-w-7xl mx-auto lg:pt-8 lg:pb-8 pb-24">
            <div className="flex justify-center items-center py-6">
              {studyMode === 'flashcards' ? (
                isDesktop ? (
                  <FlashcardView
                    currentCard={currentCard}
                    isFlipped={isFlipped}
                    primaryLanguage={primaryLanguage}
                    slideDirection={slideDirection}
                    onFlip={handleFlipCard}
                    onSpeak={speakText}
                    onSwitchToQuiz={() => changeStudyMode('quiz')}
                    onPrevCard={prevCard}
                    onNextCard={nextCard}
                    onToggleLearned={toggleLearned}
                    currentIndex={currentIndex}
                    filteredCards={filteredCards}
                  />
                ) : (
                  <FlashcardViewMobile
                    currentCard={currentCard}
                    isFlipped={isFlipped}
                    primaryLanguage={primaryLanguage}
                    slideDirection={slideDirection}
                    onFlip={handleFlipCard}
                    onSpeak={speakText}
                    onSwitchToQuiz={() => changeStudyMode('quiz')}
                    onPrevCard={prevCard}
                    onNextCard={nextCard}
                    onToggleLearned={toggleLearned}
                    currentIndex={currentIndex}
                    filteredCards={filteredCards}
                  />
                )
              ) : (
                currentCard && (
                  isDesktop ? (
                    <QuizView
                      currentCard={currentCard}
                      primaryLanguage={primaryLanguage}
                      currentIndex={currentIndex}
                      previousIndex={previousIndex}
                      totalCards={filteredCards.length}
                      quizAnswer={quizAnswer}
                      quizResult={quizResult}
                      quizCompleted={quizCompleted}
                      onAnswerChange={setQuizAnswer}
                      onCheckAnswer={checkQuizAnswer}
                      onSpeak={speakText}
                      onPrevCard={prevCard}
                      onNextCard={nextCard}
                    />
                  ) : (
                    <QuizViewMobile
                      currentCard={currentCard}
                      currentCardIndex={currentIndex}
                      totalCards={filteredCards.length}
                      onNextCard={nextCard}
                      onPrevCard={prevCard}
                      primaryLanguage={primaryLanguage}
                    />
                  )
                )
              )}
            </div>

            {/* Progress indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-8 lg:mt-12 max-w-4xl mx-auto px-2 lg:px-0">
              {/* Postęp Fiszek */}
              <div>
                <div className="flex justify-between text-xs lg:text-sm text-muted-foreground mb-2">
                  <span>🃏 Postęp Fiszek</span>
                  <span data-testid="fullscreen-flashcards-progress">
                    {flashcardsLearned.size}/{cards.length} ({Math.round(flashcardsProgress)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${flashcardsProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Postęp Quiz */}
              <div>
                <div className="flex justify-between text-xs lg:text-sm text-muted-foreground mb-2">
                  <span>🧠 Postęp Quiz</span>
                  <span>
                    {quizLearned.size}/{cards.length} ({Math.round(quizProgress)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${quizProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Private Flashcards Form Dialog */}
      <PrivateFishcardsForm
        open={showPrivateForm}
        onOpenChange={setShowPrivateForm}
        onSuccess={(updatedSetId) => {
          const setIdToPreserve = updatedSetId || editSetId || currentSetId;
          onReload?.(setIdToPreserve);
        }}
        editSetId={editSetId}
        flashcardSets={flashcardSets}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten zestaw?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteSetId && flashcardSets.find(s => s.id === deleteSetId)?.name}
              <br />
              <br />
              Ta akcja jest nieodwracalna. Zestaw fiszek zostanie trwale usunięty.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Usuwanie...' : 'Usuń'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};
