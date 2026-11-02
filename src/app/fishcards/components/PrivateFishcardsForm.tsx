'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { getAuthToken } from '@/lib/auth-token';

interface Flashcard {
  id: number;
  polish: string;
  english: string;
  learned: boolean;
}

interface FlashcardSet {
  id: string;
  numericId?: number; // For API operations that require numeric ID
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cards: Flashcard[];
}

interface PrivateFishcardsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (setId?: string) => void;
  editSetId?: string;
  flashcardSets?: FlashcardSet[];
}

export const PrivateFishcardsForm: React.FC<PrivateFishcardsFormProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editSetId,
  flashcardSets,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  const isEditMode = !!editSetId;
  const existingSet = isEditMode && flashcardSets ? flashcardSets.find(s => s.id === editSetId) : null;
  
  const [formData, setFormData] = useState({
    name: existingSet?.name || '',
    description: existingSet?.description || '',
    category: 'private',
    difficulty: (existingSet?.difficulty || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
  });

  const [cards, setCards] = useState<Omit<Flashcard, 'id' | 'learned'>[]>(
    existingSet?.cards.map(c => ({ polish: c.polish, english: c.english })) || [{ polish: '', english: '' }]
  );

  const [jsonInput, setJsonInput] = useState('');

  const handleAddCard = () => {
    const newCards = [...cards, { polish: '', english: '' }];
    setCards(newCards);
    updateJsonFromCards(newCards);
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length > 1) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
      updateJsonFromCards(newCards);
    }
  };

  const handleCardChange = (index: number, field: 'polish' | 'english', value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
    updateJsonFromCards(newCards);
  };

  const updateJsonFromCards = (cardsArray: Omit<Flashcard, 'id' | 'learned'>[]) => {
    const jsonString = JSON.stringify(cardsArray, null, 2);
    setJsonInput(jsonString);
    setJsonError(null);
  };

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    setJsonError(null);

    if (!value.trim()) {
      setCards([{ polish: '', english: '' }]);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      
      if (!Array.isArray(parsed)) {
        setJsonError('JSON musi być tablicą obiektów');
        return;
      }

      const validCards = parsed.filter((item) => {
        return item && typeof item === 'object' && 
               ('polish' in item || 'pl' in item) && 
               ('english' in item || 'en' in item);
      }).map((item) => ({
        polish: item.polish || item.pl || '',
        english: item.english || item.en || '',
      }));

      if (validCards.length === 0) {
        setJsonError('Nie znaleziono poprawnych fiszek. Każda fiszka musi mieć pola: polish (lub pl) i english (lub en)');
        return;
      }

      setCards(validCards);
      setJsonError(null);
    } catch {
      setJsonError('Nieprawidłowy format JSON');
    }
  };

  // Update JSON when cards change (on mount or when adding/removing)
  React.useEffect(() => {
    if (cards.length > 0 && !jsonInput) {
      updateJsonFromCards(cards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tylko przy montowaniu
  }, []);

  // Load existing data when opening in edit mode
  React.useEffect(() => {
    if (open && isEditMode && existingSet) {
      console.log('Loading existing set for edit:', editSetId, existingSet);
      setFormData({
        name: existingSet.name,
        description: existingSet.description,
        category: 'private',
        difficulty: existingSet.difficulty,
      });
      const existingCards = existingSet.cards.map(c => ({ polish: c.polish, english: c.english }));
      setCards(existingCards);
      updateJsonFromCards(existingCards);
    } else if (open && !isEditMode) {
      // Reset form for add mode
      setFormData({
        name: '',
        description: '',
        category: 'private',
        difficulty: 'beginner',
      });
      setCards([{ polish: '', english: '' }]);
      setJsonInput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editSetId tylko do logu, nie ma wywoływać ponownego ładowania
  }, [open, isEditMode, existingSet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate cards
      const validCards = cards.filter((card) => card.polish.trim() && card.english.trim());
      
      if (validCards.length === 0) {
        setError('Dodaj przynajmniej jedną fiszkę z wypełnionymi polami');
        setLoading(false);
        return;
      }

      // Prepare cards array with IDs
      const cardsArray: Flashcard[] = validCards.map((card, index) => ({
        id: index + 1,
        polish: card.polish.trim(),
        english: card.english.trim(),
        learned: false,
      }));

      const token = getAuthToken();
      if (!token) {
        setError('Brak tokenu autoryzacji');
        setLoading(false);
        return;
      }
      
      // Use numericId for API calls if available
      const apiId = isEditMode 
        ? (existingSet?.numericId || editSetId) 
        : null;
      
      const response = await fetch(
        isEditMode ? `/api/private-fishcards/${apiId}` : '/api/private-fishcards/create',
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            difficulty: formData.difficulty,
            jsonData: {
              cards: cardsArray,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Nie udało się ${isEditMode ? 'zaktualizować' : 'utworzyć'} zestawu fiszek`);
      }

      const responseData = await response.json();

      // Get the set ID from response (for create) or use editSetId (for update)
      const resultSetId = isEditMode 
        ? editSetId 
        : (responseData?.data?.documentId || responseData?.data?.id);

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'private',
        difficulty: 'beginner',
      });
      setCards([{ polish: '', english: '' }]);
      
      onOpenChange(false);
      onSuccess?.(resultSetId);
    } catch (err) {
      console.error('Error creating flashcard set:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edytuj zestaw fiszek' : 'Dodaj nowy zestaw fiszek'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Zaktualizuj istniejący zestaw fiszek. Możesz edytować dowolną liczbę kart.'
              : 'Utwórz własny zestaw fiszek do nauki. Możesz dodać dowolną liczbę kart.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa zestawu *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="np. Moje słówka z angielskiego"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Krótki opis zestawu (opcjonalnie)"
              rows={3}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Poziom trudności *</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                setFormData({ ...formData, difficulty: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz poziom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Początkujący</SelectItem>
                <SelectItem value="intermediate">Średni</SelectItem>
                <SelectItem value="advanced">Zaawansowany</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards - JSON Input */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="json-input">Fiszki (format JSON) *</Label>
              <Textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => handleJsonInputChange(e.target.value)}
                placeholder={`[
  {"polish": "cześć", "english": "hello"},
  {"polish": "dziękuję", "english": "thank you"}
]

Możesz użyć również skróconych nazw pól:
[{"pl": "cześć", "en": "hello"}]`}
                rows={8}
                className="font-mono text-sm"
              />
              {jsonError && (
                <p className="text-sm text-destructive">{jsonError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Wklej tablicę JSON z fiszkami lub edytuj poniżej używając przycisków
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Edycja ręczna</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCard}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Dodaj fiszkę
              </Button>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Polski"
                      value={card.polish}
                      onChange={(e) => handleCardChange(index, 'polish', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Angielski"
                      value={card.english}
                      onChange={(e) => handleCardChange(index, 'english', e.target.value)}
                      required
                    />
                  </div>
                  {cards.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCard(index)}
                      className="h-auto px-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEditMode ? 'Aktualizowanie...' : 'Tworzenie...') : (isEditMode ? 'Zaktualizuj zestaw' : 'Utwórz zestaw')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
