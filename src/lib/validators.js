/** Practical email check: name@domain.tld (TLD at least 2 chars). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  if (!email || email.length > 254) return false;
  return EMAIL_RE.test(email);
}

export function emailValidationMessage(value) {
  if (!String(value || '').trim()) return 'Email is required.';
  if (!isValidEmail(value)) return 'Enter a valid email address (example: name@example.com).';
  return '';
}