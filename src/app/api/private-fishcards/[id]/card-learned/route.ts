import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// PUT /api/private-fishcards/[id]/card-learned - Update card learned status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const base = process.env.STRAPI_API_URL || '';
  
  try {
    const { id } = await params;
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${base}/private-fishcards/${id}/card-learned`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
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
        { error: 'Failed to update card learned status', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update card learned status' },
      { status: 500 }
    );
  }
}
