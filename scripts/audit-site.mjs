const BASE = process.env.AUDIT_BASE_URL || 'https://www.peacebaptist.net';

const publicPages = [
  '/',
  '/about',
  '/watch-live',
  '/media',
  '/events',
  '/prayer-requests',
  '/contact',
  '/ministries',
  '/daily-walk',
  '/give',
  '/login',
];

const publicApis = [
  '/api/health',
  '/api/entities/Event?filter=%7B%22status%22%3A%22upcoming%22%7D&sort=date',
  '/api/entities/MediaItem',
  '/api/entities/Ministry',
  '/api/entities/Testimonial',
  '/api/entities/SiteSettings',
  '/api/entities/DailyDevotion?filter=%7B%22devotion_date%22%3A%222026-07-02%22%7D',
];

async function check(label, url, expectStatus = [200]) {
  try {
    const res = await fetch(`${BASE}${url}`, { redirect: 'follow' });
    const ok = expectStatus.includes(res.status);
    return { label, url, status: res.status, ok };
  } catch (err) {
    return { label, url, status: 'ERR', ok: false, error: err.message };
  }
}

const results = [];
for (const path of publicPages) {
  results.push(await check(`page ${path}`, path));
}
for (const path of publicApis) {
  results.push(await check(`api ${path}`, path));
}

const failed = results.filter((r) => !r.ok);
for (const row of results) {
  console.log(`${row.ok ? 'OK' : 'FAIL'} ${row.status} ${row.label}`);
}
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('\nFailures:');
  for (const row of failed) console.log(`- ${row.label}: ${row.status}${row.error ? ` (${row.error})` : ''}`);
  process.exit(1);
}