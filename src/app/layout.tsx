import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import '@/lib/reactReduxShim';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import { Footer } from '@/components/footer';
import { AppProvider } from '@/components/app-context';
import { AuthProvider } from '@/components/auth-context';
import { CookieConsent } from '@/components/cookie-consent';
import { FeedbackWidget } from '@/components/feedback/feedback-widget';
import { ClarityAnalytics } from '@/components/clarity-analytics';
import { MetaPixel } from '@/components/meta-pixel';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DociekAI – kompetencje przyszłości dla dzieci i młodzieży',
  description:
    'DociekAI wspiera wychowawców w kształtowaniu kompetencji przyszłości u dzieci – od edukacji przez emocje po myślenie krytyczne i kreatywność.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
    other: [
      {
        rel: 'icon',
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
  {process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod' && (
          <>
            <script
              src="https://analytics.ahrefs.com/analytics.js"
              data-key="cgoC1tRPvbNyiJ0rgpDnKw"
              async
            ></script>
          </>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </AppProvider>
            <FeedbackWidget />
          </AuthProvider>
          <Suspense fallback={null}>
            <CookieConsent />
          </Suspense>
          <ClarityAnalytics />
          <MetaPixel />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
