'use client';

import type { ClipboardEvent, CSSProperties, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import type { ParaStyle, TextBlock } from './model';

/**
 * Jeden akapit: **zwykły `<textarea>` na warstwie z barwami**.
 *
 * Pod spodem leży `div` z tym samym tekstem, tym samym krojem i tą samą
 * szerokością — to on rysuje kolor liter i zakreślacz. Nad nim leży przezroczysty
 * `<textarea>`, który przyjmuje pisanie, kursor i zaznaczanie. Dzięki temu
 * klawiatura ekranowa, podpowiedzi, długie przytrzymanie „ą” i kursor palcem
 * działają tak, jak dziecko jest przyzwyczajone — a nie tak, jak potrafi to
 * odtworzyć `contenteditable`.
 *
 * Warstwy leżą na sobie tylko dlatego, że **kolor nie zmienia szerokości liter**.
 * Wszystko, co ją zmienia (krój, pogrubienie, kursywa), jest własnością całego
 * akapitu i trafia do obu warstw tym samym `style`. Warstwa spodnia wyznacza
 * wysokość akapitu, a `<textarea>` po prostu ją wypełnia — nic się nie mierzy.
 */

interface Look {
  size: string;
  line: number;
  weight: number;
  /** Odstęp nad akapitem — tytuły i nagłówki dostają go więcej. */
  before: string;
}

const LOOKS: Record<ParaStyle, Look> = {
  title: { size: '1.875rem', line: 1.2, weight: 700, before: '0.75rem' },
  h1: { size: '1.5rem', line: 1.25, weight: 700, before: '0.75rem' },
  h2: { size: '1.25rem', line: 1.3, weight: 700, before: '0.5rem' },
  h3: { size: '1.1rem', line: 1.35, weight: 700, before: '0.375rem' },
  normal: { size: '1rem', line: 1.6, weight: 400, before: '0.125rem' },
};

/** Wygląd tekstu — dokładnie ten sam dla obu warstw, bo od tego zależy, czy się pokrywają. */
export function typography(block: TextBlock, family: string | undefined): CSSProperties {
  const look = LOOKS[block.style];
  return {
    fontFamily: family,
    fontSize: look.size,
    lineHeight: look.line,
    fontWeight: block.bold ? 700 : look.weight,
    fontStyle: block.italic ? 'italic' : 'normal',
    textDecoration: block.underline ? 'underline' : 'none',
    textAlign: block.align ?? 'left',
    letterSpacing: 'normal',
  };
}

interface TextViewProps {
  block: TextBlock;
  /** Numer akapitu w dokumencie — do opisu dla czytnika ekranu. */
  index: number;
  /** Punktor albo numer pozycji listy; `null` poza listą. */
  marker: string | null;
  active: boolean;
  color: string;
  /** Rodzina czcionek CSS dla wybranego kroju (z listy lekcji). */
  family: string | undefined;
  register: (id: string, element: HTMLTextAreaElement | null) => void;
  onActivate: (id: string) => void;
  onText: (id: string, value: string) => void;
  onKey: (event: KeyboardEvent<HTMLTextAreaElement>, block: TextBlock) => void;
  onSelection: (id: string, from: number, to: number) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>, block: TextBlock) => void;
}

const STYLE_LABEL: Record<ParaStyle, string> = {
  normal: 'zwykły tekst',
  title: 'tytuł',
  h1: 'nagłówek 1',
  h2: 'nagłówek 2',
  h3: 'nagłówek 3',
};

export function TextView({
  block,
  index,
  marker,
  active,
  color,
  family,
  register,
  onActivate,
  onText,
  onKey,
  onSelection,
  onPaste,
}: TextViewProps) {
  const style = typography(block, family);
  const text = block.spans.map((span) => span.text).join('');

  return (
    <div
      data-kind="text"
      data-active={active || undefined}
      className={cn('flex items-baseline gap-2 border-l-2 pl-2', !active && 'border-transparent')}
      style={{
        paddingTop: LOOKS[block.style].before,
        borderColor: active ? color : undefined,
      }}
    >
      {marker && (
        <span
          aria-hidden
          className="w-7 shrink-0 select-none text-right tabular-nums"
          style={{ fontSize: '1rem', lineHeight: 1.6 }}
        >
          {marker}
        </span>
      )}
      <div className="relative min-w-0 flex-1">
        {/* Warstwa spodnia: rysuje barwy i wyznacza wysokość. */}
        <div
          aria-hidden
          className="pointer-events-none select-none whitespace-pre-wrap break-words"
          style={style}
        >
          {block.spans.map((span, i) => (
            <span
              key={i}
              style={{
                color: span.color ?? undefined,
                backgroundColor: span.highlight ?? undefined,
              }}
            >
              {span.text}
            </span>
          ))}
          {/* Bez tego ostatnia, pusta linia po Shift+Enter nie miałaby wysokości. */}
          {'​'}
        </div>
        <textarea
          ref={(element) => register(block.id, element)}
          value={text}
          rows={1}
          lang="pl"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          aria-label={`Akapit ${index + 1}, ${STYLE_LABEL[block.style]}`}
          onFocus={(event) => {
            onActivate(block.id);
            onSelection(block.id, event.currentTarget.selectionStart, event.currentTarget.selectionEnd);
          }}
          onChange={(event) => onText(block.id, event.currentTarget.value)}
          onKeyDown={(event) => onKey(event, block)}
          onSelect={(event) =>
            onSelection(block.id, event.currentTarget.selectionStart, event.currentTarget.selectionEnd)
          }
          onPaste={(event) => onPaste(event, block)}
          className="absolute inset-0 block h-full w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-transparent caret-zinc-900 outline-none selection:bg-sky-400/40"
          style={style}
        />
      </div>
    </div>
  );
}
