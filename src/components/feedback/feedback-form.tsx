'use client';

import { useState, type FormEvent } from 'react';
import { Camera, Loader2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { feedbackApi, type FeedbackCategory } from '@/lib/feedback-api';

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: 'bug', label: 'Błąd' },
  { value: 'pomysl', label: 'Sugestia' },
  { value: 'pytanie', label: 'Pytanie' },
  { value: 'inne', label: 'Inne' },
];

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface FeedbackScreenshot {
  blob: Blob;
  previewUrl: string;
}

interface FeedbackFormProps {
  pageUrl: string;
  initialPageLabel: string;
  screenshot: FeedbackScreenshot | null;
  onRequestScreenshot: () => void;
  onRemoveScreenshot: () => void;
}

export function FeedbackForm({
  pageUrl,
  initialPageLabel,
  screenshot,
  onRequestScreenshot,
  onRemoveScreenshot,
}: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [message, setMessage] = useState('');
  const [pageLabel, setPageLabel] = useState(initialPageLabel);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage(null);

    try {
      await feedbackApi.submit(
        {
          ...(category ? { category } : {}),
          message: message.trim(),
          pageUrl,
          pageLabel: pageLabel.trim(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        },
        screenshot?.blob
      );
      setStatus('success');
      onRemoveScreenshot();
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Nie udało się wysłać zgłoszenia');
    }
  };

  if (status === 'success') {
    return (
      <div className="py-6 text-center">
        <p className="text-base font-medium">Dzięki! Zgłoszenie zostało wysłane.</p>
        <p className="text-muted-foreground mt-1 text-sm">Trafiło do zespołu DociekAI.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="feedback-category">Kategoria</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as FeedbackCategory)}>
          <SelectTrigger id="feedback-category">
            <SelectValue placeholder="Wybierz kategorię" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="feedback-message">
          Treść <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="feedback-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Opisz, co zauważyłeś/aś — np. „Przycisk Dalej nie reaguje na kliknięcie”"
          rows={4}
          required
        />
      </div>

      <p className="text-muted-foreground text-xs">
        <span className="text-destructive">*</span> pole wymagane
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="feedback-context">Czego dotyczy</Label>
        <Input
          id="feedback-context"
          value={pageLabel}
          onChange={(event) => setPageLabel(event.target.value)}
          placeholder="Np. nazwa lekcji lub strony"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Zrzut ekranu (opcjonalnie)</Label>
        {screenshot ? (
          <div className="relative overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, not an optimizable remote image */}
            <img
              src={screenshot.previewUrl}
              alt="Zaznaczony fragment strony"
              className="bg-muted max-h-40 w-full object-contain"
            />
            <button
              type="button"
              onClick={onRemoveScreenshot}
              aria-label="Usuń zrzut ekranu"
              className="bg-background/90 hover:bg-background absolute top-2 right-2 rounded-full p-1.5 shadow"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={onRequestScreenshot} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Zaznacz obszar i dodaj zrzut
          </Button>
        )}
      </div>

      {status === 'error' && errorMessage && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={!message.trim() || status === 'submitting'}
        className="w-full"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wysyłanie…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Wyślij
          </>
        )}
      </Button>
    </form>
  );
}
