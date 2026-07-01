const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  if (!email || email.length > 254) return false;
  return EMAIL_RE.test(email);
}