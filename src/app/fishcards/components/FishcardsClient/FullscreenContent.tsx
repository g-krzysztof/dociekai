'use client';

import React from 'react';
import { ProgressIndicators } from './ProgressIndicators';

interface FullscreenContentProps {
  children?: React.ReactNode;
  flashcardsLearned?: number;
  quizLearned?: number;
  totalCards?: number;
}

export const FullscreenContent: React.FC<FullscreenContentProps> = ({
  children,
  flashcardsLearned = 0,
  quizLearned = 0,
  totalCards = 1,
}) => {
  return (
    <div>
      <div>{children}</div>
      <ProgressIndicators flashcardsLearned={flashcardsLearned} quizLearned={quizLearned} totalCards={totalCards} />
    </div>
  );
};
