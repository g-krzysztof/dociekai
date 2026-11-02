'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-context';
import { cn } from '@/lib/utils';
import { ApiErrorClass, authApi } from '@/lib/auth-api';
import type { User } from '@/types/auth';

/** Komunikat po akcji — hairline z ikoną, nie kolorowy prostokąt. */
function Note({ tone, children }: { tone: 'ok' | 'error'; children: React.ReactNode }) {
  const Icon = tone === 'ok' ? Check : AlertCircle;
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'mt-4 flex items-start gap-2 border-l border-current py-1 pl-3 text-sm',
        tone === 'ok' ? 'profil-note-ok' : 'profil-note-err'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Wiersz rejestru: etykieta, kropkowany prowadnik, wartość. */
function LedgerRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-end gap-3">
      <dt className="profil-micro shrink-0 pb-[3px]">{label}</dt>
      <span className="profil-leader" aria-hidden />
      <dd
        className={
          value
            ? 'shrink-0 text-[15px] font-semibold tracking-[-0.01em]'
            : 'shrink-0 text-[15px] text-[var(--ink-faint)]'
        }
      >
        {value || 'nie podano'}
      </dd>
    </div>
  );
}

function PersonalData({ user, refreshUser }: { user: User; refreshUser: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startEditing = () => {
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    });
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await authApi.updateProfile(form);
      await refreshUser();

      setSuccess('Zapisane. Dane konta są zaktualizowane.');
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiErrorClass ? err.message : 'Nie udało się zapisać zmian. Spróbuj ponownie.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          Dane osobowe
        </h3>
        {!editing && (
          <Button size="sm" className="profil-btn-quiet h-8 px-3" onClick={startEditing}>
            Edytuj
          </Button>
        )}
      </div>

      {success && <Note tone="ok">{success}</Note>}
      {error && <Note tone="error">{error}</Note>}

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="profil-micro">
                Imię
              </Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="profil-micro">
                Nazwisko
              </Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" className="profil-btn-solid h-10 px-5" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Zapisuję…' : 'Zapisz zmiany'}
            </Button>
            <Button
              type="button"
              className="profil-btn-quiet h-10 px-5"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              disabled={saving}
            >
              Anuluj
            </Button>
          </div>
        </form>
      ) : (
        <dl className="mt-5 space-y-3.5">
          <LedgerRow label="Imię" value={user.firstName} />
          <LedgerRow label="Nazwisko" value={user.lastName} />
          <LedgerRow label="Nazwa użytkownika" value={user.username} />
          <LedgerRow label="Email" value={user.email} />
          <LedgerRow
            label="Adres e-mail"
            value={user.emailVerified === false ? 'niepotwierdzony' : 'potwierdzony'}
          />
        </dl>
      )}
    </div>
  );
}

function PasswordBlock() {
  const [changing, setChanging] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError('Nowe hasła nie są takie same — popraw pole „Powtórz nowe hasło".');
      return;
    }

    if (form.newPassword.length < 8) {
      setError('Nowe hasło jest za krótkie — potrzeba przynajmniej 8 znaków.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await authApi.changePassword(form);

      setSuccess('Hasło zmienione. Następne logowanie użyje już nowego.');
      reset();
      setChanging(false);
    } catch (err) {
      setError(
        err instanceof ApiErrorClass ? err.message : 'Nie udało się zmienić hasła. Spróbuj ponownie.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          Hasło
        </h3>
        {!changing && (
          <Button
            size="sm"
            className="profil-btn-quiet h-8 px-3"
            onClick={() => {
              reset();
              setChanging(true);
              setError(null);
              setSuccess(null);
            }}
          >
            Zmień
          </Button>
        )}
      </div>

      {success && <Note tone="ok">{success}</Note>}
      {error && <Note tone="error">{error}</Note>}

      {changing ? (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="profil-micro">
              Aktualne hasło
            </Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              required
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="profil-micro">
              Nowe hasło
            </Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              required
              disabled={saving}
              aria-describedby="newPasswordHint"
            />
            <p id="newPasswordHint" className="text-[11px] text-[var(--ink-faint)]">
              Minimum 8 znaków.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="profil-micro">
              Powtórz nowe hasło
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              required
              disabled={saving}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" className="profil-btn-solid h-10 px-5" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Zmieniam…' : 'Zmień hasło'}
            </Button>
            <Button
              type="button"
              className="profil-btn-quiet h-10 px-5"
              onClick={() => {
                setChanging(false);
                setError(null);
                reset();
              }}
              disabled={saving}
            >
              Anuluj
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-5 max-w-[62ch] text-sm leading-relaxed text-[var(--ink-soft)]">
          Do zmiany hasła potrzebne jest to aktualne. Postęp w kursie zostaje na koncie niezależnie
          od hasła.
        </p>
      )}
    </div>
  );
}

/** Ustawienia konta — treść rozwinięcia arkusza „konto”; nagłówek i pasek potwierdzenia e-maila stoją nad nim. */
export function AccountSheet({ user }: { user: User }) {
  const { logout, refreshUser } = useAuth();
  const router = useRouter();

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <PersonalData user={user} refreshUser={refreshUser} />

        <div className="space-y-9 lg:border-l lg:border-[var(--rule-faint)] lg:pl-14">
          <PasswordBlock />

          <div className="border-t border-[var(--rule-faint)] pt-8">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              Sesja
            </h3>
            <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--ink-soft)]">
              Wylogowanie czyści postęp zapisany w tej przeglądarce. Kopia na koncie zostaje —
              wróci przy następnym logowaniu.
            </p>
            <Button
              className="profil-btn-quiet mt-5 h-10 px-5"
              onClick={() => {
                logout();
                router.push('/');
              }}
            >
              <LogOut className="h-4 w-4" />
              Wyloguj się
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
