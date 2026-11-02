import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const base = process.env.STRAPI_API_URL || '';
  
  try {
    // Get authorization token from request headers
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }

    // Forward the request to Strapi with the authorization token
    const response = await fetch(`${base}/private-fishcards`, {
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
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch private flashcard data' },
      { status: 500 }
    );
  }
}
