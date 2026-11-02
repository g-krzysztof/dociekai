import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// GET /api/pol-shelf - Półka czytelnika zalogowanego użytkownika.
// Kontrakt jak seria (`/api/streak`), kolekcja `pol-shelf` — backendu
// w Strapi jeszcze nie ma.
export async function GET() {
  const base = process.env.STRAPI_API_URL || '';

  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 });
    }

    // Bez backendu (lokalnie, w testach E2E) nie ma dokąd synchronizować — jak przy awarii.
    if (!base) return NextResponse.json({ data: null });

    const response = await fetch(`${base}/pol-shelf`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
      }
      // Półka z serwera tylko wzbogaca lokalny cache — dopóki endpointu nie ma
      // w Strapi, funkcja działa lokalnie i nic tego nie blokuje.
      return NextResponse.json({ data: null });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ data: null });
  }
}
