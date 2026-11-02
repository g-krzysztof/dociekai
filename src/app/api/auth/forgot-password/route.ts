import { NextRequest, NextResponse } from 'next/server';
import { ForgotPasswordData } from '@/types/auth';

const BACKEND = process.env.STRAPI_API_URL || '';

export async function POST(request: NextRequest) {
  if (!BACKEND) {
    return NextResponse.json({ error: 'Backend API nie jest skonfigurowane' }, { status: 500 });
  }

  try {
    const forgotPasswordData: ForgotPasswordData = await request.json();

    if (!forgotPasswordData.email) {
      return NextResponse.json({ error: 'Wymagany jest adres email' }, { status: 400 });
    }

    const strapiUrl = `${BACKEND.replace(/\/$/, '')}/user-management/forgot-password`;
    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forgotPasswordData),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const rec = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
      
      // Obsługa różnych formatów błędów z backendu
      let msg = 'Błąd resetowania hasła';
      
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

    return NextResponse.json(data as { message: string });
  } catch (err) {
    console.error('Forgot password API error:', err);
    return NextResponse.json({ error: 'Wystąpił błąd serwera' }, { status: 500 });
  }
}