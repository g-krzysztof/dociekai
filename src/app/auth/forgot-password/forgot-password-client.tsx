'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { authApi, ApiErrorClass } from '@/lib/auth-api';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function ForgotPasswordClient() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Pobierz returnUrl z parametrów URL
  const returnUrl = searchParams.get('returnUrl');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Proszę podać adres email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await authApi.forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError('Wystąpił błąd podczas wysyłania emaila');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="flex justify-center py-64 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Card className="w-full max-w-md mx-auto p-6">
          <div className="space-y-6">
            {!success ? (
              <>
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-cyan-600" />
                  </div>
                  <Typography variant="h2" className="text-2xl font-bold">
                    Zapomniałem hasła
                  </Typography>
                  <Typography variant="muted" className="text-sm">
                    Podaj swój adres email, a wyślemy Ci link do resetowania hasła
                  </Typography>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adres email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleInputChange}
                      placeholder="wpisz swój e-mail"
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wysyłanie...
                      </>
                    ) : (
                      'Wyślij link resetowania'
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <Typography variant="h2" className="text-2xl font-bold text-green-600">
                  Email wysłany!
                </Typography>
                <div className="space-y-2">
                  <Typography variant="muted" className="text-sm">
                    Jeśli podany adres email jest zarejestrowany w naszym systemie, 
                    otrzymasz wiadomość z linkiem do resetowania hasła.
                  </Typography>
                  <Typography variant="muted" className="text-xs">
                    Sprawdź także folder spam, jeśli nie widzisz wiadomości w skrzynce odbiorczej.
                  </Typography>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center">
              <Link 
                href={`/auth?mode=login${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
                className="flex items-center text-sm text-cyan-600 hover:text-cyan-500 hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Powrót do logowania
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
