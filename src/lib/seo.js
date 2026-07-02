import { churchInfo } from './churchInfo';

export const SITE_URL = 'https://www.peacebaptist.net';
export const SITE_NAME = 'Peace Baptist Church';
export const APP_NAME = 'Peace Baptist App';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/church-exterior.jpg`;

const DEFAULT_DESCRIPTION =
  'Peace Baptist Church app for Wilmington, NC — King James Bible preaching, Daily Walk devotions, live worship, prayer requests, events, and fellowship since 1975.';

export const DEFAULT_SEO = {
  title: `${SITE_NAME} App | Wilmington, NC Baptist Church`,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  image: DEFAULT_OG_IMAGE,
  noindex: false,
};

const PUBLIC_PAGES = {
  '/': {
    title: `${SITE_NAME} App | Wilmington, NC Baptist Church`,
    description:
      'Welcome to Peace Baptist Church in Wilmington, NC. Watch live worship, read the Daily Walk devotion, submit prayer requests, and see upcoming events — on the web or installed as an app.',
  },
  '/about': {
    title: `About ${SITE_NAME} | Wilmington, NC Since 1975`,
    description:
      'Learn about Peace Baptist Church — an independent, fundamental Baptist church devoted to the King James Bible, dynamic preaching, and genuine fellowship in Wilmington, NC.',
  },
  '/watch-live': {
    title: `Watch Live | ${SITE_NAME} Wilmington, NC`,
    description:
      'Watch Peace Baptist Church live from Wilmington, NC. Join Sunday School, morning worship, and special services online.',
    image: `${SITE_URL}/images/hero-sanctuary.jpg`,
  },
  '/media': {
    title: `Sermons & Media | ${SITE_NAME}`,
    description:
      'Browse recent worship services and sermon media from Peace Baptist Church in Wilmington, NC.',
    image: `${SITE_URL}/images/hero-sanctuary.jpg`,
  },
  '/events': {
    title: `Church Events | ${SITE_NAME} Wilmington, NC`,
    description:
      'See upcoming events, fellowships, and gatherings at Peace Baptist Church in Wilmington, NC. RSVP and sign up online.',
  },
  '/ministries': {
    title: `Ministries | ${SITE_NAME} Wilmington, NC`,
    description:
      'Explore ministries at Peace Baptist Church — Sunday School, youth, nursery, outreach, and more in Wilmington, NC.',
  },
  '/prayer-requests': {
    title: `Prayer Requests | ${SITE_NAME}`,
    description:
      'Share a prayer request with the Peace Baptist Church family in Wilmington, NC. Join the community prayer wall.',
  },
  '/contact': {
    title: `Contact Us | ${SITE_NAME} Wilmington, NC`,
    description:
      'Contact Peace Baptist Church at 320 Military Cutoff Rd, Wilmington, NC. Call, email, or send a message to our team.',
  },
  '/daily-walk': {
    title: `Daily Walk Devotion | ${APP_NAME}`,
    description:
      'Read today\'s Daily Walk devotion from Peace Baptist Church — Scripture, reflection, and encouragement for your walk with Christ.',
  },
  '/bible-believers-broadcast': {
    title: `Bible Believers Broadcast | ${SITE_NAME}`,
    description:
      'Listen to Bible Believers Broadcast — messages from Peace Baptist Church and fellow Bible-believing ministries.',
  },
  '/give': {
    title: `Give Online | ${SITE_NAME}`,
    description:
      'Support the ministry of Peace Baptist Church in Wilmington, NC through secure online giving.',
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Privacy Policy for Peace Baptist Church and the Peace Baptist app — how we collect, use, and protect your information.',
  },
  '/terms': {
    title: `Terms of Use | ${SITE_NAME}`,
    description:
      'Terms of Use for the Peace Baptist Church website and app.',
  },
};

const PRIVATE_PREFIXES = ['/admin', '/login', '/register', '/forgot-password', '/reset-password'];

function upsertMeta(attribute, key, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  let element = document.getElementById(id);
  if (!data) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.id = id;
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

export function buildChurchJsonLd() {
  const sameAs = [churchInfo.social.facebook, churchInfo.social.youtube].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Church',
    '@id': `${SITE_URL}/#church`,
    name: churchInfo.name,
    alternateName: [churchInfo.shortName, APP_NAME],
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    telephone: churchInfo.phoneTel,
    email: churchInfo.email,
    foundingDate: '1975',
    address: {
      '@type': 'PostalAddress',
      streetAddress: churchInfo.address.street,
      addressLocality: churchInfo.address.city,
      addressRegion: churchInfo.address.state,
      postalCode: churchInfo.address.zip,
      addressCountry: 'US',
    },
    sameAs,
    hasMap: churchInfo.mapsUrl,
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: APP_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#church` },
    inLanguage: 'en-US',
  };
}

export function getSeoForPath(pathname) {
  const isPrivate = PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isPrivate) {
    return {
      title: `${SITE_NAME} Admin`,
      description: DEFAULT_DESCRIPTION,
      path: pathname,
      image: DEFAULT_OG_IMAGE,
      noindex: true,
      includeStructuredData: false,
    };
  }

  const page = PUBLIC_PAGES[pathname];
  if (!page) {
    return {
      ...DEFAULT_SEO,
      path: pathname,
      title: `Page Not Found | ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
      includeStructuredData: false,
    };
  }

  if (pathname === '/give' && !churchInfo.showGiving) {
    return {
      ...DEFAULT_SEO,
      path: pathname,
      title: `Page Not Found | ${SITE_NAME}`,
      noindex: true,
      includeStructuredData: false,
    };
  }

  return {
    ...DEFAULT_SEO,
    ...page,
    path: pathname,
    includeStructuredData: pathname === '/',
  };
}

export function applyPageSeo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  includeStructuredData = false,
}) {
  const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`;

  document.title = title;

  upsertMeta('name', 'description', description);
  upsertMeta('name', 'application-name', APP_NAME);
  upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:image', image);
  upsertMeta('property', 'og:image:alt', `${SITE_NAME} in Wilmington, NC`);
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:locale', 'en_US');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', image);
  upsertMeta('name', 'twitter:image:alt', `${SITE_NAME} in Wilmington, NC`);

  upsertLink('canonical', canonicalUrl);

  if (includeStructuredData) {
    upsertJsonLd('pbc-structured-data', {
      '@context': 'https://schema.org',
      '@graph': [buildChurchJsonLd(), buildWebSiteJsonLd()],
    });
  } else {
    upsertJsonLd('pbc-structured-data', null);
  }
}