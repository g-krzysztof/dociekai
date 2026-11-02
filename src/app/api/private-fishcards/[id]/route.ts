import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// PUT /api/private-fishcards/[id] - Update private flashcard set
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

    const response = await fetch(`${base}/private-fishcards/${id}`, {
      method: 'PUT',
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
        { error: 'Failed to update flashcard set', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update private flashcard set' },
      { status: 500 }
    );
  }
}

// DELETE /api/private-fishcards/[id] - Delete private flashcard set
export async function DELETE(
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

    const response = await fetch(`${base}/private-fishcards/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
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
        { error: 'Failed to delete flashcard set', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete private flashcard set' },
      { status: 500 }
    );
  }
}
