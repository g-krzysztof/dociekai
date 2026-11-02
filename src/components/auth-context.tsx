'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthResponse, User } from '@/types/auth';
import { authApi, ApiErrorClass } from '@/lib/auth-api';
// Sprzężenie z postępem kursów jest świadome: to jedyne miejsce,
// które zawsze widzi przejścia logowania/wylogowania niezależnie od tego, na
// jakiej stronie użytkownik akurat jest (AuthProvider montuje się raz w
// layout.tsx).
// Listę kursów zna `lib/course-progress/courses.ts`, nie ten plik.
import {
  clearAllCourseProgress,
  flushAndClearAllCourseProgress,
  hasGuestSessionProgress,
  mergeGuestSessionIntoAccount,
} from '@/lib/course-progress/courses';
import { clearStreakOnLogout, creditGuestSessionOnLogin } from '@/lib/streak/record';
import { AUTH_TOKEN_KEY, clearAuthToken, getAuthToken, setAuthToken } from '@/lib/auth-token';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Postęp gościa z TEJ karty → konto. Najpierw seria (lekcje skończone jako gość
 * zaliczają dzisiejszy dzień — czytamy je z sessionStorage, ZANIM scalenie ją
 * wyczyści), potem postęp kursów. Kopia sessionStorage → localStorage jest
 * synchroniczna, więc UI nie mruga do zera.
 */
function adoptGuestSession(): void {
  if (!hasGuestSessionProgress()) return;
  creditGuestSessionOnLogin();
  void mergeGuestSessionIntoAccount();
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // loading dla operacji (login/register)
  const [initialLoading, setInitialLoading] = useState(true); // loading dla sprawdzenia tokena
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Funkcja do ładowania użytkownika z tokena
  const loadUserFromToken = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setInitialLoading(false);
      return;
    }

    try {
      const response = await authApi.getProfile();
      // Zalogowanie mogło się zdarzyć w INNEJ karcie (link z maila, nowa karta,
      // druga zakładka) — wtedy postęp gościa z tej karty nie przeszedł przez
      // `startSession` i bez tego przepadłby pod pustym stanem konta. Przejmujemy
      // go przed `setUser`, żeby powłoka lekcji od razu przeczytała pełny stan.
      adoptGuestSession();
      setUser(response.user);
      setError(null);
    } catch (err) {
      // Rozróżnienie jest krytyczne dla danych: lokalny postęp wolno skasować
      // WYŁĄCZNIE wtedy, gdy backend wprost odrzucił token (401). Każdy inny
      // błąd — brak sieci, timeout, zimny start dyna, 500 — jest przejściowy, a
      // czyszczenie magazynu byłoby wtedy trwałą utratą postępu, którego nie ma
      // jeszcze na żadnym serwerze (patrz niżej).
      const tokenRejected = err instanceof ApiErrorClass && err.statusCode === 401;

      if (tokenRejected) {
        clearAuthToken();
        setUser(null);
        clearAllCourseProgress();
        clearStreakOnLogout({ flush: false });
        // Nie pokazuj błędu dla nieautoryzowanego dostępu podczas ładowania
        setError(null);
      } else {
        // Token zostaje — użytkownik pozostaje wylogowany tylko na czas tego
        // ładowania, a kolejne wejście spróbuje ponownie.
        setUser(null);
        setError(err instanceof Error ? err.message : 'Błąd podczas ładowania profilu');
      }
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Załaduj użytkownika przy starcie
  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // Logowanie albo wylogowanie w innej karcie: token w localStorage jest wspólny,
  // stan tej karty — nie. Bez tego karta gościa pisałaby dalej do sessionStorage,
  // a po odświeżeniu pokazywała konto bez swojego postępu.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_TOKEN_KEY) return;
      if (event.newValue) void loadUserFromToken();
      else setUser(null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadUserFromToken]);

  // Wspólny koniec każdego logowania: token, użytkownik i przejęcie postępu gościa.
  const startSession = (response: AuthResponse) => {
    setAuthToken(response.jwt);
    creditGuestSessionOnLogin();
    void mergeGuestSessionIntoAccount();
    setUser(response.user);
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login({ identifier, password });

      startSession(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas logowania');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.register(data);

      startSession(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas rejestracji');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      startSession(await authApi.googleLogin(credential));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd logowania przez Google');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // KOLEJNOŚĆ JEST ISTOTNA: najpierw wypchnięcie na konto (obie funkcje
    // czytają token synchronicznie i czyszczą magazyny), dopiero potem token
    // znika. Odwrotnie ostatnia porcja postępu nie miałaby czym się
    // uwierzytelnić i przepadłaby bezpowrotnie.
    flushAndClearAllCourseProgress();
    clearStreakOnLogout();
    clearAuthToken();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    await loadUserFromToken();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    initialLoading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
