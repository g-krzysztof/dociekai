import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// POST /api/hist-progress/sync - zbiorczy upsert postępu kursu historii;
// scalanie (suma ukończonych bloków) robi backend, kontrakt jak w docs/info-progress-backend.md.
export async function POST(request: Request) {
  const base = process.env.STRAPI_API_URL || '';

  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 });
    }

    // Bez backendu (lokalnie, w testach E2E) nie ma dokąd synchronizować — jak przy awarii.
    if (!base) return NextResponse.json({ data: [] });

    const body = await request.json();

    const response = await fetch(`${base}/hist-progress/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
      }
      // Synchronizacja jest najlepszym wysiłkiem — lokalny zapis już się udał.
      return NextResponse.json({ data: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ data: [] });
  }
}
