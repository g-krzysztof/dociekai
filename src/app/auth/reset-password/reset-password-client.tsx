'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { authApi, ApiErrorClass } from '@/lib/auth-api';
import { Loader2, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { setAuthToken } from '@/lib/auth-token';

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pobierz kod z URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl);
    }
  }, [searchParams]);
  
  // Pobierz returnUrl z parametrów URL
  const returnUrl = searchParams.get('returnUrl');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Brak kodu resetowania. Sprawdź link z emaila.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Hasła nie są zgodne');
      return;
    }

    if (password.length < 8) {
      setError('Hasło musi mieć przynajmniej 8 znaków');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.resetPassword({
        code: code.trim(),
        password,
        passwordConfirmation,
      });
      
      // Zapisz token i pokaż sukces
      setAuthToken(response.jwt);
      setSuccess(true);
      
      // Przekieruj po 3 sekundach
      setTimeout(() => {
        const redirectTo = returnUrl && returnUrl !== '/' ? returnUrl : '/profil';
        router.push(redirectTo);
      }, 3000);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError('Wystąpił błąd podczas resetowania hasła');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'code':
        setCode(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'passwordConfirmation':
        setPasswordConfirmation(value);
        break;
    }
    if (error) setError(null);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="flex justify-center py-64 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Card className="w-full max-w-md mx-auto p-6">
          <div className="space-y-6">
            {!success ? (
              <>
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <Typography variant="h2" className="text-2xl font-bold">
                    Ustaw nowe hasło
                  </Typography>
                  <Typography variant="muted" className="text-sm">
                    Wprowadź nowe hasło dla swojego konta
                  </Typography>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Kod resetowania</Label>
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="Wprowadź kod z emaila"
                      required
                      disabled={loading}
                    />
                    <Typography variant="muted" className="text-xs">
                      Kod znajdziesz w emailu z linkiem resetowania hasła
                    </Typography>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Nowe hasło</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder=""
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <Typography variant="muted" className="text-xs">
                      Hasło musi mieć przynajmniej 8 znaków
                    </Typography>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirmation">Potwierdź hasło</Label>
                    <div className="relative">
                      <Input
                        id="passwordConfirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordConfirmation}
                        onChange={(e) => handleInputChange('passwordConfirmation', e.target.value)}
                        placeholder=""
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetowanie hasła...
                      </>
                    ) : (
                      'Ustaw nowe hasło'
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <Typography variant="h2" className="text-2xl font-bold text-green-600">
                  Hasło zostało zresetowane!
                </Typography>
                <div className="space-y-2">
                  <Typography variant="muted" className="text-sm">
                    Twoje hasło zostało pomyślnie zmienione. 
                    Za chwilę zostaniesz przekierowany do swojego profilu.
                  </Typography>
                  <div className="flex justify-center mt-4">
                    <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link 
                href={`/auth?mode=login${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
                className="text-sm text-cyan-600 hover:text-cyan-500 hover:underline"
              >
                Wróć do logowania
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
