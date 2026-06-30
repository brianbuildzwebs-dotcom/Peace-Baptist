import { createClient } from '@supabase/supabase-js';

let adminClient = null;

function env(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : value;
}

export function getSupabaseUrl() {
  return env('SUPABASE_URL') || env('VITE_SUPABASE_URL') || null;
}

export function getSupabaseProjectRef() {
  const match = (getSupabaseUrl() || '').match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] || null;
}

export function getSupabaseServiceRoleKey() {
  return env('SUPABASE_SERVICE_ROLE_KEY') || null;
}

export function getSupabaseAnonKey() {
  return env('SUPABASE_ANON_KEY') || env('VITE_SUPABASE_ANON_KEY') || null;
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) return null;

  adminClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return adminClient;
}

export function getSupabaseAuth() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}