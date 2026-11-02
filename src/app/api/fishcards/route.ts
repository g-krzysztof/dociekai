import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.STRAPI_API_URL || '';
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`${base}/fishcards`, {
      headers: {
        'Content-Type': 'application/json',
        // Add any required headers like Authorization
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcard data' },
      { status: 500 }
    );
  }
}