'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { FishcardsClient } from './fishcards-client';
import { FishcardsLanding } from './fishcards-landing';
import { getAuthToken } from '@/lib/auth-token';

interface Flashcard {
  id: number;
  polish: string;
  english: string;
  learned: boolean;
}

interface FlashcardSet {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ApiFlashcardSet {
  id: number;
  documentId: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  jsonData: Flashcard[] | { cards: Flashcard[] };
}

interface ApiResponse {
  data: ApiFlashcardSet[];
  meta: Record<string, unknown>;
}

export default function FishcardsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFlashcardSets = async (preserveSetId?: string) => {
    try {
      setLoading(true);
      // Load public flashcard sets
      const response = await fetch('/api/fishcards');
      if (!response.ok) {
        throw new Error('Failed to fetch flashcard sets');
      }

      const apiData: ApiResponse = await response.json();

      const sets = apiData.data.map((set) => {
        // Handle jsonData which can be either array or object with cards property
        const cardsArray = Array.isArray(set.jsonData) 
          ? set.jsonData 
          : (set.jsonData?.cards || []);
        
        return {
          id: set.documentId,
          name: set.name,
          description: set.description,
          category: set.category,
          difficulty: set.difficulty,
          cards: cardsArray,
        };
      });

      // Load private flashcard sets if authenticated
      if (isAuthenticated) {
        try {
          const token = getAuthToken();
          if (token) {
            const privateResponse = await fetch('/api/private-fishcards', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (privateResponse.ok) {
              const privateApiData: ApiResponse = await privateResponse.json();
              
              const privateSets = privateApiData.data.map((set) => {
                // Handle jsonData which can be either array or object with cards property
                const cardsArray = Array.isArray(set.jsonData) 
                  ? set.jsonData 
                  : (set.jsonData?.cards || []);
                
                return {
                  id: set.documentId || String(set.id), // Try documentId first, fallback to numeric id
                  numericId: set.id, // Store numeric ID separately for API calls
                  name: set.name,
                  description: set.description,
                  category: 'private', // Mark private sets with special category
                  difficulty: set.difficulty,
                  cards: cardsArray,
                };
              });
              
              // Combine public and private sets
              const combinedSets = [...sets, ...privateSets];
              setFlashcardSets(combinedSets);
              
              // Preserve current set selection if specified
              if (preserveSetId && typeof window !== 'undefined') {
                const preserved = combinedSets.find(s => s.id === preserveSetId);
                if (preserved) {
                  // Trigger event to notify FishcardsClient to maintain selection
                  // Use setTimeout to ensure React has finished updating state
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('preserveSetSelection', { 
                      detail: { setId: preserveSetId } 
                    }));
                  }, 100);
                }
              }
            } else {
              // If private fetch fails, just use public sets
              const combinedSets = sets;
              setFlashcardSets(combinedSets);
              if (preserveSetId && typeof window !== 'undefined') {
                const preserved = combinedSets.find(s => s.id === preserveSetId);
                if (preserved) {
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('preserveSetSelection', { 
                      detail: { setId: preserveSetId } 
                    }));
                  }, 100);
                }
              }
            }
          } else {
            const combinedSets = sets;
            setFlashcardSets(combinedSets);
            if (preserveSetId && typeof window !== 'undefined') {
              const preserved = combinedSets.find(s => s.id === preserveSetId);
              if (preserved) {
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('preserveSetSelection', { 
                    detail: { setId: preserveSetId } 
                  }));
                }, 100);
              }
            }
          }
        } catch (privateError) {
          console.error('Failed to load private flashcard sets:', privateError);
          // Continue with public sets only
          setFlashcardSets(sets);
        }
      } else {
        setFlashcardSets(sets);
      }
    } catch (error) {
      console.error('Failed to load flashcard sets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashcardSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadFlashcardSets jest odtwarzana co render; efekt ma biec tylko po zmianie isAuthenticated
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <FishcardsLanding />;
  }

  return <FishcardsClient flashcardSets={flashcardSets} onReload={loadFlashcardSets} />;
}
