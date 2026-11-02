'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, X } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useAuth } from '@/components/auth-context';
import { BANNER_EVENT, readConsent } from '@/components/cookie-consent';
import { cn } from '@/lib/utils';
import { FeedbackForm, type FeedbackScreenshot } from './feedback-form';
import { ScreenshotAreaSelector } from './screenshot-area-selector';

// Fixed trigger + dialog for logged-in users to report a bug or leave
// feedback. Only visible once auth state is resolved and the user is
// authenticated — same "no guest flash" guard as GuestProgressNotice.
// Bottom-right per explicit request — note this shares the corner with
// FloatingCta (/blog/[slug] only, 3s delay, dismissible) and, on math guide
// pages, sits near GuideRail's right-edge dot nav; no layout collision was
// reworked for that, just be aware if either ever needs the exact same spot.
// CookieConsent (full-width, z-50) can be showing at the same time for a
// user who logged in before dismissing it, and it would sit on top of and
// block this button. Simplest fix: stay hidden while that banner is up too;
// it reappears the instant the banner closes and hides again if the banner is
// reopened from the footer (listens for CookieConsent's BANNER_EVENT).
export function FeedbackWidget() {
  const { isAuthenticated, initialLoading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pageLabel, setPageLabel] = useState('');
  const [cookieBannerVisible, setCookieBannerVisible] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState<FeedbackScreenshot | null>(null);

  useEffect(() => {
    setCookieBannerVisible(readConsent() === null);
    const onBanner = (event: Event) => {
      setCookieBannerVisible(Boolean((event as CustomEvent<{ visible: boolean }>).detail?.visible));
    };
    window.addEventListener(BANNER_EVENT, onBanner);
    return () => window.removeEventListener(BANNER_EVENT, onBanner);
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (next && typeof document !== 'undefined') {
      setPageLabel(document.title);
    }
    setOpen(next);
  };

  // Selecting an area needs the drawer out of the way — visually (so it
  // doesn't cover the page) and for html2canvas (so it never ends up in its
  // own capture) — but it must stay *mounted* the whole time: closing it via
  // `open` unmounts DrawerContent (Radix/vaul), which would wipe every field
  // FeedbackForm's local state holds (category/message/context). So this
  // only ever toggles `capturing`; the drawer's own `open` is untouched.
  const startCapture = () => {
    setCapturing(true);
  };

  const handleCaptured = (blob: Blob) => {
    setScreenshot((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { blob, previewUrl: URL.createObjectURL(blob) };
    });
    setCapturing(false);
  };

  const handleCaptureCancel = () => {
    setCapturing(false);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  };

  if (initialLoading || !isAuthenticated || cookieBannerVisible) return null;

  return (
    <>
      <button
        type="button"
        data-feedback-ui
        onClick={() => handleOpenChange(true)}
        aria-label="Zgłoś uwagę lub błąd"
        className="group fixed bottom-4 right-4 z-40 flex h-12 w-12 cursor-pointer flex-row-reverse items-center justify-center overflow-hidden rounded-full border bg-background shadow-lg transition-[width,box-shadow] duration-200 hover:shadow-xl md:bottom-6 md:right-6 md:hover:w-[150px] md:hover:justify-start md:hover:gap-2 md:hover:px-4"
      >
        <MessageSquarePlus className="h-5 w-5 shrink-0" />
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 group-hover:max-w-[10rem] group-hover:opacity-100 md:inline-block">
          Zgłoś uwagę
        </span>
      </button>

      <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
        <DrawerContent
          className={cn('flex flex-col', capturing && 'invisible')}
          onEscapeKeyDown={(event) => {
            if (capturing) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (capturing) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (capturing) event.preventDefault();
          }}
        >
          <DrawerHeader className="flex-row items-start justify-between gap-2 border-b">
            <div>
              <DrawerTitle>Zgłoś uwagę lub błąd</DrawerTitle>
              <DrawerDescription>
                Twoje zgłoszenie trafi bezpośrednio do zespołu DociekAI.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Zamknij"
                className="shrink-0 rounded-full p-2 transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <FeedbackForm
              pageUrl={pathname}
              initialPageLabel={pageLabel}
              screenshot={screenshot}
              onRequestScreenshot={startCapture}
              onRemoveScreenshot={handleRemoveScreenshot}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {capturing && (
        <ScreenshotAreaSelector onCapture={handleCaptured} onCancel={handleCaptureCancel} />
      )}
    </>
  );
}
