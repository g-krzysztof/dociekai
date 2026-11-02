'use client';

import React from 'react';

interface ProgressIndicatorsProps {
  flashcardsLearned: number;
  quizLearned: number;
  totalCards: number;
}

export const ProgressIndicators: React.FC<ProgressIndicatorsProps> = ({
  flashcardsLearned,
  quizLearned,
  totalCards,
}) => {
  const flashcardsProgress = totalCards > 0 ? (flashcardsLearned / totalCards) * 100 : 0;
  const quizProgress = totalCards > 0 ? (quizLearned / totalCards) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>🃏 Postęp Fiszek</span>
          <span>
            {flashcardsLearned}/{totalCards} ({Math.round(flashcardsProgress)}%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${flashcardsProgress}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>🧠 Postęp Quiz</span>
          <span>
            {quizLearned}/{totalCards} ({Math.round(quizProgress)}%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${quizProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
