import { churchInfo } from '@/lib/churchInfo';

const CACHE_KEY = 'pbc_splash_image_url';
const DEFAULT_SPLASH = churchInfo.images.splash;

export function getDefaultSplashUrl() {
  return DEFAULT_SPLASH;
}

export function getCachedSplashUrl() {
  try {
    return localStorage.getItem(CACHE_KEY) || DEFAULT_SPLASH;
  } catch {
    return DEFAULT_SPLASH;
  }
}

export function setCachedSplashUrl(url) {
  if (!url) return;
  try {
    localStorage.setItem(CACHE_KEY, url);
  } catch {
    /* ignore */
  }
}

export async function refreshSplashCache() {
  try {
    const res = await fetch('/api/manifest', { cache: 'no-store' });
    if (!res.ok) return getCachedSplashUrl();
    const manifest = await res.json();
    const url = manifest?.icons?.[0]?.src;
    if (url) {
      setCachedSplashUrl(url);
      return url;
    }
  } catch {
    /* ignore */
  }
  return getCachedSplashUrl();
}

export function applySplashToDocument(url = getCachedSplashUrl()) {
  if (typeof document === 'undefined' || !url) return;
  const upsert = (rel) => {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = url;
  };
  upsert('apple-touch-icon');
  upsert('apple-touch-startup-image');
}