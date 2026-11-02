'use client';

import { useCallback } from 'react';
import { Flashcard } from '../components/types';

export interface UseQuizHandlersParams {
  currentCard?: Flashcard | null;
  primaryLanguage: 'polish' | 'english';
  quizAnswer: string;
  currentIndex: number;
  filteredCardsLength: number;

  quizCorrect: number;
  quizIncorrect: number;
  currentSetId: string;

  // external actions/state setters
  saveProgress: () => void;
  setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  setCompletedSets: React.Dispatch<React.SetStateAction<Set<string>>>;
  setFlashcardsLearned: React.Dispatch<React.SetStateAction<Set<number>>>;
  setQuizLearned: React.Dispatch<React.SetStateAction<Set<number>>>;
  setQuizCorrect: React.Dispatch<React.SetStateAction<number>>;
  setQuizIncorrect: React.Dispatch<React.SetStateAction<number>>;
  setQuizCompleted: React.Dispatch<React.SetStateAction<boolean>>;

  // UI setters for advancing and result handling
  setPreviousIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  setQuizAnswer: React.Dispatch<React.SetStateAction<string>>;
  setQuizResult: React.Dispatch<React.SetStateAction<'correct' | 'incorrect' | null>>;
  setHasInteracted: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useQuizHandlers(params: UseQuizHandlersParams) {
  const {
    currentCard,
    primaryLanguage,
    quizAnswer,
    currentIndex,
    filteredCardsLength,
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

    setPreviousIndex,
    setCurrentIndex,
    setIsFlipped,
    setQuizAnswer,
    setQuizResult,
    setHasInteracted,
  } = params;

  const checkQuizAnswer = useCallback(() => {
    if (!currentCard) return;

    const correctAnswer = primaryLanguage === 'polish' ? currentCard.english : currentCard.polish;
    const isCorrect = quizAnswer.toLowerCase().trim() === correctAnswer.toLowerCase();

    setQuizResult(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setQuizCorrect((prev) => prev + 1);
      setQuizLearned((prev) => new Set([...prev, currentCard.id]));

      setFlashcardsLearned((prev) => new Set([...prev, currentCard.id]));

      setCards((prev: Flashcard[]) =>
        prev.map((card) => (card.id === currentCard.id ? { ...card, learned: true } : card))
      );
    } else {
      setQuizIncorrect((prev) => prev + 1);
      setQuizLearned((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentCard.id);
        return newSet;
      });
      setFlashcardsLearned((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentCard.id);
        return newSet;
      });
      setCards((prev: Flashcard[]) =>
        prev.map((card) => (card.id === currentCard.id ? { ...card, learned: false } : card))
      );
    }

    setTimeout(() => saveProgress(), 100);

    setTimeout(() => {
      if (currentIndex + 1 >= filteredCardsLength) {
        setQuizCompleted(true);

        const totalAnswers = quizCorrect + (isCorrect ? 1 : 0) + quizIncorrect + (isCorrect ? 0 : 1);
        const finalCorrect = quizCorrect + (isCorrect ? 1 : 0);
        const accuracy = totalAnswers > 0 ? (finalCorrect / totalAnswers) * 100 : 0;

        if (accuracy === 100) {
          setCompletedSets((prev) => new Set([...prev, currentSetId]));
        }
      } else {
        // advance to next card after short delay
        setTimeout(() => {
          setPreviousIndex(currentIndex);
          setCurrentIndex((prev) => (prev + 1) % filteredCardsLength);
          setIsFlipped(false);
          setQuizAnswer('');
          setQuizResult(null);
          setHasInteracted(true);
        }, 50);
      }
    }, 1500);
  }, [
    currentCard,
    primaryLanguage,
    quizAnswer,
    currentIndex,
    filteredCardsLength,
    quizCorrect,
    quizIncorrect,
    currentSetId,
    saveProgress,
    setCards,
    setCompletedSets,
    setFlashcardsLearned,
    setQuizCompleted,
    setQuizCorrect,
    setQuizIncorrect,
    setQuizLearned,
    setPreviousIndex,
    setCurrentIndex,
    setIsFlipped,
    setQuizAnswer,
    setQuizResult,
    setHasInteracted,
  ]);

  const restartQuiz = useCallback(() => {
    setQuizCorrect(0);
    setQuizIncorrect(0);
    setQuizCompleted(false);
    setCurrentIndex(0);
    setQuizAnswer('');
    setQuizResult(null);
    setQuizLearned(new Set());
  }, [setQuizCorrect, setQuizIncorrect, setQuizCompleted, setCurrentIndex, setQuizAnswer, setQuizResult, setQuizLearned]);

  return { checkQuizAnswer, restartQuiz } as const;
}

