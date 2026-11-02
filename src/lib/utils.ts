import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hook that returns true if we're in development environment, false if in production
 * Based on ENVIRONMENT environment variable (server-side)
 */
export function getUseIsDev(): boolean {
  return process.env.ENVIRONMENT === 'dev' || process.env.NODE_ENV === 'development';
}
