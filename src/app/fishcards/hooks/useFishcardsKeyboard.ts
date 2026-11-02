'use client';

import { useEffect } from 'react';
import { Flashcard, StudyMode, Language } from '../components/types';

export interface UseFishcardsKeyboardParams {
  onFlip?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSpeak?: (text: string, lang?: string) => void;
  onToggleLearned?: () => void;
  studyMode?: StudyMode;
  isFlipped?: boolean;
  currentCard?: Flashcard | null;
  primaryLanguage?: Language;
}

export function useFishcardsKeyboard({
  onFlip,
  onPrev,
  onNext,
  onSpeak,
  onToggleLearned,
  studyMode,
  isFlipped,
  currentCard,
  primaryLanguage,
}: UseFishcardsKeyboardParams) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (studyMode === 'flashcards' && onFlip) {
          onFlip();
        }
      } else if (e.code === 'ArrowLeft') {
        if (onPrev) onPrev();
      } else if (e.code === 'ArrowRight') {
        if (onNext) onNext();
      } else if (e.code === 'Digit1') {
        e.preventDefault();
        if (currentCard && onSpeak) {
          const textToSpeak =
            studyMode === 'flashcards'
              ? isFlipped
                ? primaryLanguage === 'polish'
                  ? currentCard.english
                  : currentCard.polish
                : primaryLanguage === 'polish'
                ? currentCard.polish
                : currentCard.english
              : primaryLanguage === 'polish'
              ? currentCard.polish
              : currentCard.english;
          const language =
            studyMode === 'flashcards'
              ? isFlipped
                ? primaryLanguage === 'polish'
                  ? 'en-US'
                  : 'pl-PL'
                : primaryLanguage === 'polish'
                ? 'pl-PL'
                : 'en-US'
              : primaryLanguage === 'polish'
              ? 'pl-PL'
              : 'en-US';
          onSpeak(textToSpeak, language);
        }
      } else if (e.code === 'Digit0' && studyMode === 'flashcards') {
        e.preventDefault();
        if (onToggleLearned) onToggleLearned();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onFlip, onPrev, onNext, onSpeak, onToggleLearned, studyMode, isFlipped, currentCard, primaryLanguage]);
}
