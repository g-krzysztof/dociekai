import { UserProgress } from './types';

const STORAGE_KEY = 'fishcards-user-progress';

export const saveToLocalStorage = (data: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Błąd podczas zapisywania do localStorage:', error);
  }
};

export const loadFromLocalStorage = (): UserProgress | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Błąd podczas ładowania z localStorage:', error);
    return null;
  }
};

export const getDefaultProgress = (initialSetId: string): UserProgress => ({
  currentSetId: initialSetId,
  studyMode: 'flashcards',
  primaryLanguage: 'polish',
  completedSets: [],
  setsProgress: {},
});