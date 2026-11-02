'use client';

import { CompletionStamp } from './completion-stamp';
import { useMathProgress } from '../lib/progress';

/** Pieczątka nad ilustracją w nagłówku modułu — tylko gdy wszystkie dostępne lekcje są ukończone. */
export function ModuleHeaderStamp({ moduleSlug }: { moduleSlug: string }) {
  const { moduleProgress, ready } = useMathProgress();
  if (!ready || moduleProgress[moduleSlug]?.status !== 'done') return null;

  return <CompletionStamp label="Moduł ukończony" className="right-3 top-3 sm:right-5 sm:top-5" />;
}
