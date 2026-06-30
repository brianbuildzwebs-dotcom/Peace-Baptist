import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import { syncPeaceAuthFromSession } from '@/lib/auth-session';

export async function getMfaAssuranceLevel() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  return data;
}

export function needsMfaChallenge(level) {
  return level?.nextLevel === 'aal2' && level?.currentLevel !== 'aal2';
}

export function hasAal2Session(level) {
  return level?.currentLevel === 'aal2';
}

export function resolveAdminMfaGateState(level, factors) {
  const verified = getVerifiedTotpFactor(factors);
  if (!verified) return 'enroll';
  if (!hasAal2Session(level)) return 'challenge';
  return 'ready';
}

export const ADMIN_MFA_REQUIRED_EVENT = 'peacebaptist:admin-mfa-required';

export function notifyAdminMfaRequired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ADMIN_MFA_REQUIRED_EVENT));
}

export async function listTotpFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  const all = data?.all ?? [];
  const totpFromAll = all.filter((factor) => factor.factor_type === 'totp');
  if (totpFromAll.length > 0) return totpFromAll;
  return data?.totp ?? [];
}

export function getVerifiedTotpFactor(factors) {
  return (factors ?? []).find((factor) => factor.status === 'verified') ?? null;
}

export function getUnverifiedTotpFactors(factors) {
  return (factors ?? []).filter((factor) => factor.status !== 'verified');
}

export async function verifyTotpCode({ factorId, code }) {
  const trimmed = code.trim();
  const result = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: trimmed,
  });
  if (result.error) throw result.error;

  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) throw refreshError;
  if (refreshData.session) {
    syncPeaceAuthFromSession(refreshData.session);
  }

  const level = await getMfaAssuranceLevel();
  if (needsMfaChallenge(level)) {
    throw new Error(
      'Verification succeeded but your session is still at single-factor. Sign out and sign in again, then enter a fresh code.'
    );
  }

  return result.data;
}

export async function clearUnverifiedTotpFactors() {
  const factors = await listTotpFactors();
  const stale = getUnverifiedTotpFactors(factors);

  for (const factor of stale) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) throw error;
  }

  return stale.length;
}

const MFA_ISSUER = 'Peace Baptist Church';

export function formatMfaError(error) {
  const message = String(error?.message || error || 'MFA request failed');
  const lower = message.toLowerCase();

  if (
    lower.includes('mfa is not enabled') ||
    lower.includes('enroll is disabled') ||
    lower.includes('factor enrollment is disabled')
  ) {
    return 'Authenticator MFA is not enabled for this Supabase project. In Supabase Dashboard go to Authentication → Multi-Factor, enable TOTP, then try again.';
  }

  if (lower.includes('already exists') || lower.includes('friendly name')) {
    return 'A previous authenticator setup is still on this account. Use “Remove incomplete setup” below, then try again.';
  }

  if (lower.includes('invalid') && (lower.includes('code') || lower.includes('verification'))) {
    return 'That code did not match. Use the current 6-digit code from your authenticator app and make sure your phone time is set automatically.';
  }

  if (lower.includes('list factors') || lower.includes('listfactors')) {
    return `${message} If this persists, confirm TOTP MFA is enabled in Supabase Authentication settings.`;
  }

  return message;
}

export function buildTotpUri({ secret, accountName, issuer = MFA_ISSUER }) {
  if (!secret) return '';

  const normalizedSecret = secret.replace(/\s+/g, '');
  const label = encodeURIComponent(`${issuer}:${accountName || 'account'}`);
  const params = new URLSearchParams({
    secret: normalizedSecret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });

  return `otpauth://totp/${label}?${params.toString()}`;
}

export function formatTotpSecret(secret) {
  return (secret ?? '').replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export async function createMfaQrDataUrl(uri) {
  if (!uri) return '';
  return QRCode.toDataURL(uri, {
    width: 320,
    margin: 4,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}