import { hasConsent, CONSENT_CHANGE_EVENT } from './cookieConsent';

let initialized = false;

export function initAnalytics() {
  if (initialized || !hasConsent('analytics')) return;
  initialized = true;

  // Future: enable Google Analytics, Vercel Analytics, or similar here.
  // Example:
  // loadScript('https://www.googletagmanager.com/gtag/js?id=G-XXXX');
}

export function trackPageView(_path) {
  if (!hasConsent('analytics')) return;
  // Future: send page view to analytics provider.
}

export function bindAnalyticsToConsent() {
  if (typeof window === 'undefined') return () => {};

  const onConsentChange = () => {
    if (hasConsent('analytics')) {
      initAnalytics();
    }
  };

  window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
  onConsentChange();

  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
}