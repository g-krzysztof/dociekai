import { useState, useMemo, useCallback } from 'react';
import { FlashcardSet, UserProgress, SetProgress, StudyMode, Language, Flashcard } from '../components/types';
import { saveToLocalStorage, loadFromLocalStorage, getDefaultProgress } from '../components/storage';

export const useFishcardsState = (flashcardSets: FlashcardSet[]) => {
  const firstSetId = flashcardSets.length > 0 ? flashcardSets[0].id : '';
  const initialCards = useMemo(() => 
    flashcardSets.length > 0 ? flashcardSets[0].cards : []
  , [flashcardSets]);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = loadFromLocalStorage();
    return saved || getDefaultProgress(firstSetId);
  });

  const [currentSetId, setCurrentSetId] = useState<string>(userProgress.currentSetId);
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const currentSet = flashcardSets.find((set) => set.id === userProgress.currentSetId);
    return currentSet?.cards || initialCards;
  });

  const [studyMode, setStudyMode] = useState<StudyMode>(userProgress.studyMode);
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>(userProgress.primaryLanguage);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState<boolean>(false);
  const [completedSets, setCompletedSets] = useState<Set<string>>(
    new Set(userProgress.completedSets)
  );

  const currentSetProgress: SetProgress = userProgress.setsProgress[currentSetId] || {
    flashcardsLearned: [],
    quizLearned: [],
    quizStats: { correct: 0, incorrect: 0, completed: false, lastAccuracy: 0 },
    lastStudied: new Date().toISOString(),
  };

  const [flashcardsLearned, setFlashcardsLearned] = useState<Set<number>>(
    new Set(currentSetProgress.flashcardsLearned)
  );
  const [quizLearned, setQuizLearned] = useState<Set<number>>(
    new Set(currentSetProgress.quizLearned)
  );
  const [quizCorrect, setQuizCorrect] = useState<number>(currentSetProgress.quizStats.correct);
  const [quizIncorrect, setQuizIncorrect] = useState<number>(currentSetProgress.quizStats.incorrect);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(currentSetProgress.quizStats.completed);

  const currentSet: FlashcardSet = flashcardSets.find((set) => set.id === currentSetId) || flashcardSets[0];

  const saveProgress = useCallback((): void => {
    const updatedProgress: UserProgress = {
      currentSetId,
      studyMode,
      primaryLanguage,
      completedSets: [...completedSets],
      setsProgress: {
        ...userProgress.setsProgress,
        [currentSetId]: {
          flashcardsLearned: [...flashcardsLearned],
          quizLearned: [...quizLearned],
          quizStats: {
            correct: quizCorrect,
            incorrect: quizIncorrect,
            completed: quizCompleted,
            lastAccuracy:
              quizCorrect + quizIncorrect > 0
                ? (quizCorrect / (quizCorrect + quizIncorrect)) * 100
                : 0,
          },
          lastStudied: new Date().toISOString(),
        },
      },
    };

    saveToLocalStorage(updatedProgress);
    setUserProgress(updatedProgress);
  }, [
    currentSetId,
    studyMode,
    primaryLanguage,
    completedSets,
    flashcardsLearned,
    quizLearned,
    quizCorrect,
    quizIncorrect,
    quizCompleted,
    userProgress.setsProgress,
  ]);

  const changeFlashcardSet = useCallback(
    (setId: string) => {
      const newSet = flashcardSets.find((set) => set.id === setId);
      if (!newSet) return;

      saveProgress();

      const newSetProgress = userProgress.setsProgress[setId] || {
        flashcardsLearned: [],
        quizLearned: [],
        quizStats: { correct: 0, incorrect: 0, completed: false, lastAccuracy: 0 },
        lastStudied: new Date().toISOString(),
      };

      setCurrentSetId(setId);
      setCards(newSet.cards);

      setFlashcardsLearned(new Set(newSetProgress.flashcardsLearned));
      setQuizLearned(new Set(newSetProgress.quizLearned));
      setQuizCorrect(newSetProgress.quizStats.correct);
      setQuizIncorrect(newSetProgress.quizStats.incorrect);
      setQuizCompleted(newSetProgress.quizStats.completed);
    },
    [saveProgress, userProgress.setsProgress, flashcardSets]
  );

  const resetProgress = useCallback(() => {
    setCards((prev) => prev.map((card) => ({ ...card, learned: false })));

    setFlashcardsLearned(new Set());
    setQuizLearned(new Set());
    setQuizCorrect(0);
    setQuizIncorrect(0);
    setQuizCompleted(false);

    setPrimaryLanguage('polish');
    setShowOnlyUnlearned(false);

    setCompletedSets((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentSetId);
      return newSet;
    });

    const updatedProgress = { ...userProgress };
    delete updatedProgress.setsProgress[currentSetId];
    updatedProgress.completedSets = updatedProgress.completedSets.filter(
      (id) => id !== currentSetId
    );

    setUserProgress(updatedProgress);
    saveToLocalStorage(updatedProgress);
  }, [currentSetId, userProgress]);

  const resetAllProgress = useCallback(() => {
    const defaultProgress = getDefaultProgress(firstSetId);

    setCurrentSetId(defaultProgress.currentSetId);
    setCards(initialCards);
    setStudyMode(defaultProgress.studyMode);
    setPrimaryLanguage(defaultProgress.primaryLanguage);
    setShowOnlyUnlearned(false);
    setFlashcardsLearned(new Set());
    setQuizLearned(new Set());
    setQuizCorrect(0);
    setQuizIncorrect(0);
    setQuizCompleted(false);
    setCompletedSets(new Set());

    setUserProgress(defaultProgress);
    saveToLocalStorage(defaultProgress);
  }, [firstSetId, initialCards]);

  return {
    // State
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

    // Setters
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

    // Actions
    saveProgress,
    changeFlashcardSet,
    resetProgress,
    resetAllProgress,
  };
};