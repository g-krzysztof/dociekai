'use client';

import React from 'react';
import { Flashcard, StudyMode } from './types';

interface ProgressBarsProps {
  studyMode: StudyMode;
  flashcardsProgress: number;
  quizProgress: number;
  flashcardsLearned: Set<number>;
  quizLearned: Set<number>;
  cards: Flashcard[];
  filteredCards: Flashcard[];
  totalQuizAnswers: number;
  quizCorrect: number;
  quizIncorrect: number;
}

export const ProgressBars: React.FC<ProgressBarsProps> = ({
  studyMode,
  flashcardsProgress,
  quizProgress,
  flashcardsLearned,
  quizLearned,
  cards,
  filteredCards,
  totalQuizAnswers,
  quizCorrect,
  quizIncorrect,
}) => {
  const quizCorrectPercentage =
    totalQuizAnswers > 0 ? (quizCorrect / filteredCards.length) * 100 : 0;
  const quizIncorrectPercentage =
    totalQuizAnswers > 0 ? (quizIncorrect / filteredCards.length) * 100 : 0;

  return (
    <div className="mt-4 space-y-3">
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>🃏 Postęp Fiszek</span>
          <span>
            {flashcardsLearned.size}/{cards.length} ({Math.round(flashcardsProgress)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${flashcardsProgress}%` }}
          ></div>
        </div>
      </div>

      {studyMode === 'quiz' ? (
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>🧠 Postęp Quiz</span>
            <span>
              {totalQuizAnswers}/{filteredCards.length} ({quizCorrect} ✅ / {quizIncorrect} ❌)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 bg-green-500 h-3 transition-all duration-500"
              style={{ width: `${quizCorrectPercentage}%` }}
            ></div>
            <div
              className="absolute right-0 top-0 bg-red-500 h-3 transition-all duration-500"
              style={{ width: `${quizIncorrectPercentage}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>🧠 Postęp Quiz</span>
            <span>
              {quizLearned.size}/{cards.length} ({Math.round(quizProgress)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${quizProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};