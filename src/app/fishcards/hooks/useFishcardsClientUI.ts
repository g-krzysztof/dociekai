'use client';

import { useCallback, useEffect, useState } from 'react';
import { Flashcard, FlashcardSet, StudyMode } from '../components/types';

export interface UseFishcardsClientUIParams {
  // read-only inputs
  flashcardSets: FlashcardSet[];
  cards: Flashcard[];
  studyMode: StudyMode;
  showOnlyUnlearned: boolean;
  flashcardsLearned: Set<number>;
  quizLearned: Set<number>;

  // setters / actions from useFishcardsState
  setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  setFlashcardsLearned: React.Dispatch<React.SetStateAction<Set<number>>>;
  setQuizLearned: React.Dispatch<React.SetStateAction<Set<number>>>;
  setStudyMode: (mode: StudyMode) => void;
  saveProgress: () => void;
  changeFlashcardSet: (id: string) => void;
}

export function useFishcardsClientUI(params: UseFishcardsClientUIParams) {
  const {
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
  } = params;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [previousIndex, setPreviousIndex] = useState<number | undefined>(undefined);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const filteredCards = showOnlyUnlearned
    ? cards.filter((card) => {
        if (studyMode === 'flashcards') {
          return !flashcardsLearned.has(card.id);
        } else if (studyMode === 'quiz') {
          return !quizLearned.has(card.id);
        }
        return !card.learned;
      })
    : studyMode === 'flashcards'
    ? cards.filter((card) => !flashcardsLearned.has(card.id))
    : cards;

  const currentCard = filteredCards[currentIndex];

  const nextCard = useCallback(() => {
    if (filteredCards.length === 0) return;
    setSlideDirection('right');
    setPreviousIndex(currentIndex);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    setIsFlipped(false);
    setQuizAnswer('');
    setQuizResult(null);
    setHasInteracted(true);
    setTimeout(() => setSlideDirection(null), 100);
  }, [filteredCards.length, currentIndex]);

  const prevCard = useCallback(() => {
    if (filteredCards.length === 0) return;
    setSlideDirection('left');
    setPreviousIndex(currentIndex);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    setIsFlipped(false);
    setQuizAnswer('');
    setQuizResult(null);
    setHasInteracted(true);
    setTimeout(() => setSlideDirection(null), 100);
  }, [filteredCards.length, currentIndex]);

  const shuffleCards = useCallback(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setHasInteracted(false);
  }, [cards, setCards]);

  const toggleLearned = useCallback(
    (cardId: number) => {
      if (studyMode === 'flashcards') {
        setFlashcardsLearned((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(cardId)) {
            newSet.delete(cardId);
          } else {
            newSet.add(cardId);
          }
          return newSet;
        });
      } else if (studyMode === 'quiz') {
        const card = cards.find((c) => c.id === cardId);
        const isCurrentlyLearned = card?.learned || false;

        setCards((prev: Flashcard[]) =>
          prev.map((card: Flashcard) => (card.id === cardId ? { ...card, learned: !card.learned } : card))
        );

        setQuizLearned((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(cardId)) {
            newSet.delete(cardId);
          } else {
            newSet.add(cardId);
          }
          return newSet;
        });

        setFlashcardsLearned((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyLearned) {
            newSet.delete(cardId);
          } else {
            newSet.add(cardId);
          }
          return newSet;
        });
      }

      setTimeout(() => saveProgress(), 50);
      setIsFlipped(false);
    },
    [studyMode, cards, saveProgress, setCards, setFlashcardsLearned, setQuizLearned]
  );

  useEffect(() => {
    if (filteredCards.length > 0 && currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
  }, [filteredCards.length, currentIndex]);

  const handleChangeFlashcardSet = useCallback(
    (setId: string) => {
      changeFlashcardSet(setId);
      setCurrentIndex(0);
      setIsFlipped(false);
      setQuizAnswer('');
      setQuizResult(null);
      setHasInteracted(false);
    },
    [changeFlashcardSet]
  );

  const changeStudyMode = useCallback(
    (mode: StudyMode) => {
      setStudyMode(mode);
      setIsFlipped(false);
      setQuizAnswer('');
      setQuizResult(null);
      setCurrentIndex(0);
    },
    [setStudyMode]
  );

  const handleFlipCard = useCallback(() => {
    if (studyMode === 'flashcards') {
      setIsFlipped((s) => !s);
      setHasInteracted(true);
    }
  }, [studyMode]);

  const handleStudyModeChange = useCallback(
    (
      mode: StudyMode,
      // The following setters are not available here; calling code can
      // perform additional quiz resets when wiring hooks. This hook
      // mirrors the UI/UX state changes.
    ) => {
      if (mode === 'flashcards') {
        const learnedIds = cards.filter((card) => card.learned).map((card) => card.id);
        setFlashcardsLearned(new Set(learnedIds));
        changeStudyMode(mode);
        // Note: resetting quiz counts should be done by quiz handler when wired
      } else if (mode === 'quiz') {
        changeStudyMode(mode);
      }
    },
    [cards, changeStudyMode, setFlashcardsLearned]
  );

  const handleSwitchToFlashcards = useCallback(() => {
    const learnedIds = cards.filter((card) => card.learned).map((card) => card.id);
    setFlashcardsLearned(new Set(learnedIds));
    changeStudyMode('flashcards');
  }, [cards, changeStudyMode, setFlashcardsLearned]);

  return {
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

    // setters for wiring/tests
    setPreviousIndex,
    setCurrentIndex,
    setIsFlipped,
    setQuizAnswer,
    setQuizResult,
    setHasInteracted,
  } as const;
}
