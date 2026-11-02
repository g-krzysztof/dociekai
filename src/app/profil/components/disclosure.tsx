'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Rozwinięcie w świecie Atlasu: pulpit pokazuje jeden zwarty wiersz, a scena
 * (wykres roku, gablota, taśma) leży warstwę niżej. Przełącznik to prawdziwy
 * przycisk z `aria-expanded`; panel otwiera się wysokością (`grid-template-rows`
 * 0fr → 1fr), więc nie trzeba mierzyć treści.
 */
export function DisclosureToggle({
  open,
  onToggle,
  controls,
  children,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={cn('profil-toggle', className)}
    >
      {children}
      <ChevronDown className="profil-toggle__chev h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
    </button>
  );
}

/**
 * Treść montuje się dopiero przy pierwszym otwarciu — wtedy autorski moment
 * arkusza (wznoszenie słupków roku) gra na oczach, a nie w niewidocznym panelu
 * przy wczytaniu strony. Po zamknięciu zostaje w drzewie, żeby zwijanie też
 * miało ruch, ale jest `inert`, więc klawiatura i czytnik jej nie widzą.
 */
export function DisclosurePanel({
  id,
  open,
  children,
  className,
}: {
  id: string;
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  return (
    <div id={id} className="profil-reveal" data-open={open} inert={!open}>
      <div>{mounted && <div className={className}>{children}</div>}</div>
    </div>
  );
}
