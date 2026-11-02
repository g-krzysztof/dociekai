'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/components/auth-context';
import { GoogleSignInButton, googleSignInEnabled } from '@/components/google-sign-in-button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { login, register, loginWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    identifier: '', // dla logowania
  });

  const isLogin = mode === 'login';
  const title = isLogin ? 'Zaloguj się' : 'Utwórz konto';
  const switchText = isLogin ? 'Nie masz konta?' : 'Masz już konto?';
  
  // Pobierz returnUrl z parametrów URL
  const returnUrl = searchParams.get('returnUrl');
  
  // Konstruuj linki dla przełączania między logowaniem a rejestracją z zachowaniem returnUrl
  const switchLink = isLogin 
    ? `/auth?mode=register${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`
    : `/auth?mode=login${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
  const switchLinkText = isLogin ? 'Zarejestruj się' : 'Zaloguj się';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Wyczyść błąd gdy użytkownik zaczyna pisać
    if (error) clearError();
  };

  const finish = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      const redirectTo = returnUrl && returnUrl !== '/' ? returnUrl : '/profil';
      router.push(redirectTo);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    if (await loginWithGoogle(credential)) finish();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Zapobiegnij domyślnemu zachowaniu formularza (odświeżeniu strony)
    e.preventDefault();
    e.stopPropagation();
    
    let success = false;
    
    if (isLogin) {
      success = await login(formData.identifier, formData.password);
    } else {
      success = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
    }
    
    // Tylko przekieruj jeśli operacja była udana
    if (success) {
      finish();
    } else {
      console.log('[AuthForm] Registration failed, keeping form data');
    }
    // Jeśli success === false, błąd jest już wyświetlony w UI i dane pozostają w formularzu
    
    return false;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Typography variant="h2" className="text-2xl font-bold">
            {title}
          </Typography>
          <Typography variant="muted" className="text-sm">
            {isLogin 
              ? 'Wprowadź swoje dane aby się zalogować' 
              : 'Wypełnij poniższe pola aby utworzyć konto'
            }
          </Typography>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {googleSignInEnabled && (
          <>
            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              text={isLogin ? 'continue_with' : 'signup_with'}
            />
            <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
              <span className="h-px flex-1 bg-border" />
              albo e-mailem
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="identifier">Email lub nazwa użytkownika</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleInputChange}
                placeholder="mail / nazwa"
                required
                disabled={loading}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Imię</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="imię"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nazwisko</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="nazwisko"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nazwa użytkownika *</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="twoja nazwa użytkownika"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adres email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="twój działający e-mail"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
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
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Logowanie...' : 'Tworzenie konta...'}
              </>
            ) : (
              title
            )}
          </Button>

          {!isLogin && (
            <p className="text-center text-xs text-muted-foreground">
              Zakładając konto, akceptujesz{' '}
              <Link href="/polityka-prywatnosci" className="underline underline-offset-4 hover:text-foreground">
                politykę prywatności
              </Link>
              .
            </p>
          )}
        </form>

        {isLogin && (
          <div className="text-center">
            <Link 
              href={`/auth/forgot-password${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
              className="text-sm text-primary hover:text-primary/80 hover:underline"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          {switchText}{' '}
          <Link 
            href={switchLink}
            className="text-primary hover:text-primary/80 hover:underline font-medium"
          >
            {switchLinkText}
          </Link>
        </div>
      </div>
    </Card>
  );
}
