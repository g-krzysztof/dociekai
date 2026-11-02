import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse, ResetPasswordData } from '@/types/auth';

const BACKEND = process.env.STRAPI_API_URL || '';

export async function POST(request: NextRequest) {
  if (!BACKEND) {
    return NextResponse.json({ error: 'Backend API nie jest skonfigurowane' }, { status: 500 });
  }

  try {
    const resetPasswordData: ResetPasswordData = await request.json();

    if (!resetPasswordData.code || !resetPasswordData.password || !resetPasswordData.passwordConfirmation) {
      return NextResponse.json({ error: 'Wymagane są code, password i passwordConfirmation' }, { status: 400 });
    }

    const strapiUrl = `${BACKEND.replace(/\/$/, '')}/user-management/reset-password`;
    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetPasswordData),
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

    return NextResponse.json(data as AuthResponse);
  } catch (err) {
    console.error('Reset password API error:', err);
    return NextResponse.json({ error: 'Wystąpił błąd serwera' }, { status: 500 });
  }
}