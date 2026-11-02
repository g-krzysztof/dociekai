/**
 * Fanpage na Facebooku. Celowo zwykły link, nie wtyczka „Lubię to” od Mety:
 * wtyczka ładuje SDK śledzące jeszcze przed zgodą na cookies, działa tylko
 * u zalogowanych do Facebooka w tej samej przeglądarce, a Meta i tak ją wygasza.
 * Link działa wszędzie, a na telefonie otwiera aplikację Facebooka.
 */
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/dociekai';

/** Gdzie stoi przycisk — trafia do zdarzenia Clarity, żeby porównać miejsca. */
export type FacebookPlacement = 'footer' | 'blog' | 'profile' | 'lesson-end';

/**
 * Zdarzenie w Clarity, np. `fb_follow_click_blog`. Clarity startuje dopiero
 * po zgodzie z banera, więc bez zgody `window.clarity` nie istnieje i nic nie
 * wysyłamy.
 */
export function trackFacebookClick(placement: FacebookPlacement) {
  const clarity = (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity;
  try {
    clarity?.('event', `fb_follow_click_${placement}`);
  } catch {
    // pomiar nigdy nie może zablokować wyjścia na Facebooka
  }
}
