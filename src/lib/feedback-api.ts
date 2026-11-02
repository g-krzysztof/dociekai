// Thin client for POST /api/feedback — the Next.js proxy to Strapi's
// feedback-entries collection. Mirrors the auth-api.ts pattern: client code
// never calls Strapi directly, only this same-origin route.

import { getAuthToken } from '@/lib/auth-token';

export type FeedbackCategory = 'bug' | 'pomysl' | 'pytanie' | 'inne';

export interface FeedbackPayload {
  category?: FeedbackCategory;
  message: string;
  pageUrl: string;
  pageLabel: string;
  userAgent: string;
}

class ApiErrorClass extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export const feedbackApi = {
  // Always multipart — Strapi's REST create accepts a `data` field (JSON) plus
  // `files.<attribute>` parts in the same request, which is the standard way
  // to create an entry and attach a media field in one call. `screenshot` is
  // optional; when omitted the request is just a `data`-only multipart body.
  async submit(payload: FeedbackPayload, screenshot?: Blob | null): Promise<void> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiErrorClass('Brak tokenu autoryzacji', 401);
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    if (screenshot) {
      formData.append('files.screenshot', screenshot, 'screenshot.png');
    }

    // No explicit Content-Type — fetch sets multipart/form-data with the
    // correct boundary itself when the body is a FormData instance.
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        typeof errorData?.error === 'string' ? errorData.error : 'Nie udało się wysłać zgłoszenia';
      throw new ApiErrorClass(message, response.status);
    }
  },
};

export { ApiErrorClass };
