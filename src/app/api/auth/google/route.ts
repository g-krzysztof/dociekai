import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse } from '@/types/auth';

const BACKEND = process.env.STRAPI_API_URL || '';

export async function POST(request: NextRequest) {
  if (!BACKEND) {
    return NextResponse.json({ error: 'Backend API nie jest skonfigurowane' }, { status: 500 });
  }

  try {
    const body: { credential?: string } = await request.json();

    if (!body.credential) {
      return NextResponse.json({ error: 'Brak tokenu Google' }, { status: 400 });
    }

    const strapiUrl = `${BACKEND.replace(/\/$/, '')}/user-management/google`;
    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: body.credential }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const rec = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
      
      // Obsługa różnych formatów błędów z backendu
      let msg = 'Błąd logowania przez Google';
      
      if (typeof rec['error'] === 'string') {
        // Backend zwraca { error: "komunikat" }
        msg = rec['error'] as string;
      } else if (typeof rec['error'] === 'object' && rec['error']) {
        // Backend zwraca { error: { message: "komunikat" } }
        const errorObj = rec['error'] as Record<string, unknown>;
        msg = (errorObj['message'] as string) || msg;
      } else if (rec['message']) {
        // Backend zwraca { message: "komunikat" }
        msg = rec['message'] as string;
      }
      
      return NextResponse.json({ error: msg }, { status: response.status });
    }

    return NextResponse.json(data as AuthResponse);
  } catch (err) {
    console.error('Google login API error:', err);
    return NextResponse.json({ error: 'Wystąpił błąd serwera' }, { status: 500 });
  }
}
