import { getSupabaseAdmin } from '../supabase.js';

const BASE_MANIFEST = {
  id: '/',
  name: 'Peace Baptist Church App',
  short_name: 'Peace Baptist',
  description:
    'Peace Baptist Church app for Wilmington, NC — Daily Walk devotions, live worship, prayer requests, events, and more.',
  start_url: '/?source=pwa',
  scope: '/',
  display: 'standalone',
  display_override: ['standalone', 'browser'],
  background_color: '#0F172A',
  theme_color: '#0F172A',
  orientation: 'any',
  categories: ['lifestyle', 'education'],
};

async function getSplashImageUrl() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return '/images/church-exterior.jpg';

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'splash_screen_image_url')
    .maybeSingle();

  return data?.value || '/images/church-exterior.jpg';
}

export async function handleManifest(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const splash = await getSplashImageUrl();

  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host || 'www.peacebaptist.net'}`;

  const manifest = {
    ...BASE_MANIFEST,
    related_applications: [
      {
        platform: 'webapp',
        url: `${origin}/api/manifest`,
      },
    ],
    prefer_related_applications: false,
    icons: [
      {
        src: splash,
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: splash,
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
    ],
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).json(manifest);
}