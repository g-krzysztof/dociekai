export interface Flashcard {
  id: number;
  polish: string;
  english: string;
  learned: boolean;
}

export interface FlashcardSet {
  id: string;
  numericId?: number; // For API operations that require numeric ID
  name: string;
  description: string;
  cards: Flashcard[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface SetProgress {
  flashcardsLearned: number[];
  quizLearned: number[];
  quizStats: {
    correct: number;
    incorrect: number;
    completed: boolean;
    lastAccuracy: number;
  };
  lastStudied: string;
}

export interface UserProgress {
  currentSetId: string;
  studyMode: 'flashcards' | 'quiz' | 'match';
  primaryLanguage: 'polish' | 'english';
  completedSets: string[];
  setsProgress: Record<string, SetProgress>;
}

export type StudyMode = 'flashcards' | 'quiz' | 'match';
export type Language = 'polish' | 'english';