import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Walidacja danych
    const { firstName, lastName, email, phone, subject, message } = body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Wszystkie wymagane pola muszą być wypełnione' },
        { status: 400 }
      );
    }

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Nieprawidłowy format adresu email' }, { status: 400 });
    }

    // Przygotowanie danych dla Strapi
    const formData: ContactFormData = {
      name: `${firstName} ${lastName}`,
      email,
      subject,
      message,
      phone: phone || '',
    };

    // Sprawdzenie konfiguracji Strapi
    const strapiUrl = process.env.STRAPI_API_URL;
    if (!strapiUrl) {
      console.error('STRAPI_API_URL nie jest skonfigurowane');
      return NextResponse.json({ error: 'Błąd konfiguracji serwera' }, { status: 500 });
    }

    // Wysłanie danych do Strapi
    const strapiResponse = await fetch(`${strapiUrl}/contact-form/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!strapiResponse.ok) {
      const errorText = await strapiResponse.text();
      console.error('Błąd odpowiedzi z Strapi:', strapiResponse.status, errorText);
      return NextResponse.json(
        { error: 'Wystąpił błąd podczas wysyłania wiadomości' },
        { status: 500 }
      );
    }

    const result = await strapiResponse.json();

    return NextResponse.json(
      {
        success: true,
        message: 'Wiadomość została wysłana pomyślnie',
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Błąd podczas przetwarzania formularza kontaktowego:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas wysyłania wiadomości' },
      { status: 500 }
    );
  }
}
