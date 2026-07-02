const STORAGE_KEY = 'pbc_cookie_consent';
export const CONSENT_CHANGE_EVENT = 'pbc:cookie-consent-change';
export const OPEN_COOKIE_SETTINGS_EVENT = 'pbc:open-cookie-settings';

const DEFAULT_PREFS = {
  essential: true,
  functional: false,
  analytics: false,
};

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      essential: true,
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return null;
  }
}

function writeStorage(prefs) {
  const record = {
    essential: true,
    functional: !!prefs.functional,
    analytics: !!prefs.analytics,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore quota errors
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: record }));
  return record;
}

export function hasGlobalPrivacyControl() {
  return typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;
}

export function getConsent() {
  const stored = readStorage();
  if (stored) return stored;
  return { ...DEFAULT_PREFS, updatedAt: null };
}

export function hasUserChosen() {
  return readStorage() !== null;
}

export function hasConsent(category) {
  if (category === 'essential') return true;
  const consent = getConsent();
  return !!consent[category];
}

export function saveConsent(prefs) {
  return writeStorage(prefs);
}

export function acceptAllConsent() {
  return writeStorage({ essential: true, functional: true, analytics: true });
}

export function essentialOnlyConsent() {
  return writeStorage({ essential: true, functional: false, analytics: false });
}

export function applyPrivacyControlDefaults() {
  if (hasUserChosen() || !hasGlobalPrivacyControl()) return null;
  return essentialOnlyConsent();
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
}