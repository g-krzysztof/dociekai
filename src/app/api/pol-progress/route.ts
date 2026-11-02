import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// GET /api/pol-progress - postęp kursu języka polskiego (klasa 4) zalogowanego użytkownika.
// Kontrakt ze Strapi opisany w docs/info-progress-backend.md (ten sam kontrakt, kolekcja pol-progress).
export async function GET() {
  const base = process.env.STRAPI_API_URL || '';

  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 });
    }

    // Bez backendu (lokalnie, w testach E2E) nie ma dokąd synchronizować — jak przy awarii.
    if (!base) return NextResponse.json({ data: [] });

    const response = await fetch(`${base}/pol-progress`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
      }
      // Postęp z serwera tylko wzbogaca lokalny cache — backend w tym stanie
      // nie może zablokować nauki, więc traktujemy to jak brak danych.
      return NextResponse.json({ data: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ data: [] });
  }
}
