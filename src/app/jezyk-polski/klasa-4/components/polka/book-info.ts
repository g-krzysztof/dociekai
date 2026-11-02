import { bookById } from '../../data/czytelnia';
import { POL_LESSONS, type PolLesson } from '../../data/lessons';
import type { ShelfBookInfo } from '../../lib/polka/summary';
import type { ShelfEntry } from '../../lib/polka/types';

/**
 * Krótkie teksty z lekcji, które stają na Półce (`lekcja:<moduł>/<lekcja>`):
 * tytuł i autor tekstu, nie lekcji. Lekcja, która stawia tekst na Półce,
 * dopisuje go tutaj; bez wpisu Półka pokaże tytuł lekcji.
 */
export const SHELF_LESSON_TEXTS: Record<string, { title: string; author?: string; genre?: string }> = {
  'ja-i-my/mazurek-i-rota#mazurek': { title: 'Mazurek Dąbrowskiego', author: 'Józef Wybicki', genre: 'pieśń' },
  'ja-i-my/mazurek-i-rota#rota': { title: 'Rota', author: 'Maria Konopnicka', genre: 'wiersz' },
};

/** Lekcja po kluczu `<moduł>/<lekcja>`. */
export function lessonByKey(key: string): PolLesson | undefined {
  const [moduleSlug, slug] = key.split('/');
  return POL_LESSONS.find((l) => l.moduleSlug === moduleSlug && l.slug === slug);
}

/** Co pokazać o pozycji na Półce; `null` — książki nie ma już w kursie (widok ją pomija). */
export function shelfBookInfo(entry: ShelfEntry): ShelfBookInfo | null {
  if (entry.kind === 'czytelnia') {
    const book = bookById(entry.bookId);
    if (!book) return null;
    const author = book.translator ? `${book.author}, tłum. ${book.translator}` : book.author;
    return { title: book.title, author, genre: book.genre, total: book.episodes.length };
  }
  const key = entry.bookId.replace(/^lekcja:/, '');
  const text = SHELF_LESSON_TEXTS[key];
  if (text) return { ...text, total: 1 };
  const lesson = lessonByKey(key);
  return lesson ? { title: lesson.short, genre: 'tekst z lekcji', total: 1 } : null;
}
