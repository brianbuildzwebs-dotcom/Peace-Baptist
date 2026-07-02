import { useEffect, useState } from 'react';
import { CONSENT_CHANGE_EVENT, getConsent } from '@/lib/cookieConsent';

export function useCookieConsent() {
  const [consent, setConsent] = useState(getConsent);

  useEffect(() => {
    const refresh = () => setConsent(getConsent());
    window.addEventListener(CONSENT_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, refresh);
  }, []);

  return consent;
}