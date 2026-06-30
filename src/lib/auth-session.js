import { supabase } from '@/lib/supabase';

export const TOKEN_KEY = 'peace_auth_token';
export const REFRESH_KEY = 'peace_auth_refresh_token';

export function syncPeaceAuthFromSession(session) {
  if (!session) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    return;
  }

  if (session.access_token) {
    localStorage.setItem(TOKEN_KEY, session.access_token);
  }
  if (session.refresh_token) {
    localStorage.setItem(REFRESH_KEY, session.refresh_token);
  }
}

export async function getPeaceAccessToken() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (session?.access_token) {
    syncPeaceAuthFromSession(session);
    return session.access_token;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export async function restoreSupabaseSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (session) {
    syncPeaceAuthFromSession(session);
    return session;
  }

  const refreshToken = localStorage.getItem(REFRESH_KEY);
  const accessToken = localStorage.getItem(TOKEN_KEY);
  if (!refreshToken) return null;

  const { data, error: setError } = await supabase.auth.setSession({
    access_token: accessToken || '',
    refresh_token: refreshToken,
  });

  if (setError || !data.session) {
    syncPeaceAuthFromSession(null);
    return null;
  }

  syncPeaceAuthFromSession(data.session);
  return data.session;
}

export async function logoutPeaceAuth() {
  await supabase.auth.signOut();
  syncPeaceAuthFromSession(null);
}