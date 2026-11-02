import type { Page } from '@playwright/test';

// Testy chodzą przeciwko `npm run dev`, a Next.js dokleja wtedy overlay
// dev-tools (<nextjs-portal>), który potrafi zasłonić klikany element
// i przechwycić zdarzenia wskaźnika — klik pada na timeoutcie, choć aplikacja
// działa poprawnie. Chowamy portal CSS-em na każdej nawigacji (addInitScript
// wykonuje się przed skryptami strony, przy każdym przeładowaniu dokumentu),
// zamiast `click({ force: true })`, żeby zachować normalne sprawdzanie
// klikalności elementów.
export async function hideNextDevOverlay(page: Page) {
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = 'nextjs-portal{display:none!important}';
    (document.head ?? document.documentElement).appendChild(style);
  });
}

// Baner cookies: przycisk nazywa się "Zgadzam się" (testy historycznie szukały
// "Akceptuj"), a samego banera może wcale nie być. Klikamy tylko gdy widoczny.
export async function acceptCookiesIfPresent(page: Page) {
  const btn = page.getByRole('button', { name: /Zgadzam się|Akceptuj/i }).first();
  const visible = await btn
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  if (visible) {
    // Baner wjeżdża z animacją i bywa "niestabilny" (zwłaszcza na mobile) —
    // wtedy klikamy siłowo; baner cookies nie jest przedmiotem testu.
    await btn.click({ timeout: 5000 }).catch(() => btn.click({ force: true }).catch(() => {}));
  }
}
