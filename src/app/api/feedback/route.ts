import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// POST /api/feedback - Create a new feedback/bug report entry, owned by the
// authenticated user. Mirrors src/app/api/private-fishcards/create/route.ts,
// except the body is multipart (Strapi's `data` field + optional
// `files.screenshot` part) instead of JSON, so an attached screenshot can be
// created together with the entry in one request.
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

    const formData = await request.formData();

    // No explicit Content-Type — fetch derives multipart/form-data with a
    // fresh boundary itself from the FormData body.
    const response = await fetch(`${base}/feedback-entries`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: formData,
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
        { error: 'Failed to create feedback entry', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback entry' },
      { status: 500 }
    );
  }
}
