import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// POST /api/private-fishcards - Create new private flashcard set
export async function POST(request: Request) {
  const base = process.env.STRAPI_API_URL || '';
  
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${base}/private-fishcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ data: body }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to create flashcard set', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create private flashcard set' },
      { status: 500 }
    );
  }
}
